import React from 'react'
import { Flex } from '@chakra-ui/react'
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'
interface Props {
  sidebarVisible: boolean
  snapshot: DraggableStateSnapshot
  provided: DraggableProvided
  children: React.ReactNode
}

export const SidebarDraggableItem = (props: Props) => {
  return (
    <Flex
      key={uuidv4()}
      direction={'column'}
      justifyContent={'center'}
      w={'100%'}
      m={0}
      p={0}
      pl={props.sidebarVisible ? 1 : 0}
      bg={props.snapshot.isDragging ? 'gray.900' : 'gray.800'}
      shadow={props.snapshot.isDragging ? 'md' : 'none'}
      borderRadius={5}
      {...props.provided.draggableProps}
      {...props.provided.dragHandleProps}
      ref={props.provided.innerRef}
    >
      {props.children}
    </Flex>
  )
}
