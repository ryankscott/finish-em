import React from 'react'
import { Flex } from '@chakra-ui/react'
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd'

interface Props {
  sidebarVisible: boolean
  snapshot: DroppableStateSnapshot
  provided: DroppableProvided
  children: React.ReactNode
}

const SidebarDroppableItem = (props: Props) => {
  return (
    <Flex
      direction={'column'}
      justifyContent={'center'}
      w={'100%'}
      m={0}
      p={0}
      px={props.sidebarVisible ? 1 : 0}
      borderRadius={5}
      bg={props.snapshot.isDragging ? 'gray.900' : 'gray.800'}
      shadow={props.snapshot.isDragging ? 'base' : 'none'}
      {...props.provided.draggableProps}
      {...props.provided.dragHandleProps}
      ref={props.provided.innerRef}
    >
      {props.children}
    </Flex>
  )
}
export default SidebarDroppableItem
