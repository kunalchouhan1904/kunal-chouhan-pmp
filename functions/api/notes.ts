const GITHUB_API = 'https://api.github.com';

interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  GITHUB_FILE_PATH: string;
}

function response(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function envOrThrow(env: Env): Env {
  for (const key of [
    'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO',
    'GITHUB_BRANCH', 'GITHUB_FILE_PATH'
  ] as const) {
    if (!env[key]) throw new Error(`Missing environment variable: ${key}`);
  }
  return env;
}

function headers(env: Env): HeadersInit {
  return {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'pmp-notes-app'
  };
}

async function readGitHubFile(env: Env): Promise<{ notes: unknown[]; sha: string }> {
  const url =
    `${GITHUB_API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}` +
    `/contents/${env.GITHUB_FILE_PATH}?ref=${encodeURIComponent(env.GITHUB_BRANCH)}`;

  const res = await fetch(url, { headers: headers(env) });
  if (!res.ok) throw new Error(`GitHub read failed (${res.status}).`);

  const file = await res.json() as { content?: string; sha?: string };
  if (!file.content || !file.sha) throw new Error('Invalid GitHub file response.');

  const binary = atob(file.content.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const notes = JSON.parse(new TextDecoder().decode(bytes));

  if (!Array.isArray(notes)) throw new Error('notes.json must contain an array.');
  return { notes, sha: file.sha };
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  try {
    const env = envOrThrow(context.env);
    const { notes } = await readGitHubFile(env);
    return response(notes);
  } catch (error) {
    console.error(error);
    return response({
      success: false,
      message: error instanceof Error ? error.message : 'Unable to load notes.'
    }, 500);
  }
}

export async function onRequestPut(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const env = envOrThrow(context.env);
    const notes = await context.request.json();

    if (!Array.isArray(notes)) {
      return response({ success: false, message: 'Notes must be an array.' }, 400);
    }

    const { sha } = await readGitHubFile(env);
    const content = JSON.stringify(notes, null, 2) + '\n';

    const bytes = new TextEncoder().encode(content);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }

    const url =
      `${GITHUB_API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}` +
      `/contents/${env.GITHUB_FILE_PATH}`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: { ...headers(env), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Update notes.json',
        content: btoa(binary),
        sha,
        branch: env.GITHUB_BRANCH
      })
    });

    const result = await res.json().catch(() => null);
    if (!res.ok) {
      console.error('GitHub write:', result);
      return response({
        success: false,
        message: `GitHub write failed (${res.status}).`
      }, 502);
    }

    return response({
      success: true,
      message: 'Notes saved to GitHub.',
      commit: result?.commit?.sha ?? null
    });
  } catch (error) {
    console.error(error);
    return response({
      success: false,
      message: error instanceof Error ? error.message : 'Unable to save notes.'
    }, 500);
  }
}
