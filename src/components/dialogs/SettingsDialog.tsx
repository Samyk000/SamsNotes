'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { dataDB, getStorageUsage, settingsDB } from '@/lib/db';
import { ExportData } from '@/types';
import { safeValidateExportData } from '@/lib/schemas';
import { format } from 'date-fns';
import {
  X,
  Download,
  Upload,
  Trash2,
  Info,
  AlertTriangle,
  Check,
  Moon,
  Sun,
} from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { theme, setTheme, initialize } = useStore();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [storageUsed, setStorageUsed] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Storage usage check
  const loadStorageUsage = async () => {
    const usage = await getStorageUsage();
    if (usage) {
      const usedMB = (usage.used / (1024 * 1024)).toFixed(2);
      const quotaMB = Math.round(usage.quota / (1024 * 1024));
      setStorageUsed(`${usedMB} MB of ~${quotaMB} MB`);
    } else {
      setStorageUsed('Unavailable');
    }
  };

  // Export data — properly awaited
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await dataDB.export();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `samsnotes-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      await settingsDB.update({ lastExportDate: Date.now() });
    } catch (err) {
      console.error('Export failed:', err);
    }
    setIsExporting(false);
  };

  // Import data — properly awaited, with validation
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(null);

    // File size guard (max 50 MB)
    if (file.size > 50 * 1024 * 1024) {
      setImportError('File too large (max 50 MB)');
      setIsImporting(false);
      e.target.value = '';
      return;
    }

    try {
      const text = await file.text();
      let data: ExportData;
      try {
        const rawJson = JSON.parse(text);
        const result = safeValidateExportData(rawJson);
        if (!result.success) {
          const firstIssue = result.error.issues[0];
          throw new Error(
            `Invalid backup format: ${firstIssue?.message ?? 'unknown validation error'}`
          );
        }
        data = result.data as ExportData;
      } catch (parseErr) {
        if (parseErr instanceof SyntaxError) {
          throw new Error('Invalid JSON file — make sure you are importing a SamsNotes backup');
        }
        throw parseErr;
      }

      const result = await dataDB.import(data, 'merge');
      setImportSuccess(
        `Imported ${result.foldersImported} folder${result.foldersImported !== 1 ? 's' : ''} and ${result.notesImported} note${result.notesImported !== 1 ? 's' : ''}`
      );
      if (result.errors.length > 0) {
        setImportError(`Partial import — some items failed: ${result.errors.slice(0, 3).join('; ')}`);
      }
      await initialize();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    }

    setIsImporting(false);
    e.target.value = '';
  };

  // Clear all data — properly awaited
  const handleClearAll = async () => {
    if (clearConfirmText !== 'CLEAR') return;
    setIsClearing(true);
    try {
      await dataDB.clearAll();
      await initialize();
      setClearConfirmText('');
      onClose();
    } catch (err) {
      console.error('Clear failed:', err);
    }
    setIsClearing(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-raised border border-subtle rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle">
          <h2 className="text-base font-semibold text-primary-custom">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-hover text-muted-custom hover:text-secondary-custom transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Theme ───────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-custom mb-3">
              Appearance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Dark */}
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'relative flex flex-col items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all',
                  theme === 'dark'
                    ? 'border-accent-neutral bg-selected'
                    : 'border-subtle bg-surface-2 hover:bg-hover'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <Moon className="w-5 h-5 text-gray-300" />
                </div>
                <span className="text-sm font-medium text-secondary-custom">Dark</span>
                {theme === 'dark' && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent-neutral flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                )}
              </button>

              {/* Light */}
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'relative flex flex-col items-center gap-3 px-4 py-4 rounded-xl border-2 transition-all',
                  theme === 'light'
                    ? 'border-accent-neutral bg-selected'
                    : 'border-subtle bg-surface-2 hover:bg-hover'
                )}
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                  <Sun className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-sm font-medium text-secondary-custom">Light</span>
                {theme === 'light' && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent-neutral flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            </div>
          </section>

          {/* ── Data & Backup ────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-custom mb-3">
              Data &amp; Backup
            </h3>
            <div className="space-y-2">
              {/* Export */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                  'bg-surface-2 border border-subtle text-left',
                  'text-secondary-custom hover:bg-hover hover:border-strong transition-colors',
                  isExporting && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Download className="w-4 h-4 text-muted-custom shrink-0" />
                <div>
                  <div className="text-sm font-medium">Export Notes</div>
                  <div className="text-xs text-muted-custom">Download as JSON backup</div>
                </div>
              </button>

              {/* Import */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                  'bg-surface-2 border border-subtle text-left',
                  'text-secondary-custom hover:bg-hover hover:border-strong transition-colors',
                  isImporting && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Upload className="w-4 h-4 text-muted-custom shrink-0" />
                <div>
                  <div className="text-sm font-medium">Import Backup</div>
                  <div className="text-xs text-muted-custom">Restore from a .json file</div>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />

              {/* Import feedback */}
              {importSuccess && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-success/10 text-accent-success text-sm">
                  <Check className="w-4 h-4 shrink-0" />
                  {importSuccess}
                </div>
              )}
              {importError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-error/10 text-accent-error text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {importError}
                </div>
              )}
            </div>
          </section>

          {/* ── Danger Zone ──────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-custom mb-3">
              Danger Zone
            </h3>
            <div className="p-4 rounded-xl border border-accent-error/30 bg-accent-error/5">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-4 h-4 text-accent-error shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-secondary-custom">Clear All Data</div>
                  <div className="text-xs text-muted-custom mt-1">
                    Permanently deletes all notes, folders and settings. Cannot be undone.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={clearConfirmText}
                  onChange={(e) => setClearConfirmText(e.target.value)}
                  placeholder="Type CLEAR to confirm"
                  className={cn(
                    'flex-1 h-9 px-3 rounded-lg text-sm bg-surface-1 border border-subtle',
                    'text-primary-custom placeholder:text-muted-custom',
                    'focus:outline-none focus:border-accent-error'
                  )}
                />
                <button
                  onClick={handleClearAll}
                  disabled={clearConfirmText !== 'CLEAR' || isClearing}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-error/20 text-accent-error hover:bg-accent-error/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClearing ? 'Clearing…' : 'Clear All'}
                </button>
              </div>
            </div>
          </section>

          {/* ── About ────────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-custom mb-3">
              About
            </h3>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-2 border border-subtle">
              <Info className="w-4 h-4 text-muted-custom shrink-0" />
              <div className="text-sm text-muted-custom flex-1 min-w-0">
                <span className="text-secondary-custom font-medium">SamsNotes</span>
                &nbsp;·&nbsp; All data stored locally &nbsp;·&nbsp;
                <button onClick={loadStorageUsage} className="text-accent-neutral hover:underline">
                  {storageUsed || 'Check storage'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
