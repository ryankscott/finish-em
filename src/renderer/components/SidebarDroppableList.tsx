import React from 'react';
import { Flex } from '@chakra-ui/react';
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  sidebarVisible: boolean;
  snapshot: DroppableStateSnapshot;
  provided: DroppableProvided;
  children: React.ReactNode;
}

const SidebarDroppableList = ({
  sidebarVisible,
  snapshot,
  provided,
  children,
}: Props) => {
  return (
    <Flex
      key={uuidv4()}
      direction="column"
      alignItems="center"
      justifyContent="center"
      w="100%"
      px={sidebarVisible ? 1 : 0}
      py={1}
      m={0}
      my={snapshot.isDraggingOver ? 2 : 0}
      {...provided.droppable}
      ref={provided.innerRef}
    >
      {children}
    </Flex>
  );
};

export default SidebarDroppableList;
