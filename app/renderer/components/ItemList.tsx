import React, { ReactElement } from 'react'
import Item from './Item'
import { ItemIcons } from '../interfaces/item'
import { item as itemKeymap } from '../keymap'
import { useHotkeys } from 'react-hotkeys-hook'
import { gql, useMutation, useQuery } from '@apollo/client'
import { cloneDeep } from '@apollo/client/utilities'
import { get } from 'lodash'
import { activeItemVar, focusbarVisibleVar, subtasksVisibleVar } from '..'
import { Spinner } from './Spinner'
import { Box, Flex, Text } from '@chakra-ui/react'

const GET_DATA = gql`
  query {
    subtasksVisible @client
  }
`

const COMPLETE_ITEM = gql`
  mutation CompleteItem($key: String!) {
    completeItem(input: { key: $key }) {
      key
      completed
      completedAt
    }
  }
`

const UNCOMPLETE_ITEM = gql`
  mutation UnCompleteItem($key: String!) {
    unCompleteItem(input: { key: $key }) {
      key
      completed
      completedAt
    }
  }
`

const DELETE_ITEM = gql`
  mutation DeleteItem($key: String!) {
    deleteItem(input: { key: $key }) {
      key
      deleted
      deletedAt
    }
  }
`

const RESTORE_ITEM = gql`
  mutation RestoreItem($key: String!) {
    restoreItem(input: { key: $key }) {
      key
      deleted
      deletedAt
    }
  }
`

type ItemListProps = {
  componentKey: string
  inputItems: {
    key: string
    text: string
    label: { key: string; name: string }
    project: { key: string; name: string }
    parent: { key: string; name: string }
    children: { key: string }[]
    sortOrder: { sortOrder: number }
  }[]
  grouping?: 'project' | 'label'
  flattenSubtasks?: boolean
  hiddenIcons: ItemIcons[]
  compact?: boolean
}

function ItemList(props: ItemListProps): ReactElement {
  const { loading, error, data } = useQuery(GET_DATA)
  if (loading)
    return (
      <Flex h={'100%'} w={'100%'} justifyContent={'center'} alignContent={'center'}>
        <Spinner loading={true}></Spinner>
      </Flex>
    )
  if (error) {
    console.log(error)
    return null
  }
  const [completeItem] = useMutation(COMPLETE_ITEM)
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM)
  const [deleteItem] = useMutation(DELETE_ITEM)
  const [restoreItem] = useMutation(RESTORE_ITEM)

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

  const renderItem = (i): JSX.Element => {
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
      <Box tabIndex={0} key={'container-' + i.key}>
        <Item
          compact={props.compact}
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
              compact={props.compact}
              key={childItem.key}
              itemKey={childItem.key}
              componentKey={props.componentKey}
              hiddenIcons={
                props.hiddenIcons ? [...props.hiddenIcons, ItemIcons.Subtask] : [ItemIcons.Subtask]
              }
              shouldIndent={true}
            />
          )
        })}
      </Box>
    )
  }

  return (
    <Box w={'100%'} my={4} mx={0} data-cy="item-list">
      {props.inputItems.map((i) => {
        return renderItem(i)
      })}
      {props.inputItems.length == 0 && (
        <Text color={'gray.400'} fontSize="sm" py={4} px={0} pl={4}>
          No items
        </Text>
      )}
    </Box>
  )
}

export default ItemList
