'use client';

import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { X, FileText, CheckSquare, FolderKanban, BookOpen, Bookmark, Folder } from 'lucide-react';

interface MoveNoteDialogProps {
  isOpen: boolean;
  noteId: string | null;
  onClose: () => void;
}

const folderIcons: Record<string, typeof FileText> = {
  FileText,
  CheckSquare,
  FolderKanban,
  BookOpen,
  Bookmark,
  Folder,
};

export function MoveNoteDialog({ isOpen, noteId, onClose }: MoveNoteDialogProps) {
  const { folders, notes, moveNote, selectNote } = useStore();

  const selectedNote = notes.find(n => n.id === noteId);

  const handleMove = async (folderId: string) => {
    if (!noteId) return;
    
    await moveNote(noteId, folderId);
    selectNote(noteId);
    onClose();
  };

  const getIcon = (iconName: string) => {
    const Icon = folderIcons[iconName] || Folder;
    return <Icon className="w-4 h-4" />;
  };

  if (!isOpen || !noteId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div 
        className={cn(
          'w-full max-w-sm bg-raised border border-subtle rounded-xl shadow-lg'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle">
          <h2 className="text-lg font-semibold text-primary-custom">Move Note</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-hover text-muted-custom hover:text-secondary-custom transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current note info */}
        {selectedNote && (
          <div className="px-6 py-3 border-b border-subtle bg-surface-1">
            <div className="text-xs text-muted-custom mb-1">Moving:</div>
            <div className="text-sm text-secondary-custom truncate">
              {selectedNote.title || 'Untitled Note'}
            </div>
          </div>
        )}

        {/* Folder list */}
        <div className="p-2 max-h-[300px] overflow-y-auto">
          {folders.map(folder => {
            const isCurrentFolder = folder.id === selectedNote?.folderId;
            
            return (
              <button
                key={folder.id}
                onClick={() => !isCurrentFolder && handleMove(folder.id)}
                disabled={isCurrentFolder}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                  'text-left transition-colors',
                  isCurrentFolder
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-hover cursor-pointer'
                )}
              >
                <span className="text-muted-custom">
                  {getIcon(folder.icon)}
                </span>
                <span className="flex-1 text-sm text-secondary-custom truncate">
                  {folder.name}
                </span>
                {isCurrentFolder && (
                  <span className="text-xs text-muted-custom">Current</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
