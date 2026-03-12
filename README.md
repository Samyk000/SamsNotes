# SamsNotes

SamsNotes is a modern, high-performance, private note-taking application designed for speed, security, and a premium user experience. It features a rich text editor with full support for images, formatting, and organized folder management.

## ✨ Key Features

- **🚀 Rich Text Editor** - Powered by TipTap, supporting font sizes, colors, highlighting, and more.
- **🖼️ Image Support** - Drag-and-drop or upload images with custom resizing and placement controls (Left, Center, Right).
- **📂 Organization** - Simple folder-based organization with smart duplication and safe deletion.
- **📱 Responsive Design** - Optimized for both Desktop and Mobile with a clean, AMOLED dark theme.
- **🔒 Private & Local** - Your data is stored locally in your browser using IndexedDB for maximum privacy and offline capability.
- **⚡ Performance First** - Optimized algorithms for fast search and smooth editing.

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Storage**: IndexedDB (via `idb`)
- **Editor**: TipTap (ProseMirror)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Samyk000/SamsNotes.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application in action.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router (Pages & Layouts)
├── components/          # React Components
│   ├── editor/         # TipTap Editor & Extensions
│   ├── layout/         # UI Shell Components (Sidebar, NoteList)
│   ├── mobile/         # Mobile-specific UI
│   └── ui/             # Reusable UI primitives (shadcn)
├── hooks/              # Custom React Hooks
├── lib/                # Database logic (idb), Zustand store, and Constants
└── types/              # TypeScript Type Definitions
```

## 📜 License

Private - All rights reserved. Built for the developer community with ❤️.
