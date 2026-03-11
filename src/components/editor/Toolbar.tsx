'use client';

import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Link,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  RemoveFormatting,
  ChevronDown,
  Palette,
  Highlighter,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolbarProps {
  editor: Editor;
  onImageUpload: () => void;
  onImageUrl: () => void;
  onAddLink: () => void;
  onRemoveLink: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEXT_SIZES = [
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '30', value: '30px' },
  { label: '36', value: '36px' },
  { label: '48', value: '48px' },
  { label: '64', value: '64px' },
];

const COLORS = [
  { name: 'Default', value: 'inherit' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Gray', value: '#9CA3AF' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Green', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
];

const HIGHLIGHTS = [
  { name: 'None', value: 'transparent' },
  { name: 'Yellow', value: '#FEF08A' },
  { name: 'Green', value: '#BBF7D0' },
  { name: 'Blue', value: '#BFDBFE' },
  { name: 'Purple', value: '#E9D5FF' },
  { name: 'Pink', value: '#FBCFE8' },
  { name: 'Orange', value: '#FED7AA' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToolbarButton({ onClick, isActive, isDisabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={isDisabled}
      title={title}
      className={cn(
        'p-2 rounded-md transition-colors shrink-0',
        isActive
          ? 'bg-selected text-primary-custom'
          : 'text-muted-custom hover:text-secondary-custom hover:bg-hover',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-subtle mx-1 shrink-0" />;
}

// ─── Dropdown type management ─────────────────────────────────────────────────

type DropdownType = 'size' | 'color' | 'highlight' | 'image' | null;

// ─── Main component ──────────────────────────────────────────────────────────

export function Toolbar({
  editor,
  onImageUpload,
  onImageUrl,
  onAddLink,
  onRemoveLink,
}: ToolbarProps) {
  // Single state for which dropdown is open (only one can be open at a time)
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Refs for trigger buttons
  const sizeButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const highlightButtonRef = useRef<HTMLButtonElement>(null);
  const imageButtonRef = useRef<HTMLButtonElement>(null);

  // Ref for the active dropdown portal content
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Close on outside click or Escape ──────────────────────────────────────

  useEffect(() => {
    if (!activeDropdown) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDropdown(null);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      // Don't close if clicking inside the dropdown portal
      if (dropdownRef.current?.contains(target)) return;

      // Don't close if clicking the trigger button (toggle handles it)
      const triggerRefs = [sizeButtonRef, colorButtonRef, highlightButtonRef, imageButtonRef];
      for (const ref of triggerRefs) {
        if (ref.current?.contains(target)) return;
      }

      setActiveDropdown(null);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [activeDropdown]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const openDropdown = useCallback((type: DropdownType, ref: React.RefObject<HTMLButtonElement | null>) => {
    if (activeDropdown === type) {
      setActiveDropdown(null);
      return;
    }
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
    setActiveDropdown(type);
  }, [activeDropdown]);

  const getCurrentSizeLabel = useCallback(() => {
    const attrs = editor.getAttributes('textStyle');
    if (attrs.fontSize) return attrs.fontSize.replace('px', '');
    if (editor.isActive('heading', { level: 1 })) return '32';
    if (editor.isActive('heading', { level: 2 })) return '24';
    if (editor.isActive('heading', { level: 3 })) return '20';
    return '16';
  }, [editor]);

  // ── Action handlers ───────────────────────────────────────────────────────

  const applyFontSize = useCallback((size: string) => {
    editor.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run();
    setActiveDropdown(null);
  }, [editor]);

  const applyColor = useCallback((value: string) => {
    if (value === 'inherit') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(value).run();
    }
    setActiveDropdown(null);
  }, [editor]);

  const applyHighlight = useCallback((value: string) => {
    if (value === 'transparent') {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().setHighlight({ color: value }).run();
    }
    setActiveDropdown(null);
  }, [editor]);

  const handleUploadFromDevice = useCallback(() => {
    onImageUpload();
    setActiveDropdown(null);
  }, [onImageUpload]);

  const handleInsertFromUrl = useCallback(() => {
    onImageUrl();
    setActiveDropdown(null);
  }, [onImageUrl]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="sticky top-0 z-10 bg-surface-2 border-b border-subtle px-4 py-2">
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-wrap gap-y-1">
          {/* Undo / Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            isDisabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            isDisabled={!editor.can().redo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Font Size */}
          <button
            ref={sizeButtonRef}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openDropdown('size', sizeButtonRef)}
            title="Font size"
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-mono font-medium transition-colors shrink-0',
              'text-muted-custom hover:text-secondary-custom hover:bg-hover',
              activeDropdown === 'size' && 'bg-hover text-secondary-custom'
            )}
          >
            <span className="min-w-[20px] text-center">{getCurrentSizeLabel()}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <ToolbarDivider />

          {/* Text Color */}
          <button
            ref={colorButtonRef}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openDropdown('color', colorButtonRef)}
            title="Text Color"
            className={cn(
              'p-2 rounded-md transition-colors shrink-0',
              'text-muted-custom hover:text-secondary-custom hover:bg-hover',
              activeDropdown === 'color' && 'bg-selected text-primary-custom'
            )}
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Highlight */}
          <button
            ref={highlightButtonRef}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openDropdown('highlight', highlightButtonRef)}
            title="Highlight"
            className={cn(
              'p-2 rounded-md transition-colors shrink-0',
              'text-muted-custom hover:text-secondary-custom hover:bg-hover',
              activeDropdown === 'highlight' && 'bg-selected text-primary-custom'
            )}
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <ToolbarDivider />

          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Checklist"
          >
            <CheckSquare className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Block elements */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Link */}
          <ToolbarButton
            onClick={onAddLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <Link className="w-4 h-4" />
          </ToolbarButton>

          {/* Image */}
          <button
            ref={imageButtonRef}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => openDropdown('image', imageButtonRef)}
            title="Insert Image"
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors shrink-0',
              'text-muted-custom hover:text-secondary-custom hover:bg-hover',
              activeDropdown === 'image' && 'bg-hover text-secondary-custom'
            )}
          >
            <ImageIcon className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>

          <ToolbarDivider />

          {/* Clear formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* ── Dropdown Portals ─────────────────────────────────────────────── */}

      {/* Font Size Menu */}
      {activeDropdown === 'size' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] min-w-[80px] py-1.5 rounded-xl bg-raised border border-subtle shadow-2xl"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-custom">
            Size
          </div>
          {TEXT_SIZES.map((size) => (
            <button
              key={size.label}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFontSize(size.label)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors',
                getCurrentSizeLabel() === size.label
                  ? 'text-primary-custom bg-selected'
                  : 'text-secondary-custom hover:bg-hover'
              )}
            >
              <span className="font-mono text-sm">{size.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Color Menu */}
      {activeDropdown === 'color' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] min-w-[140px] py-1.5 rounded-xl bg-raised border border-subtle shadow-2xl"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-custom">
            Color
          </div>
          <div className="grid grid-cols-5 gap-1 p-2">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyColor(color.value)}
                title={color.name}
                className="w-6 h-6 rounded-md border border-subtle transition-transform hover:scale-110"
                style={{ backgroundColor: color.value === 'inherit' ? 'transparent' : color.value }}
              >
                {color.value === 'inherit' && <RemoveFormatting className="w-3 h-3 mx-auto" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Highlight Menu */}
      {activeDropdown === 'highlight' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] min-w-[140px] py-1.5 rounded-xl bg-raised border border-subtle shadow-2xl"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-custom">
            Highlight
          </div>
          <div className="grid grid-cols-5 gap-1 p-2">
            {HIGHLIGHTS.map((color) => (
              <button
                key={color.name}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyHighlight(color.value)}
                title={color.name}
                className="w-6 h-6 rounded-md border border-subtle transition-transform hover:scale-110"
                style={{ backgroundColor: color.value }}
              >
                {color.value === 'transparent' && <RemoveFormatting className="w-3 h-3 mx-auto" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Image Menu */}
      {activeDropdown === 'image' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] min-w-[160px] py-1 rounded-lg bg-raised border border-subtle shadow-2xl"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleUploadFromDevice}
            className="w-full px-3 py-2 text-left text-sm text-secondary-custom hover:bg-hover transition-colors flex items-center gap-2"
          >
            Upload from device
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertFromUrl}
            className="w-full px-3 py-2 text-left text-sm text-secondary-custom hover:bg-hover transition-colors flex items-center gap-2"
          >
            Insert from URL
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
