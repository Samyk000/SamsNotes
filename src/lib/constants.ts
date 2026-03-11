// ============================================================
// SamsNotes — Centralised Constants
// ============================================================

// IndexedDB configuration
export const DB_NAME = 'samsnotes-db';
export const DB_VERSION = 1;

// Object store names
export const STORE_FOLDERS = 'folders';
export const STORE_NOTES = 'notes';
export const STORE_SETTINGS = 'settings';

// Constraints (from specification)
export const MAX_FOLDER_NAME_LENGTH = 32;
export const MAX_TAG_LENGTH = 30;
export const MAX_TAGS_PER_NOTE = 20;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// UX timings (ms)
export const SEARCH_DEBOUNCE_MS = 300;
export const SAVE_DEBOUNCE_MS = 800;
export const UNDO_TOAST_DURATION_MS = 5000;

// Default IDs (must match seed data)
export const FOLDER_ALL_ID = 'all';
export const FOLDER_UNCATEGORISED_ID = 'uncategorised';
