import React, { KeyboardEvent, ReactElement, useState, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import { RRule } from 'rrule'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'
import { ItemType, ProjectType, Item, Label } from '../interfaces'
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
    ParentItemContainer,
    MoreContainer,
    LabelContainer,
    ProjectName,
    AttributeContainer,
    AttributeIcon,
    AttributeText,
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
    changeParentItem,
    convertSubtask,
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
import ItemCreator from './ItemCreator'
import MoreDropdown from './MoreDropdown'
import Tooltip from './Tooltip'
import { getAllItems } from '../selectors/item'
import { scheduledIcon, dueIcon, repeatIcon } from '../assets/icons'
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
    setRepeatRule: (id: Uuid, rule: RRule) => void
    setScheduledDate: (id: Uuid, date: string) => void
    setDueDate: (id: Uuid, date: string) => void
    completeItem: (id: Uuid) => void
    uncompleteItem: (id: Uuid) => void
    moveItem: (id: Uuid, projectId: Uuid | '0') => void
    createSubTask: (id: Uuid, text: string, projectId: Uuid) => void
    deleteItem: (id: Uuid) => void
    undeleteItem: (id: Uuid) => void
    setActiveItem: (id: Uuid) => void
    showFocusbar: () => void
    convertSubtask: (id: Uuid) => void
    changeParentItem: (id: Uuid, parentId: Uuid) => void
}
interface StateProps {
    projects: ProjectType[]
    items: Item
    theme: string
    labels: Label
}

interface OwnProps extends ItemType {
    hideIcons: ItemIcons[]
    noIndentOnSubtasks: boolean
    keymap?: {}
}

type ItemProps = OwnProps & StateProps & DispatchProps

