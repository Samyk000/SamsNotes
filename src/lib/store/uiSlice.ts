// ============================================================
// SamsNotes — UI Slice
// Search, sort, filter, theme, and transient UI state
// ============================================================

import { Note, SortOption, FilterOption } from '@/types';
import { settingsDB } from '@/lib/db';
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

function filterNotes(notes: Note[], filterBy: string): Note[] {
  switch (filterBy) {
    case 'tagged':   return notes.filter((n) => n.tags.length > 0);
    case 'untagged': return notes.filter((n) => n.tags.length === 0);
    default:         return notes;
  }
}

// ── Slice ────────────────────────────────────────────────────

export interface UIActions {
  setSearchQuery: (q: string) => void;
  setSortBy: (s: SortOption) => void;
  setFilterBy: (f: FilterOption) => void;
  setTagFilter: (t: string | null) => void;
  setReducedMotion: (v: boolean) => Promise<void>;
  setTheme: (t: 'dark' | 'light') => Promise<void>;
  setSaveState: (s: 'saved' | 'saving' | 'error') => void;
  setMobileEditorOpen: (v: boolean) => void;
  getFilteredNotes: () => Note[];
}

export function createUISlice(
  set: StoreApi<AppState & UIActions>['setState'],
  get: StoreApi<AppState & UIActions>['getState']
): UIActions {
  return {
    setSearchQuery: (q) => set({ searchQuery: q }),
    setSortBy: (s) => set({ sortBy: s }),
    setFilterBy: (f) => set({ filterBy: f }),
    setTagFilter: (t) => set({ activeTagFilter: t }),

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
  };
}
