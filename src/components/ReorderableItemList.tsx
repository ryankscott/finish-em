import React, { ReactElement } from 'react'
import Item from './Item'
import { ItemIcons } from '../interfaces/item'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ItemType, RenderingStrategy, Items } from '../interfaces'
import { Container, NoItemText } from './styled/ItemList'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import uuidv4 from 'uuid/v4'
import * as CSS from 'csstype'
import { connect } from 'react-redux'
import {
    reorderItem,
    showFocusbar,
    setActiveItem,
    uncompleteItem,
    completeItem,
    undeleteItem,
    deleteItem,
    toggleSubtasks,
} from '../actions'
import { Uuid } from '@typed/uuid'
import { HotKeys } from 'react-hotkeys'

/* We need two strategies for rendering items:

1.  Default 
  - If an item has a parent, don't render it
  - For each item, render the item and it's children  (In the Item component)

 2. All rendering
  - If an item has a parent and the parent is in the list, don't render it
  - If an item has a parent and the parent isn't in the list, render it
*/

interface DispatchProps {
    reorderItem: (id: Uuid, destinationId: Uuid) => void
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
interface OwnProps {
    componentId: Uuid
    inputItems: ItemType[]
    hideIcons: ItemIcons[]
    renderingStrategy?: RenderingStrategy
}

type ReorderableItemListProps = OwnProps & StateProps & DispatchProps

function ReorderableItemList(props: ReorderableItemListProps): ReactElement {
    const theme = themes[props.theme]
    const getItemStyle = (isDragging: boolean, draggableStyle): CSS.Properties => ({
        userSelect: 'none',
        margin: '0 0 0 0',
        borderRadius: '5px',
        padding: '0px 5px',
        // change background colour if dragging
        background: isDragging ? theme.colours.borderColour : 'inherit',
        ...draggableStyle,
    })
    const getListStyle = (isDraggingOver: boolean): CSS.Properties => ({
        background: isDraggingOver ? theme.colours.focusBackgroundColour : 'inherit',
        padding: '20px',
        width: '100%',
    })
    const handlers = {
        TOGGLE_CHILDREN: (event) => {
            props.toggleSubtasks(event.target.id)
        },
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
        SET_SCHEDULED_DATE: (event) => {
            const item = props.items.items[event.target.id]
            if (item.type == 'NOTE') return
            if (item.deleted || item.completed) return
            console.log('scheduled')
            event.preventDefault()
        },
        SET_DUE_DATE: (event) => {
            const item = props.items.items[event.target.id]
            if (item.type == 'NOTE') return
            if (item.deleted || item.completed) return
            console.log('due date')
            event.preventDefault()
        },
        CREATE_SUBTASK: (event) => {
            const item = props.items.items[event.target.id]
            if (item.deleted || item.completed || item.parentId != null) return
            console.log('create sub task')
            event.preventDefault()
        },
        CONVERT_TO_SUBTASK: (event) => {
            const item = props.items.items[event.target.id]
            if (item.type == 'NOTE') return
            if (item.deleted || item.completed) return
            console.log('convert to sub task')
            event.preventDefault()
        },
        REPEAT_ITEM: (event) => {
            const item = props.items.items[event.target.id]
            if (item.type == 'NOTE') return
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
        EDIT_ITEM_DESC: (event) => {
            const item = props.items.items[event.target.id]
            event.preventDefault()
        },
    }

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <HotKeys keyMap={itemKeymap} handlers={handlers}>
                    <DragDropContext
                        onDragEnd={(e) => {
                            props.reorderItem(e.draggableId, props.items.order[e.destination.index])
                        }}
                    >
                        <Droppable droppableId={uuidv4()} type="ITEM">
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}
                                >
                                    {props.items.order.map((o, index) => {
                                        // Get each item
                                        const item = props.inputItems.find((i) => i.id == o)
                                        if (item == undefined) return
                                        switch (props.renderingStrategy) {
                                            case RenderingStrategy.All:
                                                // If the item has a parent find out if it exists in the list we've been provided
                                                if (item.parentId != null) {
                                                    const parentExists = props.inputItems.find(
                                                        (i) => i.id == item.parentId,
                                                    )
                                                    if (parentExists) {
                                                        return
                                                    }
                                                    return (
                                                        <Draggable
                                                            key={item.id}
                                                            draggableId={item.id}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={getItemStyle(
                                                                        snapshot.isDragging,
                                                                        provided.draggableProps
                                                                            .style,
                                                                    )}
                                                                    key={'container-' + item.id}
                                                                >
                                                                    <Item
                                                                        {...item}
                                                                        key={item.id}
                                                                        componentId={
                                                                            props.componentId
                                                                        }
                                                                        shouldIndent={false}
                                                                        hideIcons={props.hideIcons}
                                                                    />

                                                                    {item.children?.map((c) => {
                                                                        const childItem =
                                                                            props.items.items[c]
                                                                        return (
                                                                            <Item
                                                                                key={c}
                                                                                {...childItem}
                                                                                componentId={
                                                                                    props.componentId
                                                                                }
                                                                                shouldIndent={true}
                                                                                hideIcons={
                                                                                    props.hideIcons
                                                                                        ? [
                                                                                              ...props.hideIcons,
                                                                                              ItemIcons.Subtask,
                                                                                          ]
                                                                                        : [
                                                                                              ItemIcons.Subtask,
                                                                                          ]
                                                                                }
                                                                            />
                                                                        )
                                                                    })}
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    )
                                                }

                                            default:
                                                return (
                                                    <Draggable
                                                        key={item.id}
                                                        draggableId={item.id}
                                                        index={index}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={getItemStyle(
                                                                    snapshot.isDragging,
                                                                    provided.draggableProps.style,
                                                                )}
                                                                key={'container-' + item.id}
                                                            >
                                                                <Item
                                                                    {...item}
                                                                    key={item.id}
                                                                    componentId={props.componentId}
                                                                    shouldIndent={false}
                                                                    hideIcons={props.hideIcons}
                                                                />
                                                                {item.children?.map((c) => {
                                                                    const childItem =
                                                                        props.items.items[c]
                                                                    return (
                                                                        <Item
                                                                            key={c}
                                                                            {...childItem}
                                                                            shouldIndent={true}
                                                                            componentId={
                                                                                props.componentId
                                                                            }
                                                                            hideIcons={
                                                                                props.hideIcons
                                                                                    ? [
                                                                                          ...props.hideIcons,
                                                                                          ItemIcons.Subtask,
                                                                                      ]
                                                                                    : [
                                                                                          ItemIcons.Subtask,
                                                                                      ]
                                                                            }
                                                                        />
                                                                    )
                                                                })}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                )
                                        }
                                    })}
                                    {props.inputItems.length == 0 && (
                                        <NoItemText>No items</NoItemText>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </HotKeys>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    items: state.items,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    reorderItem: (id: Uuid, destinationId: Uuid) => {
        dispatch(reorderItem(id, destinationId))
    },
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

export default connect(mapStateToProps, mapDispatchToProps)(ReorderableItemList)
