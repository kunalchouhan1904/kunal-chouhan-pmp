import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../core/services/NoteService';

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

  /*
   * Same persistence approach used by LearningComponent bookmarks:
   * browser localStorage.
   *
   * Existing key is retained so any notes already stored by the
   * previous Notes implementation are preserved.
   */
  private readonly notesStorageKey = 'notes-todo-data';

  formData = {
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    category: 'General',
    dueDate: ''
  };

  ngOnInit(): void {
    this.loadNotes();
  }

  /**
   * Load notes from browser localStorage.
   *
   * This follows the same pattern as LearningComponent.restoreBookmark():
   * localStorage.getItem() -> JSON.parse() -> restore component state.
   */
  loadNotes(): void {
    this.loading = true;
    this.error = '';

    try {
      const saved = localStorage.getItem(this.notesStorageKey);

      if (!saved) {
        this.notes = [];
        this.loading = false;
        return;
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        console.warn('Saved notes data is not an array.');
        this.notes = [];
        this.error = 'Saved notes data is invalid.';
        this.loading = false;
        return;
      }

      this.notes = parsed as Note[];
      this.sortNotes();
      this.loading = false;
    } catch (error) {
      console.error('Unable to restore notes from localStorage.', error);
      this.notes = [];
      this.error = 'Unable to load saved notes.';
      this.loading = false;
    }
  }

  /**
   * Save the complete notes collection to browser localStorage.
   *
   * This is intentionally the same persistence mechanism used by
   * LearningComponent.saveBookmark().
   */
  private saveNotes(): boolean {
    try {
      localStorage.setItem(
        this.notesStorageKey,
        JSON.stringify(this.notes)
      );

      return true;
    } catch (error) {
      console.error('Unable to save notes to localStorage.', error);
      this.error = 'Unable to save the note in this browser.';
      return false;
    }
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

    this.error = '';
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

    this.error = '';
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingNote = null;
  }

  /**
   * Create or update a note and immediately persist it to localStorage.
   */
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

    if (this.saveNotes()) {
      this.closeForm();
    }
  }

  /**
   * Complete/uncomplete a note and persist the change.
   */
  toggleComplete(note: Note): void {
    note.completed = !note.completed;
    note.updatedAt = new Date().toISOString();

    this.sortNotes();
    this.saveNotes();
  }

  /**
   * Delete a note and persist the change.
   */
  deleteNote(note: Note): void {
    const confirmed = window.confirm(`Delete "${note.title}"?`);

    if (!confirmed) {
      return;
    }

    this.notes = this.notes.filter(item => item.id !== note.id);
    this.saveNotes();
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

      const aPriority =
        priorityOrder[a.priority] ?? Number.MAX_SAFE_INTEGER;

      const bPriority =
        priorityOrder[b.priority] ?? Number.MAX_SAFE_INTEGER;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime();
    });
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
