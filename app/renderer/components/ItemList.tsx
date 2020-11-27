import React, { ReactElement } from 'react'
import Item from './Item'
import { ItemIcons } from '../interfaces/item'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ThemeType } from '../interfaces'
import { Container, NoItemText, ItemContainer } from './styled/ItemList'
import { TransitionGroup, Transition } from 'react-transition-group'
import { useHotkeys } from 'react-hotkeys-hook'
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

type ItemListProps = {
  componentKey: string
  inputItems: {
    key: string
    parent: { key: string; name: string }
    children: { key: string }[]
    sortOrder: { sortOrder: number }
  }[]
  flattenSubtasks?: Boolean
  hiddenIcons: ItemIcons[]
}

function ItemList(props: ItemListProps): ReactElement {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  const [completeItem] = useMutation(COMPLETE_ITEM)
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM)
  const [deleteItem] = useMutation(DELETE_ITEM)
  const [restoreItem] = useMutation(RESTORE_ITEM)

  //   /*  const handlers = {
  //     TOGGLE_CHILDREN: (event) => {
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       props.toggleSubtasks(itemId, props.componentId)
  //     },
  //     NEXT_ITEM: (event) => {
  //       // We concatenate the itemId and componentId so we need to split it to get the itemId
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       // If it's a parent element we need to get the first child
  //       if (item.children?.length > 0) {
  //         // Show subtasks so we can iterate over them
  //         props.showSubtasks(event.target.id, props.componentId)
  //         const nextItem = event.target.nextSibling
  //         if (nextItem) {
  //           nextItem.focus()
  //           return
  //         }
  //       }
  //       // If it's a child
  //       if (item.parentId != null) {
  //         const nextItem = event.target.nextElementSibling
  //         if (nextItem) {
  //           nextItem.focus()
  //           return
  //         }
  //         // If it's the last child (i.e. no next)
  //         else {
  //           const nextItem = event.target.parentNode.nextSibling.firstChild
  //           if (nextItem) {
  //             nextItem.focus()
  //             return
  //           }
  //         }
  //       }

  //       // You have to go up to the parent to get the next sibling
  //       const nextItem = event.target.parentNode?.nextSibling
  //       if (nextItem) {
  //         nextItem.firstChild.focus()
  //         return
  //       }
  //     },
  //     PREV_ITEM: (event) => {
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       if (item.children.length > 0) {
  //         const prevItem = event.target.parentNode.previousSibling
  //         if (prevItem) {
  //           prevItem.firstChild.focus()
  //           return
  //         }
  //       }
  //       // If it's a child
  //       if (item.parentId != null) {
  //         const prevItem = event.target.previousSibling
  //         if (prevItem) {
  //           prevItem.focus()
  //           return
  //         }
  //         // If there is no previous item (i.e. the first)
  //         else {
  //           const prevItem = event.target.parentNode
  //           if (prevItem) {
  //             prevItem.focus()
  //             return
  //           }
  //         }
  //       }
  //       const parent = event.target.parentNode
  //       const prevItem = parent.previousSibling?.firstChild
  //       if (prevItem) {
  //         prevItem.focus()
  //         return
  //       }
  //     },
  //     SET_ACTIVE_ITEM: (event) => {
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       props.showFocusbar()
  //       props.setActiveItem(itemId)
  //       return
  //     },
  //     COMPLETE_ITEM: (event) => {
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       if (item.type == 'NOTE') return
  //       if (item.deleted || item.completed) return
  //       props.completeItem(item.id)
  //     },
  //     UNCOMPLETE_ITEM: (event) => {
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       if (item.type == 'NOTE') return
  //       if (item.deleted) return
  //       props.uncompleteItem(item.id)
  //     },
  //     DELETE_ITEM: (event) => {
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       if (item.deleted) return
  //       props.deleteItem(item.id)
  //     },
  //     UNDELETE_ITEM: (event) => {
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       props.undeleteItem(item.id)
  //     },
  //     SET_SCHEDULED_DATE: (event) => {
  //       // TODO: Implement me
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       if (item.type == 'NOTE') return
  //       if (item.deleted || item.completed) return
  //       event.preventDefault()
  //     },
  //     SET_DUE_DATE: (event) => {
  //       // TODO: Implement me
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       if (item.type == 'NOTE') return
  //       if (item.deleted || item.completed) return
  //       event.preventDefault()
  //     },
  //     CREATE_SUBTASK: (event) => {
  //       // TODO: Implement me
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       if (item.deleted || item.completed || item.parentId != null) return
  //       console.log('create sub task')
  //       event.preventDefault()
  //     },
  //     CONVERT_TO_SUBTASK: (event) => {
  //       // TODO: Implement me
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       if (item.type == 'NOTE') return
  //       if (item.deleted || item.completed) return
  //       console.log('convert to sub task')
  //       event.preventDefault()
  //     },
  //     REPEAT_ITEM: (event) => {
  //       // TODO: Implement me
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       if (item.type == 'NOTE') return
  //       if (item.deleted || item.completed) return
  //       console.log('repeat')
  //       event.preventDefault()
  //     },
  //     ADD_PROJECT: (event) => {
  //       // TODO: Implement me
  //       const itemId = event.target.id.split(`${props.componentId}`)[1].substring(1)
  //       const item = items[itemId]
  //       if (item.deleted || item.completed) return
  //       console.log('move item')
  //       event.preventDefault()
  //     },
  //     EDIT_ITEM_DESC: (event) => {
  //       // TODO:Implement me
  //       // const item = items[event.target.id]
  //       event.preventDefault()
  //     },
  //   }
  //   Object.entries(itemKeymap).map(([k, v]) => {
  //     useHotkeys(v, handlers[k])
  //   })
  // */

  return (
    <ThemeProvider theme={theme}>
      <Container data-cy="item-list">
        <TransitionGroup component={null}>
          {props.inputItems.map((i) => {
            if (i == undefined) return null
            /* We want to allow flattening of subtasks which means:
                1. If we should flatten
                    - If an item has a parent and the parent is in the list, don't render the parent 
                2.  Default
                    - If an item has a parent, don't render it (as it will get rendered later)
                    - For each item, render the item and it's children  (In the Item component)
            */
            if (props.flattenSubtasks == true) {
              if (i.parent != null) {
                const parentExistsInList = props.inputItems.find((z) => z.key == i.parent.key)
                // It exists it will get rendered later, so don't render it
                if (parentExistsInList) {
                  return
                }
              }
            }
            return (
              <Transition
                key={'t-container-' + i.key}
                timeout={{
                  appear: 100,
                  enter: 100,
                  exit: 100,
                }}
              >
                {(state) => {
                  return (
                    <ItemContainer state={state} tabIndex={0} key={'container-' + i.key}>
                      <Item
                        key={i.key}
                        itemKey={i.key}
                        componentKey={props.componentKey}
                        shouldIndent={false}
                        hiddenIcons={props.hiddenIcons}
                      />

                      {i.children?.map((childItem) => {
                        // We need to check if the child exists in the original input list
                        return (
                          <Item
                            key={childItem.key}
                            itemKey={childItem.key}
                            componentKey={props.componentKey}
                            hiddenIcons={
                              props.hiddenIcons
                                ? [...props.hiddenIcons, ItemIcons.Subtask]
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

export default ItemList
