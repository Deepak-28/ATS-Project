import React from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';

const DndProviderWrapper = ({ children, onDragEnd }) => {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {children}
    </DndContext>
  );
};

export default DndProviderWrapper;
