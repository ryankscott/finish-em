import React, { KeyboardEvent, ReactElement, useState, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import { RRule } from 'rrule'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'
import { ItemType, ProjectType, Items } from '../interfaces'
import {
    Body,
    Container,
    QuickAdd,
    ExpandContainer,
    ScheduledContainer,
    DueContainer,
    RepeatContainer,
    TypeContainer,
    ProjectContainer,
} from './styled/Item'

import {
    addChildItem,
    createItem,
    moveItem,
    updateItemDescription,
    completeItem,
    deleteItem,
    undeleteItem,
    uncompleteItem,
    setScheduledDate,
    setRepeatRule,
    setDueDate,
    setActiveItem,
    showFocusbar,
} from '../actions'
import { theme } from '../theme'
import ProjectDropdown from './ProjectDropdown'
import EditableItem from './EditableItem'
import DatePicker from './DatePicker'
import RepeatPicker from './RepeatPicker'
import EditableText from './EditableText'
import {
    removeItemTypeFromString,
    formatRelativeDate,
    rruleToText,
} from '../utils'
import { parseISO } from 'date-fns'
import { Button } from './Button'
//import { useHotkeys } from 'react-hotkeys-hook'

interface DispatchProps {
    updateItemDescription: (id: Uuid, text: string) => void
    setRepeatRule: (id: Uuid, rule: RRule) => void
    setScheduledDate: (id: Uuid, date: string) => void
    setDueDate: (id: Uuid, date: string) => void
    completeItem: (id: Uuid) => void
    uncompleteItem: (id: Uuid) => void
    moveItem: (id: Uuid, projectId: Uuid) => void
    createSubTask: (id: Uuid, text: string, projectId: Uuid) => void
    deleteItem: (id: Uuid) => void
    undeleteItem: (id: Uuid) => void
    setActiveItem: (id: Uuid) => void
    showFocusbar: () => void
}
interface StateProps {
    projects: ProjectType[]
    items: Items
}

export enum ItemProperties {
    Due = 'due',
    Repeat = 'repeat',
    Scheduled = 'scheduled',
}

interface OwnProps extends ItemType {
    hideIcons?: boolean
    noIndentOnSubtasks: boolean
    showProject: boolean
    keymap: {}
}

type ItemProps = OwnProps & StateProps & DispatchProps

function Item(props: ItemProps): ReactElement {
    const [
        createSubtaskDropdownVisible,
        setCreateSubtaskDropdownVisible,
    ] = useState(false)
    const [dueDateDropdownVisible, setDueDateDropdownVisible] = useState(false)
    const [
        scheduledDateDropdownVisible,
        setScheduledDateDropdownVisible,
    ] = useState(false)
    const [repeatDropdownVisible, setRepeatDropdownVisible] = useState(false)
    const [isEditingDescription, setIsEditingDescription] = useState(false)
    const [hideChildren, setHideChildren] = useState(false)
    const [keyPresses, setKeyPresses] = useState([])
    const [isDescriptionReadOnly, setIsDescriptionReadOnly] = useState(true)
    const [projectDropdownVisible, setProjectDropdownVisible] = useState(false)

    const quickAdd = React.createRef<HTMLInputElement>()
    const editor = React.createRef<HTMLInputElement>()
    const container = React.createRef<HTMLInputElement>()
    const handlers = {
        TODO: {
            SET_ACTIVE_ITEM: () => {
                props.showFocusbar()
                props.setActiveItem(props.id)
                return
            },
            NEXT_ITEM: (event) => {
                // If it's a parent element we need to get the first child
                if (props.children.length > 0) {
                    const nextItem = event.target.parentNode.nextSibling
                    if (nextItem) {
                        nextItem.firstChild.focus()
                        return
                    }
                }
                // If it's a child
                if (props.parentId != null) {
                    const nextItem = event.target.parentNode.nextSibling
                    if (nextItem) {
                        nextItem.firstChild.focus()
                        return
                    }
                    // If it's the last child
                    else {
                        const nextItem =
                            event.target.parentNode.parentNode.nextSibling
                                .firstChild
                        if (nextItem) {
                            nextItem.firstChild.focus()
                            return
                        }
                    }
                }
                const parent = event.target.parentNode.parentNode
                const nextItem = parent.nextSibling
                if (nextItem) {
                    nextItem.firstChild.firstChild.focus()
                    return
                }
            },
            PREV_ITEM: (event) => {
                if (props.children.length > 0) {
                    const prevItem = event.target.parentNode.previousSibling
                    if (prevItem) {
                        prevItem.firstChild.focus()
                        return
                    }
                }
                // If it's a child
                if (props.parentId != null) {
                    const nextItem = event.target.parentNode.previousSibling
                    if (nextItem) {
                        nextItem.firstChild.focus()
                        return
                    }
                    // If it's the last child
                    else {
                        const prevItem =
                            event.target.parentNode.parentNode.previousSibling
                                .firstChild
                        if (prevItem) {
                            prevItem.firstChild.focus()
                            return
                        }
                    }
                }
                // TODO: Fix issue for first item
                const parent = event.target.parentNode.parentNode
                const prevItem = parent.previousSibling.firstChild
                if (prevItem) {
                    prevItem.firstChild.focus()
                    return
                }
            },
            TOGGLE_CHILDREN: () => {
                setHideChildren(!hideChildren)
            },
            SET_SCHEDULED_DATE: (event) => {
                if (props.deleted || props.completed) return
                setCreateSubtaskDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setScheduledDateDropdownVisible(true)
                setRepeatDropdownVisible(false)
                setProjectDropdownVisible(false)
                event.preventDefault()
            },
            SET_DUE_DATE: (event) => {
                if (props.deleted || props.completed) return
                setCreateSubtaskDropdownVisible(false)
                setDueDateDropdownVisible(true)
                setScheduledDateDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setProjectDropdownVisible(false)
                event.preventDefault()
            },
            CREATE_SUBTASK: (event) => {
                if (props.deleted || props.completed || props.parentId != null)
                    return
                setCreateSubtaskDropdownVisible(!createSubtaskDropdownVisible)
                setDueDateDropdownVisible(false)
                setScheduledDateDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setProjectDropdownVisible(false)
                quickAdd.current.focus()
                event.preventDefault()
            },
            REPEAT_ITEM: (event) => {
                if (props.deleted || props.completed) return
                setCreateSubtaskDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setScheduledDateDropdownVisible(false)
                setRepeatDropdownVisible(true)
                setProjectDropdownVisible(false)
                event.preventDefault()
            },
            MOVE_ITEM: (event) => {
                if (props.deleted || props.completed) return
                setCreateSubtaskDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setScheduledDateDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setProjectDropdownVisible(true)
                event.preventDefault()
            },
            ESCAPE: () => {
                setCreateSubtaskDropdownVisible(false)
                setCreateSubtaskDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setScheduledDateDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setProjectDropdownVisible(false)
                container.current.focus()
            },
            COMPLETE_ITEM: () => {
                if (props.deleted || props.completed) return
                props.completeItem(props.id)
            },
            UNCOMPLETE_ITEM: () => {
                if (props.deleted) return
                props.uncompleteItem(props.id)
            },
            DELETE_ITEM: () => {
                if (props.deleted) return
                props.deleteItem(props.id)
            },
            UNDELETE_ITEM: () => {
                props.undeleteItem(props.id)
            },
            EDIT_ITEM_DESC: (event) => {
                setIsEditingDescription(true)
                setIsDescriptionReadOnly(false)
                event.preventDefault()
            },
        },
        NOTE: {
            NEXT_ITEM: (event) => {
                // If it's a parent element we need to get the first child
                if (props.children.length > 0) {
                    const nextItem = event.target.parentNode.nextSibling
                    if (nextItem) {
                        nextItem.firstChild.focus()
                        return
                    }
                }
                // If it's a child
                if (props.parentId != null) {
                    const nextItem = event.target.parentNode.nextSibling
                    if (nextItem) {
                        nextItem.firstChild.focus()
                        return
                    }
                    // If it's the last child
                    else {
                        const nextItem =
                            event.target.parentNode.parentNode.nextSibling
                                .firstChild
                        if (nextItem) {
                            nextItem.firstChild.focus()
                            return
                        }
                    }
                }
                const parent = event.target.parentNode.parentNode
                const nextItem = parent.nextSibling
                if (nextItem) {
                    nextItem.firstChild.firstChild.focus()
                    return
                }
            },
            PREV_ITEM: (event) => {
                if (props.children.length > 0) {
                    const prevItem = event.target.parentNode.previousSibling
                    if (prevItem) {
                        prevItem.firstChild.focus()
                        return
                    }
                }
                // If it's a child
                if (props.parentId != null) {
                    const nextItem = event.target.parentNode.previousSibling
                    if (nextItem) {
                        nextItem.firstChild.focus()
                        return
                    }
                    // If it's the last child
                    else {
                        const prevItem =
                            event.target.parentNode.parentNode.previousSibling
                                .firstChild
                        if (prevItem) {
                            prevItem.firstChild.focus()
                            return
                        }
                    }
                }
                // TODO: Fix issue for first item
                const parent = event.target.parentNode.parentNode
                const prevItem = parent.previousSibling.firstChild
                if (prevItem) {
                    prevItem.firstChild.focus()
                    return
                }
            },
            DELETE_ITEM: () => {
                props.deleteItem(props.id)
            },
            UNDELETE_ITEM: () => {
                props.undeleteItem(props.id)
            },
            MOVE_ITEM: (event) => {
                if (props.deleted) return
                setCreateSubtaskDropdownVisible(false)
                event.preventDefault()
            },
            ESCAPE: () => {
                setCreateSubtaskDropdownVisible(false)
            },
            EDIT_ITEM_DESC: (event) => {
                setIsEditingDescription(true)
                //                editor.current.focus()
                event.preventDefault()
            },
        },
    }

    useEffect(() => {
        if (!isDescriptionReadOnly) {
            editor.current.focus()
        }
    }, [isDescriptionReadOnly])

    /* TODO: Try move this to somewhere central
    Not to future self - You've tried
     -  To extract this as hooks (useHotkeys.tsx)
     - react-hotkey-hooks
     
    They all have the same problem of binding to *all* the item components in the DOM :(
    */

    const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>): void => {
        // Don't handle key presses if we're editing the description
        if (isEditingDescription) return
        let currentKeyPresses = keyPresses
        // Remove the first value in the array (3 is the max shortcut matching length)
        currentKeyPresses =
            currentKeyPresses.length >= 3
                ? currentKeyPresses.slice(1)
                : currentKeyPresses
        currentKeyPresses.push(event.key)
        // Clear keypress history if using the arrow keys. Enables quick scrolling
        if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
            setTimeout(() => {
                setKeyPresses([])
            }, 200)
            // After 1s remove the first item in the array
        } else {
            setTimeout(() => {
                setKeyPresses(keyPresses.slice(1))
            }, 500)
        }
        // TODO handle not matching
        // TODO handle multiple key bindings for each action
        for (const [key, value] of Object.entries(props.keymap)) {
            currentKeyPresses.forEach((k, v) => {
                if (v < currentKeyPresses.length) {
                    const combo = k + ' ' + currentKeyPresses[v + 1]
                    if (combo == value) {
                        const handler = handlers[props.type][key]
                        handler ? handler(event) : null
                        return
                    }
                    const single = k
                    if (single == value) {
                        const handler = handlers[props.type][key]
                        handler ? handler(event) : null
                        return
                    }
                }
            })
        }
        return
    }

    const handleIconClick = (e): void => {
        e.stopPropagation()
        if (props.type == 'TODO') {
            props.completed
                ? props.uncompleteItem(props.id)
                : props.completeItem(props.id)
        }
        return
    }

    const handleExpand = (e): void => {
        e.stopPropagation()
        setHideChildren(!hideChildren)
        return
    }

    const repeatText = props.repeat
        ? rruleToText(RRule.fromString(props.repeat))
        : ''
    const dueDateText = props.dueDate
        ? formatRelativeDate(parseISO(props.dueDate))
        : ''
    const scheduledDateText = props.scheduledDate
        ? formatRelativeDate(parseISO(props.scheduledDate))
        : ''
    return (
        <ThemeProvider theme={theme}>
            <div key={props.id} id={props.id}>
                <Container
                    key={props.id}
                    ref={container}
                    noIndentOnSubtasks={props.noIndentOnSubtasks}
                    isSubtask={props.parentId != null}
                    onKeyDown={handleKeyPress}
                    id={props.id}
                    tabIndex={0}
                    onClick={() => {
                        props.showFocusbar()
                        props.setActiveItem(props.id)
                    }}
                    itemType={props.type}
                >
                    {props.children?.length > 0 && (
                        <ExpandContainer>
                            <Button
                                type="default"
                                spacing="compact"
                                onClick={handleExpand}
                                icon={hideChildren ? 'expand' : 'collapse'}
                            ></Button>
                        </ExpandContainer>
                    )}
                    <TypeContainer>
                        <Button
                            type="default"
                            spacing="compact"
                            onClick={handleIconClick}
                            height="24px"
                            width="24px"
                            icon={
                                props.type == 'NOTE'
                                    ? 'note'
                                    : props.completed
                                    ? 'todo_checked'
                                    : 'todo_unchecked'
                            }
                        />
                    </TypeContainer>
                    <Body id="body" completed={props.completed}>
                        <EditableText
                            innerRef={editor}
                            readOnly={isDescriptionReadOnly}
                            onEditingChange={(editing) =>
                                setIsEditingDescription(editing)
                            }
                            input={removeItemTypeFromString(props.text)}
                            onUpdate={(text) => {
                                setIsDescriptionReadOnly(true)
                                props.updateItemDescription(
                                    props.id,
                                    props.type.concat(' ', text),
                                )
                            }}
                            singleline={true}
                        />
                    </Body>
                    <ProjectContainer visible={true}>
                        <ProjectDropdown
                            showSelect={projectDropdownVisible}
                            disableClick={true}
                            projectId={props.projectId}
                            completed={props.completed}
                            onSubmit={(projectId) => {
                                props.moveItem(props.id, projectId)
                            }}
                        />
                    </ProjectContainer>
                    <ScheduledContainer
                        visible={
                            scheduledDateDropdownVisible ||
                            props.scheduledDate != null
                        }
                    >
                        <DatePicker
                            showSelect={scheduledDateDropdownVisible}
                            disableClick={true}
                            key={'sd' + props.id}
                            style={'subtleInvert'}
                            placeholder={'Scheduled on: '}
                            onSubmit={(d) => {
                                props.setScheduledDate(props.id, d)
                                setScheduledDateDropdownVisible(false)
                            }}
                            type="scheduled"
                            text={scheduledDateText}
                            completed={props.completed}
                        />
                    </ScheduledContainer>
                    <DueContainer
                        visible={
                            dueDateDropdownVisible || props.dueDate != null
                        }
                    >
                        <DatePicker
                            showSelect={dueDateDropdownVisible}
                            disableClick={true}
                            style={'subtleInvert'}
                            key={'dd' + props.id}
                            placeholder={'Due on: '}
                            onSubmit={(d) => {
                                props.setDueDate(props.id, d)
                                setDueDateDropdownVisible(false)
                            }}
                            type="due"
                            text={dueDateText}
                            completed={props.completed}
                        />
                    </DueContainer>
                    <RepeatContainer
                        visible={repeatDropdownVisible || props.repeat != null}
                    >
                        <RepeatPicker
                            showSelect={repeatDropdownVisible}
                            disableClick={true}
                            style={'subtleInvert'}
                            completed={props.completed}
                            text={repeatText}
                            key={'rp' + props.id}
                            placeholder={'Repeat: '}
                            onSubmit={(r) => {
                                setRepeatDropdownVisible(false)
                                props.setRepeatRule(props.id, r)
                            }}
                        />
                    </RepeatContainer>
                </Container>
                <QuickAdd visible={createSubtaskDropdownVisible}>
                    <EditableItem
                        text=""
                        innerRef={quickAdd}
                        readOnly={false}
                        onSubmit={(text) => {
                            props.createSubTask(props.id, text, props.projectId)
                            setCreateSubtaskDropdownVisible(false)
                        }}
                        onEscape={() => setCreateSubtaskDropdownVisible(false)}
                    />
                </QuickAdd>
            </div>
            {!hideChildren &&
                props.children?.map((c) => {
                    const childItem = props.items.items[c]
                    // Sometimes the child item has been filtered out, so we don't want to render an empty container
                    if (!childItem) return
                    return (
                        <Item
                            {...childItem}
                            key={c}
                            items={props.items}
                            noIndentOnSubtasks={props.noIndentOnSubtasks}
                            showProject={props.showProject}
                            keymap={props.keymap}
                            projects={props.projects}
                            updateItemDescription={props.updateItemDescription}
                            setScheduledDate={props.setScheduledDate}
                            setDueDate={props.setDueDate}
                            setRepeatRule={props.setRepeatRule}
                            moveItem={props.moveItem}
                            completeItem={props.completeItem}
                            uncompleteItem={props.uncompleteItem}
                            createSubTask={props.createSubTask}
                            deleteItem={props.deleteItem}
                            undeleteItem={props.undeleteItem}
                            showFocusbar={props.showFocusbar}
                            setActiveItem={props.setActiveItem}
                        />
                    )
                })}
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    projects: state.projects,
    items: state.items,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    createSubTask: (parentId: Uuid, text: string, projectId: Uuid) => {
        const childId = uuidv4()
        dispatch(createItem(childId, text, projectId))
        dispatch(addChildItem(childId, parentId))
    },
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
    moveItem: (id: Uuid, projectId: Uuid) => {
        dispatch(moveItem(id, projectId))
    },
    setScheduledDate: (id: Uuid, date: string) => {
        dispatch(setScheduledDate(id, date))
    },
    setDueDate: (id: Uuid, date: string) => {
        dispatch(setDueDate(id, date))
    },
    setRepeatRule: (id: Uuid, rule: RRule) => {
        dispatch(setRepeatRule(id, rule))
    },
    setActiveItem: (id: Uuid) => {
        dispatch(setActiveItem(id))
    },
    showFocusbar: () => {
        dispatch(showFocusbar())
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Item)
