import React, { ReactElement } from 'react'
import Item from './Item'
import { ItemIcons } from '../interfaces/item'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ItemType, RenderingStrategy, Items } from '../interfaces'
import { Container, NoItemText, ItemContainer } from './styled/ItemList'
import { TransitionGroup, Transition } from 'react-transition-group'
import { connect } from 'react-redux'
import {
  showFocusbar,
  setActiveItem,
  uncompleteItem,
  completeItem,
  undeleteItem,
  deleteItem,
  toggleSubtasks,
  showSubtasks,
} from '../actions'
import { useHotkeys } from 'react-hotkeys-hook'

interface DispatchProps {
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

// TODO: inputItems should just be an array of IDs
interface OwnProps {
  componentId: string
  inputItems: ItemType[]
  renderingStrategy?: RenderingStrategy
  hideIcons: ItemIcons[]
  theme: string
}

type ItemListProps = OwnProps & StateProps & DispatchProps

function ItemList(props: ItemListProps): ReactElement {
  const { items } = props.items
  const handlers = {
    TOGGLE_CHILDREN: (event) => {
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      props.toggleSubtasks(itemId, props.componentId)
    },
    NEXT_ITEM: (event) => {
      // We concatenate the itemId and componentId so we need to split it to get the itemId
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      // If it's a parent element we need to get the first child
      if (item.children?.length > 0) {
        // Show subtasks so we can iterate over them
        props.showSubtasks(event.target.id, props.componentId)
        const nextItem = event.target.nextSibling
        if (nextItem) {
          nextItem.focus()
          return
        }
      }
      // If it's a child
      if (item.parentId != null) {
        const nextItem = event.target.nextElementSibling
        if (nextItem) {
          nextItem.focus()
          return
        }
        // If it's the last child (i.e. no next)
        else {
          const nextItem = event.target.parentNode.nextSibling.firstChild
          if (nextItem) {
            nextItem.focus()
            return
          }
        }
      }

      // You have to go up to the parent to get the next sibling
      const nextItem = event.target.parentNode?.nextSibling
      if (nextItem) {
        nextItem.firstChild.focus()
        return
      }
    },
    PREV_ITEM: (event) => {
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
        const prevItem = event.target.previousSibling
        if (prevItem) {
          prevItem.focus()
          return
        }
        // If there is no previous item (i.e. the first)
        else {
          const prevItem = event.target.parentNode
          if (prevItem) {
            prevItem.focus()
            return
          }
        }
      }
      const parent = event.target.parentNode
      const prevItem = parent.previousSibling?.firstChild
      if (prevItem) {
        prevItem.focus()
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
      event.preventDefault()
    },
    SET_DUE_DATE: (event) => {
      // TODO: Implement me
      const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
      const item = items[itemId]
      if (item.type == 'NOTE') return
      if (item.deleted || item.completed) return
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
      // const item = items[event.target.id]
      event.preventDefault()
    },
  }
  Object.entries(itemKeymap).map(([k, v]) => {
    useHotkeys(v, handlers[k])
  })

  return (
    <ThemeProvider theme={themes[props.theme]}>
      <Container data-cy="item-list">
        <TransitionGroup component={null}>
          {props.inputItems.map((i) => {
            if (i == undefined) return null
            /* We need two strategies for rendering items:
                1. All rendering
                    - If an item has a parent and the parent is in the list, don't render it
                2.  Default
                    - If an item has a parent, don't render it
                    - For each item, render the item and it's children  (In the Item component)
            */
            if (props.renderingStrategy == RenderingStrategy.All) {
              if (i.parentId != null) {
                const parentExists = props.inputItems.find((z) => z.id == i.parentId)
                // It exists it will get rendered later, so don't render it
                if (parentExists) {
                  return
                }
              }
            }
            return (
              <Transition
                key={'t-container-' + i.id}
                timeout={{
                  appear: 100,
                  enter: 100,
                  exit: 100,
                }}
              >
                {(state) => {
                  return (
                    <ItemContainer state={state} tabIndex={0} key={'container-' + i.id}>
                      <Item
                        {...i}
                        key={i.id}
                        componentId={props.componentId}
                        shouldIndent={false}
                        hideIcons={props.hideIcons}
                      />

                      {i.children?.map((c) => {
                        // We need to check if the child exists in the original input list
                        const childItem = items[c]
                        return (
                          <Item
                            key={c}
                            {...childItem}
                            componentId={props.componentId}
                            hideIcons={
                              props.hideIcons
                                ? [...props.hideIcons, ItemIcons.Subtask]
                                : [ItemIcons.Subtask]
                            }
                            shouldIndent={true}
                          />
                        )
                      })}
                    </ItemContainer>
                  )
                }}
              </Transition>
            )
          })}
        </TransitionGroup>
        {props.inputItems.length == 0 && <NoItemText>No items</NoItemText>}
      </Container>
    </ThemeProvider>
  )
}

const mapStateToProps = (state): StateProps => ({
  theme: state.ui.theme,
  items: state.items,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
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

export default connect(mapStateToProps, mapDispatchToProps)(ItemList)