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

  // Update title
  const handleTitleChange = useCallback((title: string) => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, { title });
    }
  }, [selectedNoteId, updateNote]);

  // Update content
  const handleContentUpdate = useCallback((content: RichContent) => {
    if (selectedNoteId) {
      updateNoteContent(selectedNoteId, content);
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
        'flex-1 flex flex-col bg-app'
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
      'flex-1 flex flex-col bg-app'
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-subtle">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-custom mb-3">
          <button
            onClick={() => selectedFolder?.id && selectFolder(selectedFolder.id)}
            className="hover:text-secondary-custom transition-colors"
          >
            {selectedFolder?.name || 'Notes'}
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-secondary-custom truncate max-w-[200px]">
            {selectedNote.title || 'Untitled Note'}
          </span>
        </div>

        {/* Title */}
        <input
          ref={titleInputRef}
          type="text"
          value={selectedNote.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onBlur={() => {
            if (!selectedNote.title.trim()) {
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

        {/* Meta row */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          {/* Left: Metadata */}
          <div className="flex items-center gap-4">
            {/* Modified date */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-custom">Modified</span>
              <span 
                className="text-xs text-secondary-custom"
                title={fullModifiedDate}
              >
                {formattedModifiedDate}
              </span>
            </div>

            {/* Created date */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-custom">Created</span>
              <span className="text-xs text-secondary-custom">
                {formattedCreatedDate}
              </span>
            </div>

            {/* Save indicator */}
            <SaveIndicator state={saveState} />
          </div>

          {/* Right: Tags */}
          <div className="flex items-center gap-2 flex-wrap">
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
