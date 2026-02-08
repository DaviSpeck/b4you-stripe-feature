import { FC, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Table } from 'reactstrap';

interface DragDropTableProps<T> {
  items: T[];
  onReorder: (reorderedItems: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemId: (item: T) => string;
  renderDragOverlay?: (item: T) => React.ReactNode;
  children: React.ReactNode; 
  className?: string;
}

const DragDropTable = <T,>({
  items,
  onReorder,
  renderItem,
  getItemId,
  renderDragOverlay,
  children,
  className = '',
}: DragDropTableProps<T>) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent): void => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => getItemId(item) === active.id);
      const newIndex = items.findIndex((item) => getItemId(item) === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        onReorder(reorderedItems);
      }
    }
    setActiveId(null);
  };

  const activeItem = activeId ? items.find((item) => getItemId(item) === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(getItemId)}
        strategy={verticalListSortingStrategy}
      >
        <Table className={className}>
          {children}
          <tbody>
            {items.map((item, index) => renderItem(item, index))}
          </tbody>
        </Table>
      </SortableContext>
      <DragOverlay>
        {activeId && activeItem && renderDragOverlay ? (
          renderDragOverlay(activeItem)
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DragDropTable;
