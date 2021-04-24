import { gql, useMutation } from '@apollo/client'
import { Box, Flex, Text } from '@chakra-ui/layout'
import React, { ReactElement, useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'
import { ItemIcons } from '../interfaces/item'
import Item from './Item'

const SET_ITEM_ORDER = gql`
  mutation SetItemOrder($itemKey: String!, $componentKey: String!, $sortOrder: Int!) {
    setItemOrder(input: { itemKey: $itemKey, componentKey: $componentKey, sortOrder: $sortOrder })
  }
`

type ReorderableItemListProps = {
  componentKey: string
  inputItems: {
    key: string
    parentKey: string
    children: {
      key: string
      deleted: boolean
      completed: boolean
    }[]
    sortOrder: number
  }[]
  hideCompletedSubtasks?: Boolean
  hideDeletedSubtasks?: Boolean
  flattenSubtasks?: Boolean
  hiddenIcons: ItemIcons[]
}

function ReorderableItemList(props: ReorderableItemListProps): ReactElement {
  const [setItemOrder] = useMutation(SET_ITEM_ORDER)
  const [sortedItems, setSortedItems] = useState([])

  console.log('re-rendering reorderable itemlist')

  useEffect(() => {
    setSortedItems(props.inputItems)
  }, [props.inputItems])

  const reorderItems = (result: DropResult): void => {
    const { destination, source, draggableId, type } = result
    //  Trying to detect drops in non-valid areas
    if (!destination) return

    const itemAtDestination = sortedItems[destination.index]
    const itemAtSource = sortedItems[source.index]

    // Sync update
    const newSortedItems = sortedItems
    newSortedItems.splice(source.index, 1)
    newSortedItems.splice(destination.index, 0, itemAtSource)
    setSortedItems(newSortedItems)

    // Async update
    setItemOrder({
      variables: {
        itemKey: draggableId,
        componentKey: props.componentKey,
        sortOrder: itemAtDestination.sortOrder,
      },
    })
  }

  /* TODO: Introduce the following shortcuts:
	- Scheduled At
	- Due At
	- Create subtask
	- Convert to subtask
	- Repeat
	- Add Project
	- Add Area
	- Edit description
 */

  return (
    <Box w={'100%'} my={4} mx={0} zIndex={0}>
      <DragDropContext onDragEnd={(result) => reorderItems(result)}>
        <Droppable droppableId={uuidv4()} type="ITEM">
          {(provided, snapshot) => (
            <Flex
              zIndex={0}
              direction={'column'}
              justifyContent={'center'}
              borderRadius={3}
              w={'100%'}
              padding={snapshot.isDraggingOver ? '20px 5px' : '5px'}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {sortedItems.map((item, index) => {
                /* 
                We want to allow flattening of subtasks which means:
								  1. If we should flatten
									  - If an item has a parent and the parent is in the list, don't render the parent 
									2.  Default
									  - If an item has a parent, don't render it (as it will get rendered later)
									  - For each item, render the item and it's children  (In the Item component)
										*/
                if (props.flattenSubtasks == true) {
                  if (item.parentKey != null) {
                    const parentExistsInList = props.inputItems.find((z) => z.key == item.parentKey)
                    // It exists it will get rendered later, so don't render it
                    if (parentExistsInList) {
                      return
                    }
                  }
                }
                return (
                  <Draggable key={item.key} draggableId={item.key} index={index}>
                    {(provided, snapshot) => (
                      <Flex
                        position={'relative'}
                        flexDirection={'column'}
                        height={'auto'}
                        userSelect={'none'}
                        p={0}
                        m={0}
                        border={'none'}
                        borderRadius={4}
                        shadow={snapshot.isDragging ? 'base' : null}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        key={'container-' + item.key}
                      >
                        <Item
                          compact={false}
                          itemKey={item.key}
                          key={item.key}
                          componentKey={props.componentKey}
                          shouldIndent={false}
                          hiddenIcons={props.hiddenIcons}
                        />
                        {item?.children.length > 0 && (
                          <Box>
                            {item.children.map((child) => {
                              // We need to check if the child exists in the original input list
                              const shouldHideItem =
                                (props.hideCompletedSubtasks && child.completed) ||
                                (props.hideDeletedSubtasks && child.deleted)
                              return (
                                !shouldHideItem && (
                                  <Item
                                    compact={false}
                                    itemKey={child.key}
                                    key={child.key}
                                    componentKey={props.componentKey}
                                    shouldIndent={true}
                                    hiddenIcons={
                                      props.hiddenIcons
                                        ? [...props.hiddenIcons, ItemIcons.Subtask]
                                        : [ItemIcons.Subtask]
                                    }
                                  />
                                )
                              )
                            })}
                          </Box>
                        )}
                      </Flex>
                    )}
                  </Draggable>
                )
              })}
              {props.inputItems.length == 0 && (
                <Text color={'gray.400'} fontSize={'sm'} py={4} px={0} pl={4}>
                  No items
                </Text>
              )}
              {provided.placeholder}
            </Flex>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  )
}

export default ReorderableItemList
