import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { createItem, addChildItem } from '../actions'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'
import Button from './Button'
import Tooltip from './Tooltip'
import { Container, ItemCreatorContainer, HelpButtonContainer } from './styled/ItemCreator'
import { Icons } from '../assets/icons'
import { themes } from '../theme'
import { ThemeProvider } from '../StyledComponents'
import chrono from 'chrono-node'
import {
    setEndOfContenteditable,
    dueTextRegex,
    scheduledTextRegex,
    projectTextRegex,
    repeatTextRegex,
    itemRegex,
} from '../utils'
import EditableText from './EditableText'

interface StateProps {
    theme: string
}

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

type ItemCreatorProps = OwnProps & DispatchProps & StateProps
const ItemCreator = (props: ItemCreatorProps): ReactElement => {
    const textRef: React.RefObject<HTMLInputElement> = props.innerRef
        ? props.innerRef
        : React.useRef<HTMLInputElement>()
    const [showItemCreator, setShowItemCreator] = useState(props.initiallyExpanded)

    const node = useRef<HTMLDivElement>()
    const handleClick = (e): null => {
        if (node.current.contains(e.target)) {
            return
        }
        setShowItemCreator(false)
    }
    useEffect(() => {
        document.addEventListener('mousedown', handleClick)
        return () => {
            document.removeEventListener('mousedown', handleClick)
        }
    }, [])

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container
                ref={node}
                onKeyDown={(e) => {
                    if (e.key == 'Escape') {
                        setShowItemCreator(false)
                    }
                }}
            >
                {!props.hideButton && (
                    <Button
                        dataFor={'add-item' + props.parentId + props.projectId + props.type}
                        type="primary"
                        spacing="compact"
                        icon="add"
                        height={props.buttonText ? 'auto' : '26px'}
                        width={props.buttonText ? 'auto' : '26px'}
                        text={showItemCreator ? '' : props.buttonText}
                        onClick={() => {
                            setShowItemCreator(!showItemCreator)
                            showItemCreator ? textRef.current.blur() : textRef.current.focus()
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
                        validation={(input) => {
                            let currentVal = input
                            // Check for prefix with TODO or NOTE
                            const itemMatches = currentVal.match(itemRegex)
                            if (itemMatches) {
                                currentVal = currentVal.replace(
                                    itemRegex,
                                    '<span class="valid">$&</span>',
                                )
                            } else {
                                currentVal = currentVal.replace(
                                    itemRegex,
                                    '<span class="invalid">$&</span>',
                                )
                                textRef.current.innerHTML = currentVal
                                setEndOfContenteditable(textRef.current)
                                return false
                            }

                            // Check for due date references
                            const dueTextMatches = currentVal.match(dueTextRegex)
                            if (dueTextMatches) {
                                const dueDateText = dueTextMatches[0].split(':')[1]

                                const dueDate = chrono.parse(dueDateText)
                                if (dueDate.length) {
                                    currentVal = currentVal.replace(
                                        dueTextRegex,
                                        '<span class="valid">$&</span>',
                                    )
                                } else {
                                    currentVal = currentVal.replace(
                                        dueTextRegex,
                                        '<span class="invalid">$&</span>',
                                    )
                                    textRef.current.innerHTML = currentVal
                                    setEndOfContenteditable(textRef.current)
                                    return false
                                }
                            }
                            // Check for scheduled date references
                            const scheduledTextMatches = currentVal.match(scheduledTextRegex)
                            if (scheduledTextMatches) {
                                const scheduledDateText = scheduledTextMatches[0].split(':')[1]

                                const scheduledDate = chrono.parse(scheduledDateText)
                                if (scheduledDate.length) {
                                    currentVal = currentVal.replace(
                                        scheduledTextRegex,
                                        '<span class="valid">$&</span>',
                                    )
                                    textRef.current.innerHTML = currentVal
                                    setEndOfContenteditable(textRef.current)
                                } else {
                                    currentVal = currentVal.replace(
                                        scheduledTextRegex,
                                        '<span class="invalid">$&</span>',
                                    )
                                    textRef.current.innerHTML = currentVal
                                    setEndOfContenteditable(textRef.current)
                                    return false
                                }
                            }
                            // TODO: Decide how I want to handle project stuff
                            currentVal = currentVal.replace(
                                projectTextRegex,
                                '<span class="valid">$&</span >',
                            )
                            currentVal = currentVal.replace(
                                repeatTextRegex,
                                '<span class="valid">$&</span >',
                            )

                            textRef.current.innerHTML = currentVal
                            setEndOfContenteditable(textRef.current)
                            return true
                        }}
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
                            textRef.current.innerHTML = ''
                        }}
                        readOnly={false}
                        input=""
                        singleline={true}
                        shouldClearOnSubmit={true}
                        shouldSubmitOnBlur={false}
                        onEscape={props.onEscape}
                    />

                    <HelpButtonContainer
                        data-for={'help-icon' + props.parentId + props.projectId + props.type}
                        data-tip
                        data-html={true}
                    >
                        {Icons.help(18, 18, themes[props.theme].colours.disabledTextColour)}
                    </HelpButtonContainer>
                    <Tooltip
                        id={'help-icon' + props.parentId + props.projectId + props.type}
                        multiline={true}
                        html={true}
                        text={`To add an item first start with the type of item you want  <br>
                        <ul>
                        <li> <code>TODO</code> for todos </li>
                        <li> <code>NOTE</code> for notes </li> 
                        </ul>
                        You can also add different attributes: <br>
                        <ul>
                        <li> <code>due:today</code> or <code>due:"7th January"</code> </li>
                        <li> <code>scheduled:monday</code> or <code>scheduled:"next monday"</code> </li>
                        <li> <code>project:Inbox</code> or <code>project:"Important secret project"</code> </li>
                        </ul>
                         Note that multi word inputs need to be surrounded in quotation marks ""
                         `}
                    ></Tooltip>
                </ItemCreatorContainer>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

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
