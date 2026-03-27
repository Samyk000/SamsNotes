# SamsNotes Codebase Analysis

This analysis is based on the learning from `testing-api-tester.md`, `testing-reality-checker.md`, `testing-workflow-optimizer.md`, and `engineering-code-reviewer.md`.

## 1. Engineering & Code Quality (Code Reviewer)

### [CR-01] Monolithic Zustand Store
- **File**: `src/lib/store.ts`
- **Issue**: The store currently manages folders, notes, search/filter, and UI state in a single 380+ line file.
- **Risk**: Difficult to maintain and test as the application grows.
- **Recommendation**: Split the store into logical slices (e.g., `folderSlice`, `noteSlice`, `uiSlice`).

### [CR-02] Fragile Suffix Logic
- **File**: `src/lib/store.ts` (L299-308)
- **Issue**: The regex used to increment copy suffixes (`duplicateNote`) is simplistic and might produce unexpected titles if the title already contains parentheses or similar patterns.
- **Risk**: UI inconsistency for users who frequently duplicate notes.

### [CR-03] Ad-hoc Z-Index Scaling
- **Files**: `TipTapEditor.tsx`, `Toolbar.tsx`, `Sidebar.tsx`
- **Issue**: Multiple components use hardcoded z-index values like `z-[100]` and `z-[9999]`.
- **Risk**: "Z-index wars" leading to overlapping UI elements (e.g., modals appearing behind toolbars).
- **Recommendation**: Define a z-index scale in `tailwind.config.ts` or a CSS variable set.

### [CR-04] Lack of Content Sanitization on Import/Export
- **File**: `src/lib/db.ts`
- **Issue**: JSON data imported from external files is parsed and directly injected into IndexedDB.
- **Risk**: Potential XSS if a user imports a malicious JSON file (though risk is limited in local-only apps, it remains a security gap).

### [CR-05] Missing Editor Content Sync
- **File**: `src/components/editor/TipTapEditor.tsx`
- **Issue**: The `useEditor` hook only sets content on first render. Selecting a different note changes the title (via store) but the editor fails to update its internal state.
- **Risk**: Massive UX failure where users edit the wrong note's content.
- **Recommendation**: Add a `useEffect` to call `editor.commands.setContent(content)` when the `content` prop changes.

## 2. Quality & Specification (Reality Checker)

### [RC-01] Document/Canvas Bloat
- **File**: `src/lib/db.ts`, `ResizableImage.tsx`
- **Issue**: Images and large canvases are stored as base64 DataURLs directly in IndexedDB.
- **Risk**: Browser storage quota (typically 5-10% of disk space) can be exhausted quickly. No image compression or resizing is performed on upload.
- **Recommendation**: Implement client-side image compression before saving to `idb`.

### [RC-02] Specification Drift (Whiteboard)
- **Issue**: The `SAMSNOTES_SPECIFICATION.md` describes a "calm note-taking app" but doesn't mention the fully featured "Whiteboard" (Excalidraw) implementation.
- **Risk**: Scope creep without technical documentation.
- **Recommendation**: Update the master specification to include the whiteboard data model and expected behaviors.

### [RC-03] Placeholder API Route
- **File**: `src/app/api/route.ts`
- **Issue**: A "Hello World" GET endpoint exists but serves no purpose for this local-first application.
- **Risk**: Confusion for new developers; unnecessary file in the deployment.

### [RC-04] CSS Specificity Conflict (Bold + Color)
- **File**: `src/app/globals.css`, `TipTapEditor.tsx`
- **Issue**: Applying "Bold" and then "Color" results in the color being ignored. This is due to `strong` tags having a specific color defined in the `prose` or base layer that overrides the `textStyle` span's inline style.
- **Risk**: Broken formatting UX.
- **Recommendation**: Set `strong { color: inherit; }` in the typography configuration or Tiptap-specific CSS.

## 3. Workflow & Process (Workflow Optimizer)

### [WO-01] Dependency Bloat
- **File**: `package.json`
- **Issue**: `prisma` and `next-auth` are included in dependencies but are not used (as confirmed by code analysis and spec).
- **Risk**: Increased install times, larger development environment overhead, and potential security vulnerabilities in unused code.
- **Recommendation**: Prune `package.json` to only include the local-first stack.

### [WO-02] Initialization Redundancy
- **File**: `src/lib/db.ts`
- **Issue**: `seedInitialData` performs checks on every store initialization.
- **Risk**: Minor performance hit on app load.
- **Recommendation**: Use a `first-run` flag in `localStorage` or `settingsDB` to skip seeding logic after the initial setup.

### [WO-03] Missing Typography Plugin & Spacing Issues
- **File**: `package.json`, `tailwind.config.ts`, `globals.css`
- **Issue**: The project uses `prose` classes but lacks the `@tailwindcss/typography` plugin. Furthermore, default `<p>` margins in the editor are too large, creating excessive vertical gaps.
- **Risk**: Inconsistent layout and "gappy" text entry feeling.
- **Recommendation**: Install the typography plugin and customize the paragraph margins in CSS.

### [WO-03] Zero Automated Testing
- **Issue**: No tests (`vitest`, `jest`, `playwright`, etc.) exist in the project.
- **Risk**: Regressions in critical data-handling logic (e.g., note deletion, folder moving) could go unnoticed.
- **Recommendation**: Implement a core test suite for the `Zustand` store and `idb` interactions.

## 4. API & Integration (API Tester)

### [AT-01] Lack of Data Integrity Validation
- **Issue**: Store operations assume the `idb` always returns valid `Note` and `Folder` objects.
- **Risk**: If the DB schema changes between versions, the app might crash on load.
- **Recommendation**: Implement a schema validation layer (e.g., `Zod`) between the DB and the Store.
