import React, { ReactElement, useState, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import marked from 'marked'
import { setEndOfContenteditable } from '../utils'
import { Paragraph, Title, Header } from './Typography'
import { Container } from './styled/EditableText'
import { isValid } from 'date-fns'

type validation =
    | { validate: false }
    | {
          validate: true
          rule: (input: string) => boolean
      }
interface EditableTextProps {
    input: string
    innerRef: React.RefObject<HTMLInputElement>
    onUpdate: (input: string) => void
    shouldSubmitOnBlur: boolean
    shouldClearOnSubmit: boolean
    readOnly?: boolean
    width?: string
    height?: string
    singleline?: boolean
    style?: typeof Title | typeof Paragraph | typeof Header
    onKeyDown?: (input: string) => void
    onEditingChange?: (isEditing: boolean) => void
    validation: validation
}

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
        setInput('')
    }

    const handleClick = (e): void => {
        // Handle links normally
        if (e.target.nodeName == 'A') {
            return
        }
        if (props.readOnly) {
            e.preventDefault()
            e.stopPropagation()
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
        setInput(props.innerRef.current.innerText)
        if (props.onEditingChange) {
            props.onEditingChange(false)
        }
        // Validate input
        if (props.shouldSubmitOnBlur) {
            if (props.validation.validate) {
                if (props.validation.rule(props.innerRef.current.innerText)) {
                    props.onUpdate(
                        props.innerRef.current.innerText.replace(
                            /\r/gi,
                            '<br/>',
                        ),
                    )
                    if (props.shouldClearOnSubmit) {
                        clearInput()
                    }
                }
            } else {
                props.onUpdate(
                    props.innerRef.current.innerText.replace(/\r/gi, '<br/>'),
                )
                if (props.shouldClearOnSubmit) {
                    clearInput()
                }
            }
            return
        }
    }

    const handleKeyPress = (e): void => {
        const currentVal = props.innerRef.current.innerText

        if (props.onKeyDown) {
            props.onKeyDown(currentVal)
        }

        if (props.validation.validate) {
            setValid(props.validation.rule(currentVal))
        }

        if (e.key == 'Enter' && props.singleline) {
            if (props.onEditingChange) {
                props.onEditingChange(false)
            }
            // Validate input
            if (props.validation.validate) {
                if (props.validation.rule(currentVal)) {
                    props.onUpdate(
                        props.innerRef.current.innerText.replace(
                            /\r/gi,
                            '<br/>',
                        ),
                    )
                    setEditable(false)
                    if (props.shouldClearOnSubmit) {
                        clearInput()
                    }
                    props.innerRef.current.blur()
                }
                e.preventDefault()
                return
            } else {
                props.onUpdate(
                    props.innerRef.current.innerText.replace(/\r/gi, '<br/>'),
                )
                if (props.shouldClearOnSubmit) {
                    clearInput()
                }
                props.innerRef.current.blur()
                e.preventDefault()
                return
            }
        } else if (e.key == 'Escape') {
            if (props.onEditingChange) {
                props.onEditingChange(false)
            }
            setEditable(false)
            props.innerRef.current.blur()
            e.preventDefault()
        }
        return
    }

    const handleFocus = (e): void => {
        // NOTE: Weirdly Chrome sometimes fires a focus event before a click
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

    return (
        <ThemeProvider theme={theme}>
            <Container
                valid={props.validation.validate ? valid : true}
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
                dangerouslySetInnerHTML={
                    editable ? getRawText() : getMarkdownText()
                }
            />
        </ThemeProvider>
    )
}

const EditableText = React.forwardRef(
    (props: EditableTextProps, ref: React.RefObject<HTMLInputElement>) => (
        <InternalEditableText innerRef={ref} {...props} />
    ),
)

EditableText.displayName = 'EditableText'
export default EditableText
