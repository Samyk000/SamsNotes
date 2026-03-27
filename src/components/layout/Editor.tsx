'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Note, RichContent } from '@/types';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { WhiteboardView } from '@/components/editor/WhiteboardView';
import { TodoView } from '@/components/editor/TodoView';
import { TagChip } from '@/components/common/TagChip';
import { SaveIndicator } from '@/components/common/SaveIndicator';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { Plus, X, Maximize, Minimize } from 'lucide-react';
import { nanoid } from 'nanoid';

interface EditorProps {
  onMoveNote?: () => void;
}

export function Editor({ onMoveNote }: EditorProps) {
  const {
    notes,
    folders,
    selectedNoteId,
    selectedFolderId,
    saveState,
    updateNote,
    updateNoteContent,
    selectFolder,
    setTagFilter,
    isInitialized,
  } = useStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const selectedFolder = folders.find(f => f.id === selectedFolderId);
  const searchQuery = useStore((state) => state.searchQuery);

  // Focus tag input when adding
  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  const [localTitle, setLocalTitle] = useState(selectedNote?.title || '');
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync localTitle when selected note changes (not on every store update)
  useEffect(() => {
    setLocalTitle(selectedNote?.title || '');
  }, [selectedNoteId]); // Only sync when we switch notes, not on every title update

  // Update title with debounce
  const handleTitleChange = useCallback((title: string) => {
    setLocalTitle(title); // Instant local update — no lag
    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    titleDebounceRef.current = setTimeout(() => {
      if (selectedNoteId) {
        updateNote(selectedNoteId, { title });
      }
    }, 400);
  }, [selectedNoteId, updateNote]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    };
  }, []);

  // Update content
  const handleContentUpdate = useCallback((content: any, plainText: string) => {
    if (selectedNoteId) {
      updateNoteContent(selectedNoteId, content, plainText);
    }
  }, [selectedNoteId, updateNoteContent]);

  // Add tag
  const handleAddTag = useCallback(() => {
    if (!selectedNoteId || !newTag.trim()) return;

    const normalizedTag = newTag.trim().toLowerCase();
    const currentTags = selectedNote?.tags || [];

    // Check for duplicate
    if (currentTags.some(t => t.toLowerCase() === normalizedTag)) {
      setNewTag('');
      setIsAddingTag(false);
      return;
    }

    updateNote(selectedNoteId, { tags: [...currentTags, newTag.trim()] });
    setNewTag('');
    setIsAddingTag(false);
  }, [selectedNoteId, selectedNote, updateNote, newTag]);

  // Remove tag
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    if (!selectedNoteId) return;

    const currentTags = selectedNote?.tags || [];
    updateNote(selectedNoteId, {
      tags: currentTags.filter(t => t !== tagToRemove)
    });
  }, [selectedNoteId, selectedNote, updateNote]);

  // Handle tag click to filter
  const handleTagClick = useCallback((tag: string) => {
    setTagFilter(tag);
  }, [setTagFilter]);

  // Format dates
  const strictTime = selectedNote ? formatDistanceToNowStrict(selectedNote.updatedAt) : '';
  const [amount, unit] = strictTime.split(' ');
  const formattedModifiedDate = selectedNote ? `${amount}${unit?.startsWith('mo') ? 'mo' : unit?.[0]}` : '';

  const fullModifiedDate = selectedNote
    ? format(selectedNote.updatedAt, 'PPpp')
    : '';
  const formattedCreatedDate = selectedNote
    ? format(selectedNote.createdAt, 'MMM d, yyyy')
    : '';

  // Show empty state when no note is selected
  if (!selectedNote) {
    return (
      <div className={cn(
        'flex-1 flex flex-col bg-transparent h-full overflow-hidden'
      )}>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            type="no-notes"
            title={searchQuery ? 'Select a note' : 'No note selected'}
            description={
              searchQuery
                ? 'Click on a note from the list to view and edit it'
                : 'Create a new note or select one from the list'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex-1 flex flex-col bg-transparent h-full overflow-hidden'
    )}>
      {/* Header */}
      <div className="px-6 md:px-12 py-3 md:py-6 border-b border-subtle shrink-0">
        {/* Top row: Title + Tags (left) + Metadata (right) */}
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 w-full">
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Title */}
            <input
              ref={titleInputRef}
              type="text"
              value={localTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => {
                if (!localTitle.trim()) {
                  handleTitleChange('Untitled Note');
                }
              }}
              placeholder="Untitled Note"
              className={cn(
                'text-2xl font-bold bg-transparent min-w-[150px] max-w-sm',
                'text-primary-custom placeholder:text-muted-custom',
                'focus:outline-none truncate border-b border-subtle/20 focus:border-subtle/50 transition-colors pb-0.5'
              )}
              style={{ letterSpacing: '-0.02em' }}
            />

            {/* Tags row */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pr-4">
              {selectedNote.tags.map(tag => (
                <TagChip
                  key={tag}
                  tag={tag}
                  size="sm"
                  isRemovable
                  onRemove={() => handleRemoveTag(tag)}
                  onClick={() => handleTagClick(tag)}
                />
              ))}
              
              {/* Add tag input */}
              {isAddingTag ? (
                <input
                  ref={tagInputRef}
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onBlur={handleAddTag}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag();
                    if (e.key === 'Escape') {
                      setIsAddingTag(false);
                      setNewTag('');
                    }
                    if (e.key === ',') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Tag name"
                  className={cn(
                    'w-20 h-6 px-1.5 rounded-md text-[10px]',
                    'bg-chip-inactive-fill border border-chip-inactive-border',
                    'text-secondary-custom placeholder:text-muted-custom',
                    'focus:outline-none focus:border-border-focus'
                  )}
                />
              ) : (
                <button
                  onClick={() => setIsAddingTag(true)}
                  className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5 rounded-md',
                    'text-[10px] text-muted-custom hover:text-secondary-custom',
                    'hover:bg-hover transition-colors whitespace-nowrap'
                  )}
                >
                  <Plus className="w-3 h-3" />
                  <span>Add tag</span>
                </button>
              )}
            </div>
          </div>

          {/* Metadata (Right) */}
          <div className="flex items-center gap-2.5 shrink-0 text-xs text-muted-custom bg-surface-2 px-3 py-1.5 rounded-full border border-subtle/30 shadow-sm">
            <span title={fullModifiedDate}>{formattedModifiedDate}</span>
            <span className="opacity-40">•</span>
            <span>{formattedCreatedDate}</span>
            <span className="opacity-40 border-l border-subtle h-3 mx-0.5"></span>
            <SaveIndicator state={saveState} minimal />
            {selectedNote.viewType === 'canvas' && (
              <>
                <span className="opacity-40 border-l border-subtle h-3 mx-0.5"></span>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="p-1 -ml-1 rounded-md hover:text-primary-custom transition-colors"
                  title="Fullscreen Whiteboard"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic View System */}
      <div className={cn(
        "flex-1 overflow-hidden flex flex-col min-h-0 bg-transparent",
        isFullscreen ? "fixed inset-0 z-[9999] bg-app" : "relative"
      )}>
        {isFullscreen && selectedNote.viewType === 'canvas' && (
          <div className="absolute top-4 right-4 z-[10001]">
            <button
               onClick={() => setIsFullscreen(false)}
               className="p-2 bg-surface-2/90 backdrop-blur-sm rounded-lg border border-subtle text-muted-custom hover:text-primary-custom hover:bg-hover shadow-lg transition-all"
               title="Close Fullscreen"
            >
              <Minimize className="w-4 h-4" />
            </button>
          </div>
        )}

        {selectedNote.viewType === 'canvas' ? (
          <WhiteboardView
            key={selectedNoteId}
            content={selectedNote.content}
            onUpdate={handleContentUpdate}
            saveState={saveState}
          />
        ) : selectedNote.viewType === 'todo' ? (
        <TodoView
          key={selectedNoteId}
          content={selectedNote.content}
          onUpdate={handleContentUpdate}
          saveState={saveState}
        />
      ) : (
        <TipTapEditor
          key={selectedNoteId}
          content={selectedNote.content}
          onUpdate={handleContentUpdate}
          saveState={saveState}
          placeholder="Start writing..."
        />
      )}
      </div>
    </div>
  );
}
