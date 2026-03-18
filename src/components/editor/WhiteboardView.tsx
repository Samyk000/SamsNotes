'use client';

import { useCallback, useEffect, useRef } from 'react';
import '@excalidraw/excalidraw/index.css';
import dynamic from 'next/dynamic';

// Dynamic import for Excalidraw as it requires browser APIs
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-app">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-2" />
          <div className="h-4 w-24 bg-surface-2 rounded" />
        </div>
      </div>
    ),
  }
);

interface WhiteboardViewProps {
  content: any;
  onUpdate: (content: any, plainText: string) => void;
  saveState: 'saved' | 'saving' | 'error';
}

export function WhiteboardView({ content, onUpdate, saveState }: WhiteboardViewProps) {
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Excalidraw expects initialData to be defined ONCE when it mounts.
  // Providing a new object reference on every render or pulling new content 
  // without careful checks causes infinite loops.
  const initialDataRef = useRef(content || {});

  // Handle changes and emit update
  const handleChange = useCallback((elements: readonly any[], appState: any, files: any) => {
    // Only update if there are actual changes to elements to avoid loop
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    
    updateTimeoutRef.current = setTimeout(() => {
      const snapshot = {
        elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemFontFamily: appState.currentItemFontFamily,
        },
        files
      };
      onUpdate(snapshot, "Whiteboard canvas with elements");
    }, 1000); // 1s debounce to avoid storming the IDB
  }, [onUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden min-h-0">
      <div className="absolute inset-0">
        <Excalidraw
          initialData={initialDataRef.current}
          onChange={handleChange}
          theme="dark"
          UIOptions={{
            canvasActions: {
              toggleTheme: true,
              export: { saveFileToDisk: true },
              loadScene: true,
              saveToActiveFile: false,
            }
          }}
        />
      </div>
    </div>
  );
}
