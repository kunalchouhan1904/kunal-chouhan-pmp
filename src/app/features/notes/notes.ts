import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

interface Note {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  category: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes.html',
  styleUrls: ['./notes.scss']
})
export class Notes implements OnInit {

  notes: Note[] = [];
  loading = true;
  error = '';
  searchText = '';
  filter: 'all' | 'active' | 'completed' = 'all';

  showForm = false;
  editingNote: Note | null = null;

  formData = {
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    category: 'General',
    dueDate: ''
  };

  /* ==========================================================
     SECURE GITHUB CONFIGURATION
     ========================================================== */

  /*
   * Do NOT put a GitHub Personal Access Token in this Angular file.
   * Angular runs in the user's browser, so any token placed here would
   * be visible in the deployed JavaScript.
   *
   * After the secure serverless endpoint is created, put its URL here.
   */
  private readonly githubApiEndpoint =
    'PASTE_YOUR_SECURE_API_ENDPOINT_HERE';

  githubSyncing = false;
  githubMessage = '';
  githubError = '';

  private readonly localStorageKey = 'notes-todo-data';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    this.loading = true;
    this.error = '';

    try {
      const localData = localStorage.getItem(this.localStorageKey);

      if (localData) {
        const parsed = JSON.parse(localData);

        if (Array.isArray(parsed)) {
          this.notes = parsed;
          this.sortNotes();
          this.loading = false;
          return;
        }
      }
    } catch (error) {
      console.warn('Unable to read local notes.', error);
    }

    this.http
      .get<Note[]>('assets/data/notes.json')
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          if (!Array.isArray(data)) {
            this.notes = [];
            this.error = 'Invalid notes.json format.';
          } else {
            this.notes = data;
            this.sortNotes();
            this.saveLocal();
          }

          this.loading = false;
        },
        error: (err) => {
          console.error('Notes JSON load error:', err);
          this.notes = [];
          this.error = 'Unable to load notes. Starting with an empty list.';
          this.loading = false;
        }
      });
  }

  get filteredNotes(): Note[] {
    let result = [...this.notes];

    if (this.filter === 'active') {
      result = result.filter(note => !note.completed);
    }

    if (this.filter === 'completed') {
      result = result.filter(note => note.completed);
    }

    const search = this.searchText.trim().toLowerCase();

    if (search) {
      result = result.filter(note =>
        note.title.toLowerCase().includes(search) ||
        note.description.toLowerCase().includes(search) ||
        note.category.toLowerCase().includes(search)
      );
    }

    return result;
  }

  get pendingCount(): number {
    return this.notes.filter(note => !note.completed).length;
  }

  get completedCount(): number {
    return this.notes.filter(note => note.completed).length;
  }

  get highPriorityCount(): number {
    return this.notes.filter(
      note => !note.completed && note.priority === 'High'
    ).length;
  }

  openAddForm(): void {
    this.editingNote = null;

    this.formData = {
      title: '',
      description: '',
      priority: 'Medium',
      category: 'General',
      dueDate: ''
    };

    this.showForm = true;
  }

  openEditForm(note: Note): void {
    this.editingNote = note;

    this.formData = {
      title: note.title,
      description: note.description,
      priority: note.priority,
      category: note.category,
      dueDate: note.dueDate
    };

    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingNote = null;
  }

  saveNote(): void {
    const title = this.formData.title.trim();

    if (!title) {
      return;
    }

    const now = new Date().toISOString();

    if (this.editingNote) {
      const index = this.notes.findIndex(
        note => note.id === this.editingNote!.id
      );

      if (index !== -1) {
        this.notes[index] = {
          ...this.notes[index],
          title,
          description: this.formData.description.trim(),
          priority: this.formData.priority,
          category: this.formData.category,
          dueDate: this.formData.dueDate,
          updatedAt: now
        };
      }
    } else {
      const newNote: Note = {
        id: this.generateId(),
        title,
        description: this.formData.description.trim(),
        completed: false,
        priority: this.formData.priority,
        category: this.formData.category,
        dueDate: this.formData.dueDate,
        createdAt: now,
        updatedAt: now
      };

      this.notes.unshift(newNote);
    }

    this.sortNotes();
    this.saveLocal();
    this.closeForm();
  }

  toggleComplete(note: Note): void {
    note.completed = !note.completed;
    note.updatedAt = new Date().toISOString();

    this.sortNotes();
    this.saveLocal();
  }

  deleteNote(note: Note): void {
    const confirmed = window.confirm(`Delete "${note.title}"?`);

    if (!confirmed) {
      return;
    }

    this.notes = this.notes.filter(item => item.id !== note.id);
    this.saveLocal();
  }

  private sortNotes(): void {
    const priorityOrder: Record<string, number> = {
      High: 1,
      Medium: 2,
      Low: 3
    };

    this.notes.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return new Date(b.updatedAt).getTime() -
             new Date(a.updatedAt).getTime();
    });
  }

  private saveLocal(): void {
    try {
      localStorage.setItem(
        this.localStorageKey,
        JSON.stringify(this.notes, null, 2)
      );
    } catch (error) {
      console.warn('Unable to save notes locally.', error);
    }
  }

  async saveToGitHub(): Promise<void> {
    this.githubMessage = '';
    this.githubError = '';

    if (
      !this.githubApiEndpoint ||
      this.githubApiEndpoint === 'PASTE_YOUR_SECURE_API_ENDPOINT_HERE'
    ) {
      this.githubError =
        'Secure GitHub endpoint is not configured yet.';
      return;
    }

    this.githubSyncing = true;

    try {
      const endpoint =
        `${this.githubApiEndpoint.replace(/\\/$/, '')}/save-notes`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: this.notes
        })
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || `Save failed (${response.status}).`
        );
      }

      this.githubMessage =
        '✓ Notes saved to GitHub successfully.';
    } catch (error: any) {
      console.error('GitHub save error:', error);

      this.githubError =
        error?.message || 'Unable to save notes to GitHub.';
    } finally {
      this.githubSyncing = false;
    }
  }

  /*
   * Read-only GitHub loading. No GitHub token is needed to read the
   * repository's public notes.json file.
   */
  async loadFromGitHub(): Promise<void> {
    this.githubMessage = '';
    this.githubError = '';
    this.githubSyncing = true;

    try {
      const rawUrl =
        'https://raw.githubusercontent.com/' +
        'Kunal-Chouhan/kunal-chouhan-pmp/main/data/notes.json';

      const response = await fetch(rawUrl, {
        method: 'GET',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(
          `Unable to load notes from GitHub (${response.status}).`
        );
      }

      const loadedNotes = await response.json();

      if (!Array.isArray(loadedNotes)) {
        throw new Error('GitHub notes.json is not an array.');
      }

      this.notes = loadedNotes;
      this.sortNotes();
      this.saveLocal();

      this.githubMessage =
        '✓ Notes loaded from GitHub successfully.';
    } catch (error: any) {
      console.error('GitHub load error:', error);

      this.githubError =
        error?.message || 'Unable to load notes from GitHub.';
    } finally {
      this.githubSyncing = false;
    }
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      '-' +
      Math.random().toString(36).substring(2, 9)
    );
  }

  trackById(index: number, note: Note): string {
    return note.id;
  }

  formatDate(value: string): string {
    if (!value) {
      return '';
    }

    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDueDate(value: string): string {
    if (!value) {
      return '';
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  isOverdue(note: Note): boolean {
    if (!note.dueDate || note.completed) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(`${note.dueDate}T00:00:00`);

    return due < today;
  }
}
