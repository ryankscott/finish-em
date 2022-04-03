import { DragHandleProps } from 'react-querybuilder';
import { Flex, IconButton, Icon } from '@chakra-ui/react';
import { forwardRef } from 'react';
import { Icons } from 'renderer/assets/icons';

const CustomDragHandle = forwardRef<HTMLSpanElement, DragHandleProps>(
  ({ className, title, disabled }, dragRef) => (
    <Flex
      m={0}
      mb={2}
      ref={dragRef}
      className={className}
      title={title}
      w="100%"
      justifyContent="center"
      borderRadius="md"
    >
      <IconButton
        variant="subtle"
        isDisabled={disabled}
        aria-label={title ?? ''}
        size="xs"
        icon={<Icon as={Icons.drag} />}
      />
    </Flex>
  )
);

export default CustomDragHandle;
