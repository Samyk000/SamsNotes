'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { useCallback, useRef, useState } from 'react';
import { Trash2, GripVertical, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── NodeView Component ───────────────────────────────────────────────────────

function ResizableImageView({ node, updateAttributes, deleteNode, selected }: ReactNodeViewProps) {
  const { src, alt, title, width, float } = node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent, direction: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = containerRef.current?.getBoundingClientRect().width ?? 300;

    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = direction === 'right'
        ? Math.max(100, startWidth + delta)
        : Math.max(100, startWidth - delta);
      updateAttributes({ width: Math.round(newWidth) });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updateAttributes]);

  if (!src) return null;

  // Alignment/float styles
  const wrapperStyle: React.CSSProperties = {};
  let wrapperClass = 'relative group my-4';
  if (float === 'left') {
    wrapperStyle.float = 'left';
    wrapperStyle.marginRight = '1em';
    wrapperStyle.marginBottom = '0.5em';
    wrapperClass = 'relative group my-2';
  } else if (float === 'right') {
    wrapperStyle.float = 'right';
    wrapperStyle.marginLeft = '1em';
    wrapperStyle.marginBottom = '0.5em';
    wrapperClass = 'relative group my-2';
  } else if (float === 'center') {
    wrapperStyle.display = 'flex';
    wrapperStyle.justifyContent = 'center';
  }

  return (
    <NodeViewWrapper
      className={wrapperClass}
      style={wrapperStyle}
      data-drag-handle
    >
      <div
        ref={containerRef}
        className={cn(
          'relative inline-block rounded-lg overflow-hidden transition-shadow',
          selected && 'ring-2 ring-accent-neutral/50',
          isResizing && 'select-none'
        )}
        style={{ width: width ? `${width}px` : 'auto', maxWidth: '100%' }}
      >
        {/* The image */}
        <img
          src={src as string}
          alt={(alt as string) || ''}
          title={(title as string) || ''}
          className="block w-full h-auto rounded-lg"
          draggable={false}
        />

        {/* Resize handle – left */}
        <div
          onMouseDown={(e) => handleMouseDown(e, 'left')}
          className={cn(
            'absolute left-0 top-0 bottom-0 w-3 cursor-col-resize',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            isResizing && 'opacity-100'
          )}
        >
          <div className="w-1 h-8 rounded-full bg-white/70 shadow" />
        </div>

        {/* Resize handle – right */}
        <div
          onMouseDown={(e) => handleMouseDown(e, 'right')}
          className={cn(
            'absolute right-0 top-0 bottom-0 w-3 cursor-col-resize',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            isResizing && 'opacity-100'
          )}
        >
          <div className="w-1 h-8 rounded-full bg-white/70 shadow" />
        </div>

        {/* Toolbar overlay (top-right) */}
        <div
          className={cn(
            'absolute top-2 right-2 flex items-center gap-1',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          {/* Alignment buttons */}
          <button
            onClick={() => updateAttributes({ float: float === 'left' ? null : 'left' })}
            className={cn(
              'p-1.5 rounded-md backdrop-blur-sm transition-colors',
              float === 'left' ? 'bg-white/30 text-white' : 'bg-black/60 text-white/80 hover:text-white'
            )}
            title="Float left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateAttributes({ float: float === 'center' ? null : 'center' })}
            className={cn(
              'p-1.5 rounded-md backdrop-blur-sm transition-colors',
              float === 'center' ? 'bg-white/30 text-white' : 'bg-black/60 text-white/80 hover:text-white'
            )}
            title="Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateAttributes({ float: float === 'right' ? null : 'right' })}
            className={cn(
              'p-1.5 rounded-md backdrop-blur-sm transition-colors',
              float === 'right' ? 'bg-white/30 text-white' : 'bg-black/60 text-white/80 hover:text-white'
            )}
            title="Float right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          {/* Drag handle */}
          <div
            data-drag-handle
            className="p-1.5 rounded-md bg-black/60 text-white/80 hover:text-white cursor-grab active:cursor-grabbing backdrop-blur-sm"
            title="Drag to move"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Delete button */}
          <button
            onClick={deleteNode}
            className="p-1.5 rounded-md bg-black/60 text-white/80 hover:text-red-400 backdrop-blur-sm transition-colors"
            title="Delete image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// ─── TipTap Extension ─────────────────────────────────────────────────────────

export const ResizableImage = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      float: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
