'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Folder } from '@/types';
import { Logo } from '@/components/common/Logo';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Settings,
  FileText,
  CheckSquare,
  FolderKanban,
  BookOpen,
  Bookmark,
  Folder as FolderIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { MAX_FOLDER_NAME_LENGTH, SEARCH_DEBOUNCE_MS } from '@/lib/constants';

// ── Icon map ──────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  CheckSquare,
  FolderKanban,
  BookOpen,
  Bookmark,
  Folder: FolderIcon,
};

function FolderItemIcon({ icon }: { icon: string }) {
  const Icon = ICON_MAP[icon] ?? FolderIcon;
  return <Icon className="w-4 h-4 shrink-0" />;
}

// ── Sidebar ───────────────────────────────────────────────────

interface SidebarProps {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const {
    folders,
    selectedFolderId,
    searchQuery,
    selectFolder,
    setSearchQuery,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useStore();

  // Search debounce
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, SEARCH_DEBOUNCE_MS);
  }, [setSearchQuery]);

  useEffect(() => {
    if (!searchQuery && localSearch) setLocalSearch('');
  }, [searchQuery]);

  // Add folder state
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderError, setNewFolderError] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);

  // Rename state
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [renameError, setRenameError] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Overflow menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Confirm delete dialog state
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<Folder | null>(null);

  // Focus inputs
  useEffect(() => {
    if (isAddingFolder) addInputRef.current?.focus();
  }, [isAddingFolder]);
  useEffect(() => {
    if (renamingFolderId) renameInputRef.current?.focus();
  }, [renamingFolderId]);

  // Close overflow menus on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      const ref = menuRefs.current[openMenuId];
      if (ref && !ref.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId]);

  // ── Folder create ────────────────────────────────────────────
  const handleStartAdd = () => {
    setIsAddingFolder(true);
    setNewFolderName('');
    setNewFolderError('');
  };

  const handleAddFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) { setIsAddingFolder(false); return; }
    if (trimmed.length > MAX_FOLDER_NAME_LENGTH) {
      setNewFolderError(`Max ${MAX_FOLDER_NAME_LENGTH} characters`);
      return;
    }
    const { folders: current } = useStore.getState();
    if (current.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewFolderError('A folder with this name already exists');
      return;
    }
    const folder = await createFolder(trimmed);
    if (folder) {
      selectFolder(folder.id);
      setIsAddingFolder(false);
      setNewFolderName('');
      setNewFolderError('');
    }
  };

  // ── Folder rename ────────────────────────────────────────────
  const startRename = (folder: Folder) => {
    setRenamingFolderId(folder.id);
    setRenameName(folder.name);
    setRenameError('');
    setOpenMenuId(null);
  };

  const handleRename = async () => {
    if (!renamingFolderId) return;
    const trimmed = renameName.trim();
    if (!trimmed) { setRenamingFolderId(null); return; }
    if (trimmed.length > MAX_FOLDER_NAME_LENGTH) {
      setRenameError(`Max ${MAX_FOLDER_NAME_LENGTH} characters`);
      return;
    }
    const { folders: current } = useStore.getState();
    const hasDupe = current.some(
      (f) => f.id !== renamingFolderId && f.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (hasDupe) { setRenameError('Name already in use'); return; }

    await renameFolder(renamingFolderId, trimmed);
    setRenamingFolderId(null);
    setRenameError('');
  };

  // ── Folder delete ────────────────────────────────────────────
  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteFolder) return;
    await deleteFolder(confirmDeleteFolder.id);
    toast(`Folder "${confirmDeleteFolder.name}" deleted`);
    setConfirmDeleteFolder(null);
  };

  // Dynamic dialog description based on whether the folder has notes
  const deleteFolderNoteCount = confirmDeleteFolder
    ? useStore.getState().notes.filter(n => n.folderId === confirmDeleteFolder.id).length
    : 0;

  return (
    <div className="flex flex-col h-full bg-surface-1 border-r border-subtle">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-subtle">
        <Logo size="md" />
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-subtle">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-custom pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search notes… (⌘K)"
            className={cn(
              'w-full h-9 pl-9 pr-8 rounded-lg text-sm',
              'bg-surface-2 border border-subtle',
              'text-primary-custom placeholder:text-muted-custom',
              'focus:outline-none focus:border-border-focus transition-colors'
            )}
          />
          {localSearch && (
            <button
              onClick={() => { setLocalSearch(''); setSearchQuery(''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-custom hover:text-secondary-custom"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Folder list */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-3 py-1 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-custom">
            Folders
          </span>
          <button
            onClick={handleStartAdd}
            className="p-1 rounded hover:bg-hover text-muted-custom hover:text-secondary-custom transition-colors"
            aria-label="Add folder"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add new folder inline */}
        {isAddingFolder && (
          <div className="px-3 mt-1">
            <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-selected border border-border-focus">
              <FolderIcon className="w-4 h-4 text-muted-custom shrink-0" />
              <input
                ref={addInputRef}
                type="text"
                value={newFolderName}
                onChange={(e) => { setNewFolderName(e.target.value); setNewFolderError(''); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddFolder();
                  if (e.key === 'Escape') { setIsAddingFolder(false); setNewFolderName(''); setNewFolderError(''); }
                }}
                onBlur={handleAddFolder}
                placeholder="Folder name"
                maxLength={MAX_FOLDER_NAME_LENGTH}
                className="flex-1 bg-transparent text-sm text-primary-custom placeholder:text-muted-custom focus:outline-none"
              />
            </div>
            {newFolderError && (
              <p className="text-xs text-accent-error mt-1 px-1">{newFolderError}</p>
            )}
          </div>
        )}

        {/* Folder items */}
        {folders.map((folder) => {
          const isSelected = folder.id === selectedFolderId;
          const isRenaming = renamingFolderId === folder.id;

          return (
            <div key={folder.id} className="px-3 mt-0.5">
              {isRenaming ? (
                <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-selected border border-border-focus">
                  <FolderItemIcon icon={folder.icon} />
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameName}
                    onChange={(e) => { setRenameName(e.target.value); setRenameError(''); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') { setRenamingFolderId(null); setRenameError(''); }
                    }}
                    onBlur={handleRename}
                    maxLength={MAX_FOLDER_NAME_LENGTH}
                    className="flex-1 bg-transparent text-sm text-primary-custom focus:outline-none"
                  />
                  <button onClick={handleRename} className="p-0.5 text-accent-neutral">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  aria-selected={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectFolder(folder.id);
                    }
                  }}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer',
                    'transition-colors text-left',
                    isSelected
                      ? 'bg-selected text-primary-custom shadow-sm'
                      : 'text-secondary-custom hover:bg-hover'
                  )}
                  onClick={() => selectFolder(folder.id)}
                >
                  <FolderItemIcon icon={folder.icon} />
                  <span className="flex-1 text-sm truncate">{folder.name}</span>

                  {/* Overflow menu (custom folders only) */}
                  {folder.type === 'custom' && (
                    <div
                      ref={(el) => { menuRefs.current[folder.id] = el; }}
                      className="relative"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === folder.id ? null : folder.id);
                        }}
                        className={cn(
                          'p-1 rounded transition-colors',
                          openMenuId === folder.id
                            ? 'text-secondary-custom bg-pressed'
                            : 'opacity-0 group-hover:opacity-100 text-muted-custom hover:text-secondary-custom hover:bg-hover'
                        )}
                        aria-label="More options"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                      {openMenuId === folder.id && (
                        <div className="absolute right-0 top-full mt-1 z-50 min-w-[130px] py-1 rounded-lg bg-raised border border-subtle shadow-xl">
                          <button
                            onClick={(e) => { e.stopPropagation(); startRename(folder); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-secondary-custom hover:bg-hover transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              setConfirmDeleteFolder(folder);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-accent-error hover:bg-hover transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Rename error */}
              {isRenaming && renameError && (
                <p className="text-xs text-accent-error mt-1 px-1">{renameError}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Settings button */}
      <div className="px-3 py-3 border-t border-subtle">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-custom hover:text-secondary-custom hover:bg-hover transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Confirm Delete Folder Dialog */}
      <ConfirmDialog
        open={!!confirmDeleteFolder}
        onOpenChange={(open) => { if (!open) setConfirmDeleteFolder(null); }}
        title="Delete Folder"
        description={
          deleteFolderNoteCount > 0
            ? `"${confirmDeleteFolder?.name}" will be deleted. ${deleteFolderNoteCount} note${deleteFolderNoteCount > 1 ? 's' : ''} inside will be moved to My Notes.`
            : `"${confirmDeleteFolder?.name}" will be permanently deleted.`
        }
        confirmLabel="Delete Folder"
        isDestructive
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}
