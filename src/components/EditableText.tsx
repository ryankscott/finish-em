import React, { ReactElement, useState, useEffect } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import marked from 'marked'
import { setEndOfContenteditable } from '../utils'
import { Paragraph, Title, Header, Code } from './Typography'
import { Container, Placeholder } from './styled/EditableText'
import { connect } from 'react-redux'
import CSS from 'csstype'
import { fontSizeType } from '../interfaces'
import isElectron from 'is-electron'
import uuidv4 from 'uuid'

if (isElectron()) {
    const electron = window.require('electron')
}

interface StateProps {
    theme: string
}

interface OwnProps {
    input: string
    innerRef: React.RefObject<HTMLInputElement>
    onUpdate: (input: string) => void
    shouldSubmitOnBlur: boolean
    shouldClearOnSubmit: boolean
    shouldShowBorderWhenReadOnly?: boolean
    backgroundColour?: CSS.Color
    fontSize?: fontSizeType
    readOnly?: boolean
    width?: string
    height?: string
    placeholder?: string
    singleline?: boolean
    plainText?: boolean
    style?: typeof Title | typeof Paragraph | typeof Header | typeof Code
    validation?: (input: string) => boolean
    onKeyDown?: (input: string) => void
    onKeyPress?: (input: string) => void
    onEditingChange?: (isEditing: boolean) => void
    onEscape?: () => void
}

export type EditableTextProps = OwnProps & StateProps

function InternalEditableText(props: EditableTextProps): ReactElement {
    const [editable, setEditable] = useState(false)
    const [input, setInput] = useState(props.input)
    const [valid, setValid] = useState(true)

    useEffect(() => {
        setInput(props.input)
    })

    useEffect(() => {
        if (editable) {
            setEndOfContenteditable(props.innerRef.current)
        }
    }, [editable])

    const clearInput = (): void => {
        props.innerRef.current.innerText = ''
        props.innerRef.current.innerHTML = ''
        setInput('')
    }

    const handleClick = (e): void => {
        // Handle links normally
        if (e.target.nodeName == 'A') {
            if (e.target.href.startsWith('outlook')) {
                electron.ipcRenderer.send('open-outlook-link', {
                    url: e.target.href,
                })
                e.preventDefault()
            }
            return
        }
        if (props.readOnly) {
            e.preventDefault()
            return
        }
        // Ignore clicks if it's already editable
        if (editable) return
        setEditable(true)
        if (props.onEditingChange) {
            props.onEditingChange(true)
        }
        return
    }

    const handleBlur = (): void => {
        // Ignore events if it's read only
        if (props.readOnly) return
        // Ignore events if we're not editing
        if (!editable) return
        setEditable(false)

        if (props.onEditingChange) {
            props.onEditingChange(false)
        }
        if (props.shouldSubmitOnBlur) {
            if (!valid) {
                return
            }
            props.onUpdate(props.innerRef.current.innerText.replace(/\r/gi, '<br/>'))

            if (props.shouldClearOnSubmit) {
                clearInput()
            }
            return
        }
    }

    const handleKeyUp = (e): void => {
        if (e.key == 'Escape') {
            if (props.onEditingChange) {
                props.onEditingChange(false)
            }
            setEditable(false)
            props.onEscape ? props.onEscape() : null
        }
    }

    const handleKeyPress = (e): void => {
        const currentVal = props.innerRef.current.innerText

        // Validation
        if (props.validation) {
            setValid(props.validation(currentVal))
        }

        if (props.onKeyPress) {
            props.onKeyPress(currentVal)
        }

        if (props.onKeyDown) {
            props.onKeyDown(currentVal)
        }

        if (e.key == 'Enter' && props.singleline) {
            // If it's not valid then don't submit
            if (!valid) {
                // This stops an actual enter being sent
                e.preventDefault()
                return
            }

            props.onUpdate(props.innerRef.current.innerText.replace(/\r/gi, '<br/>'))

            // If we're clearing on submission we should clear the input and continue allowing editing
            if (props.shouldClearOnSubmit) {
                clearInput()
            }
            // This stops an actual enter being sent
            e.preventDefault()
            setEditable(false)
            props.innerRef.current.blur()
            return
        }
    }

    const handleFocus = (e): void => {
        // Ignore clicks if it's already editable
        if (editable) return
        // NOTE: Weirdly Chrome sometimes fires a focus event before a click
        console.log('click in an editable text')
        if (props.readOnly) {
            e.preventDefault()
            e.stopPropagation()
            return
        }
        if (e.target.nodeName == 'A') {
            return
        }
        if (!editable) {
            setEditable(true)
            if (props.onEditingChange) {
                props.onEditingChange(true)
            }
        }

        setEndOfContenteditable(props.innerRef.current)
        return
    }

    // NOTE: We have to replace newlines with HTML breaks
    const getRawText = (): {} => {
        return {
            __html: input.replace(/\n/gi, '<br/>'),
        }
    }

    // TODO: Fix the return type
    const getMarkdownText = (): {} => {
        return {
            __html: marked(input, {
                breaks: true,
            }),
        }
    }
    const id = uuidv4()

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <div style={{ position: 'relative', width: '100%' }}>
                <Container
                    id={id}
                    fontSize={props.fontSize}
                    backgroundColour={props.backgroundColour}
                    shouldShowBorderWhenReadOnly={props.shouldShowBorderWhenReadOnly}
                    valid={valid}
                    as={props.style || Paragraph}
                    readOnly={props.readOnly}
                    ref={props.innerRef}
                    width={props.width}
                    height={props.height}
                    editing={editable}
                    contentEditable={editable}
                    onClick={handleClick}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    tabIndex={-1}
                    onKeyPress={handleKeyPress}
                    onKeyUp={handleKeyUp}
                    dangerouslySetInnerHTML={
                        props.plainText
                            ? {
                                  __html: props.input,
                              }
                            : editable
                            ? getRawText()
                            : getMarkdownText()
                    }
                />
                {!editable && input.length == 0 && <Placeholder>{props.placeholder}</Placeholder>}
            </div>
        </ThemeProvider>
    )
}

const EditableText = React.forwardRef(
    (props: EditableTextProps, ref: React.RefObject<HTMLInputElement>) => (
        <InternalEditableText innerRef={ref} {...props} />
    ),
)

EditableText.displayName = 'EditableText'
const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(EditableText)
