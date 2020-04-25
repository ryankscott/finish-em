import React, { KeyboardEvent, ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import { RRule } from 'rrule'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'
import { ItemType, ProjectType } from '../interfaces'
import {
    Body,
    Container,
    Project,
    QuickAdd,
    ExpandContainer,
    ScheduledContainer,
    DueContainer,
    RepeatContainer,
    TypeContainer,
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
} from '../actions'
import { theme } from '../theme'
import ProjectDropdown from './ProjectDropdown'
import EditableItem from './EditableItem'
import DatePicker from './DatePicker'
import RepeatPicker from './RepeatPicker'
import EditableText from './EditableText'
import DateRenderer from './DateRenderer'
import {
    getProjectNameById,
    removeItemTypeFromString,
    formatRelativeDate,
    rruleToText,
} from '../utils'
import { parseISO } from 'date-fns'
import { Button } from './Button'

interface ItemProps extends ItemType {
    noIndentOnSubtasks: boolean
    showProject: boolean
    keymap: {}
    projects: ProjectType[]
    items: ItemType
    updateItemDescription: (id: Uuid, text: string) => void
    setRepeatRule: (id: Uuid, rule: RRule) => void
    setScheduledDate: (id: Uuid, date: Date) => void
    setDueDate: (id: Uuid, date: Date) => void
    completeItem: (id: Uuid) => void
    uncompleteItem: (id: Uuid) => void
    moveItem: (id: Uuid, projectId: Uuid) => void
    createSubTask: (id: Uuid, text: string, projectId: Uuid) => void
    deleteItem: (id: Uuid) => void
    undeleteItem: (id: Uuid) => void
}

function Item(props: ItemProps): ReactElement {
    const [projectDropdownVisible, setProjectDropdownVisible] = useState(false)
    const [
        scheduledDateDropdownVisible,
        setScheduledDateDropdownVisible,
    ] = useState(false)
    const [dueDateDropdownVisible, setDueDateDropdownVisible] = useState(false)
    const [repeatDropdownVisible, setRepeatDropdownVisible] = useState(false)
    const [
        createSubtaskDropdownVisible,
        setCreateSubtaskDropdownVisible,
    ] = useState(false)
    const [isEditingDescription, setIsEditingDescription] = useState(false)
    const [hideChildren, setHideChildren] = useState(false)
    const [keyPresses, setKeyPresses] = useState([])

    const quickAdd = React.createRef<HTMLInputElement>()
    const editor = React.createRef<HTMLInputElement>()
    const container = React.createRef<HTMLInputElement>()
    const handlers = {
        TODO: {
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
                setScheduledDateDropdownVisible(!scheduledDateDropdownVisible)
                setDueDateDropdownVisible(false)
                setProjectDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setCreateSubtaskDropdownVisible(false)
                event.preventDefault()
            },
            SET_DUE_DATE: (event) => {
                if (props.deleted || props.completed) return
                setScheduledDateDropdownVisible(false)
                setDueDateDropdownVisible(!dueDateDropdownVisible)
                setProjectDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setCreateSubtaskDropdownVisible(false)
                event.preventDefault()
            },
            CREATE_SUBTASK: (event) => {
                if (props.deleted || props.completed) return
                setScheduledDateDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setProjectDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setCreateSubtaskDropdownVisible(!createSubtaskDropdownVisible)
                quickAdd.current.focus()
                event.preventDefault()
            },
            REPEAT_ITEM: (event) => {
                if (props.deleted || props.completed) return
                setScheduledDateDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setProjectDropdownVisible(false)
                setRepeatDropdownVisible(!repeatDropdownVisible)
                setCreateSubtaskDropdownVisible(false)
                event.preventDefault()
            },
            MOVE_ITEM: (event) => {
                if (props.deleted || props.completed) return
                setScheduledDateDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setProjectDropdownVisible(!projectDropdownVisible)
                setRepeatDropdownVisible(false)
                setCreateSubtaskDropdownVisible(false)
                event.preventDefault()
            },
            ESCAPE: () => {
                setScheduledDateDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setProjectDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setCreateSubtaskDropdownVisible(false)
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
                editor.current.focus()
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
                setScheduledDateDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setProjectDropdownVisible(!projectDropdownVisible)
                setRepeatDropdownVisible(false)
                setCreateSubtaskDropdownVisible(false)
                event.preventDefault()
            },
            ESCAPE: () => {
                setScheduledDateDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setProjectDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setCreateSubtaskDropdownVisible(false)
            },
            EDIT_ITEM_DESC: (event) => {
                setIsEditingDescription(true)
                //                editor.current.focus()
                event.preventDefault()
            },
        },
    }

    const handleDescriptionChange = (text: string): void => {
        props.updateItemDescription(props.id, props.type.concat(' ', text))
        return
    }

    const setRepeatRule = (r: RRule): void => {
        props.setRepeatRule(props.id, r)
        setRepeatDropdownVisible(false)
        return
    }

    const setScheduledDate = (d: string): void => {
        props.setScheduledDate(props.id, d)
        setScheduledDateDropdownVisible(false)
        return
    }

    const setDueDate = (d: string): void => {
        props.setDueDate(props.id, d)
        setDueDateDropdownVisible(false)
        return
    }

    const moveItem = (projectId: Uuid): void => {
        props.moveItem(props.id, projectId)
        setProjectDropdownVisible(false)
        return
    }

    const createSubTask = (text: string): void => {
        props.createSubTask(props.id, text, props.projectId)
        setCreateSubtaskDropdownVisible(false)
        return
    }
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
    const handleIconClick = (): void => {
        if (props.type == 'TODO') {
            props.completed
                ? props.uncompleteItem(props.id)
                : props.completeItem(props.id)
        }
        return
    }

    const handleExpand = (): void => {
        setHideChildren(!hideChildren)
        return
    }

    const repeat = props.repeat
        ? rruleToText(RRule.fromString(props.repeat))
        : ''
    const dueDate = props.dueDate
        ? formatRelativeDate(parseISO(props.dueDate))
        : null
    const scheduledDate = props.scheduledDate
        ? formatRelativeDate(parseISO(props.scheduledDate))
        : null

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
                    itemType={props.type}
                >
                    {props.children.length > 0 && (
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
                            readOnly={props.completed}
                            onEditingChange={(editing) =>
                                setIsEditingDescription(editing)
                            }
                            input={removeItemTypeFromString(props.text)}
                            onUpdate={(text) => handleDescriptionChange(text)}
                            singleline={true}
                        />
                    </Body>
                    {props.showProject && (
                        <Project>
                            {props.showProject
                                ? getProjectNameById(
                                      props.projectId,
                                      props.projects,
                                  )
                                : 'null'}
                        </Project>
                    )}
                    {props.scheduledDate && (
                        <ScheduledContainer>
                            <DateRenderer
                                completed={props.completed}
                                type="scheduled"
                                position="flex-start"
                                text={scheduledDate}
                                onClick={() => {
                                    if (props.completed) return
                                    setScheduledDateDropdownVisible(
                                        !scheduledDateDropdownVisible,
                                    )
                                }}
                            />
                        </ScheduledContainer>
                    )}
                    {props.dueDate && (
                        <DueContainer>
                            <DateRenderer
                                completed={props.completed}
                                type="due"
                                position="center"
                                text={dueDate}
                                onClick={() => {
                                    if (props.completed) return
                                    setDueDateDropdownVisible(
                                        !dueDateDropdownVisible,
                                    )
                                }}
                            />
                        </DueContainer>
                    )}
                    {props.repeat && (
                        <RepeatContainer>
                            <DateRenderer
                                completed={props.completed}
                                type="repeat"
                                position="flex-end"
                                text={repeat}
                                onClick={() => {
                                    if (props.completed) return
                                    setRepeatDropdownVisible(
                                        !repeatDropdownVisible,
                                    )
                                }}
                            />
                        </RepeatContainer>
                    )}
                </Container>
                <QuickAdd visible={createSubtaskDropdownVisible}>
                    <EditableItem
                        text=""
                        innerRef={quickAdd}
                        readOnly={false}
                        onSubmit={(text) => createSubTask(text)}
                        onEscape={() => setCreateSubtaskDropdownVisible(false)}
                    />
                </QuickAdd>
                {scheduledDateDropdownVisible && (
                    <DatePicker
                        key={'sd' + props.id}
                        placeholder={'Schedule to: '}
                        onSubmit={setScheduledDate}
                        onEscape={() => setScheduledDateDropdownVisible(false)}
                    />
                )}
                {dueDateDropdownVisible && (
                    <DatePicker
                        key={'dd' + props.id}
                        placeholder={'Due on: '}
                        onSubmit={setDueDate}
                        onEscape={() => setDueDateDropdownVisible(false)}
                    />
                )}
                {repeatDropdownVisible && (
                    <RepeatPicker
                        key={'rp' + props.id}
                        placeholder={'Repeat: '}
                        onSubmit={setRepeatRule}
                        onEscape={() => setRepeatDropdownVisible(false)}
                    />
                )}
                {projectDropdownVisible && (
                    <ProjectDropdown
                        key={'p' + props.id}
                        placeholder={'Move to: '}
                        onSubmit={moveItem}
                        onEscape={() => setProjectDropdownVisible(false)}
                    />
                )}
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
                        />
                    )
                })}
        </ThemeProvider>
    )
}

const mapStateToProps = (state) => ({
    projects: state.projects,
    items: state.items,
})
const mapDispatchToProps = (dispatch) => ({
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
})

export default connect(mapStateToProps, mapDispatchToProps)(Item)
