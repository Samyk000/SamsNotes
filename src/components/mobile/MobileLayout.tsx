'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Logo } from '@/components/common/Logo';
import { MobileNoteList } from './MobileNoteList';
import { MobileEditor } from './MobileEditor';
import { SettingsDialog } from '@/components/dialogs/SettingsDialog';
import { MoveNoteDialog } from '@/components/dialogs/MoveNoteDialog';
import { Search, Settings, Menu, X } from 'lucide-react';

export function MobileLayout() {
  const {
    isMobileEditorOpen,
    setMobileEditorOpen,
    selectedNoteId,
    searchQuery,
    setSearchQuery,
    isInitialized,
  } = useStore();

  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [moveNoteId, setMoveNoteId] = useState<string | null>(null);

  // Handle back navigation
  const handleBack = useCallback(() => {
    setMobileEditorOpen(false);
  }, [setMobileEditorOpen]);

  // Handle note selection (open editor)
  const handleNoteSelect = useCallback(() => {
    setMobileEditorOpen(true);
  }, [setMobileEditorOpen]);

  // Handle creating note (open editor)
  const handleNoteCreate = useCallback(() => {
    setMobileEditorOpen(true);
  }, [setMobileEditorOpen]);

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
    <div className="min-h-screen bg-app flex flex-col safe-top safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-surface-1 border-b border-subtle safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          {isMobileEditorOpen ? (
            <>
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-hover text-secondary-custom transition-colors"
                aria-label="Back to notes"
              >
                <X className="w-5 h-5" />
              </button>
              <Logo size="sm" />
              <div className="w-9" /> {/* Spacer */}
            </>
          ) : (
            <>
              <Logo size="sm" />
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

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {isMobileEditorOpen ? (
          <MobileEditor 
            onMoveNote={() => setMoveNoteId(selectedNoteId)}
          />
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
    </div>
  );
}
