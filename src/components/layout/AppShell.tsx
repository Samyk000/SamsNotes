'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Sidebar } from './Sidebar';
import { NoteList } from './NoteList';
import { Editor } from './Editor';
import { SettingsDialog } from '@/components/dialogs/SettingsDialog';
import { MoveNoteDialog } from '@/components/dialogs/MoveNoteDialog';
import { MobileLayout } from '@/components/mobile/MobileLayout';

export function AppShell() {
  const { initialize, isInitialized, reducedMotion } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [moveNoteId, setMoveNoteId] = useState<string | null>(null);

  // Use media query hook instead of manual resize listener
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Initialize app on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Apply reduced motion preference globally
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
    if (reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0ms');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
  }, [reducedMotion]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;

      // Ctrl/Cmd + N: New note (only when not typing in a text field)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !isInputFocused) {
        e.preventDefault();
        useStore.getState().createNote();
      }

      // Ctrl/Cmd + K or /: Focus search bar
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search"]'
        );
        searchInput?.focus();
      }

      // Escape: Clear search
      if (e.key === 'Escape') {
        const { searchQuery, setSearchQuery } = useStore.getState();
        if (searchQuery) setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading skeleton
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-2" />
          <div className="h-6 w-32 bg-surface-2 rounded" />
        </div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return <MobileLayout />;
  }

  // Desktop 3-panel Bento layout
  return (
    <div className="h-screen flex bg-app p-4 gap-4 overflow-hidden">
      {/* Panel 1 — Sidebar (240px) */}
      <div className="w-60 shrink-0 h-full rounded-2xl shadow-bento border border-subtle overflow-hidden bg-surface-1">
        <Sidebar onOpenSettings={() => setShowSettings(true)} />
      </div>

      {/* Panel 2 — Note list (280px) */}
      <div className="w-[280px] shrink-0 h-full rounded-2xl shadow-bento border border-subtle overflow-hidden bg-surface-1">
        <NoteList onMoveNote={(noteId) => setMoveNoteId(noteId)} />
      </div>

      {/* Panel 3 — Editor (flex, takes remaining space) */}
      <div className="flex-1 min-w-0 h-full rounded-2xl shadow-bento border border-subtle overflow-hidden bg-surface-1">
        <Editor
          onMoveNote={() => {
            const { selectedNoteId } = useStore.getState();
            if (selectedNoteId) setMoveNoteId(selectedNoteId);
          }}
        />
      </div>

      {/* Dialogs */}
      <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <MoveNoteDialog
        isOpen={!!moveNoteId}
        noteId={moveNoteId}
        onClose={() => setMoveNoteId(null)}
      />
    </div>
  );
}
