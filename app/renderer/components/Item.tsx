import { format, parseISO } from 'date-fns'
import React, { ReactElement, useEffect, useState } from 'react'
import { RRule } from 'rrule'
import { Icons } from '../assets/icons'
import { ItemIcons } from '../interfaces'
import { cloneDeep, get, isEmpty, set } from 'lodash'
import {
  capitaliseFirstLetter,
  formatRelativeDate,
  HTMLToPlainText,
  removeItemTypeFromString,
  rruleToText,
  truncateString,
} from '../utils'
import Button from './Button'
import ItemAttribute from './ItemAttribute'
import LabelDialog from './LabelDialog'
import MoreDropdown, { MoreDropdownOptions } from './MoreDropdown'
import ReminderDialog from './ReminderDialog'
import { Grid, GridItem, Tag, TagLabel, Flex, Text, Tooltip } from '@chakra-ui/react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { activeItemVar, focusbarVisibleVar, subtasksVisibleVar } from '..'
import { Item as ItemType } from '../../main/generated/typescript-helpers'
import { LoadingItem } from './LoadingItem'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

type ItemProps = {
  compact: boolean
  itemKey: string
  componentKey: string
  hiddenIcons: ItemIcons[]
  shouldIndent: boolean
  hideCollapseIcon?: boolean
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
    permanentDeleteItem(input: { key: $key })
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
  const [moreButtonVisible, setMoreButtonVisible] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [subtasksVisible, setSubtasksVisible] = useState(true)
  const [showLabelDialog, setShowLabelDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [completeItem] = useMutation(COMPLETE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [deleteItem] = useMutation(DELETE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [cloneItem] = useMutation(CLONE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [permanentDeleteItem] = useMutation(PERMANENT_DELETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  })
  const [restoreItem] = useMutation(RESTORE_ITEM, { refetchQueries: ['itemsByFilter'] })

  // Check if the item should be visible, based on a parent hiding subtasks
  const determineItemVisiblility = (parentKey: string, componentKey: string): boolean => {
    if (!parentKey || !componentKey || isEmpty(data.subtasksVisible)) return true
    // If the item has a parent, then check if the parent is hidden
    if (parentKey) {
      const parentVisibility = data.subtasksVisible?.[parentKey]?.[componentKey]
      // If the parent doesn't have visibility then set it to true
      if (parentVisibility == undefined) {
        set(data.subtasksVisible, `[${parentKey}][${componentKey}]`, true)
        return true
      } else if (parentVisibility == false) {
        // If the parent visibility is false, all subtasks should be hidden
        return false
      }
    }
    return true
  }
  // Determine if any subtasks of the item should be visible
  const determineSubtasksVisibility = (itemKey: string, componentKey: string): boolean => {
    if (!itemKey || !componentKey || isEmpty(data.subtasksVisible)) return true

    const subtaskVisibility = data?.subtasksVisible?.[itemKey]?.[componentKey]
    if (subtaskVisibility == undefined) {
      // Default to visible
      set(data.subtasksVisible, `[${itemKey}][${componentKey}]`, true)
      return true
    }
    return subtaskVisibility
  }

  let enterInterval, exitInterval
  const { loading, error, data } = useQuery(GET_DATA, {
    variables: { key: props.itemKey ? props.itemKey : null },
  })

  useEffect(() => {
    setIsVisible(determineItemVisiblility(data?.item?.parent?.key, props.componentKey))
    setSubtasksVisible(determineSubtasksVisibility(data?.item?.key, props.componentKey))
  }, [data, props.itemKey, props.componentKey])

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
    const newValue = get(newState, `${item.key}.${props.componentKey}`, true)
    if (newState[item.key]) {
      newState[item.key][props.componentKey] = !newValue
    } else {
      newState[item.key] = {
        [props.componentKey]: false,
      }
    }
    subtasksVisibleVar(newState)
    return
  }

  const isFocused = activeItemVar().findIndex((i) => i == item.key) >= 0
  return (
    <Grid
      display={isVisible ? 'grid' : 'none'}
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
        bottom: -1,
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
          if (focusbarVisibleVar() == false || focusbarVisibleVar() == undefined) {
            focusbarVisibleVar(true)
          }
        }
      }}
      tabIndex={0}
    >
      <GridItem colStart={props.compact ? 1 : 3} colSpan={props.compact ? 7 : 3}>
        <Tippy delay={500} content={HTMLToPlainText(item.text)}>
          <Text
            id="body"
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
        </Tippy>
      </GridItem>
      <GridItem colStart={props.compact ? 8 : 6} colSpan={1}>
        {(!props.hiddenIcons?.includes(ItemIcons.Project) || item.project == null) && (
          <Flex justifyContent={'flex-end'}>
            <Tippy delay={500} content={item.project?.name}>
              <Tag size={props.compact ? 'sm' : 'md'} color={'white'} bg={'blue.500'}>
                <TagLabel>
                  {props.compact ? truncateString(item.project?.name, 8) : item.project?.name}
                </TagLabel>
              </Tag>
            </Tippy>
          </Flex>
        )}
      </GridItem>
      {props.compact != true && (
        <>
          {item.children?.length > 0 && !props.hideCollapseIcon && (
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

          <GridItem rowStart={2} colStart={3} colSpan={1}>
            {!props.hiddenIcons?.includes(ItemIcons.Subtask) && item.parent != null && (
              <ItemAttribute
                compact={props.compact}
                completed={item.completed}
                type={'subtask'}
                tooltipText={item.parent.text}
                text={
                  item.parent ? truncateString(removeItemTypeFromString(item.parent.text), 12) : ''
                }
              />
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

          <GridItem rowStart={2} colStart={4} colSpan={1}>
            {item.scheduledAt != null && !props.hiddenIcons?.includes(ItemIcons.Scheduled) && (
              <ItemAttribute
                compact={props.compact}
                completed={item.completed}
                type={'scheduled'}
                tooltipText={formatRelativeDate(parseISO(item.scheduledAt), props.compact)}
                text={formatRelativeDate(parseISO(item.scheduledAt), props.compact)}
              />
            )}
          </GridItem>
          <GridItem colStart={7} colSpan={1}>
            {item.reminders.filter((r) => r.deleted == false).length > 0 && (
              <Tippy
                delay={500}
                content={`Reminder at: ${format(
                  parseISO(item?.reminders?.[0]?.remindAt),
                  'h:mm aaaa EEEE',
                )}`}
              >
                {Icons['reminder']()}
              </Tippy>
            )}
          </GridItem>
        </>
      )}
      <GridItem rowStart={2} colStart={props.compact ? 1 : 5} colSpan={props.compact ? 4 : 1}>
        {item.dueAt != null && !props.hiddenIcons?.includes(ItemIcons.Due) && (
          <ItemAttribute
            compact={props.compact}
            completed={item.completed}
            type={'due'}
            tooltipText={formatRelativeDate(parseISO(item.dueAt), props.compact)}
            text={formatRelativeDate(parseISO(item.dueAt), props.compact)}
          />
        )}
      </GridItem>
      <GridItem rowStart={2} colStart={props.compact ? 5 : 6} colSpan={props.compact ? 4 : 1}>
        {item.repeat && !props.hiddenIcons?.includes(ItemIcons.Repeat) && (
          <ItemAttribute
            compact={props.compact}
            completed={item.completed}
            type={'repeat'}
            tooltipText={capitaliseFirstLetter(rruleToText(RRule.fromString(item?.repeat)))}
            text={capitaliseFirstLetter(rruleToText(RRule.fromString(item?.repeat)))}
          />
        )}
      </GridItem>
    </Grid>
  )
}

export default Item
