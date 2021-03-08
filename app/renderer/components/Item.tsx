import { format, parseISO } from 'date-fns'
import React, { ReactElement, useEffect, useState } from 'react'
import { RRule } from 'rrule'
import { Icons } from '../assets/icons'
import { ItemIcons, ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { cloneDeep, get, set as setKey } from 'lodash'
import { themes } from '../theme'
import {
  capitaliseFirstLetter,
  createShortSidebarItem,
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
import {
  Body,
  Container,
  DueContainer,
  ExpandContainer,
  LoadingContainer,
  LoadingDesc,
  LoadingDue,
  LoadingRepeat,
  LoadingScheduled,
  LoadingType,
  MoreContainer,
  ParentItemContainer,
  ProjectContainer,
  ProjectName,
  ReminderContainer,
  RepeatContainer,
  ScheduledContainer,
  TypeContainer,
} from './styled/Item'
import Tooltip from './Tooltip'
import { gql, useMutation, useQuery } from '@apollo/client'
import { activeItemVar, focusbarVisibleVar, subtasksVisibleVar } from '..'
import { Item as ItemType } from '../../main/generated/typescript-helpers'

type ItemProps = {
  compact: boolean
  itemKey: string
  componentKey: string
  hiddenIcons: ItemIcons[]
  shouldIndent: boolean
  alwaysVisible?: boolean
}

const GET_THEME = gql`
  query {
    theme @client
    activeItem @client
    subtasksVisible @client
  }
`

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
  const container = React.useRef<HTMLInputElement>()
  useEffect(() => {
    if (!isDescriptionReadOnly) {
      editor.current.focus()
    }
  }, [isDescriptionReadOnly])

  const { loading: l, error: e, data: d, refetch } = useQuery(GET_THEME)

  const { loading, error, data } = useQuery(GET_DATA, {
    variables: { key: props.itemKey ? props.itemKey : null },
  })
  const theme: ThemeType = themes[d.theme]
  if (loading)
    return (
      <LoadingContainer>
        <LoadingType />
        <LoadingDesc />
        <LoadingDue />
        <LoadingScheduled />
        <LoadingRepeat />
      </LoadingContainer>
    )

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
    console.log('handleExpand')
    e.stopPropagation()
    let newState = cloneDeep(d.subtasksVisible)
    console.log(newState)
    const newValue = get(newState, `${item.key}.${props.componentKey}`, false)
    console.log(newValue)
    if (newState[item.key]) {
      newState[item.key][props.componentKey] = !newValue
    } else {
      newState[item.key] = {
        [props.componentKey]: true,
      }
    }
    subtasksVisibleVar(newState)
    refetch()
    return
  }

  const getProjectText = (projectName: string): { short: string; long: string } => {
    if (projectName == null) return { short: 'None', long: 'None' }
    if (projectName != 'Inbox') {
      return {
        short: truncateString(projectName, 12),
        long: projectName,
      }
    }
    return { short: 'Inbox', long: 'Inbox' }
  }

  // Check if the item should be visible, based on a parent hiding subtasks (default should be true)
  const parentVisibility = d.subtasksVisible?.[item.parent?.key]?.[props.componentKey]
  const isVisible = parentVisibility != undefined ? parentVisibility : true

  // Check if the item's subtasks should be visible (default should be true)
  const itemVisibility = d.subtasksVisible?.[item.key]?.[props.componentKey]
  const subtasksVisible = itemVisibility != undefined ? itemVisibility : true

  const isFocused = d.activeItem.findIndex((i) => i == item.key) >= 0

  return (
    <ThemeProvider theme={theme}>
      <Container
        focused={isFocused}
        id={item.key}
        compact={props.compact}
        onMouseEnter={() => {
          enterInterval = setTimeout(() => setMoreButtonVisible(true), 250)
          clearTimeout(exitInterval)
        }}
        onMouseLeave={() => {
          clearTimeout(enterInterval)
          exitInterval = setTimeout(() => setMoreButtonVisible(false), 200)
        }}
        onClick={(e) => {
          console.log('click')
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
        onBlur={() => {}}
        tabIndex={0}
        deleted={item.deleted}
        key={item.key}
        ref={container}
        shouldIndent={props.shouldIndent}
        visible={isVisible || props.alwaysVisible}
        itemType={item.type}
        labelColour={item.label ? item.label.colour : null}
      >
        {item.children?.length > 0 && !props.compact && (
          <ExpandContainer>
            <Button
              type="subtle"
              onClick={(e) => {
                handleExpand(e)
              }}
              icon={'expand'}
              rotate={subtasksVisible ? 1 : 0}
              iconSize={'16px'}
            ></Button>
          </ExpandContainer>
        )}
        {!props.compact && (
          <TypeContainer>
            <Button
              type="subtle"
              spacing="compact"
              tooltipText={item.deleted ? 'Restore' : item.completed ? 'Uncomplete' : 'Complete'}
              onClick={handleIconClick}
              icon={item.deleted ? 'restore' : item.completed ? 'todoChecked' : 'todoUnchecked'}
              iconSize={'16px'}
              iconColour={item.label ? item.label.colour : null}
            />
          </TypeContainer>
        )}
        <Body
          id="body"
          data-tip
          data-for={'item-name-' + item.key}
          compact={props.compact}
          completed={item.completed}
          deleted={item.deleted}
          dangerouslySetInnerHTML={{
            __html: item.text.startsWith('<p>')
              ? removeItemTypeFromString(item.text)
              : `<p>${removeItemTypeFromString(item.text)}</p>`,
          }}
        />
        <Tooltip id={'item-name-' + item.key} text={item.text} html={true} />
        <ProjectContainer
          visible={!(props.hiddenIcons?.includes(ItemIcons.Project) || item.project == null)}
        >
          <ProjectName data-tip data-for={'project-name-' + item.key}>
            {props.compact
              ? createShortSidebarItem(item.project?.name)
              : getProjectText(item.project?.name).short}
          </ProjectName>
          <Tooltip id={'project-name-' + item.key} text={getProjectText(item.project?.name).long} />
        </ProjectContainer>
        {!props.compact && (
          <MoreContainer visible={moreButtonVisible}>
            <MoreDropdown subtle={true} options={dropdownOptions}></MoreDropdown>
            {showLabelDialog && (
              <LabelDialog
                itemKey={item.key}
                onClose={() => {
                  setShowLabelDialog(false)
                }}
              />
            )}
            {showReminderDialog && (
              <ReminderDialog
                itemKey={item.key}
                reminderText={removeItemTypeFromString(item.text)}
                onClose={() => {
                  setShowReminderDialog(false)
                }}
              />
            )}
          </MoreContainer>
        )}
        {!props.compact && (
          <ParentItemContainer
            data-tip
            data-for={'parent-item-' + item.key}
            visible={!props.hiddenIcons?.includes(ItemIcons.Subtask) && item.parent != null}
          >
            <ItemAttribute
              compact={props.compact}
              completed={item.completed}
              type={'subtask'}
              text={
                item.parent ? truncateString(removeItemTypeFromString(item.parent.text), 12) : ''
              }
            />
            <Tooltip
              id={'parent-item-' + item.key}
              text={item.parent ? removeItemTypeFromString(item.parent.text) : ''}
            />
          </ParentItemContainer>
        )}
        <ScheduledContainer
          data-tip
          data-for={'scheduled-date-' + item.key}
          visible={item.scheduledAt != null && !props.hiddenIcons?.includes(ItemIcons.Scheduled)}
        >
          <ItemAttribute
            compact={props.compact}
            completed={item.completed}
            type={'scheduled'}
            text={
              item.scheduledAt ? formatRelativeDate(parseISO(item.scheduledAt), props.compact) : ''
            }
          />
          <Tooltip
            id={'scheduled-date-' + item.key}
            text={item.scheduledAt ? format(parseISO(item.scheduledAt), 'EEEE do MMM yyyy') : ''}
          />
        </ScheduledContainer>
        <DueContainer
          data-tip
          data-for={'due-date-' + item.key}
          visible={item.dueAt != null && !props.hiddenIcons?.includes(ItemIcons.Due)}
        >
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
        </DueContainer>
        <RepeatContainer
          data-tip
          data-for={'repeat-' + item.key}
          visible={item.repeat && !props.hiddenIcons?.includes(ItemIcons.Repeat)}
        >
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
        </RepeatContainer>
        <ReminderContainer
          data-tip
          data-for={'reminder-' + item.key}
          visible={item.reminders.filter((r) => r.deleted == false).length}
        >
          {Icons['reminder']()}
          {item.reminders.filter((r) => r.deleted == false).length && (
            <Tooltip
              id={'reminder-' + item.key}
              text={`Reminder at: ${format(
                parseISO(item?.reminders?.[0]?.remindAt),
                'h:mm aaaa EEEE',
              )}`}
            />
          )}
        </ReminderContainer>
      </Container>
    </ThemeProvider>
  )
}

export default Item
