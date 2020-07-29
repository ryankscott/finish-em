import React, { ReactElement, useState, useEffect } from 'react'

import { ThemeProvider } from '../StyledComponents'
import { connect } from 'react-redux'
import { RRule } from 'rrule'
import { Uuid } from '@typed/uuid'
import { ItemType, Projects, Label, ItemIcons } from '../interfaces'
import {
    Body,
    Container,
    ExpandContainer,
    ScheduledContainer,
    DueContainer,
    RepeatContainer,
    TypeContainer,
    ProjectContainer,
    ParentItemContainer,
    MoreContainer,
    ProjectName,
} from './styled/Item'

import {
    updateItemDescription,
    completeItem,
    deleteItem,
    undeleteItem,
    uncompleteItem,
    setActiveItem,
    showFocusbar,
    toggleSubtasks,
    deletePermanently,
} from '../actions'
import { themes } from '../theme'
import EditableText from './EditableText'
import {
    removeItemTypeFromString,
    formatRelativeDate,
    capitaliseFirstLetter,
    rruleToText,
    truncateString,
} from '../utils'
import { parseISO, format } from 'date-fns'
import Button from './Button'
import MoreDropdown, { MoreDropdownOptions } from './MoreDropdown'
import { getItemParentId } from '../selectors/item'
import ItemAttribute from './ItemAttribute'
import Tooltip from './Tooltip'
import LabelDialog from './LabelDialog'

interface DispatchProps {
    updateItemDescription: (id: Uuid, text: string) => void
    completeItem: (id: Uuid) => void
    uncompleteItem: (id: Uuid) => void
    deleteItem: (id: Uuid) => void
    undeleteItem: (id: Uuid) => void
    setActiveItem: (id: Uuid) => void
    showFocusbar: () => void
    toggleSubtasks: (id: Uuid, componentId: Uuid) => void
    deletePermanently: (id: Uuid) => void
}
interface StateProps {
    projects: Projects
    theme: string
    labels: Label
    subtasksVisible: boolean
    parentItem: ItemType
}

interface OwnProps extends ItemType {
    componentId: Uuid
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
    let interval = 0

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
          ]
        : [
              {
                  label: 'Add Label',
                  onClick: (e: React.MouseEvent) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setShowLabelDialog(!showLabelDialog)
                      return
                  },
                  icon: 'flag',
              },
          ]

    const hiddenIcons = props.hideIcons || []
    useEffect(() => {
        if (!isDescriptionReadOnly) {
            editor.current.focus()
        }
    }, [isDescriptionReadOnly])

    const handleIconClick = (e): void => {
        e.stopPropagation()
        if (props.type == 'TODO') {
            props.completed ? props.uncompleteItem(props.id) : props.completeItem(props.id)
        }
        return
    }

    const handleExpand = (e): void => {
        e.stopPropagation()
        props.toggleSubtasks(props.id, props.componentId)
        return
    }

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
        props.projectId != '0'
            ? {
                  short: truncateString(props.projects.projects[props.projectId].name, 12),
                  long: props.projects.projects[props.projectId].name,
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
                id={props.id}
                onMouseEnter={(e) => {
                    clearTimeout(interval)
                    setMoreButtonVisible(true)
                }}
                onMouseLeave={(e) => {
                    interval = setTimeout(() => setMoreButtonVisible(false), 1000)
                }}
                onClick={() => {
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
                        type="subtle"
                        spacing="compact"
                        onClick={handleIconClick}
                        icon={
                            props.type == 'NOTE'
                                ? 'note'
                                : props.completed
                                ? 'todoChecked'
                                : 'todoUnchecked'
                        }
                    />
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
                <ProjectContainer visible={!hiddenIcons?.includes(ItemIcons.Project)}>
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
                </MoreContainer>

                <ParentItemContainer
                    data-tip
                    data-for={'parent-item-' + props.id}
                    visible={!hiddenIcons.includes(ItemIcons.Subtask) && props.parentId != null}
                >
                    <ItemAttribute
                        completed={props.completed}
                        type={'subtask'}
                        text={parentTaskText.short}
                    />
                    <Tooltip id={'parent-item-' + props.id} text={parentTaskText.long} />
                </ParentItemContainer>
                <ScheduledContainer
                    data-tip
                    data-for={'scheduled-date-' + props.id}
                    visible={
                        props.scheduledDate != null && !hiddenIcons?.includes(ItemIcons.Scheduled)
                    }
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
                    <ItemAttribute
                        completed={props.completed}
                        type={'due'}
                        text={dueDateText.short}
                    />
                    <Tooltip id={'due-date-' + props.id} text={dueDateText.long} />
                </DueContainer>
                <RepeatContainer
                    data-tip
                    data-for={'repeat-' + props.id}
                    visible={props.repeat != null && !hiddenIcons.includes(ItemIcons.Repeat)}
                >
                    <ItemAttribute
                        completed={props.completed}
                        type={'repeat'}
                        text={repeatText.short}
                    />
                    <Tooltip id={'repeat-' + props.id} text={repeatText.long} />
                </RepeatContainer>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state, props): StateProps => ({
    projects: state.projects,
    theme: state.ui.theme,
    labels: state.ui.labels.labels,
    subtasksVisible: state.ui.subtasksVisible,
    parentItem: getItemParentId(state, props),
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    updateItemDescription: (id: Uuid, text: string) => {
        dispatch(updateItemDescription(id, text))
    },
    uncompleteItem: (id: Uuid) => {
        dispatch(uncompleteItem(id))
    },
    completeItem: (id: Uuid) => {
        dispatch(completeItem(id))
    },
    undeleteItem: (id: Uuid) => {
        dispatch(undeleteItem(id))
    },
    deleteItem: (id: Uuid) => {
        dispatch(deleteItem(id))
    },
    setActiveItem: (id: Uuid) => {
        dispatch(setActiveItem(id))
    },
    showFocusbar: () => {
        dispatch(showFocusbar())
    },
    toggleSubtasks: (id: Uuid, componentId: Uuid) => {
        dispatch(toggleSubtasks(id, componentId))
    },
    deletePermanently: (id: Uuid) => {
        dispatch(deletePermanently(id))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Item)
