import React from 'react';
import { Flex } from '@chakra-ui/react';
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

interface Props {
  snapshot: DroppableStateSnapshot;
  provided: DroppableProvided;
  children: React.ReactNode;
}

const SidebarDroppableItem = ({ snapshot, provided, children }: Props) => {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      w="100%"
      m={0}
      p={0}
      borderRadius="md"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...provided.droppableProps}
      ref={provided.innerRef}
    >
      <>
        {children}
        {provided.placeholder}
      </>
    </Flex>
  );
};
export default SidebarDroppableItem;
