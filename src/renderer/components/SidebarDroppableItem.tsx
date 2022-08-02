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
      key={uuidv4()}
    >
      {children}
    </Flex>
  );
};
export default SidebarDroppableItem;
