import React, { ReactElement } from 'react'
import Item from './Item'
import { ItemIcons } from '../interfaces/item'
import { ThemeProvider } from '../StyledComponents'
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
    toggleSubtasks,
} from '../actions'
import { Uuid } from '@typed/uuid'
import { useHotkeys } from 'react-hotkeys-hook'

interface DispatchProps {
    showFocusbar: () => void
    setActiveItem: (id: Uuid) => void
    completeItem: (id: Uuid) => void
    uncompleteItem: (id: Uuid) => void
    deleteItem: (id: Uuid) => void
    undeleteItem: (id: Uuid) => void
    toggleSubtasks: (id: Uuid, componentId: Uuid) => void
}

interface StateProps {
    theme: string
    items: Items
}

// TODO: inputItems should just be an array of IDs
interface OwnProps {
    componentId: Uuid
    inputItems: ItemType[]
    renderingStrategy?: RenderingStrategy
    hideIcons: ItemIcons[]
    theme: string
}
/* We need two strategies for rendering items:

1.  Default 
  - If an item has a parent, don't render it
  - For each item, render the item and it's children  (In the Item component)

 2. All rendering
  - If an item has a parent and the parent is in the list, don't render it
  - If an item has a parent and the parent isn't in the list, render it
*/

const getItem = (
    item: ItemType,
    inputItems: ItemType[],
    strategy: RenderingStrategy,
    componentId: Uuid,
    hideIcons: ItemIcons[],
    items: Items,
): ReactElement => {
    switch (strategy) {
        case RenderingStrategy.All:
            if (item.parentId != null) {
                const parentExists = inputItems.find((i) => i.id == item.parentId)
                // If it exists it will get rendered later, so don't render it
                if (parentExists) {
                    return
                }
            }
            return (
                <div key={'container-' + item.id}>
                    <Item
                        {...item}
                        key={item.id}
                        componentId={componentId}
                        shouldIndent={false}
                        hideIcons={hideIcons}
                    />
                    {item.children?.map((c) => {
                        const childItem = items.items[c]
                        return (
                            <Item
                                key={c}
                                {...childItem}
                                componentId={componentId}
                                hideIcons={
                                    hideIcons
                                        ? [...hideIcons, ItemIcons.Subtask]
                                        : [ItemIcons.Subtask]
                                }
                                shouldIndent={true}
                            />
                        )
                    })}
                </div>
            )

        default:
            return (
                <div key={'container-' + item.id}>
                    <Item
                        {...item}
                        key={item.id}
                        componentId={componentId}
                        hideIcons={hideIcons}
                        shouldIndent={false}
                    />
                    {item.children?.map((c) => {
                        const childItem = items.items[c]
                        return (
                            <Item
                                key={c}
                                {...childItem}
                                shouldIndent={true}
                                componentId={componentId}
                                hideIcons={
                                    hideIcons
                                        ? [...hideIcons, ItemIcons.Subtask]
                                        : [ItemIcons.Subtask]
                                }
                            />
                        )
                    })}
                </div>
            )
    }
}

type ItemListProps = OwnProps & StateProps & DispatchProps

function ItemList(props: ItemListProps): ReactElement {
    const handlers = {
        TOGGLE_CHILDREN: (event) => {
            props.toggleSubtasks(event.target.id, props.componentId)
        },
        NEXT_ITEM: (event) => {
            const item = props.items.items[event.target.id]
            console.log('next item')
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
                    const nextItem = event.target.parentNode.parentNode.nextSibling.firstChild
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
            console.log('prev item')
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
                    const prevItem = event.target.parentNode.parentNode.previousSibling.firstChild
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
        COMPLETE_ITEM: (event) => {
            const item = props.items.items[event.target.id]
            if (item.type == 'NOTE') return
            if (item.deleted || item.completed) return
            props.completeItem(item.id)
        },
        UNCOMPLETE_ITEM: (event) => {
            const item = props.items.items[event.target.id]
            if (item.type == 'NOTE') return
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
        SET_SCHEDULED_DATE: (event) => {
            // TODO: Implement me
            const item = props.items.items[event.target.id]
            if (item.type == 'NOTE') return
            if (item.deleted || item.completed) return
            console.log('scheduled')
            event.preventDefault()
        },
        SET_DUE_DATE: (event) => {
            // TODO: Implement me
            const item = props.items.items[event.target.id]
            if (item.type == 'NOTE') return
            if (item.deleted || item.completed) return
            console.log('due date')
            event.preventDefault()
        },
        CREATE_SUBTASK: (event) => {
            // TODO: Implement me
            const item = props.items.items[event.target.id]
            if (item.deleted || item.completed || item.parentId != null) return
            console.log('create sub task')
            event.preventDefault()
        },
        CONVERT_TO_SUBTASK: (event) => {
            // TODO: Implement me
            const item = props.items.items[event.target.id]
            if (item.type == 'NOTE') return
            if (item.deleted || item.completed) return
            console.log('convert to sub task')
            event.preventDefault()
        },
        REPEAT_ITEM: (event) => {
            // TODO: Implement me
            const item = props.items.items[event.target.id]
            if (item.type == 'NOTE') return
            if (item.deleted || item.completed) return
            console.log('repeat')
            event.preventDefault()
        },
        MOVE_ITEM: (event) => {
            // TODO: Implement me
            const item = props.items.items[event.target.id]
            if (item.deleted || item.completed) return
            console.log('move item')
            event.preventDefault()
        },
        EDIT_ITEM_DESC: (event) => {
            // TODO:Implement me
            const item = props.items.items[event.target.id]
            event.preventDefault()
        },
    }
    Object.entries(itemKeymap).map(([k, v]) => {
        useHotkeys(v, handlers[k])
    })

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container>
                {props.inputItems.map((i) => {
                    if (i == undefined) return null
                    return getItem(
                        i,
                        props.inputItems,
                        props.renderingStrategy,
                        props.componentId,
                        props.hideIcons,
                        props.items,
                    )
                })}
                {props.inputItems.length == 0 && <NoItemText>No items</NoItemText>}
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
    toggleSubtasks: (id: Uuid, componentId: Uuid) => {
        dispatch(toggleSubtasks(id, componentId))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(ItemList)
