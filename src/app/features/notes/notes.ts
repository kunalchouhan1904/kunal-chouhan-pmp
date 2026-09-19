import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note, NoteService } from '../../core/services/NoteService';

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

  constructor(private noteService: NoteService) {}

  ngOnInit(): void {
    this.loadNotes();
  }

  /**
   * Load notes through NoteService.
   */
  loadNotes(): void {
    this.loading = true;
    this.error = '';

    this.noteService.getNotes().subscribe({
      next: (data) => {
        this.notes = Array.isArray(data) ? data : [];
        this.sortNotes();
        this.loading = false;
      },
      error: (error) => {
        console.error('Notes load error:', error);
        this.notes = [];
        this.error = 'Unable to load notes.';
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

  /**
   * Save the note entered in the popup through NoteService.
   * The service persists the complete notes collection, so the new
   * note is still available after refresh/reopen.
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

    this.noteService.saveNotes(this.notes).subscribe({
      next: () => {
        this.closeForm();
      },
      error: (error) => {
        console.error('Note save error:', error);
        this.error = 'Unable to save the note.';
      }
    });
  }

  toggleComplete(note: Note): void {
    note.completed = !note.completed;
    note.updatedAt = new Date().toISOString();

    this.sortNotes();

    this.noteService.saveNotes(this.notes).subscribe({
      error: (error) => {
        console.error('Note update error:', error);
        this.error = 'Unable to update the note.';
      }
    });
  }

  deleteNote(note: Note): void {
    const confirmed = window.confirm(`Delete "${note.title}"?`);

    if (!confirmed) {
      return;
    }

    this.notes = this.notes.filter(item => item.id !== note.id);

    this.noteService.saveNotes(this.notes).subscribe({
      error: (error) => {
        console.error('Note delete error:', error);
        this.error = 'Unable to delete the note.';
      }
    });
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

      const aPriority = priorityOrder[a.priority] ?? Number.MAX_SAFE_INTEGER;
      const bPriority = priorityOrder[b.priority] ?? Number.MAX_SAFE_INTEGER;

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
