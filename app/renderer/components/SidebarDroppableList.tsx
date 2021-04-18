import React from 'react'
import { Flex } from '@chakra-ui/react'
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  sidebarVisible: boolean
  snapshot: DroppableStateSnapshot
  provided: DroppableProvided
  children: React.ReactNode
}

export const SidebarDroppableList = (props: Props) => {
  return (
    <Flex
      key={uuidv4()}
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
