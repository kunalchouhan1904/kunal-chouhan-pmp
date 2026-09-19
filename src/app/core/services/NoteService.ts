import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

export interface Note {
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

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly apiUrl = '/api/notes';

  constructor(private http: HttpClient) {}

  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.apiUrl, {
      headers: { 'Cache-Control': 'no-cache' }
    }).pipe(
      take(1),
      map(data => Array.isArray(data) ? data : [])
    );
  }

  saveNotes(notes: Note[]): Observable<void> {
    return this.http.put<{ success: boolean }>(
      this.apiUrl,
      notes,
      { headers: { 'Content-Type': 'application/json' } }
    ).pipe(
      take(1),
      map(() => void 0)
    );
  }

  saveNote(note: Note): Observable<Note[]> {
    return this.getNotes().pipe(
      map(notes => {
        const index = notes.findIndex(item => item.id === note.id);
        if (index >= 0) notes[index] = note;
        else notes.unshift(note);
        return notes;
      })
    );
  }

  getNote(noteId: string): Observable<Note | null> {
    return this.getNotes().pipe(
      map(notes => notes.find(note => note.id === noteId) ?? null)
    );
  }
}
