# SamsNotes - Complete Product Specification

---

## 1. BUSINESS REQUIREMENTS DOCUMENT (BRD)

### 1.1 Product Vision

SamsNotes is a calm, premium, private note-taking application designed for users who demand a beautiful, distraction-free writing environment with rich formatting, reliable organization, and trustworthy persistence. The application must feel fast, elegant, stable, and intentional at every interaction point. It must look exceptional in AMOLED dark mode while maintaining strong readability and visual hierarchy across all device types.

### 1.2 Product Goals

**Primary Goals:**
- Deliver a pixel-perfect, premium user experience that feels like polished desktop software
- Implement complete local-first functionality with zero server dependencies
- Provide a robust, reliable rich text editor supporting comprehensive formatting
- Make note creation, editing, retrieval, and organization effortless and intuitive
- Preserve all formatting, embedded images, and application state perfectly across browser sessions
- Handle all edge cases gracefully without breaking the user experience
- Deliver purpose-built experiences for desktop, tablet, and mobile form factors
- Implement a true AMOLED dark design language with perfect grey contrast hierarchy

**Quality Goals:**
- Zero console errors in normal operation
- No broken states after any user action
- Every visible control must be fully functional
- No placeholder interactions or fake buttons
- Instant responsiveness to all user input
- Graceful degradation under adverse conditions

### 1.3 Non-Goals

The product must NOT include:
- User authentication or login systems
- Cloud synchronization services
- Team collaboration features
- Comments or annotation systems
- Sharing workflows
- Server-side APIs for app functionality
- Advertisements or promotional content
- Unnecessary decorative elements
- Social features of any kind

### 1.4 Target Users

**User Profile 1: Maya Chen - Graduate Student**
- **Demographics:** 24 years old, Computer Science graduate student
- **Context:** Manages lecture notes, research summaries, project documentation, and revision materials across multiple courses
- **Pain Points:** Existing note apps are either too simple (plain text only) or too complex (feature bloat, slow performance), lose formatting, require accounts, or don't work offline reliably
- **Needs:** 
  - Rich formatting for code snippets, equations, and structured notes
  - Fast search across hundreds of notes
  - Reliable folder organization for different courses
  - Image support for diagrams and screenshots
  - Privacy - no account required, data stays local
  - Works perfectly offline in the library
- **Usage Pattern:** Heavy daily usage, creates 5-15 notes per day, frequently searches and references past notes

**User Profile 2: James Morrison - Product Manager**
- **Demographics:** 35 years old, Senior Product Manager at a tech company
- **Context:** Manages meeting notes, product requirement documents, project drafts, reference materials, and quick captures throughout busy workdays
- **Pain Points:** Note apps feel cluttered, syncing issues cause conflicts, account requirements are frustrating for simple note-taking, formatting breaks when copying between apps
- **Needs:**
  - Clean, distraction-free interface for focused writing
  - Professional appearance for sharing screenshots of notes
  - Quick capture for fleeting thoughts during meetings
  - Tags for cross-cutting topics that span projects
  - Reliable persistence without thinking about saving
  - Export capability for archiving
- **Usage Pattern:** Moderate daily usage, creates 3-8 notes per day, heavy use of tags and search

### 1.5 Core Product Promise

**"Open the app and start writing instantly."**

The experience should feel private, elegant, stable, and frictionless. A user should be able to open SamsNotes for the first time and immediately understand how to create, organize, and find their notes without any onboarding, tutorials, or account creation.

### 1.6 Success Metrics

- User can create a formatted note within 5 seconds of opening the app
- All formatting persists correctly after browser refresh
- Embedded images render correctly after refresh
- Search returns results within 100ms for typical note counts
- No data loss under any edge case condition
- Zero console errors during normal operation
- Full keyboard accessibility
- Mobile experience feels native, not like a squeezed desktop site

---

## 2. PRODUCT PRINCIPLES

### 2.1 Design Philosophy

**Minimal, Not Empty**
- Remove everything that doesn't serve a purpose
- What remains should feel complete, not barren
- Negative space is intentional, not accidental
- Every element earns its place

**Dense Enough to Be Useful, Spacious Enough to Breathe**
- Information density should support productivity
- Whitespace should provide visual rest
- Balance utility with comfort
- Never crowd, never waste space

**Dark, But Never Muddy**
- AMOLED black surfaces create premium feel
- Grey hierarchy must maintain perfect visibility
- Contrast ratios ensure accessibility
- No guesswork about what is interactive

**Contrast Without Harshness**
- Sharp enough to see clearly
- Soft enough to feel calm
- No jarring bright elements
- Hierarchy through value, not color

### 2.2 Interaction Philosophy

**Motion Without Distraction**
- Micro-interactions should feel tactile, not theatrical
- Transitions should aid understanding, not impress
- Respect reduced motion preferences
- Timing should feel instant but not abrupt

**Every Pixel Intentional**
- No decorative elements for decoration's sake
- Spacing follows a system
- Alignment is precise
- Consistency creates trust

**Every Click Has a Defined Outcome**
- No disabled buttons that appear enabled
- No actions that do nothing
- Clear feedback for every interaction
- Predictable results

**Every Empty State Helps Recovery**
- Empty states guide users forward
- No dead ends
- Helpful suggestions, not just blank screens
- Context-aware guidance

**Every Destructive Action Is Clear and Safe**
- Confirmations prevent accidental loss
- Warnings are specific and actionable
- Undo where possible
- Clear language about consequences

**Persistence Must Feel Trustworthy**
- Save states are visible but not intrusive
- Data integrity is preserved
- Recovery from errors is possible
- Users trust their data is safe

### 2.3 Quality Principles

**No Placeholders**
- Every visible element works
- No "coming soon" features
- No fake buttons
- Complete functionality only

**No Broken States**
- Edge cases are handled
- Errors are graceful
- The app always returns to a usable state
- No dead ends in the UI flow

**Production Quality Always**
- Polish is not optional
- Details matter
- Consistency is mandatory
- Accessibility is required

---

## 3. VISUAL DESIGN SYSTEM

### 3.1 Color System - AMOLED Dark Theme

**Background Surfaces:**
```css
--background-app: #000000;          /* Pure black - app root */
--background-surface-1: #050505;    /* Primary surface */
--background-surface-2: #0A0A0A;    /* Secondary surface */
--background-raised: #101010;       /* Raised elements (cards, menus) */
--background-selected: #151515;     /* Selected state */
--background-hover: #131313;        /* Hover state */
--background-pressed: #1A1A1A;      /* Pressed state */
```

