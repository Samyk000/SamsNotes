'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Note, RichContent } from '@/types';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { TagChip } from '@/components/common/TagChip';
import { SaveIndicator } from '@/components/common/SaveIndicator';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDistanceToNow, format } from 'date-fns';
import { ChevronRight, Plus, X } from 'lucide-react';
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
  const handleContentUpdate = useCallback((content: RichContent, plainText: string) => {
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
  const formattedModifiedDate = selectedNote 
    ? formatDistanceToNow(selectedNote.updatedAt, { addSuffix: true })
    : '';
  const fullModifiedDate = selectedNote 
    ? format(selectedNote.updatedAt, 'PPpp')
    : '';
  const formattedCreatedDate = selectedNote 
    ? format(selectedNote.createdAt, 'PP')
    : '';

  // Show empty state when no note is selected
  if (!selectedNote) {
    return (
      <div className={cn(
        'flex-1 flex flex-col bg-app h-full overflow-hidden'
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
      'flex-1 flex flex-col bg-app h-full overflow-hidden'
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-subtle shrink-0">
        {/* Top row: Breadcrumb (left) + Metadata (right) */}
        <div className="flex items-center justify-between gap-4 mb-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-custom min-w-0">
            <button
              onClick={() => selectedFolder?.id && selectFolder(selectedFolder.id)}
              className="hover:text-secondary-custom transition-colors shrink-0"
            >
              {selectedFolder?.name || 'Notes'}
            </button>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-secondary-custom truncate">
              {selectedNote.title || 'Untitled Note'}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-custom">Modified</span>
              <span className="text-xs text-secondary-custom" title={fullModifiedDate}>
                {formattedModifiedDate}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-custom">Created</span>
              <span className="text-xs text-secondary-custom">
                {formattedCreatedDate}
              </span>
            </div>
            <SaveIndicator state={saveState} />
          </div>
        </div>

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
            'w-full text-2xl font-semibold bg-transparent',
            'text-primary-custom placeholder:text-muted-custom',
            'focus:outline-none'
          )}
        />

        {/* Tags row */}
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {selectedNote.tags.map(tag => (
            <TagChip
              key={tag}
              tag={tag}
              size="md"
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
                'w-24 h-7 px-2 rounded-md text-xs',
                'bg-chip-inactive-fill border border-chip-inactive-border',
                'text-secondary-custom placeholder:text-muted-custom',
                'focus:outline-none focus:border-border-focus'
              )}
            />
          ) : (
            <button
              onClick={() => setIsAddingTag(true)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md',
                'text-xs text-muted-custom hover:text-secondary-custom',
                'hover:bg-hover transition-colors'
              )}
            >
              <Plus className="w-3 h-3" />
              <span>Add tag</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <TipTapEditor
        content={selectedNote.content}
        onUpdate={handleContentUpdate}
        saveState={saveState}
        placeholder="Start writing..."
      />
    </div>
  );
}
