// SamsNotes Type Definitions

// Rich text content type (TipTap/ProseMirror JSON)
export type RichContent = {
  type: string;
  content?: RichContent[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  attrs?: Record<string, unknown>;
  text?: string;
};

// Folder types
export type FolderType = 'system' | 'custom';

export interface Folder {
  id: string;
  name: string;
  type: FolderType;
  icon: string; // Icon name as string
  createdAt: number;
  updatedAt: number;
  order: number;
}

// Note View Types
export type ViewType = 'doc' | 'canvas' | 'todo';

// Note type
export interface Note {
  id: string;
  folderId: string;
  title: string;
  viewType?: ViewType; // Determines which editor to use
  content: any | null; // Changed from RichContent to 'any' to support Tldraw state or Todo state dynamically
  plainText: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// System folder identifiers
export type SystemFolderId = 'my-notes' | 'to-do' | 'projects' | 'journal' | 'reading-list' | 'whiteboard';

// Sort options
export type SortOption = 
  | 'modified-desc' 
  | 'modified-asc' 
  | 'created-desc' 
  | 'created-asc' 
  | 'title-asc' 
  | 'title-desc';

// Filter options
export type FilterOption = 'all' | 'tagged' | 'untagged';

// App state
export interface AppState {
  // Data
  folders: Folder[];
  notes: Note[];
  
  // Selection
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  
  // Search & Filter
  searchQuery: string;
  activeTagFilter: string | null;
  sortBy: SortOption;
  filterBy: FilterOption;
  
  // UI State
  reducedMotion: boolean;
  theme: 'dark' | 'light';
  saveState: 'saved' | 'saving' | 'error';
  
  // Initialization
  isInitialized: boolean;
  
  // Mobile
  isMobileEditorOpen: boolean;
}

// Settings
export interface Settings {
  reducedMotion: boolean;
  theme: 'dark' | 'light';
  lastExportDate?: number;
}

// Export data format
export interface ExportData {
  version: string;
  exportedAt: number;
  folders: Folder[];
  notes: Note[];
  settings: Settings;
}

// Menu item for dropdowns
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  isDestructive?: boolean;
  isDisabled?: boolean;
}

// Note: DB constants have moved to @/lib/constants.ts
// Note: DEFAULT_FOLDERS and DEMO_NOTES have moved to @/lib/seed.ts
