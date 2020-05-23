import React, { ReactElement, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { createItem, addChildItem } from '../actions'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'
import { Button } from './Button'
import { Tooltip } from './Tooltip'
import EditableText from './EditableText'
import { validateItemString } from '../utils'
import { Container, ItemCreatorContainer } from './styled/ItemCreator'

interface DispatchProps {
    createSubTask: (parentId: Uuid, text: string, projectId: Uuid | '0') => void
    createItem: (text: string, projectId: Uuid | '0') => void
}

interface OwnProps {
    type: 'item' | 'subtask'
    initiallyExpanded: boolean
    shouldCloseOnSubmit?: boolean
    parentId?: Uuid
    projectId?: Uuid | '0'
    buttonText?: string
    width?: string
    hideButton?: boolean
    innerRef?: React.RefObject<HTMLInputElement>
    onCreate?: () => void
    onEscape?: () => void
}

type ItemCreatorProps = OwnProps & DispatchProps
const ItemCreator = (props: ItemCreatorProps): ReactElement => {
    const textRef: React.RefObject<HTMLInputElement> = props.innerRef
        ? props.innerRef
        : React.createRef<HTMLInputElement>()
    const [showItemCreator, setShowItemCreator] = useState(
        props.initiallyExpanded,
    )

    useEffect(() => {
        showItemCreator ? textRef.current.focus() : textRef.current.blur()
    })

    return (
        <Container>
            {!props.hideButton && (
                <Button
                    dataFor={
                        'add-item' +
                        props.parentId +
                        props.projectId +
                        props.type
                    }
                    type="primary"
                    spacing="compact"
                    icon="add"
                    height={props.buttonText ? 'auto' : '26px'}
                    width={props.buttonText ? 'auto' : '26px'}
                    text={showItemCreator ? '' : props.buttonText}
                    onClick={() => {
                        setShowItemCreator(!showItemCreator)
                    }}
                />
            )}
            <Tooltip
                id={'add-item' + props.parentId + props.projectId + props.type}
                text={props.type == 'item' ? 'Create Item' : 'Create Subtask'}
            ></Tooltip>
            <ItemCreatorContainer width={props.width} visible={showItemCreator}>
                <EditableText
                    innerRef={textRef}
                    onUpdate={(text) => {
                        props.type == 'item'
                            ? props.createItem(text, props.projectId)
                            : props.createSubTask(props.parentId, text, null)
                        if (props.shouldCloseOnSubmit) {
                            setShowItemCreator(false)
                        } else {
                            textRef.current.focus()
                        }
                        if (props.onCreate) {
                            props.onCreate()
                        }
                    }}
                    readOnly={false}
                    validation={{ validate: true, rule: validateItemString }}
                    input=""
                    singleline={true}
                    shouldClearOnSubmit={true}
                    shouldSubmitOnBlur={false}
                    onEscape={props.onEscape}
                />
            </ItemCreatorContainer>
        </Container>
    )
}

const mapStateToProps = (state): {} => ({})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    createItem: (text: string, projectId: Uuid | '0') => {
        dispatch(createItem(uuidv4(), text, projectId))
    },
    createSubTask: (parentId: Uuid, text: string, projectId: Uuid | '0') => {
        const childId = uuidv4()
        dispatch(createItem(childId, text, projectId))
        dispatch(addChildItem(childId, parentId))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(ItemCreator)
