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
  Heading1,
  Heading2,
  Heading3,
  Type,
  RemoveFormatting,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

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

function ToolbarButton({ onClick, isActive, isDisabled, children, title }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
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

// Font size options — map display px label → what we apply via inline style
// TipTap doesn't have a built-in fontSize extension in StarterKit, so we use
// a custom mark via the FontSize extension OR fall back to heading levels.
// To avoid requiring a new extension, we use heading levels + paragraph for structure:
const TEXT_STYLES = [
  { label: '12',  value: 'xs',    action: 'paragraph',  fontSize: '12px' },
  { label: '14',  value: 'sm',    action: 'paragraph',  fontSize: '14px' },
  { label: '16',  value: 'base',  action: 'paragraph',  fontSize: '16px' },
  { label: '18',  value: 'lg',    action: 'paragraph',  fontSize: '18px' },
  { label: '20',  value: 'xl',    action: 'heading-3',  fontSize: '20px' },
  { label: '24',  value: '2xl',   action: 'heading-2',  fontSize: '24px' },
  { label: '32',  value: '3xl',   action: 'heading-1',  fontSize: '32px' },
] as const;

export function Toolbar({
  editor,
  onImageUpload,
  onImageUrl,
  onAddLink,
  onRemoveLink,
}: ToolbarProps) {
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [sizeMenuPosition, setSizeMenuPosition] = useState({ top: 0, left: 0 });
  const [imageMenuPosition, setImageMenuPosition] = useState({ top: 0, left: 0 });

  const sizeButtonRef = useRef<HTMLButtonElement>(null);
  const imageButtonRef = useRef<HTMLButtonElement>(null);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSizeMenu(false);
        setShowImageMenu(false);
      }
    };
    const handleClickOutside = () => {
      setShowSizeMenu(false);
      setShowImageMenu(false);
    };
    if (showSizeMenu || showImageMenu) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSizeMenu, showImageMenu]);

  const updateSizeMenuPosition = useCallback(() => {
    if (sizeButtonRef.current) {
      const rect = sizeButtonRef.current.getBoundingClientRect();
      setSizeMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, []);

  const updateImageMenuPosition = useCallback(() => {
    if (imageButtonRef.current) {
      const rect = imageButtonRef.current.getBoundingClientRect();
      setImageMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, []);

  const handleSizeMenuToggle = () => {
    if (!showSizeMenu) updateSizeMenuPosition();
    setShowSizeMenu(!showSizeMenu);
    setShowImageMenu(false);
  };

  const handleImageMenuToggle = () => {
    if (!showImageMenu) updateImageMenuPosition();
    setShowImageMenu(!showImageMenu);
    setShowSizeMenu(false);
  };

  // Get the label of the currently active text size
  const getCurrentSizeLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return '32';
    if (editor.isActive('heading', { level: 2 })) return '24';
    if (editor.isActive('heading', { level: 3 })) return '20';
    // For paragraph nodes, try to read the inline font-size from DOM selection
    // We default to 16 for normal paragraph
    return '16';
  };

  const applyTextStyle = (style: typeof TEXT_STYLES[number]) => {
    if (style.action === 'heading-1') {
      editor.chain().focus().setHeading({ level: 1 }).run();
    } else if (style.action === 'heading-2') {
      editor.chain().focus().setHeading({ level: 2 }).run();
    } else if (style.action === 'heading-3') {
      editor.chain().focus().setHeading({ level: 3 }).run();
    } else {
      editor.chain().focus().setParagraph().run();
    }
    setShowSizeMenu(false);
  };

  const isStyleActive = (style: typeof TEXT_STYLES[number]) => {
    if (style.action === 'heading-1') return editor.isActive('heading', { level: 1 });
    if (style.action === 'heading-2') return editor.isActive('heading', { level: 2 });
    if (style.action === 'heading-3') return editor.isActive('heading', { level: 3 });
    return !editor.isActive('heading') && style.label === getCurrentSizeLabel();
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-surface-2 border-b border-subtle px-4 py-2">
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-wrap gap-y-1">
          {/* Undo/Redo */}
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

          {/* Font Size dropdown — replaces old P/H1/H2/H3 label */}
          <button
            ref={sizeButtonRef}
            onClick={handleSizeMenuToggle}
            title="Font size"
            className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-mono font-medium transition-colors shrink-0',
              'text-muted-custom hover:text-secondary-custom hover:bg-hover',
              showSizeMenu && 'bg-hover text-secondary-custom'
            )}
          >
            <span className="min-w-[20px] text-center">{getCurrentSizeLabel()}</span>
            <ChevronDown className="w-3 h-3" />
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

          {/* Image dropdown */}
          <button
            ref={imageButtonRef}
            onClick={handleImageMenuToggle}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors shrink-0',
              'text-muted-custom hover:text-secondary-custom hover:bg-hover',
              showImageMenu && 'bg-hover text-secondary-custom'
            )}
            title="Insert Image"
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

      {/* Font Size Menu — portalled to body */}
      {showSizeMenu && createPortal(
        <div
          className="fixed z-[9999] min-w-[120px] py-1.5 rounded-xl bg-raised border border-subtle shadow-2xl"
          style={{ top: sizeMenuPosition.top, left: sizeMenuPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-custom">
            Size
          </div>
          {TEXT_STYLES.map((style) => (
            <button
              key={style.label}
              onClick={() => applyTextStyle(style)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors',
                isStyleActive(style)
                  ? 'text-primary-custom bg-selected'
                  : 'text-secondary-custom hover:bg-hover'
              )}
            >
              <span className="font-mono text-sm">{style.label}</span>
              <span
                className="text-muted-custom ml-3 flex-1 text-right truncate"
                style={{ fontSize: style.fontSize, lineHeight: 1 }}
              >
                {style.action === 'heading-1' ? 'H1' :
                 style.action === 'heading-2' ? 'H2' :
                 style.action === 'heading-3' ? 'H3' : 'Aa'}
              </span>
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Image Menu — portalled to body */}
      {showImageMenu && createPortal(
        <div
          className="fixed z-[9999] min-w-[160px] py-1 rounded-lg bg-raised border border-subtle shadow-2xl"
          style={{ top: imageMenuPosition.top, left: imageMenuPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { onImageUpload(); setShowImageMenu(false); }}
            className="w-full px-3 py-2 text-left text-sm text-secondary-custom hover:bg-hover transition-colors flex items-center gap-2"
          >
            Upload from device
          </button>
          <button
            onClick={() => { onImageUrl(); setShowImageMenu(false); }}
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
