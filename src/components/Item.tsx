import React, { ReactElement, useState, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import { RRule } from 'rrule'
import { Uuid } from '@typed/uuid'
import { ItemType, Projects, Item, Label } from '../interfaces'
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
    LabelContainer,
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
} from '../actions'
import { themes } from '../theme'
import EditableText from './EditableText'
import {
    removeItemTypeFromString,
    formatRelativeDate,
    capitaliseFirstLetter,
    rruleToText,
} from '../utils'
import { parseISO, differenceInDays } from 'date-fns'
import Button from './Button'
import MoreDropdown from './MoreDropdown'
import Tooltip from './Tooltip'
import { getItemParentId } from '../selectors/item'
import { ItemAttribute } from './ItemAttribute'
//import { useHotkeys } from 'react-hotkeys-hook'

export enum ItemIcons {
    Due = 'due',
    Scheduled = 'scheduled',
    Repeat = 'repeat',
    Project = 'project',
    Subtask = 'subtask',
}

interface DispatchProps {
    updateItemDescription: (id: Uuid, text: string) => void
    completeItem: (id: Uuid) => void
    uncompleteItem: (id: Uuid) => void
    deleteItem: (id: Uuid) => void
    undeleteItem: (id: Uuid) => void
    setActiveItem: (id: Uuid) => void
    showFocusbar: () => void
    toggleSubtasks: (id: Uuid, componentId: Uuid) => void
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

    const editor = React.useRef<HTMLInputElement>()
    const container = React.useRef<HTMLInputElement>()

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

    const dueDateText = props.dueDate ? formatRelativeDate(parseISO(props.dueDate)) : ''
    const scheduledDateText = props.scheduledDate
        ? formatRelativeDate(parseISO(props.scheduledDate))
        : ''

    const repeatText = props.repeat
        ? capitaliseFirstLetter(rruleToText(RRule.fromString(props.repeat)))
        : 'Repeat'

    const parentTaskText = props.parentId ? removeItemTypeFromString(props.parentItem.text) : ''

    const labelName = props.labelId ? props.labels[props.labelId].name : null
    const labelId = props.labelId ? props.labels[props.labelId].id : null
    const labelColour = props.labelId ? props.labels[props.labelId].colour : null

    // Make it invisible if it has a parent which is hiding subtasks
    const isVisible = (() => {
        if (props.parentId != null) {
            const parentVisibility = props.subtasksVisible[props.parentId]
            if (parentVisibility != undefined) {
                const componentVisibility = parentVisibility[props.componentId]
                if (componentVisibility != undefined) {
                    return componentVisibility
                }
                return true
            }
            return true
        }
        return true
    })()
    const subtasksVisible = (() => {
        const itemVisibility = props.subtasksVisible[props.id]
        if (itemVisibility != undefined) {
            const componentVisibility = itemVisibility[props.componentId]
            if (componentVisibility) return componentVisibility
            return false
        }
        return false
    })()
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <div key={props.id} id={props.id}>
                <Container
                    key={props.id}
                    ref={container}
                    shouldIndent={props.shouldIndent}
                    visible={isVisible || props.alwaysVisible}
                    id={props.id}
                    tabIndex={0}
                    onClick={() => {
                        props.showFocusbar()
                        props.setActiveItem(props.id)
                    }}
                    itemType={props.type}
                    labelColour={labelColour}
                >
                    {props.children?.length > 0 && (
                        <ExpandContainer>
                            <Button
                                type="subtleInvert"
                                onClick={handleExpand}
                                icon={'expand'}
                                rotate={subtasksVisible == false ? 0 : 1}
                            ></Button>
                        </ExpandContainer>
                    )}
                    <LabelContainer
                        data-tip
                        data-for={'label-' + props.id}
                        stale={differenceInDays(parseISO(props.lastUpdatedAt), new Date()) > 7}
                        labelColour={labelColour}
                    />
                    {labelId && <Tooltip id={'label-' + props.id} text={labelName}></Tooltip>}
                    <TypeContainer>
                        <Button
                            type="subtleInvert"
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
                    <Body id="body" completed={props.completed}>
                        <EditableText
                            validation={false}
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
                        <ProjectName>
                            {props.projectId != '0'
                                ? props.projects.projects[props.projectId].name
                                : 'Inbox'}
                        </ProjectName>
                    </ProjectContainer>

                    <MoreContainer visible={true}>
                        <MoreDropdown itemId={props.id} deleted={props.deleted}></MoreDropdown>
                    </MoreContainer>
                    <ParentItemContainer
                        visible={!hiddenIcons.includes(ItemIcons.Subtask) && props.parentId != null}
                    >
                        <ItemAttribute
                            completed={props.completed}
                            type={'subtask'}
                            text={parentTaskText}
                        />
                    </ParentItemContainer>
                    <ScheduledContainer
                        visible={
                            props.scheduledDate != null &&
                            !hiddenIcons?.includes(ItemIcons.Scheduled)
                        }
                    >
                        <ItemAttribute
                            completed={props.completed}
                            type={'scheduled'}
                            text={scheduledDateText}
                        />
                    </ScheduledContainer>
                    <DueContainer
                        visible={props.dueDate != null && !hiddenIcons.includes(ItemIcons.Due)}
                    >
                        <ItemAttribute
                            completed={props.completed}
                            type={'due'}
                            text={dueDateText}
                        />
                    </DueContainer>
                    <RepeatContainer
                        visible={props.repeat != null && !hiddenIcons.includes(ItemIcons.Repeat)}
                    >
                        <ItemAttribute
                            completed={props.completed}
                            type={'repeat'}
                            text={repeatText}
                        />
                    </RepeatContainer>
                </Container>
            </div>
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
})

export default connect(mapStateToProps, mapDispatchToProps)(Item)
