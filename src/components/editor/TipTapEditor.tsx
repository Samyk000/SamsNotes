'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ResizableImage } from './ResizableImage';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Extension } from '@tiptap/core';
import { common, createLowlight } from 'lowlight';
import { cn } from '@/lib/utils';
import { RichContent } from '@/types';
import { Toolbar } from './Toolbar';

const lowlight = createLowlight(common);

// Custom Font Size extension — uses TipTap v3 command pattern
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: Record<string, string>) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

function normalizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('mailto:') && !trimmed.startsWith('tel:')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

interface TipTapEditorProps {
  content: RichContent | null;
  onUpdate: (content: RichContent, plainText: string) => void;
  saveState: 'saved' | 'saving' | 'error';
  placeholder?: string;
  className?: string;
}

export function TipTapEditor({
  content,
  onUpdate,
  saveState,
  placeholder = 'Start writing...',
  className,
}: TipTapEditorProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile keyboard handling
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const viewport = window.visualViewport;
    
    const handleResize = () => {
      // Calculate offset based on window layout height vs actual visual height
      const offset = window.innerHeight - viewport.height;
      setKeyboardHeight(Math.max(0, offset));
    };

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);
    handleResize();

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
        // Disable link and underline from StarterKit since we add them separately
        link: false,
        underline: false,
      }),
      ResizableImage,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-accent-neutral underline underline-offset-2 hover:text-secondary-custom',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-surface-1 p-4 rounded-lg font-mono text-sm overflow-x-auto my-4',
        },
      }),
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: content || undefined,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-invert max-w-none min-h-[300px] focus:outline-none',
          'prose-headings:text-primary-custom prose-p:text-secondary-custom',
          'prose-strong:text-primary-custom prose-em:text-secondary-custom',
          'prose-code:text-accent-neutral prose-pre:bg-surface-1',
          'prose-li:text-secondary-custom prose-li:marker:text-muted-custom',
          'prose-blockquote:text-muted-custom prose-blockquote:border-l-border-strong',
          'prose-a:text-accent-neutral'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as RichContent;
      const plainText = editor.getText();
      onUpdate(json, plainText);
    },
    immediatelyRender: false,
  });

  // Handle image upload
  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      editor?.chain().focus().insertContent({
        type: 'image',
        attrs: { src: result },
      }).run();
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  }, [editor]);

  // Handle image URL
  const handleImageUrlSubmit = useCallback(() => {
    if (imageUrl.trim()) {
      editor?.chain().focus().insertContent({
        type: 'image',
        attrs: { src: normalizeUrl(imageUrl) },
      }).run();
      setImageUrl('');
      setIsImageDialogOpen(false);
    }
  }, [editor, imageUrl]);

  // Handle link
  const handleLinkSubmit = useCallback(() => {
    if (linkUrl.trim()) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: normalizeUrl(linkUrl) }).run();
      setLinkUrl('');
      setIsLinkDialogOpen(false);
    }
  }, [editor, linkUrl]);

  // Unset link
  const unsetLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  if (!editor) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        <div className="h-12 bg-surface-2 border-b border-subtle animate-pulse" />
        <div className="flex-1 p-6">
          <div className="max-w-[720px] mx-auto space-y-4">
            <div className="h-6 w-3/4 bg-surface-1 rounded animate-pulse" />
            <div className="h-4 w-full bg-surface-1 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-surface-1 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Desktop Toolbar (Hidden on Mobile) */}
      <Toolbar
        editor={editor}
        onImageUpload={handleImageUpload}
        onImageUrl={() => setIsImageDialogOpen(true)}
        onAddLink={() => setIsLinkDialogOpen(true)}
        onRemoveLink={unsetLink}
        className="hidden md:flex sticky top-0 z-10"
      />

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 md:px-12 py-6 pb-24 md:pb-32">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Mobile Toolbar (Hidden on Desktop) */}
      <div 
        className="md:hidden fixed left-0 right-0 z-[100] transition-[bottom] duration-100 ease-out"
        style={{ bottom: keyboardHeight > 0 ? keyboardHeight : 0 }}
      >
        <div className="w-full bg-surface-2 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <Toolbar
            editor={editor}
            onImageUpload={handleImageUpload}
            onImageUrl={() => setIsImageDialogOpen(true)}
            onAddLink={() => setIsLinkDialogOpen(true)}
            onRemoveLink={unsetLink}
            className="border-t border-b-0 border-subtle safe-area-bottom bg-transparent h-12"
          />
        </div>
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image URL Dialog - Rendered at root level */}
      {isImageDialogOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          onClick={() => {
            setIsImageDialogOpen(false);
            setImageUrl('');
          }}
        >
          <div 
            className="bg-raised border border-subtle rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-primary-custom mb-4">
              Add Image from URL
            </h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-surface-2 border border-subtle',
                'text-primary-custom placeholder:text-muted-custom',
                'focus:outline-none focus:border-border-focus'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleImageUrlSubmit();
                if (e.key === 'Escape') {
                  setIsImageDialogOpen(false);
                  setImageUrl('');
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsImageDialogOpen(false);
                  setImageUrl('');
                }}
                className="px-4 py-2 rounded-lg text-sm text-muted-custom hover:text-secondary-custom transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImageUrlSubmit}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-2 border border-subtle text-secondary-custom hover:bg-hover transition-colors"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Link Dialog - Rendered at root level */}
      {isLinkDialogOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          onClick={() => {
            setIsLinkDialogOpen(false);
            setLinkUrl('');
          }}
        >
          <div 
            className="bg-raised border border-subtle rounded-xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-primary-custom mb-4">
              Add Link
            </h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className={cn(
                'w-full h-10 px-3 rounded-lg',
                'bg-surface-2 border border-subtle',
                'text-primary-custom placeholder:text-muted-custom',
                'focus:outline-none focus:border-border-focus'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLinkSubmit();
                if (e.key === 'Escape') {
                  setIsLinkDialogOpen(false);
                  setLinkUrl('');
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsLinkDialogOpen(false);
                  setLinkUrl('');
                }}
                className="px-4 py-2 rounded-lg text-sm text-muted-custom hover:text-secondary-custom transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkSubmit}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-surface-2 border border-subtle text-secondary-custom hover:bg-hover transition-colors"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