**Borders:**
```css
--border-subtle: #1F1F1F;           /* Subtle separation */
--border-strong: #2A2A2A;           /* More visible separation */
--border-focus: #9AA0A6;            /* Focus ring */
```

**Text:**
```css
--text-primary: #F5F5F5;            /* Primary text - high emphasis */
--text-secondary: #C8C8C8;          /* Secondary text - medium emphasis */
--text-muted: #8E8E8E;              /* Muted text - low emphasis */
--text-disabled: #666666;           /* Disabled text */
--text-inverse: #000000;            /* Text on light backgrounds */
```

**Accent:**
```css
--accent-neutral: #9AA0A6;          /* Neutral accent for focus/active */
--accent-success: #4ADE80;          /* Success states */
--accent-warning: #FBBF24;          /* Warning states */
--accent-error: #F87171;            /* Error states */
```

**Chips and Tags:**
```css
--chip-active-fill: #1B1B1B;        /* Active chip background */
--chip-active-border: #3A3A3A;      /* Active chip border */
--chip-inactive-fill: #0F0F0F;      /* Inactive chip background */
--chip-inactive-border: #1F1F1F;    /* Inactive chip border */
```

**Design Rules:**
- No bright color-heavy accents
- No loud gradients
- No neon glows
- No decorative color effects
- Hierarchy through contrast, spacing, and typography only
- Nearly monochrome palette

### 3.2 Typography System

**Font Stack:**
- Primary: Inter (UI text, editor body)
- Monospace: JetBrains Mono (code blocks)

**Type Scale:**
```css
--font-size-xs: 0.75rem;      /* 12px - metadata labels, small text */
--font-size-sm: 0.875rem;     /* 14px - secondary text, chips */
--font-size-base: 1rem;       /* 16px - body text, note preview */
--font-size-lg: 1.125rem;     /* 18px - note card title */
--font-size-xl: 1.25rem;      /* 20px - panel headings */
--font-size-2xl: 1.5rem;      /* 24px - note title */
--font-size-3xl: 1.875rem;    /* 30px - logo text */
```

**Font Weights:**
```css
--font-weight-normal: 400;    /* Body text */
--font-weight-medium: 500;    /* Labels, emphasis */
--font-weight-semibold: 600;  /* Headings, titles */
--font-weight-bold: 700;      /* Logo, strong emphasis */
```

**Line Heights:**
```css
--line-height-tight: 1.25;    /* Headings */
--line-height-normal: 1.5;    /* Body text */
--line-height-relaxed: 1.75;  /* Editor content */
```

**Typography Applications:**

| Element | Size | Weight | Color | Usage |
|---------|------|--------|-------|-------|
| Logo text | 30px | 700 | --text-primary | "SamsNotes" brand |
| Sidebar labels | 14px | 500 | --text-secondary | Section headers |
| Panel headings | 20px | 600 | --text-primary | Folder titles |
| Note title | 24px | 600 | --text-primary | Editor title field |
| Note card title | 18px | 500 | --text-primary | Card primary text |
| Note preview | 14px | 400 | --text-muted | Card preview text |
| Metadata labels | 12px | 500 | --text-muted | "Modified", "Created" |
| Metadata values | 12px | 400 | --text-secondary | Dates, counts |
| Chips | 12px | 500 | --text-secondary | Tags, filters |
| Editor body | 16px | 400 | --text-primary | Content area |
| Code block | 14px | 400 | --text-primary | Monospace content |

### 3.3 Spacing System

**Base Unit:** 8px with 4px sub-steps

```css
--space-0: 0;
--space-1: 4px;     /* Tight spacing */
--space-2: 8px;     /* Base unit */
--space-3: 12px;    /* Medium */
--space-4: 16px;    /* Comfortable */
--space-5: 20px;    /* Relaxed */
--space-6: 24px;    /* Spacious */
--space-7: 28px;    /* Section */
--space-8: 32px;    /* Large gap */
--space-10: 40px;   /* Extra large */
--space-12: 48px;   /* Section separation */
--space-16: 64px;   /* Major sections */
```

### 3.4 Sizing System

**Corner Radii:**
```css
--radius-sm: 4px;      /* Small elements, chips */
--radius-md: 6px;      /* Buttons, inputs */
--radius-lg: 8px;      /* Cards, panels */
--radius-xl: 12px;     /* Modals, large surfaces */
--radius-full: 9999px; /* Pills, avatars */
```

**Icon Sizes:**
```css
--icon-xs: 14px;       /* Inline icons */
--icon-sm: 16px;       /* Button icons */
--icon-md: 20px;       /* Standard icons */
--icon-lg: 24px;       /* Feature icons */
--icon-xl: 32px;       /* Large feature icons */
```

**Component Heights:**
```css
--height-sm: 28px;     /* Compact buttons, chips */
--height-md: 36px;     /* Standard buttons, inputs */
--height-lg: 44px;     /* Touch-friendly targets */
--height-xl: 52px;     /* Large touch targets */
--height-toolbar: 48px; /* Editor toolbar */
--height-header: 56px; /* Mobile header */
```

**Panel Dimensions:**
```css
--sidebar-width: 260px;
--sidebar-collapsed: 64px;
--note-list-width: 340px;
--editor-max-width: 720px;
--panel-padding: 16px;
--card-padding: 16px;
```

**Touch Targets:**
- Minimum 44px × 44px for all interactive elements on mobile
- Minimum 36px × 36px for desktop interactive elements
- Adequate spacing between touch targets (8px minimum)

### 3.5 Shadows and Elevation

