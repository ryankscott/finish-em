import React, { ReactElement, useState, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import marked from 'marked'
import { setEndOfContenteditable } from '../utils'
import { Paragraph, Title, Header } from './Typography'
import { Container } from './styled/EditableText'

interface EditableTextProps {
    input: string
    innerRef: React.RefObject<HTMLInputElement>
    onUpdate: (input: string) => void
    onEditingChange?: (isEditing: boolean) => void
    shouldValidate: boolean
    validationRule?: (input: string) => boolean
    shouldSubmitOnBlur: boolean
    readOnly?: boolean
    width?: string
    height?: string
    singleline?: boolean
    style?: typeof Title | typeof Paragraph | typeof Header
    onKeyDown?: (input: string) => void
}

function EditableText(props: EditableTextProps): ReactElement {
    const [input, setInput] = useState(props.input)
    const [editable, setEditable] = useState(false)
    const [valid, setValid] = useState(true)
    // TODO: Remove from state

    useEffect(() => {
        if (editable) {
            setEndOfContenteditable(props.innerRef.current)
        }
    }, [editable])

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
    const handleBlur = (e): void => {
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
            if (props.shouldValidate) {
                if (props.validationRule(props.innerRef.current.innerText)) {
                    props.onUpdate(
                        props.innerRef.current.innerText.replace(
                            /\r/gi,
                            '<br/>',
                        ),
                    )
                    setInput('')
                    props.innerRef.current.innerText = ''
                }
            } else {
                props.onUpdate(
                    props.innerRef.current.innerText.replace(/\r/gi, '<br/>'),
                )
                setInput('')
                props.innerRef.current.innerText = ''
            }
            return
        }
    }
    const clearInput = (): void => {
        setInput('')
        setValid(true)
        props.innerRef.current.innerText = ''
    }

    const handleKeyPress = (e): void => {
        const currentVal = props.innerRef.current.innerText.trim()
        setValid(props.validationRule(currentVal))

        if (props.onKeyDown) {
            props.onKeyDown(currentVal)
        }

        if (e.key == 'Enter' && props.singleline) {
            if (props.onEditingChange) {
                props.onEditingChange(false)
            }
            // Validate input
            if (props.shouldValidate) {
                if (props.validationRule(currentVal)) {
                    props.onUpdate(
                        props.innerRef.current.innerText.replace(
                            /\r/gi,
                            '<br/>',
                        ),
                    )
                    setEditable(false)
                    clearInput()
                    props.innerRef.current.blur()
                }
                e.preventDefault()
                return
            } else {
                props.onUpdate(
                    props.innerRef.current.innerText.replace(/\r/gi, '<br/>'),
                )
                clearInput()
                props.innerRef.current.blur()
                e.preventDefault()
                return
            }
        } else if (e.key == 'Escape') {
            setInput(props.innerRef.current.innerText)
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

    // TODO: Fix the return type
    // NOTE: We have to replace newlines with HTML breaks
    const getRawText = (): {} => {
        return { __html: input.replace(/\n/gi, '<br/>') }
    }

    // TODO: Fix the return type
    const getMarkdownText = (): {} => {
        return { __html: marked(input, { breaks: true }) }
    }

    return (
        <ThemeProvider theme={theme}>
            <Container
                placeholder="foo"
                valid={props.shouldValidate ? valid : true}
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

export default React.forwardRef(
    (props: EditableTextProps, ref: React.RefObject<HTMLInputElement>) => (
        <EditableText innerRef={ref} {...props} />
    ),
)
