import React, { ReactElement, useEffect, useState } from 'react'
import Item from './Item'
import { ItemIcons } from '../interfaces/item'
import { item as itemKeymap } from '../keymap'

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'
import { useHotkeys } from 'react-hotkeys-hook'
import { cloneDeep, get, orderBy } from 'lodash'
import { gql, useMutation } from '@apollo/client'
import { subtasksVisibleVar, focusbarVisibleVar, activeItemVar } from '..'
import { Box, Flex, Text } from '@chakra-ui/layout'

const COMPLETE_ITEM = gql`
  mutation CompleteItem($key: String!) {
    completeItem(input: { key: $key }) {
      key
      completed
    }
  }
`

const UNCOMPLETE_ITEM = gql`
  mutation UnCompleteItem($key: String!) {
    unCompleteItem(input: { key: $key }) {
      key
      completed
    }
  }
`

const DELETE_ITEM = gql`
  mutation DeleteItem($key: String!) {
    deleteItem(input: { key: $key }) {
      key
      deleted
    }
  }
`

const RESTORE_ITEM = gql`
  mutation RestoreItem($key: String!) {
    restoreItem(input: { key: $key }) {
      key
      deleted
    }
  }
`
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
  const [completeItem] = useMutation(COMPLETE_ITEM)
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM)
  const [deleteItem] = useMutation(DELETE_ITEM)
  const [restoreItem] = useMutation(RESTORE_ITEM)
  const [sortedItems, setSortedItems] = useState([])

  console.log('re-rendering reorderable itemlist')

  useEffect(() => {
    setSortedItems(props.inputItems)
  }, [props.inputItems])

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
  const handlers = {
    TOGGLE_CHILDREN: (event) => {
      const itemKey = event.target.id
      let newState = cloneDeep(data.subtasksVisible)
      const newValue = get(newState, [`${itemKey}`, `${props.componentKey}`], false)
      if (newState[itemKey]) {
        newState[itemKey][props.componentKey] = !newValue
      } else {
        newState[itemKey] = {
          [props.componentKey]: true,
        }
      }
      subtasksVisibleVar(newState)
    },
    NEXT_ITEM: (event) => {
      // Check if there are siblings (subtasks)
      const hasSibling = event.target.nextSibling
      if (hasSibling) {
        hasSibling.focus()
        return
      }

      // Otherwise we have to go up a node
      const parent = event.target.parentNode
      const nextItem = parent?.nextSibling?.firstChild
      if (nextItem) {
        nextItem.focus()
        return
      }
    },
    PREV_ITEM: (event) => {
      // Check if there are siblings (subtasks)
      const hasSibling = event.target.previousSibling
      if (hasSibling) {
        hasSibling.focus()
        return
      }

      // Otherwise we have to go up a node
      const parent = event.target.parentNode
      const prevItem = parent?.previousSibling?.lastChild
      if (prevItem) {
        prevItem.focus()
        return
      }
    },
    SET_ACTIVE_ITEM: (event) => {
      const itemKey = event.target.id
      focusbarVisibleVar(true)
      activeItemVar([itemKey])
      return
    },
    COMPLETE_ITEM: (event) => {
      const itemKey = event.target.id
      completeItem({ variables: { key: itemKey } })
    },
    UNCOMPLETE_ITEM: (event) => {
      const itemKey = event.target.id
      unCompleteItem({ variables: { key: itemKey } })
    },
    DELETE_ITEM: (event) => {
      const itemKey = event.target.id
      deleteItem({ variables: { key: itemKey } })
    },
    UNDELETE_ITEM: (event) => {
      const itemKey = event.target.id
      restoreItem({ variables: { key: itemKey } })
    },
  }
  Object.entries(itemKeymap).map(([k, v]) => {
    useHotkeys(v, handlers[k], {
      filter: (event) => {
        const target = event.target
        var tagName = (event.target || event.srcElement).tagName
        return !(
          target.contentEditable ||
          tagName == 'INPUT' ||
          tagName == 'SELECT' ||
          tagName == 'TEXTAREA'
        )
      },
      filterPreventDefault: false,
    })
  })

  return (
    <Box w={'100%'} my={4} mx={0} zIndex={0}>
      <DragDropContext
        onDragEnd={(result) => {
          const { destination, source, draggableId, type } = result
          //  Trying to detect drops in non-valid areas
          if (!destination) {
            return
          }

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
        }}
      >
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
                /* We want to allow flattening of subtasks which means:
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
                              const shouldHide =
                                (props.hideCompletedSubtasks && child.completed) ||
                                (props.hideDeletedSubtasks && child.deleted)
                              return (
                                !shouldHide && (
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
