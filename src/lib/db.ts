// ============================================================
// SamsNotes — IndexedDB Storage Layer
// Migrated from localStorage to idb for image support & capacity
// ============================================================

import { openDB, IDBPDatabase } from 'idb';
import { Folder, Note, Settings, ExportData } from '@/types';
import {
  DB_NAME,
  DB_VERSION,
  STORE_FOLDERS,
  STORE_NOTES,
  STORE_SETTINGS,
} from './constants';
import { DEFAULT_FOLDERS, DEMO_NOTES } from './seed';

// ── Database initialisation ──────────────────────────────────

let _dbPromise: Promise<IDBPDatabase> | undefined;

function getDB(): Promise<IDBPDatabase> {
  if (!_dbPromise) {
    _dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_FOLDERS)) {
          db.createObjectStore(STORE_FOLDERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_NOTES)) {
          const noteStore = db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
          noteStore.createIndex('folderId', 'folderId', { unique: false });
          noteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      },
    });
  }
  return _dbPromise!;
}

// ── Folders ──────────────────────────────────────────────────

export const foldersDB = {
  async getAll(): Promise<Folder[]> {
    const db = await getDB();
    const all = await db.getAll(STORE_FOLDERS);
    return all.sort((a, b) => a.order - b.order);
  },

  async get(id: string): Promise<Folder | undefined> {
    const db = await getDB();
    return db.get(STORE_FOLDERS, id);
  },

  async put(folder: Folder): Promise<void> {
    const db = await getDB();
    await db.put(STORE_FOLDERS, folder);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_FOLDERS, id);
  },
};

// ── Notes ────────────────────────────────────────────────────

export const notesDB = {
  async getAll(): Promise<Note[]> {
    const db = await getDB();
    return db.getAll(STORE_NOTES);
  },

  async getByFolder(folderId: string): Promise<Note[]> {
    const db = await getDB();
    return db.getAllFromIndex(STORE_NOTES, 'folderId', folderId);
  },

  async get(id: string): Promise<Note | undefined> {
    const db = await getDB();
    return db.get(STORE_NOTES, id);
  },

  async put(note: Note): Promise<void> {
    const db = await getDB();
    await db.put(STORE_NOTES, note);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NOTES, id);
  },

  /** Delete all notes that belong to a given folder. */
  async deleteByFolder(folderId: string): Promise<void> {
    const db = await getDB();
    const notes = await db.getAllFromIndex(STORE_NOTES, 'folderId', folderId);
    const tx = db.transaction(STORE_NOTES, 'readwrite');
    await Promise.all([
      ...notes.map((n) => tx.store.delete(n.id)),
      tx.done,
    ]);
  },
};

// ── Settings ─────────────────────────────────────────────────

export const settingsDB = {
  async get(): Promise<Settings> {
    const db = await getDB();
    const row = await db.get(STORE_SETTINGS, 'settings');
    return row ? (row as { key: string } & Settings) : { reducedMotion: false, theme: 'dark' };
  },

  async update(patch: Partial<Settings>): Promise<void> {
    const db = await getDB();
    const existing = await settingsDB.get();
    await db.put(STORE_SETTINGS, { key: 'settings', ...existing, ...patch });
  },
};

// ── Seed / First-run ─────────────────────────────────────────

/** Returns true once (sets a flag) so we only seed on the very first launch. */
async function hasSeeded(): Promise<boolean> {
  const db = await getDB();
  const flag = await db.get(STORE_SETTINGS, 'seeded');
  return !!flag;
}

