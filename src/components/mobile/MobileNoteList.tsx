'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { SortOption, FilterOption, Note } from '@/types';
import { NoteCard } from '@/components/common/NoteCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import { Plus, ChevronDown, Filter, ArrowUpDown, X } from 'lucide-react';

interface MobileNoteListProps {
  onSelectNote: () => void;
  onCreateNote: () => void;
  onMoveNote: (noteId: string) => void;
}

export function MobileNoteList({ onSelectNote, onCreateNote, onMoveNote }: MobileNoteListProps) {
  const {
    folders,
    selectedFolderId,
    searchQuery,
    sortBy,
    filterBy,
    activeTagFilter,
    selectedNoteId,
    selectNote,
    createNote,
    deleteNote,
    duplicateNote,
    setSortBy,
    setFilterBy,
    setTagFilter,
    selectFolder,
    getFilteredNotes,
  } = useStore();

  const [showFolderSheet, setShowFolderSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<Note | null>(null);

  const notes = getFilteredNotes();
  const activeFolder = folders.find(f => f.id === selectedFolderId);

  const handleCreateNote = async () => {
    const note = await createNote();
    if (note) {
      onCreateNote();
    }
  };

  const handleSelectNote = async (noteId: string) => {
    await selectNote(noteId);
    onSelectNote();
  };

  const handleDeleteNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId) || null;
    setConfirmDeleteNote(note);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteNote) return;
    const deleted = await deleteNote(confirmDeleteNote.id);
    setConfirmDeleteNote(null);
    if (deleted) {
      toast(`"${deleted.title || 'Untitled Note'}" deleted`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            useStore.setState(s => ({ notes: [...s.notes, deleted] }));
            const { notesDB } = await import('@/lib/db');
            await notesDB.put(deleted);
          },
        },
        duration: 5000,
      });
    }
  };

  const handleDuplicateNote = async (noteId: string) => {
    const duplicated = await duplicateNote(noteId);
    if (duplicated) {
      await selectNote(duplicated.id);
      onSelectNote();
    }
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'modified-desc', label: 'Modified (newest)' },
    { value: 'modified-asc', label: 'Modified (oldest)' },
    { value: 'created-desc', label: 'Created (newest)' },
    { value: 'created-asc', label: 'Created (oldest)' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
  ];

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All notes' },
    { value: 'tagged', label: 'Tagged only' },
    { value: 'untagged', label: 'Untagged only' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-subtle bg-surface-1">
        <button
          onClick={() => setShowFolderSheet(true)}
          className="flex items-center gap-2 text-sm font-medium text-secondary-custom"
        >
          <span>{activeFolder?.name || 'Notes'}</span>
          <ChevronDown className="w-4 h-4 text-muted-custom" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSortSheet(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs bg-surface-2 border border-subtle text-muted-custom"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort</span>
          </button>
          <button
            onClick={() => setShowFilterSheet(true)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs',
              'bg-surface-2 border border-subtle',
              filterBy !== 'all' || activeTagFilter
                ? 'text-secondary-custom border-strong'
                : 'text-muted-custom'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <EmptyState
            type={searchQuery ? 'no-results' : 'no-notes'}
            title={searchQuery ? 'No results found' : 'No notes yet'}
            description={
              searchQuery 
                ? 'Try a different search term'
                : 'Create your first note to get started'
            }
            action={!searchQuery ? {
              label: 'Create Note',
              onClick: handleCreateNote,
            } : undefined}
          />
        ) : (
          notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={note.id === selectedNoteId}
              onClick={() => handleSelectNote(note.id)}
              onDuplicate={() => handleDuplicateNote(note.id)}
              onMove={() => onMoveNote(note.id)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleCreateNote}
        className={cn(
          'fixed right-4 bottom-20 w-14 h-14 rounded-full',
          'bg-raised border border-subtle',
          'flex items-center justify-center',
          'text-secondary-custom shadow-lg',
          'hover:bg-hover hover:border-strong transition-colors',
          'active:scale-95'
        )}
        aria-label="Create note"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Folder bottom sheet */}
      {showFolderSheet && (
        <BottomSheet onClose={() => setShowFolderSheet(false)}>
          <div className="px-4 py-2">
            <h3 className="text-sm font-medium text-secondary-custom mb-2">Folders</h3>
          </div>
          <div className="pb-4">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => {
                  selectFolder(folder.id);
                  setShowFolderSheet(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3',
                  'text-left transition-colors',
                  folder.id === selectedFolderId
                    ? 'bg-selected text-primary-custom'
                    : 'text-secondary-custom hover:bg-hover'
                )}
              >
                <span>{folder.name}</span>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* Sort bottom sheet */}
      {showSortSheet && (
        <BottomSheet onClose={() => setShowSortSheet(false)}>
          <div className="px-4 py-2">
            <h3 className="text-sm font-medium text-secondary-custom mb-2">Sort by</h3>
          </div>
          <div className="pb-4">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setShowSortSheet(false);
                }}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm transition-colors',
                  sortBy === option.value
                    ? 'text-primary-custom bg-selected'
                    : 'text-secondary-custom hover:bg-hover'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* Filter bottom sheet */}
      {showFilterSheet && (
        <BottomSheet onClose={() => setShowFilterSheet(false)}>
          <div className="px-4 py-2">
            <h3 className="text-sm font-medium text-secondary-custom mb-2">Filter</h3>
          </div>
          <div className="pb-4">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setFilterBy(option.value);
                  if (option.value === 'all') {
                    setTagFilter(null);
                  }
                  setShowFilterSheet(false);
                }}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm transition-colors',
                  filterBy === option.value && !activeTagFilter
                    ? 'text-primary-custom bg-selected'
                    : 'text-secondary-custom hover:bg-hover'
                )}
              >
                {option.label}
              </button>
            ))}
            
            {activeTagFilter && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-subtle">
                <span className="text-sm text-muted-custom">
                  Tag: {activeTagFilter}
                </span>
                <button
                  onClick={() => {
                    setTagFilter(null);
                    setShowFilterSheet(false);
                  }}
                  className="text-sm text-accent-neutral hover:text-secondary-custom"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </BottomSheet>
      )}
      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDeleteNote}
        onOpenChange={(open) => { if (!open) setConfirmDeleteNote(null); }}
        title="Delete Note"
        description={`"${confirmDeleteNote?.title || 'Untitled Note'}" will be deleted. You can undo immediately after.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}
// Bottom sheet component
interface BottomSheetProps {
  children: React.ReactNode;
  onClose: () => void;
}

function BottomSheet({ children, onClose }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
    >
      <div 
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0',
          'bg-raised border-t border-subtle',
          'rounded-t-2xl',
          'max-h-[70vh] overflow-y-auto',
          'animate-in slide-in-from-bottom duration-200'
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-subtle" />
        </div>
        {children}
      </div>
    </div>
  );
}
