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
import { cloneDeep, get, orderBy } from 'lodash'
import { gql, useMutation, useQuery } from '@apollo/client'
import { subtasksVisibleVar, focusbarVisibleVar, activeItemVar } from '..'

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
  const [completeItem] = useMutation(COMPLETE_ITEM)
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM)
  const [deleteItem] = useMutation(DELETE_ITEM)
  const [restoreItem] = useMutation(RESTORE_ITEM)
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

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
      console.log(newValue)
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
      activeItemVar(itemKey)
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
    useHotkeys(v, handlers[k])
  })

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
