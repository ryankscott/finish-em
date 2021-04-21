import { format, parseISO } from 'date-fns'
import React, { ReactElement, useEffect, useState } from 'react'
import { RRule } from 'rrule'
import { Icons } from '../assets/icons'
import { ItemIcons } from '../interfaces'
import { cloneDeep, get } from 'lodash'
import {
  capitaliseFirstLetter,
  formatRelativeDate,
  removeItemTypeFromString,
  rruleToText,
  truncateString,
} from '../utils'
import Button from './Button'
import ItemAttribute from './ItemAttribute'
import LabelDialog from './LabelDialog'
import MoreDropdown, { MoreDropdownOptions } from './MoreDropdown'
import ReminderDialog from './ReminderDialog'
import { Grid, GridItem, Tag, TagLabel, Flex, Text } from '@chakra-ui/react'
import Tooltip from './Tooltip'
import { gql, useMutation, useQuery } from '@apollo/client'
import { activeItemVar, focusbarVisibleVar, subtasksVisibleVar } from '..'
import { Item as ItemType } from '../../main/generated/typescript-helpers'
import { LoadingItem } from './LoadingItem'

type ItemProps = {
  compact: boolean
  itemKey: string
  componentKey: string
  hiddenIcons: ItemIcons[]
  shouldIndent: boolean
  alwaysVisible?: boolean
}

const GET_DATA = gql`
  query itemByKey($key: String!) {
    item: item(key: $key) {
      key
      type
      text
      deleted
      completed
      dueAt
      scheduledAt
      lastUpdatedAt
      completedAt
      createdAt
      deletedAt
      repeat
      reminders {
        key
        deleted
        remindAt
      }
      label {
        key
        name
        colour
      }
      project {
        key
        name
      }
      parent {
        key
        text
      }
      children {
        key
      }
    }
    activeItem @client
    subtasksVisible @client
  }
`

const RENAME_ITEM = gql`
  mutation RenameItem($key: String!, $text: String!) {
    renameItem(input: { key: $key, text: $text }) {
      key
      text
    }
  }
`

