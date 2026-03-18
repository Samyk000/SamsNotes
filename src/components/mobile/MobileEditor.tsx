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

interface MobileEditorProps {
  onMoveNote: () => void;
}

export function MobileEditor({ onMoveNote }: MobileEditorProps) {
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
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const tagInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // Focus tag input
  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

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

  // Handle delete — shows confirmation dialog
  const handleDelete = () => {
    setShowMenu(false);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedNoteId) return;
    const deleted = await deleteNote(selectedNoteId);
    setShowConfirmDelete(false);
    if (deleted) {
      setMobileEditorOpen(false);
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

  // Handle duplicate
  const handleDuplicate = async () => {
    if (!selectedNoteId) return;
    
    const duplicated = await duplicateNote(selectedNoteId);
    if (duplicated) {
      setShowMenu(false);
    }
  };

  // Handle move
  const handleMove = () => {
    setShowMenu(false);
    onMoveNote();
  };

  if (!selectedNote) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-custom">No note selected</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full">
      {/* Header with title and actions */}
      <div className="px-4 py-3 border-b border-subtle bg-surface-1">
        <div className="flex items-start justify-between gap-2">
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
              'flex-1 text-lg font-semibold bg-transparent',
              'text-primary-custom placeholder:text-muted-custom',
              'focus:outline-none'
            )}
          />

          {/* Actions menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-hover text-muted-custom transition-colors"
              aria-label="Note actions"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] py-1 rounded-lg bg-raised border border-subtle shadow-lg">
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-secondary-custom hover:bg-hover transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={handleMove}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-secondary-custom hover:bg-hover transition-colors"
                >
                  <Move className="w-4 h-4" />
                  Move to...
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-accent-error hover:bg-hover transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>



        {/* Tags */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
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
              }}
              placeholder="Tag"
              className={cn(
                'w-20 h-6 px-2 rounded-md text-xs',
                'bg-chip-inactive-fill border border-chip-inactive-border',
                'text-secondary-custom placeholder:text-muted-custom',
                'focus:outline-none focus:border-border-focus'
              )}
            />
          ) : (
            <button
              onClick={() => setIsAddingTag(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-custom hover:text-secondary-custom hover:bg-hover transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add tag</span>
            </button>
          )}
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
      {/* Confirm Delete */}
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title="Delete Note"
        description={`"${selectedNote?.title || 'Untitled Note'}" will be deleted. You can undo immediately after.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}
