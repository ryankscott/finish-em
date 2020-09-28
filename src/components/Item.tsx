import { format, isPast, parseISO } from 'date-fns'
import React, { ReactElement, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { RRule } from 'rrule'
import {
  cloneItem,
  completeItem,
  deleteItem,
  deletePermanently,
  setActiveItem,
  showFocusbar,
  toggleSubtasks,
  uncompleteItem,
  undeleteItem,
  updateItemDescription,
} from '../actions'
import { Icons } from '../assets/icons'
import { ItemIcons, ItemType, Label, Projects } from '../interfaces'
import { getItemParentId } from '../selectors/item'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import {
  capitaliseFirstLetter,
  formatRelativeDate,
  removeItemTypeFromString,
  rruleToText,
  truncateString,
} from '../utils'
import Button from './Button'
import EditableText from './EditableText'
import ItemAttribute from './ItemAttribute'
import LabelDialog from './LabelDialog'
import MoreDropdown, { MoreDropdownOptions } from './MoreDropdown'
import ReminderDialog from './ReminderDialog'
import {
  Body,
  Container,
  DueContainer,
  ExpandContainer,
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

interface DispatchProps {
  updateItemDescription: (id: string, text: string) => void
  completeItem: (id: string) => void
  uncompleteItem: (id: string) => void
  deleteItem: (id: string) => void
  undeleteItem: (id: string) => void
  setActiveItem: (id: string) => void
  showFocusbar: () => void
  toggleSubtasks: (id: string, componentId: string) => void
  deletePermanently: (id: string) => void
}
interface StateProps {
  reminders: Reminders
  projects: Projects
  theme: string
  labels: Label
  subtasksVisible: boolean
  parentItem: ItemType
}

interface OwnProps extends ItemType {
  componentId: string
  hideIcons: ItemIcons[]
  shouldIndent: boolean
  alwaysVisible?: boolean
}

type ItemProps = OwnProps & StateProps & DispatchProps

function Item(props: ItemProps): ReactElement {
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isDescriptionReadOnly, setIsDescriptionReadOnly] = useState(true)
  const [moreButtonVisible, setMoreButtonVisible] = useState(false)
  const [showLabelDialog, setShowLabelDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  let enterInterval,
    exitInterval = 0

  const editor = React.useRef<HTMLInputElement>()
  const container = React.useRef<HTMLInputElement>()

  const dropdownOptions: MoreDropdownOptions = props.deleted
    ? [
        {
          label: 'Delete permanently',
          onClick: (e: React.MouseEvent) => {
            props.deletePermanently(props.id)
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'trashPermanent',
        },
        {
          label: 'Restore item',
          onClick: (e: React.MouseEvent) => {
            props.undeleteItem(props.id)
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'undelete',
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
            props.deleteItem(props.id)
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'trash',
        },
        {
          label: 'Clone item',
          onClick: (e: React.MouseEvent) => {
            props.cloneItem(props.id)
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
  const reminder = props?.reminders.find(
    (r) => r.itemId == props.id && r.deleted == false && !isPast(parseISO(r.remindAt)),
  )

  const hiddenIcons = props.hideIcons || []

  useEffect(() => {
    if (!isDescriptionReadOnly) {
      editor.current.focus()
    }
  }, [isDescriptionReadOnly])

  const handleIconClick = (e): void => {
    e.stopPropagation()
    if (props.deleted) {
      props.undeleteItem(props.id)
      return
    }
    if (props.type == 'TODO') {
      props.completed ? props.uncompleteItem(props.id) : props.completeItem(props.id)
      return
    }
  }

  const handleExpand = (e): void => {
    e.stopPropagation()
    props.toggleSubtasks(props.id, props.componentId)
    return
  }

  // TODO: There must be a nicer way to do this...
  const dueDateText = props.dueDate
    ? {
        short: formatRelativeDate(parseISO(props.dueDate)),
        long: format(parseISO(props.dueDate), 'EEEE do MMM yyyy'),
      }
    : { short: '', long: '' }

  const scheduledDateText = props.scheduledDate
    ? {
        short: formatRelativeDate(parseISO(props.scheduledDate)),
        long: format(parseISO(props.scheduledDate), 'EEEE do MMM yyyy'),
      }
    : { short: '', long: '' }

  const repeatText = props.repeat
    ? {
        short: capitaliseFirstLetter(rruleToText(RRule.fromString(props.repeat))),
        long: capitaliseFirstLetter(RRule.fromString(props.repeat).toText()),
      }
    : { short: 'Repeat', long: 'Repeat' }

  const parentTaskText = props.parentId
    ? {
        short: truncateString(removeItemTypeFromString(props.parentItem.text), 12),
        long: removeItemTypeFromString(props.parentItem.text),
      }
    : { short: '', long: '' }

  const projectText =
    props.projectId == null
      ? { short: 'None', long: 'None' }
      : props.projectId != '0'
      ? {
          short: truncateString(props.projects.projects?.[props.projectId].name, 12),
          long: props.projects.projects?.[props.projectId].name,
        }
      : { short: 'Inbox', long: 'Inbox' }

  const labelColour = props.labelId ? props.labels[props.labelId].colour : null

  // Check if the item should be visible, based on a parent hiding subtasks (default should be true)
  const parentVisibility = props.subtasksVisible?.[props.parentId]?.[props.componentId]
  const isVisible = parentVisibility != undefined ? parentVisibility : true

  // Check if the item's subtasks should be visible (default should be true)
  const itemVisibility = props.subtasksVisible?.[props.id]?.[props.componentId]
  const subtasksVisible = itemVisibility != undefined ? itemVisibility : true

  return (
    <ThemeProvider theme={themes[props.theme]}>
      <Container
        id={props.componentId + '-' + props.id}
        onMouseEnter={() => {
          enterInterval = setTimeout(() => setMoreButtonVisible(true), 250)
          clearTimeout(exitInterval)
        }}
        onMouseLeave={() => {
          clearTimeout(enterInterval)
          exitInterval = setTimeout(() => setMoreButtonVisible(false), 200)
        }}
        onClick={(e) => {
          // TODO: This causes it being impossible to click on links
          // This is a weird gross hack for if you click on a child element
          const el = document.getElementById(props.componentId + '-' + props.id)
          el.focus()
          props.showFocusbar()
          props.setActiveItem(props.id)
        }}
        tabIndex={0}
        deleted={props.deleted}
        key={props.id}
        ref={container}
        shouldIndent={props.shouldIndent}
        visible={isVisible || props.alwaysVisible}
        itemType={props.type}
        labelColour={labelColour}
      >
        {props.children.length > 0 && (
          <ExpandContainer>
            <Button
              type="subtle"
              onClick={handleExpand}
              icon={'expand'}
              rotate={subtasksVisible ? 1 : 0}
            ></Button>
          </ExpandContainer>
        )}
        <TypeContainer>
          <Button
            dataFor={`type-button-${props.id}`}
            type="subtle"
            spacing="compact"
            onClick={handleIconClick}
            icon={
              props.deleted
                ? 'restore'
                : props.type == 'NOTE'
                ? 'note'
                : props.completed
                ? 'todoChecked'
                : 'todoUnchecked'
            }
            iconSize={'16px'}
          />
          {props.type == 'TODO' && (
            <Tooltip
              id={`type-button-${props.id}`}
              text={props.deleted ? 'Restore' : props.completed ? 'Uncomplete' : 'Complete'}
            />
          )}
        </TypeContainer>
        <Body id="body" completed={props.completed} deleted={props.deleted}>
          <EditableText
            shouldSubmitOnBlur={true}
            innerRef={editor}
            readOnly={isDescriptionReadOnly}
            onEditingChange={(editing) => setIsEditingDescription(editing)}
            input={removeItemTypeFromString(props.text)}
            onUpdate={(text) => {
              setIsDescriptionReadOnly(true)
              props.updateItemDescription(props.id, props.type.concat(' ', text))
            }}
            singleline={props.type == 'NOTE' ? false : true}
            shouldClearOnSubmit={false}
          />
        </Body>
        <ProjectContainer
          visible={!(hiddenIcons?.includes(ItemIcons.Project) || props.projectId == null)}
        >
          <ProjectName data-tip data-for={'project-name-' + props.id}>
            {projectText.short}
          </ProjectName>
          <Tooltip id={'project-name-' + props.id} text={projectText.long} />
        </ProjectContainer>

        <MoreContainer visible={moreButtonVisible}>
          <MoreDropdown options={dropdownOptions}></MoreDropdown>
          {showLabelDialog && (
            <LabelDialog
              itemId={props.id}
              onClose={() => {
                setShowLabelDialog(false)
              }}
            />
          )}
          {showReminderDialog && (
            <ReminderDialog
              itemId={props.id}
              reminderText={removeItemTypeFromString(props.text)}
              onClose={() => {
                setShowReminderDialog(false)
              }}
            />
          )}
        </MoreContainer>

        <ParentItemContainer
          data-tip
          data-for={'parent-item-' + props.id}
          visible={!hiddenIcons.includes(ItemIcons.Subtask) && props.parentId != null}
        >
          <ItemAttribute completed={props.completed} type={'subtask'} text={parentTaskText.short} />
          <Tooltip id={'parent-item-' + props.id} text={parentTaskText.long} />
        </ParentItemContainer>
        <ScheduledContainer
          data-tip
          data-for={'scheduled-date-' + props.id}
          visible={props.scheduledDate != null && !hiddenIcons?.includes(ItemIcons.Scheduled)}
        >
          <ItemAttribute
            completed={props.completed}
            type={'scheduled'}
            text={scheduledDateText.short}
          />
          <Tooltip id={'scheduled-date-' + props.id} text={scheduledDateText.long} />
        </ScheduledContainer>
        <DueContainer
          data-tip
          data-for={'due-date-' + props.id}
          visible={props.dueDate != null && !hiddenIcons.includes(ItemIcons.Due)}
        >
          <ItemAttribute completed={props.completed} type={'due'} text={dueDateText.short} />
          <Tooltip id={'due-date-' + props.id} text={dueDateText.long} />
        </DueContainer>
        <RepeatContainer
          data-tip
          data-for={'repeat-' + props.id}
          visible={props.repeat != null && !hiddenIcons.includes(ItemIcons.Repeat)}
        >
          <ItemAttribute completed={props.completed} type={'repeat'} text={repeatText.short} />
          <Tooltip id={'repeat-' + props.id} text={repeatText.long} />
        </RepeatContainer>
        <ReminderContainer
          data-tip
          data-for={'reminder-' + props.id}
          visible={reminder != undefined}
        >
          {Icons['reminder']()}
          {reminder && (
            <Tooltip
              id={'reminder-' + props.id}
              text={`Reminder at: ${format(parseISO(reminder?.remindAt), 'h:mm aaaa EEEE')}`}
            />
          )}
        </ReminderContainer>
      </Container>
    </ThemeProvider>
  )
}

const mapStateToProps = (state, props): StateProps => ({
  projects: state.projects,
  reminders: state.reminders,
  theme: state.ui.theme,
  labels: state.ui.labels.labels,
  subtasksVisible: state.ui.subtasksVisible,
  parentItem: getItemParentId(state, props),
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
  cloneItem: (itemId: string) => {
    dispatch(cloneItem(itemId))
  },
  updateItemDescription: (id: string, text: string) => {
    dispatch(updateItemDescription(id, text))
  },
  uncompleteItem: (id: string) => {
    dispatch(uncompleteItem(id))
  },
  completeItem: (id: string) => {
    dispatch(completeItem(id))
  },
  undeleteItem: (id: string) => {
    dispatch(undeleteItem(id))
  },
  deleteItem: (id: string) => {
    dispatch(deleteItem(id))
  },
  setActiveItem: (id: string) => {
    dispatch(setActiveItem(id))
  },
  showFocusbar: () => {
    dispatch(showFocusbar())
  },
  toggleSubtasks: (id: string, componentId: string) => {
    dispatch(toggleSubtasks(id, componentId))
  },
  deletePermanently: (id: string) => {
    dispatch(deletePermanently(id))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Item)
