import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

const SortableList = ({ items }) => {
  return (
    <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
      {items.map(item => (
        <SortableItem key={item.id} id={item.id}>
          {item.label || item.fieldLabel}
        </SortableItem>
      ))}
    </SortableContext>
  );
};

export default SortableList;
