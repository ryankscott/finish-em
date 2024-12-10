/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { Flex } from '@chakra-ui/react'
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'

interface Props {
  snapshot: DraggableStateSnapshot
  provided: DraggableProvided
  children: React.ReactNode
}

const SidebarDraggableItem = ({ snapshot, provided, children }: Props) => {
  return (
    <Flex
      direction="column"
      m={0}
      p={0}
      bg={snapshot.isDragging ? 'gray.200' : 'gray.100'}
      shadow={snapshot.isDragging ? 'lg' : 'none'}
      border={'1px solid'}
      borderColor={snapshot.isDragging ? 'gray.200' : 'transparent'}
      borderRadius="md"
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
    >
      {children}
    </Flex>
  )
}
export default SidebarDraggableItem
