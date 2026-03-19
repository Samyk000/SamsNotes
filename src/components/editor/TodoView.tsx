import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Plus } from 'lucide-react';
import { nanoid } from 'nanoid';
import { cn } from '@/lib/utils';

interface TodoItem {
  id: string;
  title: string;
  status: 'todo' | 'done';
  order: number;
}

interface TodoViewProps {
  content: TodoItem[] | null;
  onUpdate: (content: TodoItem[], plainText: string) => void;
  saveState: 'saved' | 'saving' | 'error';
}

function SortableTodoItem({
  item,
  onToggle,
  onChange,
  onDelete,
}: {
  item: TodoItem;
  onToggle: (id: string) => void;
  onChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 p-2 rounded-lg border border-transparent transition-colors',
        'hover:bg-hover hover:border-border',
        isDragging && 'opacity-50 z-50 bg-background-surface-1 shadow-lg ring-1 ring-border-focus'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move p-1 text-muted-custom hover:text-secondary-custom rounded"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <input
        type="checkbox"
        checked={item.status === 'done'}
        onChange={() => onToggle(item.id)}
        className="w-4 h-4 rounded-full border-2 border-muted-custom accent-primary-custom"
      />

      <input
        type="text"
        value={item.title}
        onChange={(e) => onChange(item.id, e.target.value)}
        className={cn(
          'flex-1 bg-transparent border-none outline-none text-primary-custom px-1',
          item.status === 'done' && 'line-through text-muted-custom'
        )}
        placeholder="Empty task..."
      />

      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="p-1 opacity-0 group-hover:opacity-100 text-muted-custom hover:text-danger-custom transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function TodoView({ content, onUpdate, saveState }: TodoViewProps) {
  const [items, setItems] = useState<TodoItem[]>(content || []);
  const isFirstMount = useRef(true);

  // Sync internal items if remote prop changes entirely (usually only on note switch)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    // We only want to fully sync if the incoming content is structurally newly fetched 
    // to avoid typing cursor jumps. For a simple local-only app, this is fine to just trust 
    // internal state and emit up. We will rely on unique Note IDs mounting completely new components.
  }, []);

  const emitUpdate = (newItems: TodoItem[]) => {
    const plainText = newItems.map(i => i.title).join('\n');
    onUpdate(newItems, plainText);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex);
    const mapped = reordered.map((it, idx) => ({ ...it, order: idx }));
    setItems(mapped);
    emitUpdate(mapped);
  };

  const handleToggle = (id: string) => {
    const next = items.map((i) => (i.id === id ? { ...i, status: (i.status === 'done' ? 'todo' : 'done') as 'todo' | 'done' } : i));
    setItems(next);
    emitUpdate(next);
  };

  const handleChange = (id: string, text: string) => {
    const next = items.map((i) => (i.id === id ? { ...i, title: text } : i));
    setItems(next);
    emitUpdate(next);
  };

  const handleDelete = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    emitUpdate(next);
  };

  const handleCreate = () => {
    const newTask: TodoItem = { id: nanoid(), title: '', status: 'todo', order: items.length };
    const next = [...items, newTask];
    setItems(next);
    emitUpdate(next);
  };

  return (
    <div className="w-full px-10 py-6 my-6 bg-background-surface-1/50 rounded-xl border border-border">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <SortableTodoItem
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onChange={handleChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={handleCreate}
        className="mt-4 flex items-center gap-2 text-muted-custom hover:text-primary-custom transition-colors px-2 py-2 w-full"
      >
        <Plus className="w-5 h-5" />
        <span>Add a task</span>
      </button>
    </div>
  );
}
