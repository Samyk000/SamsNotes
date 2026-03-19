'use client';

import { cn } from '@/lib/utils';
import { Note } from '@/types';
import { formatDistanceToNowStrict } from 'date-fns';
import { TagChip } from './TagChip';
import { MoreHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onMove: () => void;
  onDelete: () => void;
}

export function NoteCard({ 
  note, 
  isActive, 
  onClick, 
  onDuplicate, 
  onMove, 
  onDelete 
}: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom');
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);

  const strictTime = formatDistanceToNowStrict(note.updatedAt); // "1 minute", "2 hours", etc.
  const [amount, unit] = strictTime.split(' ');
  const relativeTime = `${amount}${unit.startsWith('mo') ? 'mo' : unit[0]}`;

  const previewText = note.plainText.slice(0, 100) || 'No content';

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

  const handleMenuToggle = () => {
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setMenuPosition(spaceBelow >= 140 ? 'bottom' : 'top');
    }
    setShowMenu(!showMenu);
  };

  // Mobile Long Press Logic
  const handleTouchStart = () => {
    isLongPressActive.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressActive.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50); // Haptic feedback
      }
      handleMenuToggle();
    }, 600); // 600ms for long press
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isLongPressActive.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-selected={isActive}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onClick={(e) => {
        if (isLongPressActive.current) {
          isLongPressActive.current = false;
          return;
        }
        onClick();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        handleMenuToggle();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseMove={handleTouchMove}
      className={cn(
        'group relative p-3 rounded-lg cursor-pointer transition-all duration-100 select-none touch-none text-left',
        'border shadow-[0_2px_8px_rgba(0,0,0,0.02)]',
        isActive 
          ? 'bg-selected border-border-strong shadow-sm' 
          : 'bg-surface-1 border-subtle/30 hover:bg-hover hover:border-subtle hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
      )}
    >
      {/* Title */}
      <h3 className={cn(
        'text-sm font-medium mb-1 truncate text-primary-custom'
      )}>
        {note.title || 'Untitled Note'}
      </h3>
      
      {/* Preview text */}
      <p className={cn(
        'text-xs mb-2.5 line-clamp-2 text-muted-custom'
      )}>
        {previewText}
      </p>
      
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2">
        {/* Time */}
        <span className="text-xs text-muted-custom flex-shrink-0">
          {relativeTime}
        </span>
        
        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex items-center gap-1 overflow-hidden">
            {note.tags.slice(0, 2).map(tag => (
              <TagChip key={tag} tag={tag} size="sm" />
            ))}
            {note.tags.length > 2 && (
              <span className="text-xs text-muted-custom">+{note.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Overflow menu */}
      <div 
        ref={menuRef}
        className={cn(
          'absolute right-2 top-2',
          !showMenu && 'opacity-0 group-hover:opacity-100 transition-opacity'
        )}
      >
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();
            handleMenuToggle();
          }}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            showMenu ? 'bg-pressed' : 'hover:bg-hover'
          )}
          aria-label="Note actions"
        >
          <MoreHorizontal className="w-4 h-4 text-muted-custom" />
        </button>
        
        {/* Dropdown menu */}
        {showMenu && (
          <div 
            className={cn(
              'absolute right-0 z-50 min-w-[140px] py-1 rounded-lg',
              'bg-raised border border-subtle shadow-lg',
              menuPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onDuplicate();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-secondary-custom hover:bg-hover transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={() => {
                onMove();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-secondary-custom hover:bg-hover transition-colors"
            >
              Move to...
            </button>
            <button
              onClick={() => {
                onDelete();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-accent-error hover:bg-hover transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