AMOLED interfaces rely primarily on contrast and borders. Shadows are used sparingly:

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
--shadow-overlay: 0 16px 48px rgba(0, 0, 0, 0.6);
```

**Elevation Usage:**
- Level 0: App background (pure black)
- Level 1: Sidebar, panels (surface-1, subtle border)
- Level 2: Cards, note list (raised surface, border)
- Level 3: Dropdowns, popovers (raised surface, shadow-md)
- Level 4: Modals, dialogs (raised surface, shadow-lg)

### 3.6 Motion System

**Durations:**
```css
--duration-instant: 0ms;      /* No animation */
--duration-fast: 100ms;       /* Hover states */
--duration-normal: 200ms;     /* Standard transitions */
--duration-slow: 300ms;       /* Complex transitions */
--duration-modal: 250ms;      /* Modal open/close */
```

**Easings:**
```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);      /* Standard easing */
--ease-in: cubic-bezier(0.4, 0, 1, 1);              /* Exit animations */
--ease-out: cubic-bezier(0, 0, 0.2, 1);             /* Enter animations */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);   /* Playful feedback */
```

**Animation Principles:**
- Hover and press states should feel tactile but quiet
- Menus and sheets use slight opacity and lift transitions
- Timing should be refined and short
- Always respect `prefers-reduced-motion`
- No flashy or theatrical animations

**Reduced Motion:**
When `prefers-reduced-motion: reduce`:
- All animations set to instant
- Opacity transitions only (no transforms)
- Auto-dismiss timers disabled where applicable

---

## 4. INFORMATION ARCHITECTURE

### 4.1 Desktop Layout Structure

**Three-Panel Layout:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌──────────┐ ┌─────────────┐ ┌───────────────────────────────────┐ │
│  │          │ │             │ │                                   │ │
│  │ Sidebar  │ │  Note List  │ │          Editor Panel            │ │
│  │  260px   │ │   340px     │ │         Fluid Width              │ │
│  │          │ │             │ │                                   │ │
│  │          │ │             │ │                                   │ │
│  └──────────┘ └─────────────┘ └───────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Panel Proportions:**
- Sidebar: Fixed 260px, collapsible to 64px
- Note List: Fixed 340px minimum, can expand to 400px
- Editor: Fluid, max-width 720px for content, centered within remaining space

**Visual Hierarchy:**
- Editor is the dominant work area
- Note list remains highly scannable
- Sidebar provides navigation context
- Clear visual separation between panels

### 4.2 Sidebar Architecture

**Structure (Top to Bottom):**

```
┌──────────────────────┐
│ ○ SamsNotes          │ <- Logo (minimal S mark + wordmark)
├──────────────────────┤
│ 🔍 Search notes...   │ <- Search field
├──────────────────────┤
│ FOLDERS              │ <- Section label
│ ├─ My Notes          │ <- Default folder (system)
│ ├─ To-do List        │ <- System folder
│ ├─ Projects          │ <- System folder
│ ├─ Journal           │ <- System folder
│ ├─ Reading List      │ <- System folder
│ ├─ ───────────       │ <- Divider
│ ├─ Custom Folder ⋮   │ <- User-created folders
│ └─ + Add Folder      │ <- Add folder action
├──────────────────────┤
│                      │
│ (flexible space)     │
│                      │
├──────────────────────┤
│ ⚙ Settings           │ <- Settings entry
└──────────────────────┘
```

**Sidebar Components:**

1. **Logo Area**
   - Minimal "S" mark in rounded shape
   - "SamsNotes" wordmark
   - Click returns to primary context

2. **Search Field**
   - Placeholder: "Search notes..."
   - Live search as user types
   - Clear button when text present
   - Escape to clear

3. **Folder Section**
   - "FOLDERS" label (muted, uppercase, small)
   - System folders (non-deletable)
   - Custom folders (deletable)
   - Overflow menu for each folder
   - Add folder action at bottom

4. **Settings Entry**
   - Fixed at bottom
   - Opens settings modal

### 4.3 Note List Panel Architecture

**Structure:**

```
┌─────────────────────────────────┐
│ My Notes              + New note│ <- Header with folder title, actions
│ Sort: Modified ▼     Filter: All│ <- Sort/filter controls
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Meeting Notes              │ │ <- Note card
│ │ Summary of what we...      │ │    - Title
│ │ Modified 2h ago            │ │    - Preview text
│ │ #work #project             │ │    - Modified time
│ └─────────────────────────────┘ │    - Tags
│ ┌─────────────────────────────┐ │
│ │ Project Draft              │ │
│ │ The initial phase of...    │ │
│ │ Modified yesterday         │ │
│ │ #draft                     │ │
│ └─────────────────────────────┘ │
│ ...                             │
└─────────────────────────────────┘
```

**Note List Components:**

1. **Panel Header**
   - Dynamic title based on active folder or filter
   - Sort dropdown (Modified, Created, Title, A-Z, Z-A)
   - Filter button (All, Tagged, Untagged)
   - Add new note button (prominent but restrained)

2. **Note Cards**
   - Title (truncated if long)
   - Preview text (plain text from content, truncated)
   - Modified time (relative: "2h ago", "yesterday", date)
   - Tags (chips, truncated)
   - Active state highlighting
   - Hover state
   - Overflow menu (duplicate, move, delete)

3. **Empty States**
   - No notes: "No notes yet. Create your first note."
   - No results: "No notes match your search."
   - Both with clear action button

### 4.4 Editor Panel Architecture

**Structure:**

```
┌───────────────────────────────────────────────────────────────────┐
│ My Notes > Meeting Notes                    Saved ●              │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Meeting Notes                                                   │ <- Title field
│   Modified: Today at 2:30 PM                     #work #project   │ <- Metadata + tags
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│ B I U S ≡ • • •  Link Image Code  •  Align  •  Undo Redo         │ <- Toolbar
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   The meeting started with a review of the previous              │ <- Editor content
│   quarter's results...                                            │
│                                                                   │
│   Key points:                                                     │
│   • Revenue exceeded targets                                      │
│   • New product launch scheduled for Q3                           │
│                                                                   │
│   [embedded image]                                                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Editor Components:**

1. **Breadcrumb Bar**
   - Folder > Note title
   - Clickable breadcrumb for folder

2. **Title Field**
   - Large, prominent
   - Auto-focus on new note
   - Placeholder: "Untitled Note"
   - Empty title resolves to "Untitled Note" on blur

3. **Metadata Row**
   - Modified timestamp
   - Created timestamp (on hover or expansion)
   - Tags inline, editable
   - Save state indicator

4. **Formatting Toolbar**
   - Font family (if supported)
   - Font size (if supported)
   - Bold, Italic, Underline, Strikethrough
   - Heading levels
   - Paragraph
   - Ordered list, Bullet list, Checklist
   - Blockquote, Code block
   - Link, Image
   - Alignment
   - Remove formatting
   - Undo, Redo

5. **Content Area**
   - Rich text editing
   - Image embedding
   - Link insertion
   - Placeholder when empty

### 4.5 Tablet Layout Structure

**Adaptive Two-Panel Layout:**

On tablets (768px - 1024px):
- Sidebar collapses to icon-only mode or slide-out
- Note list and editor share the main space
- Note list can be toggled
- Editor uses full width when note list hidden

