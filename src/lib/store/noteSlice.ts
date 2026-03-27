// ============================================================
// SamsNotes — Note Slice
// All note CRUD operations for the Zustand store
// ============================================================

import { Note, SortOption } from '@/types';
import { notesDB } from '@/lib/db';
import { nanoid } from 'nanoid';
import { DUPLICATE_GUARD_MS, COPY_SUFFIX_PATTERN } from '@/lib/constants';
import { toast } from 'sonner';
import type { StoreApi } from 'zustand';
import type { AppState } from '@/types';

// ── Helpers ──────────────────────────────────────────────────

function sortNotes(notes: Note[], sortBy: string): Note[] {
  const sorted = [...notes];
  switch (sortBy) {
    case 'modified-desc': return sorted.sort((a, b) => b.updatedAt - a.updatedAt);
    case 'modified-asc':  return sorted.sort((a, b) => a.updatedAt - b.updatedAt);
    case 'created-desc':  return sorted.sort((a, b) => b.createdAt - a.createdAt);
    case 'created-asc':   return sorted.sort((a, b) => a.createdAt - b.createdAt);
    case 'title-asc':     return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':    return sorted.sort((a, b) => b.title.localeCompare(a.title));
    default:              return sorted;
  }
}

/**
 * Generates a smart copy title:
 *   "Title"         → "Title (copy)"
 *   "Title (copy)"  → "Title (copy 2)"
 *   "Title (copy 2)"→ "Title (copy 3)"
 *   ""              → "(copy)"
 */
function generateCopyTitle(sourceTitle: string): string {
  const match = sourceTitle.match(COPY_SUFFIX_PATTERN);
  if (match) {
    const num = match[1] ? parseInt(match[1], 10) + 1 : 2;
    return sourceTitle.replace(COPY_SUFFIX_PATTERN, ` (copy ${num})`);
  }
  return sourceTitle ? `${sourceTitle} (copy)` : '(copy)';
}

// ── Slice ────────────────────────────────────────────────────

export interface NoteActions {
  selectNote: (id: string | null) => void;
  createNote: () => Promise<Note | null>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  updateNoteContent: (id: string, content: any | null, plainText: string) => Promise<void>;
  deleteNote: (id: string) => Promise<Note | null>;
  duplicateNote: (id: string) => Promise<Note | null>;
  moveNote: (noteId: string, folderId: string) => Promise<boolean>;
}

export function createNoteSlice(
  set: StoreApi<AppState & NoteActions>['setState'],
  get: StoreApi<AppState & NoteActions>['getState']
): NoteActions {
  return {
    selectNote: (id) => {
      set({ selectedNoteId: id });
    },

    createNote: async () => {
      const { selectedFolderId, searchQuery, notes } = get();
      if (!selectedFolderId) return null;

      // Prevent rapid duplicates
      const recent = notes.find(
        (n) => n.folderId === selectedFolderId && Date.now() - n.createdAt < DUPLICATE_GUARD_MS
      );
      if (recent && !recent.title && !recent.plainText) return null;

      if (searchQuery) set({ searchQuery: '' });

      const now = Date.now();
      let defaultViewType: typeof notes[0]['viewType'] = 'doc';
      if (selectedFolderId === 'to-do') defaultViewType = 'todo';
      if (selectedFolderId === 'whiteboard') defaultViewType = 'canvas';

      const note: Note = {
        id: nanoid(),
        folderId: selectedFolderId,
        title: '',
        viewType: defaultViewType,
        content: null,
        plainText: '',
        tags: [],
        createdAt: now,
        updatedAt: now,
      };
      await notesDB.put(note);
      set((state) => ({ notes: [...state.notes, note] }));
      get().selectNote(note.id);
      return note;
    },

    updateNote: async (id, data) => {
      const { notes } = get();
      const existing = notes.find((n) => n.id === id);
      if (!existing) return;

      set({ saveState: 'saving' });
      const updated: Note = { ...existing, ...data, updatedAt: Date.now() };
      try {
        await notesDB.put(updated);
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updated : n)),
          saveState: 'saved',
        }));
      } catch {
        set({ saveState: 'error' });
        toast.error('Failed to save changes. Your browser storage might be full.');
      }
    },

    updateNoteContent: async (id, content, plainText) => {
      const { notes } = get();
      const existing = notes.find((n) => n.id === id);
      if (!existing) return;

      set({ saveState: 'saving' });
      const updated: Note = { ...existing, content, plainText, updatedAt: Date.now() };
      try {
        await notesDB.put(updated);
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? updated : n)),
          saveState: 'saved',
        }));
      } catch {
        set({ saveState: 'error' });
        toast.error('Failed to save changes. Your browser storage might be full.');
      }
    },

    deleteNote: async (id) => {
      const { notes, selectedNoteId, selectedFolderId, sortBy } = get();
      const deleted = notes.find((n) => n.id === id);
      if (!deleted) return null;

      await notesDB.delete(id);
      const remaining = notes.filter((n) => n.id !== id);

      let newSelectedId: string | null = selectedNoteId === id ? null : selectedNoteId;
      if (selectedNoteId === id && selectedFolderId) {
        const folderNotes = sortNotes(
          remaining.filter((n) => n.folderId === selectedFolderId),
          sortBy
        );
        newSelectedId = folderNotes[0]?.id ?? null;
      }

      set({ notes: remaining, selectedNoteId: newSelectedId });
      return deleted;
    },

    duplicateNote: async (id) => {
      const { notes } = get();
      const source = notes.find((n) => n.id === id);
      if (!source) return null;

      const now = Date.now();
      const dup: Note = {
        ...source,
        id: nanoid(),
        title: generateCopyTitle(source.title),
        createdAt: now,
        updatedAt: now,
      };
      await notesDB.put(dup);
      set((state) => ({ notes: [...state.notes, dup] }));
      return dup;
    },

    moveNote: async (noteId, folderId) => {
      const { notes } = get();
      const existing = notes.find((n) => n.id === noteId);
      if (!existing) return false;
      const updated: Note = { ...existing, folderId, updatedAt: Date.now() };
      await notesDB.put(updated);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? updated : n)),
      }));
      return true;
    },
  };
}
