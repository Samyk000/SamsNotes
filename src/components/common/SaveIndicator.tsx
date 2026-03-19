'use client';

import { cn } from '@/lib/utils';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface SaveIndicatorProps {
  state: 'saved' | 'saving' | 'error';
  minimal?: boolean;
}

export function SaveIndicator({ state, minimal }: SaveIndicatorProps) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 text-xs font-medium transition-all duration-200',
      state === 'saved' && 'text-accent-success',
      state === 'saving' && 'text-muted-custom',
      state === 'error' && 'text-accent-error'
    )}>
      {state === 'saved' && (
        <>
          <Check className="w-3.5 h-3.5" />
          {!minimal && <span>Saved</span>}
        </>
      )}
      {state === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {!minimal && <span>Saving...</span>}
        </>
      )}
      {state === 'error' && (
        <>
          <AlertCircle className="w-3.5 h-3.5" />
          {!minimal && <span>Error saving</span>}
        </>
      )}
    </div>
  );
}
