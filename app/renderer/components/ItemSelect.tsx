import { gql, useQuery } from '@apollo/client'
import CSS from 'csstype'
import groupBy from 'lodash/groupBy'
import marked from 'marked'
import React, { ReactElement } from 'react'
import { GroupType } from 'react-select'
import { Item } from '../../main/generated/typescript-helpers'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import {
  markdownBasicRegex,
  markdownLinkRegex,
  removeItemTypeFromString,
  truncateString,
} from '../utils'
import ButtonDropdown from './ButtonDropdown'

type OptionType = { value: string; label: JSX.Element | string; color?: CSS.Property.Color }

const generateItemOptions = (currentItem: Item, items: Item[]): GroupType<OptionType>[] => {
  const filteredValues = items.filter(
    (i) =>
      i.key != null &&
      i.key != currentItem.key &&
      i.key != currentItem.parent?.key &&
      i.deleted == false &&
      i.completed == false &&
      !i.parent,
  )
  // Return if we've filtered all items
  if (!filteredValues.length) return
  // Group them by project
  const groupedItems = groupBy(filteredValues, 'project.name')
  // Show the items from the project the item is in first
  // Update the label to be the project name, and the items to be the right format
  const allGroups = Object.keys(groupedItems).map((i) => {
    const group: GroupType<OptionType> = { label: '', options: [] }
    // It's possible to not have a project
    group['label'] = i ? i : 'No Project'
    group['options'] = groupedItems[i].map((i) => {
      return {
        value: i.key,
        label: removeItemTypeFromString(i.text)
          .replace(markdownLinkRegex, '$1')
          .replace(markdownBasicRegex, '$1'),
      }
    })
    return group
  })
  // Sort to ensure that the current project is at the front
  allGroups.sort((a, b) => {
    if (!currentItem?.project?.key) return 0
    return a.label == currentItem?.project?.name
      ? -1
      : b.label == currentItem?.project?.name
      ? 1
      : 0
  })

  // If it's already a subtask add an option to create it to a task
  return currentItem?.parent != null
    ? [
        {
          label: 'Options',
          options: [{ value: '', label: 'Convert to task' }],
        },
        ...allGroups,
      ]
    : allGroups
}

const GET_DATA = gql`
  query {
    items {
      key
      text
      deleted
      completed
      project {
        key
        name
      }
      parent {
        key
        text
      }
    }
    theme @client
  }
`

interface ItemSelectProps {
  item: Item
  completed: boolean
  deleted: boolean
  onSubmit: (itemKey: string) => void
}

export default function ItemSelect(props: ItemSelectProps): ReactElement {
  const { loading, error, data } = useQuery(GET_DATA)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <div>
        <ButtonDropdown
          buttonText={
            props.item.parent ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: marked(
                    truncateString(removeItemTypeFromString(props.item.parent.text), 15),
                  ),
                }}
              />
            ) : null
          }
          defaultButtonIcon={'subtask'}
          defaultButtonText={'Add Parent'}
          selectPlaceholder={'Search parent'}
          options={generateItemOptions(props.item, data.items)}
          deleted={props.deleted}
          completed={props.completed}
          onSubmit={(itemKey) => {
            props.onSubmit(itemKey)
          }}
        />
      </div>
    </ThemeProvider>
  )
}
