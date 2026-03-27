// ============================================================
// SamsNotes — Folder Slice
// All folder CRUD operations for the Zustand store
// ============================================================

import { Folder, Note } from '@/types';
import { foldersDB, notesDB } from '@/lib/db';
import { nanoid } from 'nanoid';
import { MAX_FOLDER_NAME_LENGTH, DEFAULT_FOLDER_ID } from '@/lib/constants';
import type { StoreApi } from 'zustand';
import type { AppState } from '@/types';

export interface FolderActions {
  selectFolder: (id: string | null) => void;
  createFolder: (name: string, icon?: string) => Promise<Folder | null>;
  renameFolder: (id: string, name: string) => Promise<boolean>;
  deleteFolder: (id: string) => Promise<boolean>;
}

export function createFolderSlice(
  set: StoreApi<AppState & FolderActions>['setState'],
  get: StoreApi<AppState & FolderActions>['getState']
): FolderActions {
  return {
    selectFolder: (id) => {
      set({ selectedFolderId: id, selectedNoteId: null, searchQuery: '', activeTagFilter: null });
    },

    createFolder: async (name, icon = 'Folder') => {
      const trimmed = name.trim();
      if (!trimmed || trimmed.length > MAX_FOLDER_NAME_LENGTH) return null;
      const { folders } = get();
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

      // Safety: ensure the default folder exists before orphaning notes
      const defaultExists = folders.some((f) => f.id === DEFAULT_FOLDER_ID);
      if (!defaultExists) {
        console.error(`[SamsNotes] Cannot delete folder: default folder '${DEFAULT_FOLDER_ID}' missing`);
        return false;
      }

      // Move folder's notes to default folder
      const affectedNotes = notes.filter((n) => n.folderId === id);
      const now = Date.now();
      await Promise.all(
        affectedNotes.map((n) => {
          const moved: Note = { ...n, folderId: DEFAULT_FOLDER_ID, updatedAt: now };
          return notesDB.put(moved);
        })
      );

      await foldersDB.delete(id);

      set((state) => ({
        folders: state.folders.filter((f) => f.id !== id),
        notes: state.notes.map((n) =>
          n.folderId === id ? { ...n, folderId: DEFAULT_FOLDER_ID, updatedAt: now } : n
        ),
        selectedFolderId: selectedFolderId === id ? DEFAULT_FOLDER_ID : selectedFolderId,
        selectedNoteId: null,
      }));
      return true;
    },
  };
}
