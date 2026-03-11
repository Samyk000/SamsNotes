'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        {/* Overlay */}
        <AlertDialog.Overlay
          className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />

        {/* Dialog panel */}
        <AlertDialog.Content
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          <div className="w-full max-w-sm bg-raised border border-subtle rounded-xl shadow-2xl p-6">
            <AlertDialog.Title className="text-base font-semibold text-primary-custom mb-2">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-muted-custom mb-6 leading-relaxed">
              {description}
            </AlertDialog.Description>
            <div className="flex items-center justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 rounded-lg text-sm text-muted-custom hover:text-secondary-custom hover:bg-hover transition-colors">
                  {cancelLabel}
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={onConfirm}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isDestructive
                      ? 'bg-accent-error/15 text-accent-error hover:bg-accent-error/25'
                      : 'bg-surface-2 border border-subtle text-secondary-custom hover:bg-hover'
                  )}
                >
                  {confirmLabel}
                </button>
              </AlertDialog.Action>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
