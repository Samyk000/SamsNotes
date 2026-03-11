// ============================================================
// SamsNotes — Seed Data for First Launch
// ============================================================
// This file defines the default folders and demo notes
// that are written to IndexedDB on the very first run.

import { Folder, Note } from '@/types';
import { FOLDER_ALL_ID, FOLDER_UNCATEGORISED_ID } from './constants';

const now = Date.now();

// System folders (cannot be deleted or renamed)
export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'my-notes',      name: 'My Notes',     type: 'system', icon: 'FileText',    order: 0, createdAt: now, updatedAt: now },
  { id: 'to-do',         name: 'To-do List',   type: 'system', icon: 'CheckSquare', order: 1, createdAt: now, updatedAt: now },
  { id: 'projects',      name: 'Projects',     type: 'system', icon: 'FolderKanban', order: 2, createdAt: now, updatedAt: now },
  { id: 'journal',       name: 'Journal',      type: 'system', icon: 'BookOpen',    order: 3, createdAt: now, updatedAt: now },
  { id: 'reading-list',  name: 'Reading List', type: 'system', icon: 'Bookmark',    order: 4, createdAt: now, updatedAt: now },
];

// Demo notes shown to first-time users
export const DEMO_NOTES: Note[] = [
  {
    id: 'demo-1',
    folderId: 'my-notes',
    title: 'Welcome to SamsNotes',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Welcome to SamsNotes 👋' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'A calm, premium, and completely ' },
            { type: 'text', text: 'private', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' note-taking experience. All your notes live locally on your device — no accounts, no servers.' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Getting Started' }],
        },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Create folders to organise your notes' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Use the toolbar to format with headings, bold, lists & more' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Add tags to notes to filter across folders' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Search instantly with Ctrl/⌘ + K' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Export your data any time from Settings' }] }] },
          ],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Enjoy your distraction-free writing space.' }],
        },
      ],
    },
    plainText: 'Welcome to SamsNotes. A calm, premium, and completely private note-taking experience. All your notes live locally on your device — no accounts, no servers. Getting Started Create folders to organise your notes Use the toolbar to format with headings, bold, lists & more Add tags to notes to filter across folders Search instantly with Ctrl/⌘ + K Export your data any time from Settings Enjoy your distraction-free writing space.',
    tags: ['welcome', 'guide'],
    createdAt: now - 60_000,
    updatedAt: now - 60_000,
  },
  {
    id: 'demo-2',
    folderId: 'to-do',
    title: 'Sample To-do List',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: "Here's how checklists work in SamsNotes:" }],
        },
        {
          type: 'taskList',
          content: [
            { type: 'taskItem', attrs: { checked: true },  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Explore the sidebar and folders' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Create your first note' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Try the formatting toolbar' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Add an image to a note' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Export your notes as a backup' }] }] },
          ],
        },
      ],
    },
    plainText: "Here's how checklists work in SamsNotes: Explore the sidebar and folders Create your first note Try the formatting toolbar Add an image to a note Export your notes as a backup",
    tags: ['demo'],
    createdAt: now - 30_000,
    updatedAt: now - 30_000,
  },
];
