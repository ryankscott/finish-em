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

  // TODO: Move this to the MoreDropdown component
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

  const getProjectText = (projectId: string): { short: string; long: string } => {
    if (projectId == null) return { short: 'None', long: 'None' }
    if (projectId != '0') {
      return {
        short: truncateString(props.projects.projects?.[projectId].name, 12),
        long: props.projects.projects?.[projectId].name,
      }
    }
    return { short: 'Inbox', long: 'Inbox' }
  }

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
        labelColour={props.labelId ? props.labels[props.labelId].colour : null}
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
          visible={!(props.hideIcons?.includes(ItemIcons.Project) || props.projectId == null)}
        >
          <ProjectName data-tip data-for={'project-name-' + props.id}>
            {getProjectText(props.projectId).short}
          </ProjectName>
          <Tooltip id={'project-name-' + props.id} text={getProjectText(props.projectId).long} />
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
          visible={!props.hideIcons.includes(ItemIcons.Subtask) && props.parentId != null}
        >
          <ItemAttribute
            completed={props.completed}
            type={'subtask'}
            text={
              props.parentId
                ? truncateString(removeItemTypeFromString(props.parentItem.text), 12)
                : ''
            }
          />
          <Tooltip
            id={'parent-item-' + props.id}
            text={props.parentId ? removeItemTypeFromString(props.parentItem.text) : ''}
          />
        </ParentItemContainer>
        <ScheduledContainer
          data-tip
          data-for={'scheduled-date-' + props.id}
          visible={props.scheduledDate != null && !props.hideIcons?.includes(ItemIcons.Scheduled)}
        >
          <ItemAttribute
            completed={props.completed}
            type={'scheduled'}
            text={props.scheduledDate ? format(parseISO(scheduledDate), 'EEEE do MMM yyyy') : ''}
          />
          <Tooltip id={'scheduled-date-' + props.id} text={scheduledDateText.long} />
        </ScheduledContainer>
        <DueContainer
          data-tip
          data-for={'due-date-' + props.id}
          visible={props.dueDate != null && !props.hideIcons.includes(ItemIcons.Due)}
        >
          <ItemAttribute
            completed={props.completed}
            type={'due'}
            text={props.dueDate ? formatRelativeDate(parseISO(props.dueDate)) : ''}
          />
          <Tooltip
            id={'due-date-' + props.id}
            text={props.dueDate ? format(parseISO(props.dueDate), 'EEEE do MMM yyyy') : ''}
          />
        </DueContainer>
        <RepeatContainer
          data-tip
          data-for={'repeat-' + props.id}
          visible={props.repeat != null && !props.hideIcons.includes(ItemIcons.Repeat)}
        >
          <ItemAttribute
            completed={props.completed}
            type={'repeat'}
            text={
              props.repeat
                ? capitaliseFirstLetter(rruleToText(RRule.fromString(props.repeat)))
                : 'Repeat'
            }
          />
          <Tooltip
            id={'repeat-' + props.id}
            text={
              props.repeat
                ? capitaliseFirstLetter(RRule.fromString(props.repeat).toText())
                : 'Repeat'
            }
          />
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
