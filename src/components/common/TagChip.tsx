'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface TagChipProps {
  tag: string;
  size?: 'sm' | 'md';
  isActive?: boolean;
  isRemovable?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function TagChip({ 
  tag, 
  size = 'md', 
  isActive = false,
  isRemovable = false,
  onClick,
  onRemove 
}: TagChipProps) {
  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
  };

  const truncatedTag = tag.length > 20 ? `${tag.slice(0, 20)}...` : tag;

  return (
    <span
      onClick={(e) => {
        if (onClick && !isRemovable) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium transition-colors',
        sizes[size],
        onClick && !isRemovable && 'cursor-pointer hover:bg-selected',
        isActive
          ? 'bg-chip-active-fill border border-chip-active-border text-secondary-custom'
          : 'bg-chip-inactive-fill border border-chip-inactive-border text-muted-custom'
      )}
    >
      <span className="truncate">{truncatedTag}</span>
      {isRemovable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 p-0.5 rounded hover:bg-hover transition-colors"
          aria-label={`Remove tag ${tag}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