function Item(props: ItemProps): ReactElement {
    const [
        createSubtaskDropdownVisible,
        setCreateSubtaskDropdownVisible,
    ] = useState(false)
    const [
        convertSubtaskDropdownVisible,
        setConvertSubtaskDropdownVisible,
    ] = useState(false)
    const [dueDateDropdownVisible, setDueDateDropdownVisible] = useState(false)
    const [
        scheduledDateDropdownVisible,
        setScheduledDateDropdownVisible,
    ] = useState(false)
    const [repeatDropdownVisible, setRepeatDropdownVisible] = useState(false)
    const [isEditingDescription, setIsEditingDescription] = useState(false)
    const [hideChildren, setHideChildren] = useState(true)
    const [keyPresses, setKeyPresses] = useState([])
    const [isDescriptionReadOnly, setIsDescriptionReadOnly] = useState(true)
    const [projectDropdownVisible, setProjectDropdownVisible] = useState(false)
    const [moreDropdownVisible, setMoreDropdownVisible] = useState(false)

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
                setConvertSubtaskDropdownVisible(false)
                event.preventDefault()
            },
            SET_DUE_DATE: (event) => {
                if (props.deleted || props.completed) return
                setCreateSubtaskDropdownVisible(false)
                setDueDateDropdownVisible(true)
                setScheduledDateDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setProjectDropdownVisible(false)
                setConvertSubtaskDropdownVisible(false)
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
                setConvertSubtaskDropdownVisible(false)
                quickAdd.current.focus()
                event.preventDefault()
            },
            CONVERT_TO_SUBTASK: (event) => {
                if (props.deleted || props.completed) return
                setCreateSubtaskDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setScheduledDateDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setProjectDropdownVisible(false)
                setConvertSubtaskDropdownVisible(true)
                event.preventDefault()
            },
            REPEAT_ITEM: (event) => {
                if (props.deleted || props.completed) return
                setCreateSubtaskDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setScheduledDateDropdownVisible(false)
                setRepeatDropdownVisible(true)
                setProjectDropdownVisible(false)
                setConvertSubtaskDropdownVisible(false)
                event.preventDefault()
            },
            MOVE_ITEM: (event) => {
                if (props.deleted || props.completed) return
                setCreateSubtaskDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setScheduledDateDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setProjectDropdownVisible(true)
                setConvertSubtaskDropdownVisible(false)
                event.preventDefault()
            },
            ESCAPE: () => {
                setCreateSubtaskDropdownVisible(false)
                setDueDateDropdownVisible(false)
                setScheduledDateDropdownVisible(false)
                setRepeatDropdownVisible(false)
                setProjectDropdownVisible(false)
                setConvertSubtaskDropdownVisible(false)
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
                console.log('deleting')
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
                setProjectDropdownVisible(true)
                event.preventDefault()
            },
            ESCAPE: () => {
                setProjectDropdownVisible(false)
            },
            EDIT_ITEM_DESC: (event) => {
                setIsEditingDescription(true)
                setIsDescriptionReadOnly(false)
                event.preventDefault()
            },
        },
    }

    const hiddenIcons = props.hideIcons || []

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
        // Don't handle key presses if we're changing anything
        if (
            isEditingDescription ||
            createSubtaskDropdownVisible ||
            dueDateDropdownVisible ||
            scheduledDateDropdownVisible ||
            repeatDropdownVisible ||
            projectDropdownVisible ||
            convertSubtaskDropdownVisible ||
            moreDropdownVisible
        )
            return

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

    const dueDateText = props.dueDate
        ? formatRelativeDate(parseISO(props.dueDate))
        : ''
    const scheduledDateText = props.scheduledDate
        ? formatRelativeDate(parseISO(props.scheduledDate))
        : ''
    const repeatText = props.repeat
        ? capitaliseFirstLetter(rruleToText(props.repeat))
        : 'Repeat'

    const parentTaskText = props.parentId
        ? removeItemTypeFromString(props.items[props.parentId].text)
        : ''

    const labelName = props.labelId ? props.labels[props.labelId].name : null
    const labelId = props.labelId ? props.labels[props.labelId].id : null
    const labelColour = props.labelId
        ? props.labels[props.labelId].colour
        : null
    let moreDropdownTimeout = null
    console.log(props.projectId != '0')
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <div key={props.id} id={props.id}>
                <Container
                    onMouseEnter={() => {
                        setMoreDropdownVisible(true)
                        clearTimeout(moreDropdownTimeout)
                    }}
                    onMouseLeave={() => {
                        moreDropdownTimeout = setTimeout(() => {
                            setMoreDropdownVisible(false)
                        }, 1000)
                    }}
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
                    labelColour={labelColour}
                >
                    {props.children?.length > 0 && (
                        <ExpandContainer>
                            <Button
                                type="subtleInvert"
                                onClick={handleExpand}
                                icon={'expand'}
                                rotate={hideChildren == true ? 0 : 1}
                            ></Button>
                        </ExpandContainer>
                    )}
                    <LabelContainer
                        data-tip
                        data-for={'label-' + props.id}
                        stale={
                            differenceInDays(
                                parseISO(props.lastUpdatedAt),
                                new Date(),
                            ) > 7
                        }
                        labelColour={labelColour}
                    />
                    {labelId && (
                        <Tooltip
                            id={'label-' + props.id}
                            text={labelName}
                        ></Tooltip>
                    )}
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
                            validation={{ validate: false }}
                            shouldSubmitOnBlur={true}
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
                            singleline={props.type == 'NOTE' ? false : true}
                            shouldClearOnSubmit={false}
                        />
                    </Body>
                    <ProjectContainer
                        visible={
                            projectDropdownVisible ||
                            !hiddenIcons?.includes(ItemIcons.Project)
                        }
                    >
                        <ProjectName>
                            {props.projectId != '0'
                                ? props.projects[props.projectId]
                                : 'Inbox'}
                        </ProjectName>
                    </ProjectContainer>

                    <MoreContainer visible={moreDropdownVisible}>
                        <MoreDropdown
                            itemId={props.id}
                            deleted={props.deleted}
                        ></MoreDropdown>
                    </MoreContainer>
                    <ParentItemContainer
                        visible={
                            !hiddenIcons.includes(ItemIcons.Subtask) &&
                            (convertSubtaskDropdownVisible ||
                                props.parentId != null)
                        }
                    >
                        <AttributeContainer completed={props.completed}>
                            <AttributeIcon> {repeatIcon(14, 14)}</AttributeIcon>
                            <AttributeText>{parentTaskText}</AttributeText>
                        </AttributeContainer>
                    </ParentItemContainer>
                    <ScheduledContainer
                        visible={
                            (scheduledDateDropdownVisible ||
                                props.scheduledDate != null) &&
                            !hiddenIcons?.includes(ItemIcons.Scheduled)
                        }
                    >
                        <AttributeContainer completed={props.completed}>
                            <AttributeIcon>
                                {scheduledIcon(14, 14)}
                            </AttributeIcon>
                            <AttributeText>{scheduledDateText}</AttributeText>
                        </AttributeContainer>
                    </ScheduledContainer>
                    <DueContainer
                        visible={
                            (dueDateDropdownVisible || props.dueDate != null) &&
                            !hiddenIcons.includes(ItemIcons.Due)
                        }
                    >
                        <AttributeContainer completed={props.completed}>
                            <AttributeIcon> {dueIcon(14, 14)}</AttributeIcon>
                            <AttributeText>{dueDateText}</AttributeText>
                        </AttributeContainer>
                    </DueContainer>
                    <RepeatContainer
                        visible={
                            (repeatDropdownVisible || props.repeat != null) &&
                            !hiddenIcons.includes(ItemIcons.Repeat)
                        }
                    >
                        <AttributeContainer completed={props.completed}>
                            <AttributeIcon> {repeatIcon(14, 14)}</AttributeIcon>
                            <AttributeText>{repeatText}</AttributeText>
                        </AttributeContainer>
                    </RepeatContainer>
                </Container>
                <QuickAdd visible={createSubtaskDropdownVisible}>
                    <ItemCreator
                        innerRef={quickAdd}
                        hideButton={true}
                        type="subtask"
                        initiallyExpanded={true}
                        projectId={props.projectId}
                        shouldCloseOnSubmit={true}
                        parentId={props.id}
                        onCreate={() => {
                            setCreateSubtaskDropdownVisible(false)
                            container.current.focus()
                        }}
                        onEscape={() => {
                            setCreateSubtaskDropdownVisible(false)
                            container.current.focus()
                        }}
                    />
                </QuickAdd>
            </div>
            {!hideChildren &&
                props.children?.map((c) => {
                    const childItem = props.items[c]
                    // Sometimes the child item has been filtered out, so we don't want to render an empty container
                    if (!childItem) return
                    return (
                        <Item
                            key={c}
                            {...props}
                            {...childItem}
                            hideIcons={
                                props.hideIcons
                                    ? [...props.hideIcons, ItemIcons.Subtask]
                                    : [ItemIcons.Subtask]
                            }
                        />
                    )
                })}
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    projects: state.projects,
    items: getAllItems(state),
    theme: state.ui.theme,
    labels: state.ui.labels,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    createSubTask: (parentId: Uuid, text: string, projectId: Uuid | '0') => {
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
    convertSubtask: (id: Uuid) => {
        dispatch(convertSubtask(id))
    },
    changeParentItem: (id: Uuid, parentId: Uuid) => {
        dispatch(changeParentItem(id, parentId))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Item)
