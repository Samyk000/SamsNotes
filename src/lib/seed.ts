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
  { id: 'whiteboard',    name: 'Whiteboard',   type: 'system', icon: 'PenTool',     order: 2, createdAt: now, updatedAt: now },
  { id: 'projects',      name: 'Projects',     type: 'system', icon: 'FolderKanban', order: 3, createdAt: now, updatedAt: now },
  { id: 'journal',       name: 'Journal',      type: 'system', icon: 'BookOpen',    order: 4, createdAt: now, updatedAt: now },
  { id: 'reading-list',  name: 'Reading List', type: 'system', icon: 'Bookmark',    order: 5, createdAt: now, updatedAt: now },
];

// Demo notes shown to first-time users
export const DEMO_NOTES: Note[] = [
  {
    id: 'demo-1',
    folderId: 'my-notes',
    viewType: 'doc',
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
    viewType: 'todo',
    title: 'Sample To-do List',
    content: [
      { id: 't1', title: 'Explore the sidebar and folders', status: 'done', order: 0 },
      { id: 't2', title: 'Create your first note', status: 'todo', order: 1 },
      { id: 't3', title: 'Try the formatting toolbar', status: 'todo', order: 2 },
      { id: 't4', title: 'Add an image to a note', status: 'todo', order: 3 },
      { id: 't5', title: 'Check out the infinite canvas', status: 'todo', order: 4 },
    ],
    plainText: "Explore the sidebar and folders\nCreate your first note\nTry the formatting toolbar",
    tags: ['demo'],
    createdAt: now - 30_000,
    updatedAt: now - 30_000,
  },
  {
    id: 'demo-3',
    folderId: 'whiteboard',
    viewType: 'canvas',
    title: 'Untitled Canvas',
    content: null,
    plainText: "A blank canvas for your infinite ideas.",
    tags: ['demo'],
    createdAt: now - 15_000,
    updatedAt: now - 15_000,
  },
];
