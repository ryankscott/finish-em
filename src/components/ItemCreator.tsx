import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { createItem, addChildItem } from '../actions'
import { v4 as uuidv4 } from 'uuid'
import Button from './Button'
import Tooltip from './Tooltip'
import { Container, ItemCreatorContainer, HelpButtonContainer } from './styled/ItemCreator'
import { Icons } from '../assets/icons'
import { themes } from '../theme'
import { ThemeProvider } from '../StyledComponents'
import { Date as sugarDate } from 'sugar-date'
import {
    setEndOfContenteditable,
    dueTextRegex,
    scheduledTextRegex,
    projectTextRegex,
    repeatTextRegex,
    itemRegex,
} from '../utils'
import EditableText from './EditableText'
import { lighten } from 'polished'
import { isValid } from 'date-fns'

interface StateProps {
    theme: string
}

interface DispatchProps {
    createSubTask: (parentId: string, text: string, projectId: string | '0') => void
    createItem: (text: string, projectId: string | '0') => void
}

interface OwnProps {
    style?: 'subtle' | 'default'
    type: 'item' | 'subtask'
    initiallyExpanded: boolean
    shouldCloseOnSubmit?: boolean
    shouldCloseOnBlur?: boolean
    parentId?: string
    projectId?: string | '0'
    buttonText?: string
    width?: string
    hideButton?: boolean
    backgroundColour?: string
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
        } else {
            setShowItemCreator(false)
        }

        if (props.shouldCloseOnBlur) {
            setShowItemCreator(false)
        }
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
                        height={props.buttonText ? 'auto' : '24px'}
                        width={props.buttonText ? 'auto' : '24px'}
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
                <ItemCreatorContainer
                    backgroundColour={props.backgroundColour}
                    width={props.width}
                    visible={showItemCreator}
                >
                    <EditableText
                        backgroundColour={props.backgroundColour}
                        innerRef={textRef}
                        placeholder="Add a new task..."
                        keywords={[
                            {
                                matcher: itemRegex,
                                validation: (input) => {
                                    return true
                                },
                            },
                            {
                                matcher: dueTextRegex,
                                validation: (input) => {
                                    const dueDateText = input.split(':')[1]
                                    if (dueDateText == undefined) return false
                                    return isValid(sugarDate.create(dueDateText))
                                },
                            },
                            {
                                matcher: scheduledTextRegex,
                                validation: (input) => {
                                    const scheduledDateText = input.split(':')[1]
                                    return isValid(sugarDate.create(scheduledDateText))
                                },
                            },
                        ]}
                        validation={(input) => {
                            let currentVal = input
                            // Check for prefix with TODO or NOTE
                            const itemMatches = currentVal.match(itemRegex)
                            if (!itemMatches) {
                                setEndOfContenteditable(textRef.current)
                                return false
                            }

                            // Check for due date references
                            const dueTextMatches = currentVal.match(dueTextRegex)
                            if (dueTextMatches) {
                                let dueDateText = dueTextMatches[0].split(':')[1]
                                dueDateText = dueDateText.replace(/^"(.+(?="$))"$/, '$1')
                                const dueDate = sugarDate.create(dueDateText)
                                if (!isValid(dueDate)) {
                                    setEndOfContenteditable(textRef.current)
                                    return false
                                }
                            }
                            // Check for scheduled date references
                            const scheduledTextMatches = currentVal.match(scheduledTextRegex)
                            if (scheduledTextMatches) {
                                let scheduledDateText = scheduledTextMatches[0].split(':')[1]
                                scheduledDateText = scheduledDateText.replace(
                                    /^"(.+(?="$))"$/,
                                    '$1',
                                )
                                const scheduledDate = sugarDate.create(scheduledDateText)
                                if (!isValid(scheduledDate)) {
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

                    {showItemCreator && (
                        <>
                            <HelpButtonContainer
                                data-for={
                                    'help-icon' + props.parentId + props.projectId + props.type
                                }
                                data-tip
                                data-html={true}
                            >
                                {Icons.help(
                                    18,
                                    18,
                                    props.backgroundColour
                                        ? lighten(0.2, props.backgroundColour)
                                        : themes[props.theme].colours.disabledTextColour,
                                )}
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
                        </>
                    )}
                </ItemCreatorContainer>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    createItem: (text: string, projectId: string | '0') => {
        dispatch(createItem(uuidv4(), text, projectId))
    },
    createSubTask: (parentId: string, text: string, projectId: string | '0') => {
        const childId = uuidv4()
        dispatch(createItem(childId, text, projectId))
        dispatch(addChildItem(childId, parentId))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(ItemCreator)