export async function seedInitialData(): Promise<void> {
  if (await hasSeeded()) {
    // Migration: Ensure new system folders (like 'whiteboard') are added to existing DBs
    const existing = await foldersDB.getAll();
    const missing = DEFAULT_FOLDERS.filter(df => !existing.some(f => f.id === df.id));
    if (missing.length > 0) {
      const db = await getDB();
      const tx = db.transaction(STORE_FOLDERS, 'readwrite');
      await Promise.all([
        ...missing.map(f => tx.store.put(f)),
        tx.done,
      ]);
    }
    return;
  }

  const db = await getDB();

  // Write default folders
  const folderTx = db.transaction(STORE_FOLDERS, 'readwrite');
  await Promise.all([
    ...DEFAULT_FOLDERS.map((f) => folderTx.store.put(f)),
    folderTx.done,
  ]);

  // Write demo notes
  const noteTx = db.transaction(STORE_NOTES, 'readwrite');
  await Promise.all([
    ...DEMO_NOTES.map((n) => noteTx.store.put(n)),
    noteTx.done,
  ]);

  // Mark as seeded
  await db.put(STORE_SETTINGS, { key: 'seeded', value: true });
}

// ── Data export / import ──────────────────────────────────────

export const dataDB = {
  async export(): Promise<ExportData> {
    const [folders, notes, settings] = await Promise.all([
      foldersDB.getAll(),
      notesDB.getAll(),
      settingsDB.get(),
    ]);
    return {
      version: '1.0.0',
      exportedAt: Date.now(),
      folders,
      notes,
      settings,
    };
  },

  async import(
    data: ExportData,
    mode: 'merge' | 'replace' = 'merge'
  ): Promise<{ foldersImported: number; notesImported: number; errors: string[] }> {
    const errors: string[] = [];
    let foldersImported = 0;
    let notesImported = 0;

    const db = await getDB();

    if (mode === 'replace') {
      // Clear existing user data (keep system folders protected)
      const existingFolders = await foldersDB.getAll();
      const customFolders = existingFolders.filter((f) => f.type === 'custom');
      const folderClearTx = db.transaction(STORE_FOLDERS, 'readwrite');
      await Promise.all([
        ...customFolders.map((f) => folderClearTx.store.delete(f.id)),
        folderClearTx.done,
      ]);
      const noteClearTx = db.transaction(STORE_NOTES, 'readwrite');
      await Promise.all([noteClearTx.store.clear(), noteClearTx.done]);
    }

    // Import folders
    for (const folder of data.folders) {
      try {
        await foldersDB.put(folder);
        foldersImported++;
      } catch (e) {
        errors.push(`Folder "${folder.name}": ${e}`);
      }
    }

    // Import notes
    for (const note of data.notes) {
      try {
        await notesDB.put(note);
        notesImported++;
      } catch (e) {
        errors.push(`Note "${note.title}": ${e}`);
      }
    }

    // Import settings (non-destructively)
    if (data.settings) {
      await settingsDB.update(data.settings);
    }

    return { foldersImported, notesImported, errors };
  },

  async clearAll(): Promise<void> {
    const db = await getDB();

    // Restore default folders, delete custom ones
    const existingFolders = await foldersDB.getAll();
    const customFolders = existingFolders.filter((f) => f.type === 'custom');
    const folderTx = db.transaction(STORE_FOLDERS, 'readwrite');
    await Promise.all([
      ...customFolders.map((f) => folderTx.store.delete(f.id)),
      folderTx.done,
    ]);

    // Remove all notes
    const noteTx = db.transaction(STORE_NOTES, 'readwrite');
    await Promise.all([noteTx.store.clear(), noteTx.done]);

    // Re-seed demo notes
    const now = Date.now();
    const newDemoTx = db.transaction(STORE_NOTES, 'readwrite');
    await Promise.all([
      ...DEMO_NOTES.map((n) =>
        newDemoTx.store.put({ ...n, createdAt: now, updatedAt: now })
      ),
      newDemoTx.done,
    ]);
  },
};

// ── Storage usage ─────────────────────────────────────────────

export async function getStorageUsage(): Promise<{ used: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null;
  const { usage, quota } = await navigator.storage.estimate();
  if (usage === undefined || quota === undefined) return null;
  return { used: usage, quota };
}
