'use client';

import { cn } from '@/lib/utils';
import { FileText, Search, Folder } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-notes' | 'no-results' | 'no-folder';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  'no-notes': FileText,
  'no-results': Search,
  'no-folder': Folder,
};

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const Icon = icons[type];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center'
    )}>
      <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-custom" />
      </div>
      <h3 className="text-sm font-medium text-secondary-custom mb-1">
        {title}
      </h3>
      <p className="text-xs text-muted-custom mb-4 max-w-[240px]">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            'bg-raised border border-subtle text-secondary-custom',
            'hover:bg-hover hover:border-strong'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
