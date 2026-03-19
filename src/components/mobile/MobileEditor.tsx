'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { RichContent } from '@/types';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { WhiteboardView } from '@/components/editor/WhiteboardView';
import { TodoView } from '@/components/editor/TodoView';
import { TagChip } from '@/components/common/TagChip';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';
import { Plus, MoreHorizontal, Trash2, Copy, Move } from 'lucide-react';

export function MobileEditor() {
  const {
    notes,
    selectedNoteId,
    saveState,
    updateNote,
    updateNoteContent,
    deleteNote,
    duplicateNote,
    setMobileEditorOpen,
    setTagFilter,
  } = useStore();

  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const tagInputRef = useRef<HTMLInputElement>(null);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // Focus tag input
  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  // Setup complete
  const [localTitle, setLocalTitle] = useState(selectedNote?.title || '');
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync localTitle when selected note changes
  useEffect(() => {
    setLocalTitle(selectedNote?.title || '');
  }, [selectedNoteId]);

  // Update title with debounce
  const handleTitleChange = useCallback((title: string) => {
    setLocalTitle(title);
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

  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-custom">No note selected</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full bg-app">
      {/* Inline Title and Tags */}
      <div className="px-4 py-4 border-b border-subtle bg-surface-1 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full">
          {/* Title */}
          <input
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
              'text-xl font-bold bg-transparent min-w-[120px] max-w-[200px]',
              'text-primary-custom placeholder:text-muted-custom',
              'focus:outline-none border-b border-subtle/20 focus:border-subtle/50 pb-0.5'
            )}
            style={{ letterSpacing: '-0.02em' }}
          />

          {/* Tags */}
          <div className="flex items-center gap-1.5 shrink-0 pr-2">
            {selectedNote.tags.map(tag => (
              <TagChip
                key={tag}
                tag={tag}
                size="sm"
                isRemovable
                onRemove={() => handleRemoveTag(tag)}
                onClick={() => {
                  setTagFilter(tag);
                  setMobileEditorOpen(false);
                }}
              />
            ))}
            
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
                placeholder="Tag"
                className={cn(
                  'w-16 h-6 px-1.5 rounded-md text-[10px]',
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
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {selectedNote.viewType === 'canvas' ? (
          <div className="flex-1 min-h-0 w-full relative">
            <WhiteboardView
              content={selectedNote.content}
              onUpdate={handleContentUpdate}
              saveState={saveState}
            />
          </div>
        ) : selectedNote.viewType === 'todo' ? (
          <TodoView
            content={selectedNote.content}
            onUpdate={handleContentUpdate}
            saveState={saveState}
          />
        ) : (
          <TipTapEditor
            content={selectedNote.content}
            onUpdate={handleContentUpdate}
            saveState={saveState}
            placeholder="Start writing..."
            className="h-full"
          />
        )}
      </div>
    </div>
  );
}
