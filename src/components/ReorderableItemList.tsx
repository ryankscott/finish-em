import React, { ReactElement } from 'react'
import Item from './Item'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ItemType } from '../interfaces'
import { Container, NoItemText } from './styled/ItemList'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import uuidv4 from 'uuid/v4'
import * as CSS from 'csstype'
import { connect } from 'react-redux'
import { reorderItem } from '../actions'
import { Uuid } from '@typed/uuid'

export enum RenderingStrategy {
    Default = 'DEFAULT',
    All = 'ALL',
}

/* We need two strategies for rendering items:

1.  Default 
  - If an item has a parent, don't render it
  - For each item, render the item and it's children  (In the Item component)

 2. All rendering
  - If an item has a parent and the parent is in the list, don't render it
  - If an item has a parent and the parent isn't in the list, render it
  -  

*/

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

interface ReorderableItemListProps {
    items: ItemType[]
    order: Uuid[]
    hideProject: boolean
    renderingStrategy?: RenderingStrategy
    reorderItem: (id: Uuid, destinationId: Uuid) => void
}

function ReorderableItemList(props: ReorderableItemListProps): ReactElement {
    return (
        <ThemeProvider theme={theme}>
            <DragDropContext
                onDragEnd={(e) => {
                    props.reorderItem(
                        e.draggableId,
                        props.order[e.destination.index],
                    )
                }}
            >
                <Droppable droppableId={uuidv4()} type="ITEM">
                    {(provided, snapshot) => (
                        <Container
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                        >
                            {props.order.map((o, index) => {
                                const item = props.items.filter(
                                    (i) => i.id == o,
                                )[0]
                                if (item == undefined) return
                                switch (props.renderingStrategy) {
                                    case 'ALL':
                                        if (item.parentId != null) return
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
                                                            provided
                                                                .draggableProps
                                                                .style,
                                                        )}
                                                        key={
                                                            'container-' +
                                                            item.id
                                                        }
                                                    >
                                                        <Item
                                                            {...item}
                                                            key={item.id}
                                                            noIndentOnSubtasks={
                                                                false
                                                            }
                                                            hideProject={
                                                                props.hideProject
                                                            }
                                                            keymap={itemKeymap}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        )

                                    default:
                                        if (item.parentId != null) return
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
                                                            provided
                                                                .draggableProps
                                                                .style,
                                                        )}
                                                        key={
                                                            'container-' +
                                                            item.id
                                                        }
                                                    >
                                                        <Item
                                                            {...item}
                                                            key={item.id}
                                                            noIndentOnSubtasks={
                                                                false
                                                            }
                                                            hideProject={
                                                                props.hideProject
                                                            }
                                                            keymap={itemKeymap}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        )
                                }
                            })}
                            {props.items.length == 0 && (
                                <NoItemText>No items</NoItemText>
                            )}
                        </Container>
                    )}
                </Droppable>
            </DragDropContext>
        </ThemeProvider>
    )
}

const mapStateToProps = (state) => ({
    order: state.items.order,
})

const mapDispatchToProps = (dispatch) => ({
    reorderItem: (id: Uuid, destinationId: Uuid) => {
        dispatch(reorderItem(id, destinationId))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(ReorderableItemList)
