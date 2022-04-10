/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Flex } from '@chakra-ui/react';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

interface Props {
  snapshot: DraggableStateSnapshot;
  provided: DraggableProvided;
  children: React.ReactNode;
}

const SidebarDraggableItem = ({ snapshot, provided, children }: Props) => {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      w="100%"
      m={0}
      p={0}
      bg={snapshot.isDragging ? 'gray.900' : 'gray.800'}
      shadow={snapshot.isDragging ? 'lg' : 'none'}
      borderRadius={5}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
    >
      {children}
    </Flex>
  );
};
export default SidebarDraggableItem;
