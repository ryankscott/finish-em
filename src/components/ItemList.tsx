import React, { ReactElement, useState, KeyboardEvent } from 'react'
import Item, { ItemIcons } from './Item'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ItemType, RenderingStrategy, Items } from '../interfaces'
import { Container, NoItemText } from './styled/ItemList'
import { connect } from 'react-redux'
import {
    showFocusbar,
    setActiveItem,
    uncompleteItem,
    completeItem,
    undeleteItem,
    deleteItem,
} from '../actions'
import { Uuid } from '@typed/uuid'

const DEBUG_KEYHANDLING = false
const MAX_SHORTCUT_LENGTH = 2

interface DispatchProps {
    showFocusbar: () => void
    setActiveItem: (id: Uuid) => void
    completeItem: (id: Uuid) => void
    uncompleteItem: (id: Uuid) => void
    deleteItem: (id: Uuid) => void
    undeleteItem: (id: Uuid) => void
}

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

type ItemListProps = OwnProps & StateProps & DispatchProps
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
            TOGGLE_CHILDREN: () => {},
            NEXT_ITEM: (event) => {
                const item = props.items.items[event.target.id]
                // If it's a parent element we need to get the first child
                if (item.children.length > 0) {
                    const nextItem = event.target.parentNode.nextSibling
                    if (nextItem) {
                        nextItem.firstChild.focus()
                        return
                    }
                }
                // If it's a child
                if (item.parentId != null) {
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
                const item = props.items.items[event.target.id]
                if (item.children.length > 0) {
                    const prevItem = event.target.parentNode.previousSibling
                    if (prevItem) {
                        prevItem.firstChild.focus()
                        return
                    }
                }
                // If it's a child
                if (item.parentId != null) {
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
                const parent = event.target.parentNode.parentNode
                const prevItem = parent.previousSibling?.firstChild
                if (prevItem) {
                    prevItem.firstChild.focus()
                    return
                }
            },
            SET_ACTIVE_ITEM: (event) => {
                props.showFocusbar()
                props.setActiveItem(event.target.id)
                return
            },
            SET_SCHEDULED_DATE: (event) => {
                const item = props.items.items[event.target.id]
                if (item.deleted || item.completed) return
                console.log('scheduled')
                event.preventDefault()
            },
            SET_DUE_DATE: (event) => {
                const item = props.items.items[event.target.id]
                if (item.deleted || item.completed) return
                console.log('due date')
                event.preventDefault()
            },
            CREATE_SUBTASK: (event) => {
                const item = props.items.items[event.target.id]
                if (item.deleted || item.completed || item.parentId != null)
                    return
                console.log('create sub task')
                event.preventDefault()
            },
            CONVERT_TO_SUBTASK: (event) => {
                const item = props.items.items[event.target.id]
                if (item.deleted || item.completed) return
                console.log('convert to sub task')
                event.preventDefault()
            },
            REPEAT_ITEM: (event) => {
                const item = props.items.items[event.target.id]
                if (item.deleted || item.completed) return
                console.log('repeat')
                event.preventDefault()
            },
            MOVE_ITEM: (event) => {
                const item = props.items.items[event.target.id]
                if (item.deleted || item.completed) return
                console.log('move item')
                event.preventDefault()
            },
            ESCAPE: () => {
                console.log('escape')
            },
            COMPLETE_ITEM: (event) => {
                const item = props.items.items[event.target.id]
                if (item.deleted || item.completed) return
                props.completeItem(item.id)
            },
            UNCOMPLETE_ITEM: (event) => {
                const item = props.items.items[event.target.id]
                if (item.deleted) return
                props.uncompleteItem(item.id)
            },
            DELETE_ITEM: () => {
                console.log('deleting')
                const item = props.items.items[event.target.id]
                if (item.deleted) return
                props.deleteItem(item.id)
            },
            UNDELETE_ITEM: () => {
                const item = props.items.items[event.target.id]
                props.undeleteItem(item.id)
            },
            EDIT_ITEM_DESC: (event) => {
                const item = props.items.items[event.target.id]
                event.preventDefault()
            },
        },
        NOTE: {
            NEXT_ITEM: (event) => {
                const item = props.items.items[event.target.id]
                // If it's a parent element we need to get the first child
                if (item.children.length > 0) {
                    const nextItem = event.target.parentNode.nextSibling
                    if (nextItem) {
                        nextItem.firstChild.focus()
                        return
                    }
                }
                // If it's a child
                if (item.parentId != null) {
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
                const item = props.items.items[event.target.id]
                if (item.children.length > 0) {
                    const prevItem = event.target.parentNode.previousSibling
                    if (prevItem) {
                        prevItem.firstChild.focus()
                        return
                    }
                }
                // If it's a child
                if (item.parentId != null) {
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
                const parent = event.target.parentNode.parentNode
                const prevItem = parent.previousSibling?.firstChild
                if (prevItem) {
                    prevItem.firstChild.focus()
                    return
                }
            },
            SET_ACTIVE_ITEM: (event) => {
                props.showFocusbar()
                props.setActiveItem(event.target.id)
                return
            },
            MOVE_ITEM: (event) => {
                const item = props.items.items[event.target.id]
                if (item.deleted || item.completed) return
                console.log('move item')
                event.preventDefault()
            },
            ESCAPE: () => {
                console.log('escape')
            },
            DELETE_ITEM: () => {
                console.log('deleting')
                const item = props.items.items[event.target.id]
                if (item.deleted) return
                props.deleteItem(item.id)
            },
            UNDELETE_ITEM: () => {
                const item = props.items.items[event.target.id]
                props.undeleteItem(item.id)
            },
            EDIT_ITEM_DESC: (event) => {
                const item = props.items.items[event.target.id]
                event.preventDefault()
            },
        },
    }

    const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>): void => {
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
                        if (DEBUG_KEYHANDLING && handler) {
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
                    switch (props.renderingStrategy) {
                        case RenderingStrategy.All:
                            // If the item has a parent, we need to find if that parent exists in the list we've been provided
                            if (o.parentId != null) {
                                const parentExists = props.inputItems.find(
                                    (i) => i.id == o.parentId,
                                )
                                // If it exists it will get rendered later, so don't render it
                                if (parentExists) {
                                    return
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
                            // Default rendering won't render children elements as they get rendered in the Item component itself
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

const mapDispatchToProps = (dispatch): DispatchProps => ({
    showFocusbar: () => {
        dispatch(showFocusbar())
    },
    setActiveItem: (id: Uuid) => {
        dispatch(setActiveItem(id))
    },
    deleteItem: (id: Uuid) => {
        dispatch(deleteItem(id))
    },
    undeleteItem: (id: Uuid) => {
        dispatch(undeleteItem(id))
    },
    completeItem: (id: Uuid) => {
        dispatch(completeItem(id))
    },
    uncompleteItem: (id: Uuid) => {
        dispatch(uncompleteItem(id))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(ItemList)
