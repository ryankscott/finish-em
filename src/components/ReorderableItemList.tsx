import React, { ReactElement } from 'react'
import Item, { ItemIcons } from './Item'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ItemType, RenderingStrategy, Items } from '../interfaces'
import { Container, NoItemText } from './styled/ItemList'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import uuidv4 from 'uuid/v4'
import * as CSS from 'csstype'
import { connect } from 'react-redux'
import { reorderItem } from '../actions'
import { Uuid } from '@typed/uuid'

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
}
interface StateProps {
    theme: string
    items: Items
}
interface OwnProps {
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
        // change background colour if dragging
        background: isDragging ? theme.colours.focusBackgroundColour : 'inherit',
        ...draggableStyle,
    })
    const getListStyle = (isDraggingOver: boolean): CSS.Properties => ({
        background: isDraggingOver ? 'inherit' : 'inherit',
        padding: '20px',
        width: '100%',
    })

    return (
        <ThemeProvider theme={theme}>
            <DragDropContext
                onDragEnd={(e) => {
                    props.reorderItem(e.draggableId, props.items.order[e.destination.index])
                }}
            >
                <Droppable droppableId={uuidv4()} type="ITEM">
                    {(provided, snapshot) => (
                        <Container
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                        >
                            {props.items.order.map((o, index) => {
                                // Get each item
                                const item = props.inputItems.filter((i) => i.id == o)[0]
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
                                                                provided.draggableProps.style,
                                                            )}
                                                            key={'container-' + item.id}
                                                        >
                                                            <Item
                                                                {...item}
                                                                key={item.id}
                                                                noIndentOnSubtasks={true}
                                                                hideIcons={props.hideIcons}
                                                                keymap={itemKeymap}
                                                            />

                                                            {item.children?.map((c) => {
                                                                const childItem =
                                                                    props.items.items[c]
                                                                return (
                                                                    <Item
                                                                        key={c}
                                                                        noIndentOnSubtasks={false}
                                                                        {...childItem}
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
                                                            noIndentOnSubtasks={false}
                                                            hideIcons={props.hideIcons}
                                                            keymap={itemKeymap}
                                                        />
                                                        {item.children?.map((c) => {
                                                            const childItem = props.items.items[c]
                                                            return (
                                                                <Item
                                                                    key={c}
                                                                    noIndentOnSubtasks={false}
                                                                    {...childItem}
                                                                    hideIcons={
                                                                        props.hideIcons
                                                                            ? [
                                                                                  ...props.hideIcons,
                                                                                  ItemIcons.Subtask,
                                                                              ]
                                                                            : [ItemIcons.Subtask]
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
                            {props.items.length == 0 && <NoItemText>No items</NoItemText>}
                        </Container>
                    )}
                </Droppable>
            </DragDropContext>
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
})

export default connect(mapStateToProps, mapDispatchToProps)(ReorderableItemList)
