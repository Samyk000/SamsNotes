# SamsNotes — Integrated Sprint Roadmap

**Role**: Senior Project Manager
**Methodology**: Iterative Sprints with Milestone Objectives

---

## ✅ Milestone 0: Editor Stability Hotfixes (COMPLETED)
**Objective**: Stabilize core editor behaviors and fix critical UX regressions reported during initial use.

- [x] **S0-01: Fix Note Content Sync** — Implemented `key` remount pattern to ensure editor updates on note switch. ✅
- [x] **S0-02: Resolve Bold/Color Conflict** — Fixed CSS specificity allowing colors to apply to bold text. ✅
- [x] **S0-03: Editor Spacing Optimization** — Reduced paragraph margins for a tighter, native editing feel. ✅

---

## ✅ Sprint 1: Foundation, Security & Cleanup (COMPLETED)
**Theme**: "Pruning & Hardening"
**Objective**: Remove technical debt from the starter template and secure the local data layer.

- [x] **S1-01: Pruning** — Removed unused `prisma`, `next-auth`, `sharp`, `recharts`, `react-hook-form`, and dummy `/api` route. ✅
- [x] **S1-02: Dep Audit** — Pruned 15+ unused dependencies from `package.json` (199 packages removed). Also deleted unused shadcn UI scaffolding (`chart`, `calendar`, `form`, `sonner`, `resizable`, `toast`, `input-otp`). ✅
- [x] **S1-03: Data Security** — Implemented Zod-powered validation on JSON data imports in `SettingsDialog.tsx`. ✅
- [x] **S1-04: Schema Integrity** — Created `src/lib/schemas.ts` with Zod schemas for `Folder`, `Note`, `Settings`, and `ExportData`. ✅
- [x] **S1-05: Initialization** — Already implemented via `hasSeeded()` flag in `db.ts`. Confirmed working. ✅

**Build Verification**: ✅ `next build` passes with 0 errors.

---

## ✅ Sprint 2: Architecture & Logic Stability (COMPLETED)
**Theme**: "Modularization & Reliability"
**Objective**: Decouple the monolithic state store and handle edge-case data scenarios.

- [x] **S2-01: Store Slicing** — Split monolithic `store.ts` (382 lines) into `store/folderSlice.ts`, `store/noteSlice.ts`, `store/uiSlice.ts`, and `store/index.ts`. Zero API changes — all consumers unchanged. ✅
- [x] **S2-02: Constants Audit** — Expanded `constants.ts` with `SYSTEM_FOLDER_IDS`, `DEFAULT_FOLDER_ID`, z-index scale (`Z_INDEX`), UI strings, and timing values. ✅
- [x] **S2-03: Copy Logic** — Extracted `generateCopyTitle()` helper that handles empty titles, prevents infinite suffix chains, and produces clean "(copy N)" patterns. ✅
- [x] **S2-04: Destructive Ops** — Added explicit existence check for default folder before orphaning notes in `deleteFolder`. Prevents data loss if seed data is corrupted. ✅
- [x] **S2-05: Z-Index Scale** — Added semantic z-index tokens (`z-sticky`, `z-dropdown`, `z-overlay`, `z-fullscreen`) to Tailwind config. Removed unused chart color tokens. ✅

**Build Verification**: ✅ `next build` passes with 0 errors.

---

## 🏃 Sprint 3: Performance & Automated Testing
**Theme**: "Scalability & Assurance"
**Objective**: Prevent storage exhaustion and establish a regression-prevention suite.

| Task ID | Task Group | Description | Status |
| :--- | :--- | :--- | :--- |
| S3-01 | **Asset Opt.** | Implement client-side image compression to prevent IndexedDB storage bloat. | Optional |
| S3-02 | **Testing Setup** | Initialize Vitest and set up an IndexedDB mock environment for CI. | High |
| S3-03 | **Logic Coverage**| Write unit tests for core CRUD operations in the Zustand store. | High |
| S3-04 | **Spec Alignment**| Update [SAMSNOTES_SPECIFICATION.md](cci:7://file:///c:/Users/Samee/Desktop/Samsnotes/samsnotes/SAMSNOTES_SPECIFICATION.md:0:0-0:0) to document Whiteboard/Canvas schemas. | Low |
| S3-05 | **UI Performance**| Memoize search results and note list renders for large (1000+) note collections. | Medium |

---

## 📝 Next Steps for Execution
1. **Initiate Sprint 3**: Set up Vitest testing framework and write unit tests for store logic.
2. **Optional**: Implement client-side image compression for IndexedDB storage optimization.