```
┌─────────────────────────────────────────────────┐
│ ☰  SamsNotes                             🔍 ⚙ │ <- Compact header
├──────┬──────────────────────────────────────────┤
│      │                                          │
│ Side │         Editor (full width)              │
│ bar  │         or Note List + Editor            │
│ icon │                                          │
│ only │                                          │
│      │                                          │
└──────┴──────────────────────────────────────────┘
```

### 4.6 Mobile Layout Structure

**Single-Panel Navigation Model:**

Mobile uses a completely different structure optimized for touch:

**Screen A: Notes List**
```
┌─────────────────────────────────────┐
│ ≡  SamsNotes           🔍  + New   │ <- App bar
├─────────────────────────────────────┤
│ My Notes ▼           Sort ▼  Filter│ <- Context header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Meeting Notes                   │ │
│ │ Summary of what we discussed... │ │
│ │ 2h ago        #work             │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Project Draft                   │ │
│ │ The initial phase of the...     │ │
│ │ Yesterday      #draft           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Screen B: Editor**
```
┌─────────────────────────────────────┐
│ ← Back         Saved ●        ⋮    │ <- Navigation bar
├─────────────────────────────────────┤
│                                     │
│   Meeting Notes                     │ <- Title
│   Modified: Today at 2:30 PM        │ <- Metadata
│   #work #project                    │ <- Tags
│                                     │
├─────────────────────────────────────┤
│ B I U S ≡ • Img Link  ...  >        │ <- Scrollable toolbar
├─────────────────────────────────────┤
│                                     │
│   The meeting started with a        │ <- Content
│   review of the previous            │
│   quarter's results...              │
│                                     │
│   Key points:                       │
│   • Revenue exceeded targets        │
│                                     │
└─────────────────────────────────────┘
```

**Mobile Navigation:**
- Bottom sheet for folder selection
- Bottom sheet for sort/filter
- Bottom sheet for note actions
- Bottom sheet for settings
- Full-screen editor with back navigation
- Safe area support for notch/home indicator

---

## 5. DETAILED INTERACTION SPECIFICATION

### 5.1 Logo Interaction

**Click Behavior:**
- Returns app to primary notes context
- Selects "My Notes" folder
- Clears any active filters
- Clears search
- Maintains current note selection if in My Notes
- If current note is not in My Notes, selects first note in My Notes

**Hover State:**
- Cursor changes to pointer
- No visual change (logo is static)

**Keyboard:**
- Logo is not keyboard-focusable
- Home/End keys navigate to first/last folder

### 5.2 Search Interaction

**Input Behavior:**
- Live search as user types
- Debounce: 150ms
- Searches: title, plain text content, tags
- Case-insensitive
- Accidental whitespace trimmed
- Repeated spaces normalized to single space
- Search persists across refresh

**Keyboard Shortcuts:**
- `Ctrl/Cmd + K` or `/` focuses search
- `Escape` clears search if text exists, otherwise removes focus
- `Enter` not needed (live search)

**Clear Action:**
- X button appears when text exists
- Clicking X clears text and results
- Focus remains in search field after clear

**Results Behavior:**
- Updates note list instantly
- Shows all matching notes across all folders
- Folder context is ignored during search
- Clear "No results" state when nothing matches

**Edge Cases:**
- Empty search shows all notes
- Very long search terms are truncated for display
- Special characters are escaped in regex
- No regex support in search (literal match)

### 5.3 Folder Interactions

**Selecting a Folder:**
- Click to select
- Updates note list immediately
- Saves selection to persistence
- First note in folder becomes selected
- If folder is empty, no note selected

**Creating a Folder:**
- Click "Add Folder"
- Inline input appears
- Placeholder: "Folder name"
- Enter or blur creates folder
- Empty name cancels creation
- Whitespace-only name cancels creation
- Duplicate names show error: "Folder name already exists"
- Maximum folder name: 50 characters

**Renaming a Folder:**
- Access via overflow menu → Rename
- Inline input replaces label
- Enter or blur saves
- Escape cancels
- Duplicate names show error
- System folders cannot be renamed

**Deleting a Folder:**
- Access via overflow menu → Delete
- Confirmation dialog appears
- System folders cannot be deleted
- Notes in deleted folder move to "My Notes"
- Active note selection updates if affected
- Undo toast available for 5 seconds

**Overflow Menu:**
- Three-dot icon on hover
- Menu positioned to not overflow viewport
- Options: Rename, Delete (for custom folders)
- Options: (none for system folders, or limited)
- Click outside or Escape closes menu

**Folder Icons:**
- My Notes: default note icon
- To-do List: checkbox icon
- Projects: folder icon
- Journal: book icon
- Reading List: bookmark icon
- Custom folders: generic folder icon

### 5.4 Note List Interactions

**Adding a New Note:**
- Click "Add new note" button or `Ctrl/Cmd + N`
- Creates note in current folder
- Opens note immediately
- Focuses title field
- Title placeholder: "Untitled Note"
- Timestamps: created = now, modified = now
- If search is active, clears search first
- If filter is active, note is created but filter remains

**Selecting a Note:**
- Click card to select and open
- Only one note can be selected at a time
- Selection persists across refresh
- Active state clearly visible

**Note Card Hover:**
- Subtle background change
- Cursor changes to pointer
- Overflow menu appears

**Note Overflow Menu:**
- Duplicate: Creates copy with " (Copy)" suffix
- Move: Opens move dialog with folder list
- Delete: Shows confirmation dialog

**Moving a Note:**
- Select target folder from list
- Move is immediate
- If current folder changes, note selection may update

**Deleting a Note:**
- Confirmation: "Delete this note? This cannot be undone."
- On confirm: Note is deleted
- Selection moves to previous/next note or none
- Undo toast available for 5 seconds

**Sort Options:**
- Modified (newest first) - default
- Modified (oldest first)
- Created (newest first)
- Created (oldest first)
- Title A-Z
- Title Z-A
- Sort preference persists

**Filter Options:**
- All notes
- Tagged notes only
- Untagged notes only
- Filter persists until cleared

### 5.5 Editor Interactions

**Title Field:**
- Large, prominent input
- Auto-focus on new note
- No character limit enforced, but long titles truncate in display
- Empty title on blur becomes "Untitled Note"
- Whitespace-only title becomes "Untitled Note"
- Title updates note list card immediately

**Metadata:**
- Modified timestamp updates on any content change
- Relative time display (e.g., "2 hours ago")
- Hover for full timestamp

**Tags:**
- Click to add tag
- Type tag name, Enter or comma to add
- Backspace on empty input removes last tag
- Click X on tag to remove
- Duplicate tags prevented
- Long tags truncate with ellipsis
- Clicking a tag filters note list by that tag

**Save State Indicator:**
- "Saved" with green dot when synced
- "Saving..." with spinner during save
- "Error saving" with red indicator on failure
- Automatic save on any change (debounced)

### 5.6 Rich Text Editor Interactions

**Toolbar Behavior:**
- Shows active state for current formatting
- Toolbar follows scroll or is sticky
- Touch-friendly on mobile

**Formatting Actions:**

1. **Bold:** `Ctrl/Cmd + B`
   - Applies/removes bold
   - Active state when selection is bold

2. **Italic:** `Ctrl/Cmd + I`
   - Applies/removes italic

3. **Underline:** `Ctrl/Cmd + U`
   - Applies/removes underline

4. **Strikethrough:** `Ctrl/Cmd + Shift + X`
   - Applies/removes strikethrough

5. **Headings:**
   - Dropdown with H1, H2, H3, Paragraph
   - Applies to current line/selection

6. **Lists:**
   - Bullet list: Toggle on/off
   - Ordered list: Toggle on/off
   - Checklist: Creates interactive checkboxes

7. **Blockquote:**
   - Styles as indented, italic quote
   - Toggle on/off

8. **Code Block:**
   - Monospace font
   - Background color
   - Preserves whitespace

9. **Link:**
   - Opens inline input for URL
   - Selected text becomes link text
   - Or inserts placeholder link
   - `Ctrl/Cmd + K` shortcut

10. **Image:**
    - Upload from device: File picker
    - URL: Input for image URL
    - Validates file type
    - Validates file size (max 10MB)
    - Displays in content
    - Alt text editable

11. **Alignment:**
    - Left, Center, Right, Justify
    - Applies to current paragraph

12. **Remove Formatting:**
    - Strips all formatting from selection
    - Returns to plain text

13. **Undo/Redo:**
    - `Ctrl/Cmd + Z` - Undo
    - `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` - Redo

**Editor Content Behavior:**
- Empty state shows placeholder: "Start writing..."
- Images display inline
- Links are clickable
- Code blocks syntax highlight (optional)
- Checklists are interactive

**Image Handling:**
- Supported formats: PNG, JPG, GIF, WebP, SVG
- Max file size: 10MB
- Stored as base64 in IndexedDB
- Responsive sizing in editor
- Failed images show placeholder

### 5.7 Settings Interactions

**Settings Modal:**
- Opens via sidebar entry
- Full-screen on mobile
- Centered modal on desktop

**Export Data:**
- Downloads JSON file with all data
- Includes: folders, notes, tags, preferences
- Images included as base64
- Filename: `samsnotes-backup-YYYY-MM-DD.json`

**Import Data:**
- File picker accepts .json
- Validates file structure
- Shows preview of what will be imported
- Options: Replace all, Merge (keep existing)
- Errors shown for invalid files
- Duplicate IDs are regenerated

**Clear All Data:**
- Shows strong warning
- Requires typing "CLEAR" to confirm
- Wipes IndexedDB completely
- Resets app to initial state

**App Info:**
- Version number
- "Data is stored locally in your browser"
- Storage usage estimate

**Reduced Motion:**
- Toggle to force reduced motion
- Overrides system preference
- Persists across sessions

### 5.8 Mobile-Specific Interactions

**Navigation:**
- Back button in editor returns to list
- Note list has folder selector
- Swipe gestures disabled (too error-prone)

**Bottom Sheets:**
- Used for: folder selection, sort/filter, note actions, settings
- Drag handle to dismiss
- Tap outside to dismiss
- Escape to dismiss
- Prevent scroll bleed

**Touch Toolbar:**
- Horizontally scrollable
- Larger touch targets
- Visible active states
- Does not consume excessive height

**Keyboard Handling:**
- Toolbar remains visible when keyboard open
- Editor resizes to visible area
- No overlap with keyboard

---

## 6. EPICS AND USER STORIES

### Epic 1: Foundation and Shell

**Story 1.1: Application Shell**
- As a user, I want the app to load instantly and display the main layout so I can start using it immediately.
- **Expected Behavior:** App loads in under 1 second, shows three-panel layout on desktop, proper mobile layout on phone.
- **Edge Cases:** Slow connection, IndexedDB unavailable, first-time user.
- **Acceptance Criteria:**
  - Layout renders correctly on desktop, tablet, and mobile
  - All panels are visible and properly sized
  - Logo is displayed correctly
  - No layout shift during load

**Story 1.2: Persistence Layer**
- As a user, I want my data to persist across browser sessions automatically.
- **Expected Behavior:** All notes, folders, and settings are saved locally and restored on refresh.
- **Edge Cases:** IndexedDB full, corrupted data, private browsing mode.
- **Acceptance Criteria:**
  - Notes persist after refresh
  - Folder structure persists
  - Selected folder and note restore
  - Search query restores
  - Images restore correctly

### Epic 2: Design System

**Story 2.1: AMOLED Dark Theme**
- As a user with an OLED display, I want a true dark theme with perfect contrast.
- **Expected Behavior:** Pure black background, visible grey hierarchy, no washed-out elements.
- **Edge Cases:** User with vision impairment, high contrast mode.
- **Acceptance Criteria:**
  - Background is pure black (#000000)
  - All text is readable
  - Contrast ratios meet WCAG AA
  - No harsh bright elements

**Story 2.2: Typography System**
- As a user, I want text to be crisp and readable at all sizes.
- **Expected Behavior:** Consistent typography across the app, proper hierarchy.
- **Acceptance Criteria:**
  - Font sizes follow defined scale
  - Line heights are appropriate
  - Font weights create hierarchy
  - Monospace used for code

**Story 2.3: Motion System**
- As a user, I want subtle animations that feel smooth without being distracting.
- **Expected Behavior:** Hover states, transitions, and micro-interactions are polished and fast.
- **Edge Cases:** User prefers reduced motion.
- **Acceptance Criteria:**
  - Hover states respond in 100ms
  - Transitions complete in 200ms
  - Reduced motion is respected
  - No animation feels sluggish

### Epic 3: Layout and Responsiveness

**Story 3.1: Desktop Layout**
- As a desktop user, I want a three-panel layout that feels like professional software.
- **Expected Behavior:** Sidebar, note list, and editor are all visible and functional.
- **Acceptance Criteria:**
  - Panels are correctly sized
  - Resizing works smoothly
  - Focus states are clear
  - Keyboard navigation works

**Story 3.2: Mobile Layout**
- As a mobile user, I want an app that feels native, not like a squeezed website.
- **Expected Behavior:** Single-panel navigation, touch-friendly controls, bottom sheets.
- **Acceptance Criteria:**
  - List and editor are separate screens
  - Touch targets are 44px minimum
  - Bottom sheets work correctly
  - Safe areas are respected

### Epic 4: Folder Management

**Story 4.1: View Folders**
- As a user, I want to see my folders in the sidebar to navigate my notes.
- **Expected Behavior:** Folders are listed with icons, selection is clear.
- **Acceptance Criteria:**
  - All folders are visible
  - Active folder is highlighted
  - Hover states work
  - Scroll works for many folders

**Story 4.2: Create Folder**
- As a user, I want to create new folders to organize my notes.
- **Expected Behavior:** Add folder creates inline input, validates name, saves to storage.
- **Edge Cases:** Duplicate name, empty name, maximum folders.
- **Acceptance Criteria:**
  - Inline input appears
  - Validation works
  - Folder appears in list
  - Folder persists

**Story 4.3: Rename Folder**
- As a user, I want to rename folders to keep my organization current.
- **Expected Behavior:** Rename action makes name editable, validates, saves.
- **Acceptance Criteria:**
  - Inline edit works
  - Validation prevents duplicates
  - System folders cannot be renamed

**Story 4.4: Delete Folder**
- As a user, I want to delete folders I no longer need.
- **Expected Behavior:** Confirmation dialog, notes moved to safe location.
- **Edge Cases:** Deleting active folder, folder with active note.
- **Acceptance Criteria:**
  - Confirmation required
  - Notes moved to My Notes
  - Selection updates correctly
  - System folders protected

### Epic 5: Note Lifecycle Management

**Story 5.1: Create Note**
- As a user, I want to create new notes quickly.
- **Expected Behavior:** New note button creates note, opens editor, focuses title.
- **Edge Cases:** Rapid clicks, filter active, search active.
- **Acceptance Criteria:**
  - Note created in correct folder
  - Editor opens immediately
  - Title focused
  - Timestamps correct

**Story 5.2: Edit Note**
- As a user, I want to edit my notes with a reliable editor.
- **Expected Behavior:** All changes save automatically, formatting persists.
- **Acceptance Criteria:**
  - Changes save within 500ms
  - Formatting preserved
  - Title updates in list
  - Modified time updates

**Story 5.3: Delete Note**
- As a user, I want to delete notes I no longer need.
- **Expected Behavior:** Confirmation, note removed, selection updated.
- **Edge Cases:** Deleting only note, deleting active note.
- **Acceptance Criteria:**
  - Confirmation required
  - Note removed from list
  - Selection moves appropriately
  - Undo available

**Story 5.4: Duplicate Note**
- As a user, I want to duplicate notes to use as templates.
- **Expected Behavior:** Copy created with "(Copy)" suffix, all content preserved.
- **Acceptance Criteria:**
  - Complete copy created
  - Formatting preserved
  - Images preserved
  - Tags preserved

**Story 5.5: Move Note**
- As a user, I want to move notes between folders.
- **Expected Behavior:** Folder selection, note moved, list updated.
- **Acceptance Criteria:**
  - Folder list shown
  - Move is immediate
  - Note appears in new folder

### Epic 6: Rich Text Editing

**Story 6.1: Basic Formatting**
- As a user, I want to apply bold, italic, underline, and strikethrough.
- **Expected Behavior:** Toolbar buttons and keyboard shortcuts work, formatting persists.
- **Acceptance Criteria:**
  - All formatting applies correctly
  - Shortcuts work
  - Active states show
  - Formatting persists after refresh

**Story 6.2: Headings and Structure**
- As a user, I want to structure my notes with headings and lists.
- **Expected Behavior:** Heading dropdown works, lists work, structure persists.
- **Acceptance Criteria:**
  - Heading levels apply
  - Lists work correctly
  - Checklists are interactive
  - Structure persists

**Story 6.3: Links and Images**
- As a user, I want to add links and images to my notes.
- **Expected Behavior:** Link dialog, image upload and URL input, content displays correctly.
- **Edge Cases:** Invalid URL, large image, unsupported format.
- **Acceptance Criteria:**
  - Links work
  - Images upload and display
  - Images persist
  - Errors handled gracefully

**Story 6.4: Code Blocks**
- As a user, I want to include code snippets in my notes.
- **Expected Behavior:** Code block applies monospace formatting, preserves whitespace.
- **Acceptance Criteria:**
  - Code blocks work
  - Monospace font applied
  - Whitespace preserved
  - Copy-friendly

### Epic 7: Search, Tags, Sorting, and Filtering

**Story 7.1: Search**
- As a user, I want to search my notes to find specific content.
- **Expected Behavior:** Live search, results update instantly, clear button works.
- **Acceptance Criteria:**
  - Search works on title, content, tags
  - Results update in real-time
  - No results state shown
  - Search persists

**Story 7.2: Tags**
- As a user, I want to tag notes for cross-cutting organization.
- **Expected Behavior:** Add/remove tags inline, click tag to filter.
- **Edge Cases:** Duplicate tags, long tags, special characters.
- **Acceptance Criteria:**
  - Tags add correctly
  - Tags display properly
  - Tag filter works
  - Tags persist

**Story 7.3: Sorting**
- As a user, I want to sort my notes by different criteria.
- **Expected Behavior:** Sort dropdown, immediate resort, preference persists.
- **Acceptance Criteria:**
  - All sort options work
  - Sort is instant
  - Preference saves

**Story 7.4: Filtering**
- As a user, I want to filter notes by tag status.
- **Expected Behavior:** Filter options, instant update, preference persists.
- **Acceptance Criteria:**
  - Filter options work
  - Combined with search works
  - Preference saves

### Epic 8: Settings and Data Portability

**Story 8.1: Export Data**
- As a user, I want to export my data as a backup.
- **Expected Behavior:** JSON download with all data.
- **Acceptance Criteria:**
  - All data included
  - Images included as base64
  - Valid JSON format

**Story 8.2: Import Data**
- As a user, I want to import a backup to restore my data.
- **Expected Behavior:** File picker, validation, merge/replace options.
- **Edge Cases:** Invalid file, partial data, duplicate IDs.
- **Acceptance Criteria:**
  - File validated
  - Options presented
  - Data restored correctly

**Story 8.3: Clear Data**
- As a user, I want to clear all my data to start fresh.
- **Expected Behavior:** Strong confirmation, complete wipe.
- **Acceptance Criteria:**
  - Requires typing confirmation
  - All data removed
  - App resets to initial state

### Epic 9: Mobile-First Interactions

**Story 9.1: Mobile Navigation**
- As a mobile user, I want easy navigation between list and editor.
- **Expected Behavior:** Back button works, transitions are smooth.
- **Acceptance Criteria:**
  - Back navigation works
  - Transitions are smooth
  - State preserved between screens

**Story 9.2: Bottom Sheets**
- As a mobile user, I want bottom sheets for selections and actions.
- **Expected Behavior:** Sheets appear correctly, dismiss easily.
- **Acceptance Criteria:**
  - Sheets position correctly
  - Dismiss works (drag, tap outside, Escape)
  - No scroll bleed

**Story 9.3: Touch Toolbar**
- As a mobile user, I want a touch-friendly editor toolbar.
- **Expected Behavior:** Large targets, scrollable, always accessible.
- **Acceptance Criteria:**
  - Targets are 44px minimum
  - Horizontal scroll works
  - Toolbar doesn't hide

### Epic 10: Reliability and Resilience

**Story 10.1: Storage Unavailable**
- As a user, I want to be informed if local storage is unavailable.
- **Expected Behavior:** Clear error message, graceful degradation.
- **Acceptance Criteria:**
  - Error shown clearly
  - App doesn't crash
  - User can try again

**Story 10.2: Data Corruption**
- As a user, I want the app to recover from corrupted data.
- **Expected Behavior:** Detect corruption, offer recovery options.
- **Acceptance Criteria:**
  - Corruption detected
  - Recovery attempted
  - User informed

**Story 10.3: Large Data Handling**
- As a user with many notes, I want the app to remain fast.
- **Expected Behavior:** No slowdown with 1000+ notes.
- **Acceptance Criteria:**
  - Search is fast
  - List renders smoothly
  - Save is fast

### Epic 11: Accessibility and Polish

**Story 11.1: Keyboard Navigation**
- As a keyboard user, I want to navigate the entire app without a mouse.
- **Expected Behavior:** All controls focusable, logical tab order, shortcuts work.
- **Acceptance Criteria:**
  - Tab order is logical
  - All controls accessible
  - Shortcuts work
  - Focus visible

**Story 11.2: Screen Reader Support**
- As a screen reader user, I want the app to be understandable.
- **Expected Behavior:** Proper ARIA labels, semantic structure.
- **Acceptance Criteria:**
  - Landmarks present
  - Labels meaningful
  - State changes announced

**Story 11.3: Visual Polish**
- As a user, I want every visual detail to feel intentional.
- **Expected Behavior:** Consistent spacing, alignment, states.
- **Acceptance Criteria:**
  - No visual bugs
  - Consistent styling
  - Professional appearance

---

## 7. EDGE-CASE MATRIX

| Scenario | Expected Behavior |
|----------|-------------------|
| Local storage unavailable | Show error message, prevent data loss, offer retry |
| Storage full / quota exceeded | Show warning, prevent further saves, offer data export |
| Malformed stored data | Detect, attempt recovery, show error if unrecoverable |
| Partial data corruption | Isolate corrupted data, recover what's possible |
| Duplicate IDs from import | Regenerate IDs automatically |
| Missing fields in imported data | Fill with defaults, log warning |
| Empty title | Display "Untitled Note" in UI |
| Whitespace-only title | Trim and treat as empty |
| Empty content | Allow, show placeholder in editor |
| Content with only image | Allow, preview shows [image] placeholder |
| Content with only formatting wrappers | Strip empty wrappers, treat as empty |
| Huge note content (> 1MB) | Warn user, compress if possible, allow but monitor performance |
| Canceled image upload | Clean up partial data, no side effects |
| Unsupported file type for image | Show error message with supported formats |
| Huge image file (> 10MB) | Reject with clear size limit message |
| Invalid link input | Validate URL format, show error if invalid |
| Duplicate folder names | Show error, prevent creation |
| Empty folder name | Prevent creation, show validation message |
| Deleting active folder | Move notes to My Notes, update selection |
| Deleting folder containing active note | Move note to My Notes, keep note selected |
| Duplicate tags | Silently prevent duplicate, keep one |
| Very long tags | Truncate display with ellipsis |
| Search returning no notes | Show empty state with message |
| Active note disappears due to filter | Clear selection, show placeholder |
| Creating note while filters active | Create in current folder, note may not appear if filtered out |
| Deleting final note in context | Clear selection, show empty state |
| Rapid repeated clicks | Debounce actions, prevent duplicates |
| Menu positioning near viewport edge | Flip/shift menu to stay in viewport |
| Focus restoration after dialogs | Return focus to trigger element |
| Storage changes while app open (multi-tab) | Detect and sync or warn user |
| Import of malformed backup file | Show specific error message |
| Clearing all data | Require typing "CLEAR" to confirm |
| Network required for anything | Never required - app works offline |
| Browser back button in mobile editor | Return to note list |
| Keyboard shortcuts conflict | Use standard shortcuts, document exceptions |
| Paste of formatted content | Sanitize and normalize to supported formats |
| Undo stack limit | Reasonable limit (100 steps), oldest discarded |
| Image loading failure | Show placeholder, allow removal |
| Very long note list | Virtualize or limit rendering for performance |
| Print functionality | Not required, user can use browser print |

---

## 8. RECOMMENDED STACK AND TECHNICAL ARCHITECTURE

### 8.1 Technology Choices

**Framework: Next.js 16 with App Router**
- **Rationale:** Required by project constraints. App Router provides modern React patterns, excellent performance, and client-side rendering control for a local-first app.

**Language: TypeScript 5**
- **Rationale:** Required by project constraints. Essential for type safety in a complex data model with notes, folders, tags, and editor content.

**Styling: Tailwind CSS 4 with CSS Variables**
- **Rationale:** Tailwind provides utility-first styling that's perfect for pixel-perfect implementations. CSS variables enable the precise AMOLED dark theme with easy theme switching if needed in the future. The utility approach ensures consistency with the 8px spacing system.

**UI Components: Radix UI Primitives + Custom Components**
- **Rationale:** Radix provides accessible, unstyled primitives for complex components like dialogs, dropdowns, and popovers. This allows complete control over the AMOLED visual design while ensuring accessibility. Shadcn/ui (already installed) builds on Radix and provides a great foundation.

**Rich Text Editor: TipTap (ProseMirror-based)**
- **Rationale:** 
  - Best-in-class React rich text editor
  - Excellent reliability and formatting persistence
  - Extensible with custom extensions
  - Built-in support for images, links, code blocks
  - Active development and good documentation
  - Works well with local storage (JSON content)
  - Checklists, tables, and all required features available

**State Management: Zustand**
- **Rationale:**
  - Lightweight and simple API
  - Perfect for client-side state
  - Easy persistence integration
  - TypeScript-friendly
  - No boilerplate
  - Excellent for local-first apps

**Persistence: IndexedDB via idb library**
- **Rationale:**
  - Required for image storage (base64)
  - No size limit concerns (unlike localStorage)
  - Better performance for large data sets
  - Structured data storage
  - `idb` provides a Promise-based API that's easy to work with

**Icons: Lucide React**
- **Rationale:**
  - Already installed in project
  - Consistent, clean icon set
  - Tree-shakeable
  - Good coverage for all required icons

**Animation: Framer Motion**
- **Rationale:**
  - Already installed in project
  - Smooth, performant animations
  - Built-in reduced motion support
  - Perfect for subtle micro-interactions

**Unique ID Generation: nanoid**
- **Rationale:**
  - Already installed
  - Small, fast, collision-safe
  - URL-safe IDs

### 8.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Sidebar   │  │  Note List  │  │   Editor    │                 │
│  │  Component  │  │  Component  │  │  Component  │                 │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                │                │                         │
│         └────────────────┼────────────────┘                         │
│                          │                                          │
│                    ┌─────▼─────┐                                    │
│                    │   Zustand │                                    │
│                    │   Store   │                                    │
│                    └─────┬─────┘                                    │
│                          │                                          │
├──────────────────────────┼──────────────────────────────────────────┤
│                      Data Layer                                      │
│                    ┌─────▼─────┐                                    │
│                    │   DB      │                                    │
│                    │  Service  │                                    │
│                    └─────┬─────┘                                    │
│                          │                                          │
│                    ┌─────▼─────┐                                    │
│                    │ IndexedDB │                                    │
│                    └───────────┘                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.3 Data Model

```typescript
// Folder
interface Folder {
  id: string;
  name: string;
  type: 'system' | 'custom';
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

// Note
interface Note {
  id: string;
  folderId: string;
  title: string;
  content: TipTapJSON; // ProseMirror JSON content
  plainText: string; // For search and preview
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// App State
interface AppState {
  folders: Folder[];
  notes: Note[];
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  searchQuery: string;
  tagFilter: string | null;
  sortBy: 'modified-desc' | 'modified-asc' | 'created-desc' | 'created-asc' | 'title-asc' | 'title-desc';
  showTaggedOnly: boolean | null;
  reducedMotion: boolean;
}

// Settings
interface Settings {
  reducedMotion: boolean;
  lastExportDate?: number;
}
```

### 8.4 File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main app page
│   └── globals.css             # Global styles, CSS variables
├── components/
│   ├── ui/                     # shadcn/ui components (existing)
│   ├── layout/
│   │   ├── AppShell.tsx        # Main app layout wrapper
│   │   ├── Sidebar.tsx         # Sidebar component
│   │   ├── NoteList.tsx        # Note list panel
│   │   └── Editor.tsx          # Editor panel
│   ├── editor/
│   │   ├── TipTapEditor.tsx    # Main editor component
│   │   ├── Toolbar.tsx         # Formatting toolbar
│   │   ├── extensions.ts       # TipTap extensions
│   │   └── ImageUpload.tsx     # Image handling
│   ├── dialogs/
│   │   ├── ConfirmDialog.tsx   # Confirmation modal
│   │   ├── MoveNoteDialog.tsx  # Move note modal
│   │   ├── SettingsDialog.tsx  # Settings modal
│   │   └── ImportExportDialog.tsx
│   ├── mobile/
│   │   ├── MobileLayout.tsx    # Mobile-specific layout
│   │   ├── MobileNoteList.tsx  # Mobile note list
│   │   ├── MobileEditor.tsx    # Mobile editor
│   │   └── BottomSheet.tsx     # Bottom sheet component
│   └── common/
│       ├── Logo.tsx            # SamsNotes logo
│       ├── NoteCard.tsx        # Note card component
│       ├── TagChip.tsx         # Tag chip component
│       ├── EmptyState.tsx      # Empty state component
│       └── SaveIndicator.tsx   # Save state indicator
├── hooks/
│   ├── useNotes.ts             # Note operations hook
│   ├── useFolders.ts           # Folder operations hook
│   ├── useSearch.ts            # Search functionality
│   ├── usePersist.ts           # Persistence hook
│   └── useMediaQuery.ts        # Responsive breakpoint hook
├── lib/
│   ├── db.ts                   # IndexedDB operations
│   ├── store.ts                # Zustand store
│   ├── utils.ts                # Utility functions
│   ├── constants.ts            # App constants
│   └── seed.ts                 # Demo content seeder
├── types/
│   └── index.ts                # TypeScript type definitions
└── styles/
    └── editor.css              # Editor-specific styles
```

### 8.5 Key Implementation Decisions

**1. IndexedDB over localStorage:**
- Images need base64 storage (localStorage has ~5MB limit)
- Better performance with many notes
- Structured queries possible

**2. Zustand with persist middleware:**
- Automatic state sync
- Easy to extend
- No complex setup

**3. TipTap JSON content:**
- Reliable persistence
- Easy to extract plain text for search
- No serialization issues

**4. Responsive strategy:**
- CSS media queries for layout changes
- Separate components for mobile
- Shared state between desktop and mobile

**5. Image storage:**
- Convert to base64 on upload
- Store within note content (TipTap handles this)
- Also stored in IndexedDB for backup

---

## 9. IMPLEMENTATION ACCEPTANCE CHECKLIST

Before considering the project complete, verify:

- [ ] AMOLED dark UI looks premium and deliberate
- [ ] Grey hierarchy makes everything visible and elegant
- [ ] Desktop feels like polished software
- [ ] Tablet feels intentionally adapted
- [ ] Mobile feels purpose-built and touch-friendly
- [ ] All visible controls work
- [ ] Note formatting persists perfectly after refresh
- [ ] Embedded images persist and render correctly
- [ ] Import and export work reliably
- [ ] Destructive actions are safe and clear
- [ ] Edge cases are handled gracefully
- [ ] Accessibility is strong
- [ ] No console errors during normal operation
- [ ] Final product feels complete, refined, and production-quality

---

*End of Specification Document*
