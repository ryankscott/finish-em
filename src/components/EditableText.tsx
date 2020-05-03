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
    readOnly?: boolean
    width?: string
    height?: string
    singleline?: boolean
    style?: typeof Title | typeof Paragraph | typeof Header
}

function EditableText(props: EditableTextProps): ReactElement {
    const [input, setInput] = useState(props.input)
    const [editable, setEditable] = useState(false)

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
        props.onUpdate(props.innerRef.current.innerText)
        return
    }

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

    const handleKeyPress = (e): void => {
        if (props.readOnly) {
            e.preventDefault()
            e.stopPropagation()
            return
        }
        // TODO: We should be able to call this at the Item and have the ability to update the text
        if (e.key == 'Enter' && props.singleline) {
            setEditable(false)
            setInput(props.innerRef.current.innerText.trim())
            if (props.onEditingChange) {
                props.onEditingChange(false)
            }
            props.onUpdate(props.innerRef.current.innerText.trim())
            props.innerRef.current.blur()
            e.preventDefault()
        } else if (e.key == 'Escape') {
            setEditable(false)
            setInput(props.innerRef.current.innerText)
            if (props.onEditingChange) {
                props.onEditingChange(false)
            }
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
        return { __html: marked(input) }
    }

    return (
        <ThemeProvider theme={theme}>
            <Container
                as={props.style || Paragraph}
                readOnly={props.readOnly}
                ref={props.innerRef}
                width={props.width}
                height={props.height}
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
