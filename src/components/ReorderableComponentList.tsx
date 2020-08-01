import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'

import { themes } from '../theme'
import { connect } from 'react-redux'
import ViewHeader from './ViewHeader'
import { MainComponents } from '../interfaces'
import FilteredItemList from './FilteredItemList'
import Button from './Button'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import uuidv4 from 'uuid'
import { reorderComponent, addComponent } from '../actions'
import CSS from 'csstype'

interface OwnProps {
    id: string
}
interface DispatchProps {
    reorderComponent: (id: string, destinationId: string) => void
    addComponent: (viewId: string) => void
}

interface StateProps {
    theme: string
    components: MainComponents
}
type ReorderableComponentListProps = StateProps & OwnProps & DispatchProps
const ReorderableComponentList = (props: ReorderableComponentListProps): ReactElement => {
    const theme = themes[props.theme]

    const getListStyle = (isDraggingOver: boolean): CSS.Properties => ({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: isDraggingOver ? 'inherit' : 'inherit',
        width: '100%',
        margin: '0px',
        padding: '0px',
    })

    const getComponentStyle = (isDragging: boolean, draggableStyle): CSS.Properties => ({
        ...draggableStyle,
        display: 'flex',
        flexDirection: 'row',
        height: 'auto',
        userSelect: 'none',
        margin: '0px',
        padding: '5px',
        borderRadius: '5px',
        // change background colour if dragging
        background: isDragging
            ? theme.colours.focusDialogBackgroundColour
            : theme.colours.backgroundColour,
    })

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    width: '100%',
                    margin: '20px 0px 5px 0px',
                }}
            ></div>
            <DragDropContext
                onDragEnd={(e) => {
                    props.reorderComponent(
                        e.draggableId,
                        props.components.order[e.destination.index],
                    )
                }}
                style={{ width: '100%' }}
            >
                <Droppable droppableId={uuidv4()} type="COMPONENT">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                        >
                            {Object.values(props.components.order).map((c, index) => {
                                const comp = props.components.components[c]
                                if (comp.location == 'main' && comp.viewId == props.id) {
                                    switch (comp.component.name) {
                                        case 'FilteredItemList':
                                            return (
                                                <Draggable
                                                    key={c}
                                                    draggableId={c}
                                                    index={index}
                                                    isDragDisabled={false}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            key={'container-' + c}
                                                            style={getComponentStyle(
                                                                snapshot.isDragging,
                                                                provided.draggableProps.style,
                                                            )}
                                                        >
                                                            <FilteredItemList
                                                                id={c}
                                                                key={c}
                                                                {...comp.component.props}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            )
                                        case 'ViewHeader':
                                            return (
                                                <Draggable key={c} draggableId={c} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            key={'container-' + c}
                                                            style={getComponentStyle(
                                                                snapshot.isDragging,
                                                                provided.draggableProps.style,
                                                            )}
                                                        >
                                                            <ViewHeader
                                                                key={c}
                                                                id={c}
                                                                {...comp.component.props}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            )
                                    }
                                }
                            })}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
                <Button
                    type={'default'}
                    iconSize="14px"
                    width="90px"
                    icon={'add'}
                    text={'Add list'}
                    onClick={() => {
                        props.addComponent(props.id)
                    }}
                />
            </div>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    components: state.ui.components,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    reorderComponent: (id: string, destinationId: string) => {
        dispatch(reorderComponent(id, destinationId))
    },
    addComponent: (viewId: string) => {
        const id = uuidv4()
        dispatch(
            addComponent(id, viewId, 'main', {
                name: 'FilteredItemList',
                props: {
                    id: id,
                    listName: 'New list',
                    isFilterable: true,
                    filter: 'not (completed or deleted)',
                    hideIcons: [],
                },
            }),
        )
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(ReorderableComponentList)
