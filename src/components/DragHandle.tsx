import { Flex, Icon } from '@chakra-ui/react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { Icons } from '../assets/icons';

interface DragHandleProps {
  dragHandleProps: DraggableProvidedDragHandleProps | undefined;
}
const DragHandle = ({ dragHandleProps }: DragHandleProps) => {
  return (
    <Flex
      position="absolute"
      direction="row"
      alignItems="center"
      justifyContent="center"
      h={6}
      w="200px"
      left="calc(50% - 100px)"
      zIndex={100}
      opacity={0}
      _hover={{
        opacity: 1,
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
    >
      <Icon as={Icons.drag} opacity={0.8} />
    </Flex>
  );
};

export default DragHandle;
