import React, { ReactElement, useState } from 'react'
import { connect } from 'react-redux'
import { createItem, addChildItem } from '../actions'
import EditableItem from './EditableItem'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'
import { Button } from './Button'
import styled from 'styled-components'
import { Tooltip } from './Tooltip'

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    margin-left: 2px;
`
interface ItemCreatorContainer {
    visible: boolean
    width: string
}
const ItemCreatorContainer = styled.div<ItemCreatorContainer>`
    position: relative;
    width: ${(props) =>
        props.visible ? (props.width ? props.width : '100%') : '0px'};
    opacity: ${(props) => (props.visible ? '1' : '0')};
    transition: all 0.2s ease-in-out;
    margin: 0px 2px;
`
interface ItemCreatorProps {
    parentId?: Uuid
    projectId?: Uuid
    buttonText?: string
    width?: string
    type: 'item' | 'subtask'
    createSubTask: (parentId: Uuid, text: string, projectId: Uuid) => void
    createItem: (text: string, projectId: Uuid) => void
}
const ItemCreator = (props: ItemCreatorProps): ReactElement => {
    const textRef = React.createRef<HTMLInputElement>()
    const [showItemCreator, setShowItemCreator] = useState(false)
    return (
        <Container>
            <Button
                dataFor={
                    'add-item' + props.parentId + props.projectId + props.type
                }
                type="primary"
                spacing="compact"
                icon="add"
                height={props.buttonText ? 'auto' : '30px'}
                width={props.buttonText ? 'auto' : '30px'}
                text={showItemCreator ? '' : props.buttonText}
                onClick={() => {
                    setShowItemCreator(!showItemCreator)
                    textRef.current.focus()
                }}
            />
            <Tooltip
                id={'add-item' + props.parentId + props.projectId + props.type}
                text={props.type == 'item' ? 'Create Item' : 'Create Subtask'}
            ></Tooltip>
            <ItemCreatorContainer width={props.width} visible={showItemCreator}>
                <EditableItem
                    ref={textRef}
                    hideIcon={true}
                    text=""
                    onSubmit={(text) => {
                        props.type == 'item'
                            ? props.createItem(text, props.projectId)
                            : props.createSubTask(props.parentId, text, null)
                    }}
                    readOnly={false}
                />
            </ItemCreatorContainer>
        </Container>
    )
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = (dispatch) => ({
    createItem: (text: string, projectId: Uuid) => {
        dispatch(createItem(uuidv4(), text, projectId))
    },
    createSubTask: (parentId: Uuid, text: string, projectId: Uuid) => {
        const childId = uuidv4()
        dispatch(createItem(childId, text, projectId))
        dispatch(addChildItem(childId, parentId))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(ItemCreator)
