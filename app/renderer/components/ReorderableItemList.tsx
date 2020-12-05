import React, { ReactElement } from 'react'
import Item from './Item'
import { ItemIcons } from '../interfaces/item'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ThemeType } from '../interfaces'
import { TransitionGroup, Transition } from 'react-transition-group'
import {
  Container,
  NoItemText,
  DraggableList,
  DraggableContainer,
} from './styled/ReorderableItemList'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'
import { useHotkeys } from 'react-hotkeys-hook'
import { Item as ItemType } from '../../main/generated/typescript-helpers'
import { orderBy } from 'lodash'
import { gql, useMutation, useQuery } from '@apollo/client'

const GET_THEME = gql`
  query {
    theme @client
  }
`

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
  mutation SetItemOrder($itemKey: String!, $sortOrder: Int!) {
    setItemOrder(input: { itemKey: $itemKey, sortOrder: $sortOrder }) {
      itemKey
    }
  }
`

type ReorderableItemListProps = {
  componentKey: string
  inputItems: {
    text: string
    key: string
    parent: { key: string; name: string }
    children: { key: string }[]
    sortOrder: { sortOrder: number }
  }[]
  flattenSubtasks?: Boolean
  hiddenIcons: ItemIcons[]
}

function ReorderableItemList(props: ReorderableItemListProps): ReactElement {
  const [setItemOrder] = useMutation(SET_ITEM_ORDER)
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

  // TODO: Reintroduce shortcuts

  // const handlers = {
  //   TOGGLE_CHILDREN: (event) => {
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     props.toggleSubtasks(itemId, props.componentId)
  //   },
  //   NEXT_ITEM: (event) => {
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     // If it's a parent element we need to get the first child
  //     if (item.children.length > 0) {
  //       // Show subtasks so we can iterate over them
  //       props.showSubtasks(event.target.id, props.componentId)
  //       const nextItem = event.target.parentNode.nextSibling
  //       if (nextItem) {
  //         nextItem.firstChild.focus()
  //         return
  //       }
  //     }
  //     // If it's a child
  //     if (item.parentId != null) {
  //       const nextItem = event.target.parentNode.nextSibling
  //       if (nextItem) {
  //         nextItem.firstChild.focus()
  //         return
  //       }
  //       // If it's the last child
  //       else {
  //         const nextItem = event.target.parentNode.parentNode.nextSibling.firstChild
  //         if (nextItem) {
  //           nextItem.firstChild.focus()
  //           return
  //         }
  //       }
  //     }
  //     const parent = event.target.parentNode.parentNode
  //     const nextItem = parent.nextSibling
  //     if (nextItem) {
  //       nextItem.firstChild.firstChild.focus()
  //       return
  //     }
  //   },
  //   PREV_ITEM: (event) => {
  //     console.log('prev item')
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     if (item.children.length > 0) {
  //       const prevItem = event.target.parentNode.previousSibling
  //       if (prevItem) {
  //         prevItem.firstChild.focus()
  //         return
  //       }
  //     }
  //     // If it's a child
  //     if (item.parentId != null) {
  //       const nextItem = event.target.parentNode.previousSibling
  //       if (nextItem) {
  //         nextItem.firstChild.focus()
  //         return
  //       }
  //       // If it's the last child
  //       else {
  //         const prevItem = event.target.parentNode.parentNode.previousSibling.firstChild
  //         if (prevItem) {
  //           prevItem.firstChild.focus()
  //           return
  //         }
  //       }
  //     }
  //     const parent = event.target.parentNode.parentNode
  //     const prevItem = parent.previousSibling?.firstChild
  //     if (prevItem) {
  //       prevItem.firstChild.focus()
  //       return
  //     }
  //   },
  //   SET_ACTIVE_ITEM: (event) => {
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     props.showFocusbar()
  //     props.setActiveItem(itemId)
  //     return
  //   },
  //   COMPLETE_ITEM: (event) => {
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     if (item.type == 'NOTE') return
  //     if (item.deleted || item.completed) return
  //     props.completeItem(item.id)
  //   },
  //   UNCOMPLETE_ITEM: (event) => {
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     if (item.type == 'NOTE') return
  //     if (item.deleted) return
  //     props.uncompleteItem(item.id)
  //   },
  //   DELETE_ITEM: (event) => {
  //     console.log('deleting')
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     if (item.deleted) return
  //     props.deleteItem(item.id)
  //   },
  //   UNDELETE_ITEM: (event) => {
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     props.undeleteItem(item.id)
  //   },
  //   SET_SCHEDULED_DATE: (event) => {
  //     // TODO: Implement me
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     if (item.type == 'NOTE') return
  //     if (item.deleted || item.completed) return
  //     console.log('scheduled')
  //     event.preventDefault()
  //   },
  //   SET_DUE_DATE: (event) => {
  //     // TODO: Implement me
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     if (item.type == 'NOTE') return
  //     if (item.deleted || item.completed) return
  //     console.log('due date')
  //     event.preventDefault()
  //   },
  //   CREATE_SUBTASK: (event) => {
  //     // TODO: Implement me
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     if (item.deleted || item.completed || item.parentId != null) return
  //     console.log('create sub task')
  //     event.preventDefault()
  //   },
  //   CONVERT_TO_SUBTASK: (event) => {
  //     // TODO: Implement me
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     if (item.type == 'NOTE') return
  //     if (item.deleted || item.completed) return
  //     console.log('convert to sub task')
  //     event.preventDefault()
  //   },
  //   REPEAT_ITEM: (event) => {
  //     // TODO: Implement me
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     if (item.type == 'NOTE') return
  //     if (item.deleted || item.completed) return
  //     console.log('repeat')
  //     event.preventDefault()
  //   },
  //   ADD_PROJECT: (event) => {
  //     // TODO: Implement me
  //     const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //     const item = items[itemId]
  //     if (item.deleted || item.completed) return
  //     console.log('move item')
  //     event.preventDefault()
  //   },
  //   EDIT_ITEM_DESC: (event) => {
  //     // TODO:Implement me
  //     //const item = items[event.target.id]
  //     event.preventDefault()
  //   },
  // }
  // Object.entries(itemKeymap).map(([k, v]) => {
  //   useHotkeys(v, handlers[k])
  // })

  const sortedItems: ItemType[] = orderBy(props.inputItems, ['sortOrder.sortOrder'], ['asc'])
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <DragDropContext
          onDragEnd={(e) => {
            setItemOrder({
              variables: {
                itemKey: e.draggableId,
                sortOrder: sortedItems[e.destination.index].sortOrder.sortOrder,
              },
            })
          }}
        >
          <Droppable droppableId={uuidv4()} type="ITEM">
            {(provided, snapshot) => (
              <DraggableList
                {...provided.droppableProps}
                ref={provided.innerRef}
                isDraggingOver={snapshot.isDraggingOver}
              >
                <TransitionGroup component={null}>
                  {sortedItems.map((item, index) => {
                    /* We want to allow flattening of subtasks which means:
                      1. If we should flatten
                        - If an item has a parent and the parent is in the list, don't render the parent 
                      2.  Default
                        - If an item has a parent, don't render it (as it will get rendered later)
                        - For each item, render the item and it's children  (In the Item component)
                    */
                    if (props.flattenSubtasks == true) {
                      if (item.parent != null) {
                        const parentExistsInList = props.inputItems.find(
                          (z) => z.key == item.parent.key,
                        )
                        // It exists it will get rendered later, so don't render it
                        if (parentExistsInList) {
                          return
                        }
                      }
                    }
                    return (
                      <Transition
                        key={'t-container-' + item.key}
                        timeout={{
                          appear: 100,
                          enter: 100,
                          exit: 100,
                        }}
                      >
                        {(state) => {
                          return (
                            <Draggable
                              key={item.key}
                              draggableId={item.key}
                              zIndex={0}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <DraggableContainer
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  key={'container-' + item.key}
                                  isDragging={snapshot.isDragging}
                                  draggableStyle={provided.draggableProps.style}
                                  state={state}
                                >
                                  <Item
                                    itemKey={item.key}
                                    {...item}
                                    key={item.key}
                                    componentKey={props.componentKey}
                                    shouldIndent={false}
                                    hiddenIcons={props.hiddenIcons}
                                  />
                                  {item.children?.map((childItem) => {
                                    // We need to check if the child exists in the original input list
                                    return (
                                      <Item
                                        compact={false}
                                        itemKey={childItem.key}
                                        key={childItem.key}
                                        {...childItem}
                                        componentKey={props.componentKey}
                                        shouldIndent={true}
                                        hiddenIcons={
                                          props.hiddenIcons
                                            ? [...props.hiddenIcons, ItemIcons.Subtask]
                                            : [ItemIcons.Subtask]
                                        }
                                      />
                                    )
                                  })}
                                </DraggableContainer>
                              )}
                            </Draggable>
                          )
                        }}
                      </Transition>
                    )
                  })}
                </TransitionGroup>
                {props.inputItems.length == 0 && <NoItemText>No items</NoItemText>}
                {provided.placeholder}
              </DraggableList>
            )}
          </Droppable>
        </DragDropContext>
      </Container>
    </ThemeProvider>
  )
}

export default ReorderableItemList
