import React, { ReactElement } from 'react'
import Item from './Item'
import { ItemIcons } from '../interfaces/item'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ItemType, RenderingStrategy, Items } from '../interfaces'
import { TransitionGroup, Transition } from 'react-transition-group'
import {
  Container,
  NoItemText,
  DraggableList,
  DraggableContainer,
} from './styled/ReorderableItemList'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'
import { connect } from 'react-redux'
import {
  reorderItem,
  showFocusbar,
  setActiveItem,
  uncompleteItem,
  completeItem,
  undeleteItem,
  deleteItem,
  toggleSubtasks,
  showSubtasks,
} from '../actions'
import { HotKeys } from 'react-hotkeys'
import { useHotkeys } from 'react-hotkeys-hook'

interface DispatchProps {
  reorderItem: (id: string, destinationId: string) => void
  showFocusbar: () => void
  setActiveItem: (id: string) => void
  completeItem: (id: string) => void
  uncompleteItem: (id: string) => void
  deleteItem: (id: string) => void
  undeleteItem: (id: string) => void
  toggleSubtasks: (id: string, componentId: string) => void
  showSubtasks: (id: string, componentId: string) => void
}
interface StateProps {
  theme: string
  items: Items
}
interface OwnProps {
  componentId: string
  inputItems: ItemType[]
  hideIcons: ItemIcons[]
  renderingStrategy?: RenderingStrategy
}

type ReorderableItemListProps = OwnProps & StateProps & DispatchProps

