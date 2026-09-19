import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly localStorageKey = 'notes-todo-data';
  private readonly seedNotesUrl = 'assets/data/notes.json';

  constructor(private http: HttpClient) {}

  /**
   * Retrieve all saved notes.
   *
   * Existing notes are read from localStorage first. If nothing has
   * been saved yet, the application's notes.json is used as the
   * initial seed and then persisted locally.
   */
  getNotes(): Observable<Note[]> {
    try {
      const localData = localStorage.getItem(this.localStorageKey);

      if (localData) {
        const parsed = JSON.parse(localData);

        if (Array.isArray(parsed)) {
          return of(parsed as Note[]);
        }
      }
    } catch (error) {
      console.warn('Unable to read saved notes.', error);
    }

    return this.http.get<Note[]>(this.seedNotesUrl).pipe(
      take(1),
      map((data) => {
        const notes = Array.isArray(data) ? data : [];
        this.writeNotes(notes);
        return notes;
      }),
      catchError((error) => {
        console.warn('Unable to load initial notes.', error);
        return of([]);
      })
    );
  }

  /**
   * Save the complete notes collection.
   * This is the single persistence point used by the Notes component
   * for add, edit, complete and delete operations.
   */
  saveNotes(notes: Note[]): Observable<void> {
    try {
      this.writeNotes(notes);
      return of(void 0);
    } catch (error) {
      console.error('Unable to save notes.', error);
      throw error;
    }
  }

  /**
   * Save one note and return the updated collection.
   * Useful when a caller wants an explicit "save note" operation.
   */
  saveNote(note: Note): Observable<Note[]> {
    return this.getNotes().pipe(
      map((notes) => {
        const index = notes.findIndex((item) => item.id === note.id);

        if (index >= 0) {
          notes[index] = note;
        } else {
          notes.unshift(note);
        }

        this.writeNotes(notes);
        return notes;
      })
    );
  }

  /**
   * Retrieve one note by id.
   */
  getNote(noteId: string): Observable<Note | null> {
    return this.getNotes().pipe(
      map((notes) => notes.find((note) => note.id === noteId) ?? null)
    );
  }

  private writeNotes(notes: Note[]): void {
    localStorage.setItem(
      this.localStorageKey,
      JSON.stringify(notes, null, 2)
    );
  }
}
