// ============================================================
// SamsNotes — Zod Validation Schemas
// Runtime safety for data entering IndexedDB
// ============================================================

import { z } from 'zod';

// ── Folder Schema ────────────────────────────────────────────

export const FolderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(32),
  type: z.enum(['system', 'custom']),
  icon: z.string(),
  order: z.number().int().min(0),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// ── Note Schema ──────────────────────────────────────────────

export const NoteSchema = z.object({
  id: z.string().min(1),
  folderId: z.string().min(1),
  title: z.string(),
  viewType: z.enum(['doc', 'canvas', 'todo']).optional(),
  content: z.any().nullable(), // TipTap JSON, Excalidraw state, or Todo array
  plainText: z.string(),
  tags: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// ── Settings Schema ──────────────────────────────────────────

export const SettingsSchema = z.object({
  reducedMotion: z.boolean(),
  theme: z.enum(['dark', 'light']),
  lastExportDate: z.number().optional(),
});

// ── Export Data Schema ───────────────────────────────────────

export const ExportDataSchema = z.object({
  version: z.string(),
  exportedAt: z.number(),
  folders: z.array(FolderSchema),
  notes: z.array(NoteSchema),
  settings: SettingsSchema.optional(),
});

// ── Validation helpers ───────────────────────────────────────

/**
 * Validates an imported ExportData payload.
 * Returns the parsed data or throws a descriptive error.
 */
export function validateExportData(raw: unknown): z.infer<typeof ExportDataSchema> {
  return ExportDataSchema.parse(raw);
}

/**
 * Safe version — returns { success, data, error } instead of throwing.
 */
export function safeValidateExportData(raw: unknown) {
  return ExportDataSchema.safeParse(raw);
}
