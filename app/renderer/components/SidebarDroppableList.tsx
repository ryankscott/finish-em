import React from 'react'
import { Flex } from '@chakra-ui/react'
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd'

interface Props {
  sidebarVisible: boolean
  snapshot: DroppableStateSnapshot
  provided: DroppableProvided
  children: React.ReactNode
}

export const SidebarDroppableList = (props: Props) => {
  return (
    <Flex
      direction={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      w={'100%'}
      px={props.sidebarVisible ? 1 : 0}
      py={props.sidebarVisible ? (props.snapshot.isDraggingOver ? 3 : 1) : 1}
      m={0}
      my={props.snapshot.isDraggingOver ? 3 : 0}
      {...props.provided.droppableProps}
      ref={props.provided.innerRef}
    >
      {props.children}
    </Flex>
  )
}
