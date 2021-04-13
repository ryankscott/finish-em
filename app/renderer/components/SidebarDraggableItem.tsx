import React from 'react'
import { Flex } from '@chakra-ui/react'
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'

interface Props {
  sidebarVisible: boolean
  snapshot: DraggableStateSnapshot
  provided: DraggableProvided
  children: React.ReactNode
}

export const SidebarDraggableItem = (props: Props) => {
  return (
    <Flex
      direction={'column'}
      justifyContent={'center'}
      w={'100%'}
      m={0}
      p={0}
      pl={props.sidebarVisible ? 1 : 0}
      bg={props.snapshot.isDragging ? 'gray.900' : 'gray.800'}
      shadow={props.snapshot.isDragging ? 'md' : 'none'}
      {...props.provided.draggableProps}
      {...props.provided.dragHandleProps}
      ref={props.provided.innerRef}
    >
      {props.children}
    </Flex>
  )
}
