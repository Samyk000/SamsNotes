'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Logo } from '@/components/common/Logo';
import { MobileNoteList } from './MobileNoteList';
import { MobileEditor } from './MobileEditor';
import { SettingsDialog } from '@/components/dialogs/SettingsDialog';
import { MoveNoteDialog } from '@/components/dialogs/MoveNoteDialog';
import { Search, Settings, X, ChevronLeft, MoreHorizontal, Copy, Move, Trash2, Maximize, Minimize } from 'lucide-react';
import { SaveIndicator } from '@/components/common/SaveIndicator';
import { formatDistanceToNowStrict } from 'date-fns';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { toast } from 'sonner';

export function MobileLayout() {
  const {
    isMobileEditorOpen,
    setMobileEditorOpen,
    selectedNoteId,
    searchQuery,
    setSearchQuery,
    isInitialized,
    notes,
    saveState,
  } = useStore();

  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [moveNoteId, setMoveNoteId] = useState<string | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle back navigation
  const handleBack = useCallback(() => {
    setMobileEditorOpen(false);
    setIsFullscreen(false);
  }, [setMobileEditorOpen]);

  // Handle note selection (open editor)
  const handleNoteSelect = useCallback(() => {
    setMobileEditorOpen(true);
  }, [setMobileEditorOpen]);

  // Handle creating note (open editor)
  const handleNoteCreate = useCallback(() => {
    setMobileEditorOpen(true);
  }, [setMobileEditorOpen]);

  // Actions for the open note 
  const { duplicateNote, deleteNote } = useStore.getState();

  const handleDuplicate = async () => {
    if (!selectedNoteId) return;
    await duplicateNote(selectedNoteId);
    setShowMenu(false);
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

  const handleMove = () => {
    setShowMenu(false);
    if (selectedNoteId) setMoveNoteId(selectedNoteId);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-app flex flex-col overflow-hidden safe-top safe-bottom">
      {/* Header */}
      {!isFullscreen && (
        <header className="sticky top-0 z-20 bg-surface-1 border-b border-subtle safe-top shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
          {isMobileEditorOpen ? (
            <>
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-hover text-secondary-custom transition-colors flex items-center gap-1"
                aria-label="Back to notes"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex flex-1 items-center justify-between ml-2">
                {/* Minimal Metadata Bubble */}
                <div className="flex items-center gap-2 text-xs text-muted-custom bg-surface-2 px-3 py-1.5 rounded-full border border-subtle/30 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  {(() => {
                    const note = notes.find(n => n.id === selectedNoteId);
                    if (!note) return null;
                    const strictTime = formatDistanceToNowStrict(note.updatedAt);
                    const [amount, unit] = strictTime.split(' ');
                    const shortTime = `${amount}${unit?.startsWith('mo') ? 'mo' : unit?.[0]}`;
                    return (
                      <>
                        <span>{shortTime}</span>
                        <span className="opacity-40 border-l border-subtle h-3 mx-0.5"></span>
                        <SaveIndicator state={saveState} minimal />
                      </>
                    );
                  })()}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const note = notes.find(n => n.id === selectedNoteId);
                    if (note?.viewType === 'canvas') {
                      return (
                        <button
                          onClick={() => setIsFullscreen(true)}
                          className="p-2 rounded-lg hover:bg-hover text-muted-custom transition-colors"
                          aria-label="Fullscreen"
                        >
                          <Maximize className="w-4 h-4" />
                        </button>
                      );
                    }
                    return null;
                  })()}

                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 -mr-2 rounded-lg hover:bg-hover text-muted-custom transition-colors"
                      aria-label="Note actions"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] py-1 rounded-lg bg-raised border border-subtle shadow-xl">
                          <button
                            onClick={handleDuplicate}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-secondary-custom hover:bg-hover transition-colors"
                          >
                            <Copy className="w-4 h-4" /> Duplicate
                          </button>
                          <button
                            onClick={handleMove}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-secondary-custom hover:bg-hover transition-colors"
                          >
                            <Move className="w-4 h-4" /> Move to...
                          </button>
                          <button
                            onClick={() => { setShowMenu(false); setShowConfirmDelete(true); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-accent-error hover:bg-hover transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Logo size="sm" showWordmark={false} />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 rounded-lg hover:bg-hover text-muted-custom hover:text-secondary-custom transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-lg hover:bg-hover text-muted-custom hover:text-secondary-custom transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Search bar (expandable) */}
        {!isMobileEditorOpen && showSearch && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-custom" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                autoFocus
                className={cn(
                  'w-full h-10 pl-10 pr-10 rounded-lg text-sm',
                  'bg-surface-2 border border-subtle text-primary-custom placeholder:text-muted-custom',
                  'focus:outline-none focus:border-border-focus'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearch(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-hover transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-muted-custom" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>
      )}

      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-[10001]">
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-2 bg-surface-2/90 backdrop-blur-sm rounded-lg border border-subtle text-muted-custom hover:text-primary-custom hover:bg-hover shadow-lg transition-all"
            aria-label="Close Fullscreen"
          >
            <Minimize className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <main className={cn("flex-1 overflow-hidden flex flex-col w-full", isFullscreen ? "fixed inset-0 z-[9999] bg-app" : "relative")}>
        {isMobileEditorOpen ? (
          <MobileEditor />
        ) : (
          <MobileNoteList 
            onSelectNote={handleNoteSelect}
            onCreateNote={handleNoteCreate}
            onMoveNote={(id) => setMoveNoteId(id)}
          />
        )}
      </main>

      {/* Dialogs */}
      <SettingsDialog 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      <MoveNoteDialog
        isOpen={!!moveNoteId}
        noteId={moveNoteId}
        onClose={() => setMoveNoteId(null)}
      />
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title="Delete Note"
        description={`The note will be deleted. You can undo immediately after.`}
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}
