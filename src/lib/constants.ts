// ============================================================
// SamsNotes — Centralised Constants
// Single source of truth for all magic values
// ============================================================

// ── IndexedDB ────────────────────────────────────────────────

export const DB_NAME = 'samsnotes-db';
export const DB_VERSION = 1;

export const STORE_FOLDERS = 'folders';
export const STORE_NOTES = 'notes';
export const STORE_SETTINGS = 'settings';

// ── System Folder IDs ────────────────────────────────────────
// Must match seed data in seed.ts

export const SYSTEM_FOLDER_IDS = {
  MY_NOTES: 'my-notes',
  TODO: 'to-do',
  WHITEBOARD: 'whiteboard',
  PROJECTS: 'projects',
  JOURNAL: 'journal',
  READING_LIST: 'reading-list',
} as const;

/** The default fallback folder for orphaned notes. */
export const DEFAULT_FOLDER_ID = SYSTEM_FOLDER_IDS.MY_NOTES;

// Legacy aliases (for backward compat with existing imports)
export const FOLDER_ALL_ID = 'all';
export const FOLDER_UNCATEGORISED_ID = 'uncategorised';

// ── Data Constraints ─────────────────────────────────────────

export const MAX_FOLDER_NAME_LENGTH = 32;
export const MAX_TAG_LENGTH = 30;
export const MAX_TAGS_PER_NOTE = 20;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_IMPORT_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

// ── UX Timings (ms) ─────────────────────────────────────────

export const SEARCH_DEBOUNCE_MS = 300;
export const SAVE_DEBOUNCE_MS = 800;
export const TITLE_DEBOUNCE_MS = 400;
export const UNDO_TOAST_DURATION_MS = 5000;
export const DUPLICATE_GUARD_MS = 1000;

// ── Z-Index Scale ────────────────────────────────────────────
// Canonical layers — prevents z-index wars across components.
// Use via Tailwind: z-sticky, z-dropdown, z-overlay, etc.

export const Z_INDEX = {
  /** Sticky headers, toolbars (10) */
  STICKY: 10,
  /** Sidebar rails, resize handles (20) */
  SIDEBAR: 20,
  /** FAB buttons (30) */
  FAB: 30,
  /** Dropdown menus, popups, context menus, tooltips (50) */
  DROPDOWN: 50,
  /** Mobile toolbar (100) */
  MOBILE_TOOLBAR: 100,
  /** Modal overlays, dialogs, sheets, drawers (200) */
  OVERLAY: 200,
  /** Fullscreen mode (9999) */
  FULLSCREEN: 9999,
  /** Controls on top of fullscreen (10001) */
  FULLSCREEN_CONTROLS: 10001,
} as const;

// ── UI Strings ───────────────────────────────────────────────

export const CLEAR_CONFIRM_TEXT = 'CLEAR';
export const DEFAULT_NOTE_TITLE = 'Untitled Note';
export const COPY_SUFFIX_PATTERN = / \(copy(?: (\d+))?\)$/;
