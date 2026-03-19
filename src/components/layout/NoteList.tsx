'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { SortOption, FilterOption, Note } from '@/types';
import { NoteCard } from '@/components/common/NoteCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import {
  Plus,
  Check,
  ChevronDown,
  Filter,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface NoteListProps {
  onMoveNote?: (noteId: string) => void;
}

export function NoteList({ onMoveNote }: NoteListProps) {
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
    getFilteredNotes,
    notes,
  } = useStore();

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<Note | null>(null);

  const sortMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const filteredNotes = getFilteredNotes();
  const activeFolder = folders.find((f) => f.id === selectedFolderId);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCreateNote = useCallback(async () => {
    await createNote();
  }, [createNote]);

  const handleDeleteNote = useCallback(async (note: Note) => {
    setConfirmDeleteNote(note);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!confirmDeleteNote) return;
    const deleted = await deleteNote(confirmDeleteNote.id);
    setConfirmDeleteNote(null);
    if (deleted) {
      toast(`"${deleted.title || 'Untitled Note'}" deleted`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            // Re-insert the note into the store and DB
            const { notes: currentNotes } = useStore.getState();
            useStore.setState({ notes: [...currentNotes, deleted] });
            const { notesDB } = await import('@/lib/db');
            await notesDB.put(deleted);
          },
        },
        duration: 5000,
      });
    }
  }, [confirmDeleteNote, deleteNote]);

  const handleDuplicateNote = useCallback(async (noteId: string) => {
    await duplicateNote(noteId);
  }, [duplicateNote]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'modified-desc', label: 'Modified — newest' },
    { value: 'modified-asc',  label: 'Modified — oldest' },
    { value: 'created-desc',  label: 'Created — newest' },
    { value: 'created-asc',   label: 'Created — oldest' },
    { value: 'title-asc',     label: 'Title A–Z' },
    { value: 'title-desc',    label: 'Title Z–A' },
  ];

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all',      label: 'All notes' },
    { value: 'tagged',   label: 'Tagged only' },
    { value: 'untagged', label: 'Untagged only' },
  ];

  const hasActiveFilter = filterBy !== 'all' || !!activeTagFilter;

  return (
    <div className="flex flex-col h-full bg-surface-1 border-r border-subtle">
      {/* Header */}
      <div className="h-[53px] flex items-center justify-between px-4 border-b border-subtle shrink-0">
        <h2 className="text-sm font-semibold text-primary-custom truncate">
          {searchQuery ? 'Search Results' : activeFolder?.name ?? 'Notes'}
        </h2>
        <button
          onClick={handleCreateNote}
          className="p-1.5 rounded-lg hover:bg-hover text-muted-custom hover:text-secondary-custom transition-colors"
          aria-label="New note (Ctrl+N)"
          title="New note (Ctrl+N)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Sort & Filter controls */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0">
        {/* Sort */}
        <div ref={sortMenuRef} className="relative">
          <button
            onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors',
              'bg-surface-2 border border-subtle',
              showSortMenu ? 'text-secondary-custom border-strong' : 'text-muted-custom hover:text-secondary-custom hover:border-strong'
            )}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort</span>
          </button>
          {showSortMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] py-1 rounded-lg bg-raised border border-subtle shadow-xl">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-hover"
                >
                  <span className={sortBy === opt.value ? 'text-primary-custom' : 'text-secondary-custom'}>
                    {opt.label}
                  </span>
                  {sortBy === opt.value && <Check className="w-3 h-3 text-accent-neutral" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter */}
        <div ref={filterMenuRef} className="relative">
          <button
            onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors',
              'bg-surface-2 border',
              hasActiveFilter
                ? 'text-secondary-custom border-strong'
                : 'border-subtle text-muted-custom hover:text-secondary-custom hover:border-strong',
              showFilterMenu && 'border-strong'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {hasActiveFilter && <span className="w-1.5 h-1.5 rounded-full bg-accent-neutral" />}
          </button>
          {showFilterMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] py-1 rounded-lg bg-raised border border-subtle shadow-xl">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFilterBy(opt.value);
                    if (opt.value === 'all') setTagFilter(null);
                    setShowFilterMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-hover"
                >
                  <span className={filterBy === opt.value && !activeTagFilter ? 'text-primary-custom' : 'text-secondary-custom'}>
                    {opt.label}
                  </span>
                  {filterBy === opt.value && !activeTagFilter && <Check className="w-3 h-3 text-accent-neutral" />}
                </button>
              ))}
              {activeTagFilter && (
                <div className="px-3 py-2 border-t border-subtle">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-custom">
                      Tag: <span className="text-secondary-custom">{activeTagFilter}</span>
                    </span>
                    <button
                      onClick={() => { setTagFilter(null); setShowFilterMenu(false); }}
                      className="p-0.5 rounded hover:bg-hover text-muted-custom"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Note count */}
        <span className="ml-auto text-xs text-muted-custom">{filteredNotes.length}</span>
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredNotes.length === 0 ? (
          <EmptyState
            type={searchQuery ? 'no-results' : 'no-notes'}
            title={searchQuery ? 'No results found' : 'No notes yet'}
            description={
              searchQuery
                ? 'Try a different search term'
                : 'Press + to create your first note'
            }
            action={!searchQuery ? { label: 'New Note', onClick: handleCreateNote } : undefined}
          />
        ) : (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={note.id === selectedNoteId}
              onClick={() => selectNote(note.id)}
              onDuplicate={() => handleDuplicateNote(note.id)}
              onMove={() => onMoveNote?.(note.id)}
              onDelete={() => handleDeleteNote(note)}
            />
          ))
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!confirmDeleteNote}
        onOpenChange={(open) => { if (!open) setConfirmDeleteNote(null); }}
        title="Delete Note"
        description={`"${confirmDeleteNote?.title || 'Untitled Note'}" will be permanently deleted. You can undo immediately after.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}
