// ============================================================
// SamsNotes — Zustand Global Store (Modular)
// Composes folder, note, and UI slices into a single store
// ============================================================

import { create } from 'zustand';
import { AppState } from '@/types';
import { foldersDB, notesDB, settingsDB, seedInitialData } from '@/lib/db';
import { createFolderSlice, type FolderActions } from './folderSlice';
import { createNoteSlice, type NoteActions } from './noteSlice';
import { createUISlice, type UIActions } from './uiSlice';

// ── Combined Store Type ──────────────────────────────────────

export type Store = AppState & FolderActions & NoteActions & UIActions & {
  initialize: () => Promise<void>;
};

// ── Store ────────────────────────────────────────────────────

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

      document.documentElement.dataset.theme = settings.theme ?? 'dark';
    } catch (e) {
      console.error('[SamsNotes] Init failed:', e);
      set({ isInitialized: true });
    }
  },

  // ── Slices ──────────────────────────────────────────────────
  ...createFolderSlice(set as any, get as any),
  ...createNoteSlice(set as any, get as any),
  ...createUISlice(set as any, get as any),
}));
