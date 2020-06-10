import React, { ReactElement, useState, KeyboardEvent } from 'react'
import Item, { ItemIcons } from './Item'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ItemType, RenderingStrategy, Items } from '../interfaces'
import { Container, NoItemText } from './styled/ItemList'
import { connect } from 'react-redux'

const DEBUG_KEYHANDLING = true
const MAX_SHORTCUT_LENGTH = 3

interface StateProps {
    theme: string
    items: Items
}

// TODO: inputItems should just be an array of IDs
interface OwnProps {
    inputItems: ItemType[]
    renderingStrategy?: RenderingStrategy
    hideIcons: ItemIcons[]
    theme: string
}

type ItemListProps = OwnProps & StateProps
/* We need two strategies for rendering items:

1.  Default 
  - If an item has a parent, don't render it
  - For each item, render the item and it's children  (In the Item component)

 2. All rendering
  - If an item has a parent and the parent is in the list, don't render it
  - If an item has a parent and the parent isn't in the list, render it
*/

function ItemList(props: ItemListProps): ReactElement {
    const [keyPresses, setKeyPresses] = useState([])
    const handlers = {
        TODO: {
            TOGGLE_CHILDREN: () => {
                console.log('toggle children')
            },
            /* SET_ACTIVE_ITEM: () => {
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
            */
        },
        NOTE: {
            /* NEXT_ITEM: (event) => {
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
            },*/
        },
    }

    const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>): void => {
        const target = event.target
        const item = props.items.items[event.target.id]

        // Remove the first value in the array (3 is the max shortcut matching length)
        let currentKeyPresses = keyPresses
        currentKeyPresses =
            currentKeyPresses.length == MAX_SHORTCUT_LENGTH + 1
                ? currentKeyPresses.slice(1)
                : currentKeyPresses
        currentKeyPresses.push(event.key)

        // Clear keypress history if using the arrow keys. Enables quick scrolling
        if (
            event.key == 'ArrowUp' ||
            event.key == 'ArrowDown' ||
            event.key == 'j' ||
            event.key == 'k'
        ) {
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
        for (const [key, value] of Object.entries(itemKeymap)) {
            currentKeyPresses.forEach((k, v) => {
                if (v < currentKeyPresses.length) {
                    const combo = k + ' ' + currentKeyPresses[v + 1]

                    if (combo == value) {
                        const handler = handlers[item.type][key]
                        if (handler) {
                            console.log(handler)
                        }
                        handler ? handler(event) : null
                        return
                    }
                    const single = k
                    if (single == value) {
                        const handler = handlers[item.type][key]
                        handler ? handler(event) : null
                        return
                    }
                }
            })
        }
        event.stopPropagation()
        return
    }
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container
                onKeyDown={(e) => {
                    handleKeyPress(e)
                }}
            >
                {props.inputItems.map((o, index) => {
                    if (o == undefined) return
                    switch (props.renderingStrategy) {
                        case RenderingStrategy.All:
                            if (o.parentId != null) {
                                const parentExists = props.inputItems.filter(
                                    (i) => i.id == o.parentId,
                                )
                                if (parentExists.length > 0) {
                                    return
                                } else {
                                    return (
                                        <div key={'container-' + o.id}>
                                            <Item
                                                {...o}
                                                key={o.id}
                                                noIndentOnSubtasks={true}
                                                hideIcons={props.hideIcons}
                                                keymap={itemKeymap}
                                            />
                                        </div>
                                    )
                                }
                            }
                            return (
                                <div key={'container-' + o.id}>
                                    <Item
                                        {...o}
                                        key={o.id}
                                        noIndentOnSubtasks={false}
                                        hideIcons={props.hideIcons}
                                        keymap={itemKeymap}
                                    />
                                </div>
                            )

                        default:
                            if (o.parentId != null) return
                            return (
                                <div key={'container-' + o.id}>
                                    <Item
                                        {...o}
                                        key={o.id}
                                        noIndentOnSubtasks={false}
                                        hideIcons={props.hideIcons}
                                        keymap={itemKeymap}
                                    />
                                </div>
                            )
                    }
                })}
                {props.inputItems.length == 0 && (
                    <NoItemText>No items</NoItemText>
                )}
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    items: state.items,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(ItemList)
