import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'

import { themes } from '../theme'
import { connect } from 'react-redux'
import ViewHeader from './ViewHeader'
import { MainComponents } from '../interfaces'
import FilteredItemList from '../containers/FilteredItemList'
import Button from './Button'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import uuidv4 from 'uuid'
import { reorderComponent, addComponent } from '../actions'
import { Uuid } from '@typed/uuid'

interface OwnProps {
    id: string
}
interface DispatchProps {
    reorderComponent: (id: Uuid, destinationId: Uuid) => void
    addComponent: (viewId: string) => void
}

interface StateProps {
    theme: string
    components: MainComponents
}
type ReorderableComponentListProps = StateProps & OwnProps & DispatchProps
const ReorderableComponentList = (props: ReorderableComponentListProps): ReactElement => {
    const [showEdit, setShowEdit] = useState(false)
    const theme = themes[props.theme]
    console.log(props.components)

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
        padding: '0px',
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
                    margin: '5px 0px',
                }}
            >
                <Button
                    type={'primary'}
                    spacing={'compact'}
                    width={'60px'}
                    icon={showEdit ? 'save' : 'edit'}
                    text={showEdit ? 'Save' : 'Edit'}
                    onClick={() => {
                        setShowEdit(!showEdit)
                    }}
                />
            </div>
            <DragDropContext
                onDragEnd={(e) => {
                    props.reorderComponent(
                        e.draggableId,
                        props.components.order[e.destination.index],
                    )
                }}
            >
                <Droppable droppableId={uuidv4()} type="COMPONENT">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                        >
                            {Object.values(props.components.order).map((c, index) => {
                                console.log(c)
                                const comp = props.components.components[c]
                                if (comp.location == 'main' && comp.viewId == props.id) {
                                    switch (comp.component.name) {
                                        case 'FilteredItemList':
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
                                                            <FilteredItemList
                                                                id={c}
                                                                key={c}
                                                                {...comp.component.props}
                                                                readOnly={!showEdit}
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
            {showEdit && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        type={'default'}
                        iconSize="14px"
                        width="80px"
                        icon={'add'}
                        text={'Add list'}
                        onClick={() => {
                            props.addComponent(props.id)
                        }}
                    />
                </div>
            )}
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    components: state.ui.components,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    reorderComponent: (id: Uuid, destinationId: Uuid) => {
        dispatch(reorderComponent(id, destinationId))
    },
    addComponent: (viewId: string) => {
        dispatch(
            addComponent(uuidv4(), viewId, 'main', {
                name: 'FilteredItemList',
                props: {
                    listName: 'New list',
                    isFilterable: true,
                    filter: 'not completed and not deleted',
                },
            }),
        )
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(ReorderableComponentList)
