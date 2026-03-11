// ============================================================
// SamsNotes — Zustand Global Store
// Uses async IndexedDB operations throughout
// ============================================================

import { create } from 'zustand';
import { Folder, Note, SortOption, FilterOption, AppState, RichContent } from '@/types';
import { foldersDB, notesDB, settingsDB, seedInitialData, dataDB } from '@/lib/db';
import { nanoid } from 'nanoid';
import { MAX_FOLDER_NAME_LENGTH } from '@/lib/constants';

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

function filterNotes(notes: Note[], filterBy: string): Note[] {
  switch (filterBy) {
    case 'tagged':   return notes.filter((n) => n.tags.length > 0);
    case 'untagged': return notes.filter((n) => n.tags.length === 0);
    default:         return notes;
  }
}

/** Extract plain text from ProseMirror/TipTap JSON for search indexing. */
function extractPlainText(content: RichContent | null): string {
  if (!content) return '';
  const parts: string[] = [];
  function walk(node: RichContent) {
    if (node.text) parts.push(node.text);
    node.content?.forEach(walk);
  }
  walk(content);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// ── Store interface ───────────────────────────────────────────

interface Store extends AppState {
  // Init
  initialize: () => Promise<void>;

  // Folders
  selectFolder: (id: string | null) => void;
  createFolder: (name: string, icon?: string) => Promise<Folder | null>;
  renameFolder: (id: string, name: string) => Promise<boolean>;
  deleteFolder: (id: string) => Promise<boolean>;

  // Notes
  selectNote: (id: string | null) => void;
  createNote: () => Promise<Note | null>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  updateNoteContent: (id: string, content: RichContent | null) => Promise<void>;
  deleteNote: (id: string) => Promise<Note | null>;
  duplicateNote: (id: string) => Promise<Note | null>;
  moveNote: (noteId: string, folderId: string) => Promise<boolean>;

  // Search & Filter
  setSearchQuery: (q: string) => void;
  setSortBy: (s: SortOption) => void;
  setFilterBy: (f: FilterOption) => void;
  setTagFilter: (t: string | null) => void;

  // UI
  setReducedMotion: (v: boolean) => Promise<void>;
  setTheme: (t: 'dark' | 'light') => Promise<void>;
  setSaveState: (s: 'saved' | 'saving' | 'error') => void;
  setMobileEditorOpen: (v: boolean) => void;

  // Computed
  getFilteredNotes: () => Note[];
}

// ── Store ─────────────────────────────────────────────────────

export const useStore = create<Store>((set, get) => ({
  // ── Initial State ───────────────────────────────────────────
  folders: [],
  notes: [],
  selectedFolderId: null,
  selectedNoteId: null,
  searchQuery: '',
  activeTagFilter: null,
  sortBy: 'modified-desc',
  filterBy: 'all',
  reducedMotion: false,
  theme: 'dark' as 'dark' | 'light',
  saveState: 'saved',
  isInitialized: false,
  isMobileEditorOpen: false,

  // ── Initialization ──────────────────────────────────────────
  initialize: async () => {
    try {
      await seedInitialData();

      const [folders, notes, settings] = await Promise.all([
        foldersDB.getAll(),
        notesDB.getAll(),
        settingsDB.get(),
      ]);

      // Restore selections — default to first folder
      const firstFolderId = folders[0]?.id ?? null;

      set({
        folders,
        notes,
        selectedFolderId: firstFolderId,
        selectedNoteId: null,
        sortBy: 'modified-desc',
        filterBy: 'all',
        reducedMotion: settings.reducedMotion ?? false,
        theme: (settings.theme as 'dark' | 'light') ?? 'dark',
        isInitialized: true,
      });
      // Apply theme on load
      document.documentElement.dataset.theme = settings.theme ?? 'dark';
    } catch (e) {
      console.error('[SamsNotes] Init failed:', e);
      set({ isInitialized: true });
    }
  },

  // ── Folders ─────────────────────────────────────────────────
  selectFolder: (id) => {
    set({ selectedFolderId: id, selectedNoteId: null, searchQuery: '', activeTagFilter: null });
  },

  createFolder: async (name, icon = 'Folder') => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > MAX_FOLDER_NAME_LENGTH) return null;
    const { folders } = get();
    // Deduplication check
    if (folders.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) return null;

    const now = Date.now();
    const folder: Folder = {
      id: nanoid(),
      name: trimmed,
      type: 'custom',
      icon,
      order: folders.length,
      createdAt: now,
      updatedAt: now,
    };
    await foldersDB.put(folder);
    set((state) => ({ folders: [...state.folders, folder] }));
    return folder;
  },

  renameFolder: async (id, name) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > MAX_FOLDER_NAME_LENGTH) return false;
    const { folders } = get();
    // Prevent duplicate name
    if (folders.some((f) => f.id !== id && f.name.toLowerCase() === trimmed.toLowerCase())) return false;

    const existing = folders.find((f) => f.id === id);
    if (!existing || existing.type === 'system') return false;

    const updated: Folder = { ...existing, name: trimmed, updatedAt: Date.now() };
    await foldersDB.put(updated);
    set((state) => ({ folders: state.folders.map((f) => (f.id === id ? updated : f)) }));
    return true;
  },

  deleteFolder: async (id) => {
    const { folders, notes, selectedFolderId } = get();
    const folder = folders.find((f) => f.id === id);
    if (!folder || folder.type === 'system') return false;

    // Move folder's notes to 'My Notes'
    const affectedNotes = notes.filter((n) => n.folderId === id);
    const now = Date.now();
    await Promise.all(
      affectedNotes.map((n) => {
        const moved: Note = { ...n, folderId: 'my-notes', updatedAt: now };
        return notesDB.put(moved);
      })
    );

    await foldersDB.delete(id);

    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
      notes: state.notes.map((n) =>
        n.folderId === id ? { ...n, folderId: 'my-notes', updatedAt: now } : n
      ),
      selectedFolderId: selectedFolderId === id ? 'my-notes' : selectedFolderId,
      selectedNoteId: null,
    }));
    return true;
  },

  // ── Notes ────────────────────────────────────────────────────
  selectNote: (id) => {
    set({ selectedNoteId: id });
  },

  createNote: async () => {
    const { selectedFolderId, searchQuery, notes } = get();
    if (!selectedFolderId) return null;

    // Prevent rapid duplicates within 1 second
    const recent = notes.find(
      (n) => n.folderId === selectedFolderId && Date.now() - n.createdAt < 1000
    );
    if (recent && !recent.title && !recent.plainText) return null;

    if (searchQuery) set({ searchQuery: '' });

    const now = Date.now();
    const note: Note = {
      id: nanoid(),
      folderId: selectedFolderId,
      title: '',
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
    set({ saveState: 'saving' });
    try {
      const { notes } = get();
      const existing = notes.find((n) => n.id === id);
      if (!existing) { set({ saveState: 'error' }); return; }
      const updated: Note = { ...existing, ...data, updatedAt: Date.now() };
      await notesDB.put(updated);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updated : n)),
        saveState: 'saved',
      }));
    } catch {
      set({ saveState: 'error' });
    }
  },

  updateNoteContent: async (id, content) => {
    set({ saveState: 'saving' });
    try {
      const { notes } = get();
      const existing = notes.find((n) => n.id === id);
      if (!existing) { set({ saveState: 'error' }); return; }
      const plainText = extractPlainText(content);
      const updated: Note = { ...existing, content, plainText, updatedAt: Date.now() };
      await notesDB.put(updated);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updated : n)),
        saveState: 'saved',
      }));
    } catch {
      set({ saveState: 'error' });
    }
  },

  /** Deletes the note and returns it (so callers can offer an Undo). */
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
      title: `${source.title} (copy)`,
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

  // ── Search & Filter ────────────────────────────────────────
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortBy: (s) => set({ sortBy: s }),
  setFilterBy: (f) => set({ filterBy: f }),
  setTagFilter: (t) => set({ activeTagFilter: t }),

  // ── UI ─────────────────────────────────────────────────────
  setReducedMotion: async (v) => {
    set({ reducedMotion: v });
    await settingsDB.update({ reducedMotion: v });
  },
  setTheme: async (t) => {
    set({ theme: t });
    document.documentElement.dataset.theme = t;
    await settingsDB.update({ theme: t });
  },
  setSaveState: (s) => set({ saveState: s }),
  setMobileEditorOpen: (v) => set({ isMobileEditorOpen: v }),

  // ── Computed ────────────────────────────────────────────────
  getFilteredNotes: () => {
    const { notes, selectedFolderId, searchQuery, sortBy, filterBy, activeTagFilter } = get();

    let filtered = notes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.plainText.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    } else if (selectedFolderId) {
      filtered = notes.filter((n) => n.folderId === selectedFolderId);
    }

    if (activeTagFilter) {
      filtered = filtered.filter((n) =>
        n.tags.some((t) => t.toLowerCase() === activeTagFilter.toLowerCase())
      );
    }

    filtered = filterNotes(filtered, filterBy);
    return sortNotes(filtered, sortBy);
  },
}));