function ReorderableItemList(props: ReorderableItemListProps): ReactElement {
  const theme = themes[props.theme]
  const { items, order } = props.items
  const handlers = {
    TOGGLE_CHILDREN: (event) => {
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      props.toggleSubtasks(itemId, props.componentId)
    },
    NEXT_ITEM: (event) => {
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      // If it's a parent element we need to get the first child
      if (item.children.length > 0) {
        // Show subtasks so we can iterate over them
        props.showSubtasks(event.target.id, props.componentId)
        const nextItem = event.target.parentNode.nextSibling
        if (nextItem) {
          nextItem.firstChild.focus()
          return
        }
      }
      // If it's a child
      if (item.parentId != null) {
        const nextItem = event.target.parentNode.nextSibling
        if (nextItem) {
          nextItem.firstChild.focus()
          return
        }
        // If it's the last child
        else {
          const nextItem = event.target.parentNode.parentNode.nextSibling.firstChild
          if (nextItem) {
            nextItem.firstChild.focus()
            return
          }
        }
      }
      const parent = event.target.parentNode.parentNode
      const nextItem = parent.nextSibling
      if (nextItem) {
        nextItem.firstChild.firstChild.focus()
        return
      }
    },
    PREV_ITEM: (event) => {
      console.log('prev item')
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.children.length > 0) {
        const prevItem = event.target.parentNode.previousSibling
        if (prevItem) {
          prevItem.firstChild.focus()
          return
        }
      }
      // If it's a child
      if (item.parentId != null) {
        const nextItem = event.target.parentNode.previousSibling
        if (nextItem) {
          nextItem.firstChild.focus()
          return
        }
        // If it's the last child
        else {
          const prevItem = event.target.parentNode.parentNode.previousSibling.firstChild
          if (prevItem) {
            prevItem.firstChild.focus()
            return
          }
        }
      }
      const parent = event.target.parentNode.parentNode
      const prevItem = parent.previousSibling?.firstChild
      if (prevItem) {
        prevItem.firstChild.focus()
        return
      }
    },
    SET_ACTIVE_ITEM: (event) => {
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      props.showFocusbar()
      props.setActiveItem(itemId)
      return
    },
    COMPLETE_ITEM: (event) => {
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.type == 'NOTE') return
      if (item.deleted || item.completed) return
      props.completeItem(item.id)
    },
    UNCOMPLETE_ITEM: (event) => {
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.type == 'NOTE') return
      if (item.deleted) return
      props.uncompleteItem(item.id)
    },
    DELETE_ITEM: (event) => {
      console.log('deleting')
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.deleted) return
      props.deleteItem(item.id)
    },
    UNDELETE_ITEM: (event) => {
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      props.undeleteItem(item.id)
    },
    SET_SCHEDULED_DATE: (event) => {
      // TODO: Implement me
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.type == 'NOTE') return
      if (item.deleted || item.completed) return
      console.log('scheduled')
      event.preventDefault()
    },
    SET_DUE_DATE: (event) => {
      // TODO: Implement me
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.type == 'NOTE') return
      if (item.deleted || item.completed) return
      console.log('due date')
      event.preventDefault()
    },
    CREATE_SUBTASK: (event) => {
      // TODO: Implement me
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.deleted || item.completed || item.parentId != null) return
      console.log('create sub task')
      event.preventDefault()
    },
    CONVERT_TO_SUBTASK: (event) => {
      // TODO: Implement me
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.type == 'NOTE') return
      if (item.deleted || item.completed) return
      console.log('convert to sub task')
      event.preventDefault()
    },
    REPEAT_ITEM: (event) => {
      // TODO: Implement me
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.type == 'NOTE') return
      if (item.deleted || item.completed) return
      console.log('repeat')
      event.preventDefault()
    },
    ADD_PROJECT: (event) => {
      // TODO: Implement me
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.deleted || item.completed) return
      console.log('move item')
      event.preventDefault()
    },
    EDIT_ITEM_DESC: (event) => {
      // TODO:Implement me
      //const item = items[event.target.id]
      event.preventDefault()
    },
  }
  Object.entries(itemKeymap).map(([k, v]) => {
    useHotkeys(v, handlers[k])
  })
  const orderedIndex = order.filter((p) => {
    return props.inputItems.find((i) => i.id == p)
  })

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <HotKeys keyMap={itemKeymap} handlers={handlers}>
          <DragDropContext
            onDragEnd={(e) => {
              props.reorderItem(e.draggableId, orderedIndex[e.destination.index])
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
                    {orderedIndex.map((o, index) => {
                      const item = items[o]
                      /* We need two strategies for rendering items:
                        1. All rendering
                          - If an item has a parent and the parent is in the list, don't render it
                        2.  Default
                          - If an item has a parent, don't render it
                          - For each item, render the item and it's children  (In the Item component)
                        */
                      if (props.renderingStrategy == RenderingStrategy.All) {
                        // If the item has a parent find out if it exists in the list we've been provided
                        if (item.parentId != null) {
                          const parentExists = props.inputItems.find((i) => i.id == item.parentId)
                          if (parentExists) {
                            return
                          }
                        }
                      }
                      return (
                        <Transition
                          key={'t-container-' + item.id}
                          timeout={{
                            appear: 200,
                            enter: 200,
                            exit: 500,
                          }}
                        >
                          {(state) => {
                            return (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                zIndex={0}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <DraggableContainer
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    key={'container-' + item.id}
                                    isDragging={snapshot.isDragging}
                                    draggableStyle={...provided.draggableProps.style}
                                    state={state}
                                  >
                                    <Item
                                      {...item}
                                      key={item.id}
                                      componentId={props.componentId}
                                      shouldIndent={false}
                                      hideIcons={props.hideIcons}
                                    />
                                    {item.children?.map((c) => {
                                      // We need to check if the child exists in the original input list
                                      const childItem = items[c]
                                      return (
                                        <Item
                                          key={c}
                                          {...childItem}
                                          componentId={props.componentId}
                                          shouldIndent={true}
                                          hideIcons={
                                            props.hideIcons
                                              ? [...props.hideIcons, ItemIcons.Subtask]
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
        </HotKeys>
      </Container>
    </ThemeProvider>
  )
}

const mapStateToProps = (state): StateProps => ({
  theme: state.ui.theme,
  items: state.items,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
  reorderItem: (id: string, destinationId: string) => {
    dispatch(reorderItem(id, destinationId))
  },
  showFocusbar: () => {
    dispatch(showFocusbar())
  },
  setActiveItem: (id: string) => {
    dispatch(setActiveItem(id))
  },
  deleteItem: (id: string) => {
    dispatch(deleteItem(id))
  },
  undeleteItem: (id: string) => {
    dispatch(undeleteItem(id))
  },
  completeItem: (id: string) => {
    dispatch(completeItem(id))
  },
  uncompleteItem: (id: string) => {
    dispatch(uncompleteItem(id))
  },
  toggleSubtasks: (id: string, componentId: string) => {
    dispatch(toggleSubtasks(id, componentId))
  },
  showSubtasks: (id: string, componentId: string) => {
    dispatch(showSubtasks(id, componentId))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(ReorderableItemList)