const COMPLETE_ITEM = gql`
  mutation CompleteItem($key: String!) {
    completeItem(input: { key: $key }) {
      key
      completed
      completedAt
      scheduledAt
      repeat
      dueAt
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

const PERMANENT_DELETE_ITEM = gql`
  mutation PermanentDeleteItem($key: String!) {
    permanentDeleteItem(input: { key: $key }) {
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

const CLONE_ITEM = gql`
  mutation CloneItem($key: String!) {
    cloneItem(input: { key: $key }) {
      key
    }
  }
`

function Item(props: ItemProps): ReactElement {
  const [isDescriptionReadOnly, setIsDescriptionReadOnly] = useState(true)
  const [moreButtonVisible, setMoreButtonVisible] = useState(false)
  const [showLabelDialog, setShowLabelDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [completeItem] = useMutation(COMPLETE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [renameItem] = useMutation(RENAME_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [deleteItem] = useMutation(DELETE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [cloneItem] = useMutation(CLONE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [permanentDeleteItem] = useMutation(PERMANENT_DELETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  })
  const [restoreItem] = useMutation(RESTORE_ITEM, { refetchQueries: ['itemsByFilter'] })

  let enterInterval, exitInterval
  const editor = React.useRef<HTMLInputElement>()
  useEffect(() => {
    if (!isDescriptionReadOnly) {
      editor.current.focus()
    }
  }, [isDescriptionReadOnly])

  const { loading, error, data } = useQuery(GET_DATA, {
    variables: { key: props.itemKey ? props.itemKey : null },
  })

  if (loading) return <LoadingItem />

  if (error) return null

  const item: ItemType = data.item
  // TODO: Move this to the MoreDropdown component
  const dropdownOptions: MoreDropdownOptions = item.deleted
    ? [
        {
          label: 'Delete permanently',
          onClick: (e: React.MouseEvent) => {
            permanentDeleteItem({ variables: { key: item.key } })
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'trashPermanent',
        },
        {
          label: 'Restore item',
          onClick: (e: React.MouseEvent) => {
            restoreItem({ variables: { key: item.key } })
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'restore',
        },
      ]
    : [
        {
          label: 'Add label',
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation()
            e.preventDefault()
            setShowLabelDialog(!showLabelDialog)
            return
          },
          icon: 'flag',
        },
        {
          label: 'Delete item',
          onClick: (e: React.MouseEvent) => {
            deleteItem({ variables: { key: item.key } })
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'trash',
        },
        {
          label: 'Clone item',
          onClick: (e: React.MouseEvent) => {
            cloneItem({ variables: { key: item.key } })
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'copy',
        },
        {
          label: 'Remind me',
          onClick: (e: React.MouseEvent) => {
            setShowReminderDialog(!showReminderDialog)
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'reminder',
        },
      ]

  const handleIconClick = (e): void => {
    e.stopPropagation()
    if (item.deleted) {
      restoreItem({ variables: { key: item.key } })
      return
    }
    if (item.type == 'TODO') {
      item.completed
        ? unCompleteItem({ variables: { key: item.key } })
        : completeItem({ variables: { key: item.key } })
      return
    }
  }

  const handleExpand = (e): void => {
    e.stopPropagation()
    let newState = cloneDeep(data.subtasksVisible)
    const newValue = get(newState, `${item.key}.${props.componentKey}`, false)
    if (newState[item.key]) {
      newState[item.key][props.componentKey] = !newValue
    } else {
      newState[item.key] = {
        [props.componentKey]: true,
      }
    }
    subtasksVisibleVar(newState)
    return
  }

  // Check if the item should be visible, based on a parent hiding subtasks (default should be true)
  const parentVisibility = data.subtasksVisible?.[item.parent?.key]?.[props.componentKey]
  const isVisible = parentVisibility != undefined ? parentVisibility : true

  // Check if the item's subtasks should be visible (default should be true)
  const itemVisibility = data.subtasksVisible?.[item.key]?.[props.componentKey]
  const subtasksVisible = itemVisibility != undefined ? itemVisibility : true

  const isFocused = data.activeItem.findIndex((i) => i == item.key) >= 0
  return (
    <Grid
      opacity={isVisible ? 1 : 0}
      height={isVisible ? 'auto' : '0px'}
      transition={'all 0.2s ease-in-out'}
      position={'relative'}
      maxHeight={'200px'}
      py={1}
      px={1}
      pl={props.shouldIndent ? 5 : 1}
      mx={0}
      my={1}
      gap={0.5}
      alignItems={'center'}
      cursor={'pointer'}
      borderRadius={5}
      gridTemplateColumns={props.compact ? 'repeat(8, 1fr)' : '25px 25px repeat(4, 1fr) 25px 25px'}
      gridTemplateRows={'40px auto'}
      _before={{
        content: "''",
        position: 'absolute',
        top: '-16px',
        left: '16px',
        height: props.shouldIndent ? 'calc(100% + 10px)' : '0px',
        transition: 'all 0.1s ease-in-out',
        background: 'gray.400',
        width: '1px',
        zIndex: 9,
      }}
      _after={{
        content: "''",
        position: 'absolute',
        battom: -1,
        right: '0px',
        left: '0px',
        margin: 'auto',
        width: props.shouldIndent || subtasksVisible ? '90%' : '100%',
        borderBottom: '1px',
        borderColor: 'gray.100',
        opacity: 0.8,
      }}
      bg={isFocused ? 'gray.100' : 'gray.50'}
      id={item.key}
      onMouseEnter={() => {
        enterInterval = setTimeout(() => setMoreButtonVisible(true), 250)
        clearTimeout(exitInterval)
      }}
      onMouseLeave={() => {
        clearTimeout(enterInterval)
        exitInterval = setTimeout(() => setMoreButtonVisible(false), 200)
      }}
      onClick={(e) => {
        if (e.shiftKey) {
          if (isFocused) {
            const activeItems = data.activeItem.filter((i) => i != item.key)
            activeItemVar(activeItems)
            if (activeItems.length == 0) {
              focusbarVisibleVar(false)
            }
          } else {
            activeItemVar([item.key, ...data.activeItem])
            focusbarVisibleVar(true)
          }
        } else {
          activeItemVar([item.key])
          focusbarVisibleVar(true)
        }
      }}
      tabIndex={0}
    >
      <GridItem colStart={props.compact ? 1 : 3} colSpan={props.compact ? 7 : 3}>
        <Text
          id="body"
          data-tip
          data-for={'item-name-' + item.key}
          mx={0}
          my={2}
          fontSize="md"
          isTruncated={true}
          textDecoration={item.completed ? 'line-through' : null}
          color={item.deleted ? 'gray.500' : 'gray.800'}
          sx={{
            p: {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            a: {
              textDecoration: 'underline',
            },
          }}
          dangerouslySetInnerHTML={{
            __html: removeItemTypeFromString(item.text),
          }}
        />
        <Tooltip id={'item-name-' + item.key} text={item.text} html={true} />
      </GridItem>
      <GridItem colStart={props.compact ? 8 : 6} colSpan={1}>
        {(!props.hiddenIcons?.includes(ItemIcons.Project) || item.project == null) && (
          <Flex justifyContent={'flex-end'}>
            <Tag
              size={props.compact ? 'sm' : 'md'}
              color={'white'}
              bg={'blue.500'}
              data-tip
              data-for={'project-name-' + item.key}
            >
              <TagLabel>
                {props.compact ? truncateString(item.project?.name, 8) : item.project?.name}
              </TagLabel>
            </Tag>
            <Tooltip id={'project-name-' + item.key} text={item.project?.name} />
          </Flex>
        )}
      </GridItem>
      {props.compact != true && (
        <>
          {item.children?.length > 0 && (
            <GridItem rowStart={1} colStart={1} colSpan={1}>
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  handleExpand(e)
                }}
                icon={subtasksVisible ? 'collapse' : 'expand'}
                iconSize={'16px'}
              ></Button>
            </GridItem>
          )}

          <GridItem rowStart={1} colStart={2} colSpan={1}>
            <Button
              variant="subtle"
              size="sm"
              tooltipText={item.deleted ? 'Restore' : item.completed ? 'Uncomplete' : 'Complete'}
              onClick={handleIconClick}
              icon={item.deleted ? 'restore' : item.completed ? 'todoChecked' : 'todoUnchecked'}
              iconSize={'16px'}
              iconColour={item.label ? item.label.colour : null}
            />
          </GridItem>

          <GridItem
            rowStart={2}
            colStart={3}
            colSpan={1}
            data-tip
            data-for={'parent-item-' + item.key}
          >
            {!props.hiddenIcons?.includes(ItemIcons.Subtask) && item.parent != null && (
              <>
                <ItemAttribute
                  compact={props.compact}
                  completed={item.completed}
                  type={'subtask'}
                  text={
                    item.parent
                      ? truncateString(removeItemTypeFromString(item.parent.text), 12)
                      : ''
                  }
                />
                <Tooltip
                  id={'parent-item-' + item.key}
                  text={item.parent ? removeItemTypeFromString(item.parent.text) : ''}
                />
              </>
            )}
          </GridItem>

          <GridItem rowStart={1} colStart={7} colSpan={1}>
            {showReminderDialog && (
              <ReminderDialog
                itemKey={item.key}
                reminderText={removeItemTypeFromString(item.text)}
                onClose={() => {
                  setShowReminderDialog(false)
                }}
              />
            )}
          </GridItem>
          <GridItem rowStart={1} colStart={8} colSpan={1}>
            {moreButtonVisible && (
              <>
                <MoreDropdown options={dropdownOptions}></MoreDropdown>
                {showLabelDialog && (
                  <LabelDialog
                    itemKey={item.key}
                    onClose={() => {
                      setShowLabelDialog(false)
                    }}
                  />
                )}
              </>
            )}
          </GridItem>

          <GridItem
            rowStart={2}
            colStart={4}
            colSpan={1}
            data-tip
            data-for={'scheduled-date-' + item.key}
          >
            {item.scheduledAt != null && !props.hiddenIcons?.includes(ItemIcons.Scheduled) && (
              <>
                <ItemAttribute
                  compact={props.compact}
                  completed={item.completed}
                  type={'scheduled'}
                  text={
                    item.scheduledAt
                      ? formatRelativeDate(parseISO(item.scheduledAt), props.compact)
                      : ''
                  }
                />
                <Tooltip
                  id={'scheduled-date-' + item.key}
                  text={
                    item.scheduledAt ? format(parseISO(item.scheduledAt), 'EEEE do MMM yyyy') : ''
                  }
                />
              </>
            )}
          </GridItem>
          <GridItem colStart={7} colSpan={1} data-tip data-for={'reminder-' + item.key}>
            {item.reminders.filter((r) => r.deleted == false).length > 0 && (
              <>
                {Icons['reminder']()}
                {item.reminders.filter((r) => r.deleted == false).length > 0 && (
                  <Tooltip
                    id={'reminder-' + item.key}
                    text={`Reminder at: ${format(
                      parseISO(item?.reminders?.[0]?.remindAt),
                      'h:mm aaaa EEEE',
                    )}`}
                  />
                )}
              </>
            )}
          </GridItem>
        </>
      )}
      <GridItem
        rowStart={2}
        colStart={props.compact ? 1 : 5}
        colSpan={props.compact ? 4 : 1}
        data-tip
        data-for={'due-date-' + item.key}
      >
        {item.dueAt != null && !props.hiddenIcons?.includes(ItemIcons.Due) && (
          <>
            <ItemAttribute
              compact={props.compact}
              completed={item.completed}
              type={'due'}
              text={item.dueAt ? formatRelativeDate(parseISO(item.dueAt), props.compact) : ''}
            />
            <Tooltip
              id={'due-date-' + item.key}
              text={item.dueAt ? format(parseISO(item.dueAt), 'EEEE do MMM yyyy') : ''}
            />
          </>
        )}
      </GridItem>
      <GridItem
        rowStart={2}
        colStart={props.compact ? 5 : 6}
        colSpan={props.compact ? 4 : 1}
        data-tip
        data-for={'repeat-' + item.key}
      >
        {item.repeat && !props.hiddenIcons?.includes(ItemIcons.Repeat) && (
          <>
            <ItemAttribute
              compact={props.compact}
              completed={item.completed}
              type={'repeat'}
              text={
                item.repeat && item.repeat != 'undefined'
                  ? capitaliseFirstLetter(rruleToText(RRule.fromString(item?.repeat)))
                  : 'Repeat'
              }
            />
            <Tooltip
              id={'repeat-' + item.key}
              text={
                item.repeat && item.repeat != 'undefined'
                  ? capitaliseFirstLetter(RRule.fromString(item.repeat).toText())
                  : 'Repeat'
              }
            />
          </>
        )}
      </GridItem>
    </Grid>
  )
}

export default Item
