import React, { useState, ReactElement } from 'react'
import EditableText, { EditableTextProps } from './EditableText'
import chrono from 'chrono-node'
import {
    setEndOfContenteditable,
    dueTextRegex,
    scheduledTextRegex,
    projectTextRegex,
    repeatTextRegex,
    itemRegex,
} from '../utils'

type ValidatingEditableTextProps = EditableTextProps & {}
export const ValidatingEditableText = (props: ValidatingEditableTextProps): ReactElement => {
    const [valid, setValid] = useState(true)

    const handleKeyPress = (i: string): void => {
        let currentVal = props.innerRef.current.innerText
        setValid(true)

        // Check for prefix with TODO or NOTE
        const itemMatches = currentVal.match(itemRegex)
        if (itemMatches) {
            currentVal = currentVal.replace(itemRegex, '<span class="valid">$&</span>')
            setValid(true)
        } else {
            currentVal = currentVal.replace(itemRegex, '<span class="invalid">$&</span>')
            setValid(false)
        }

        // Check for due date references
        const dueTextMatches = currentVal.match(dueTextRegex)
        if (dueTextMatches) {
            const dueDateText = dueTextMatches[0].split(':')[1]

            const dueDate = chrono.parse(dueDateText)
            if (dueDate.length) {
                currentVal = currentVal.replace(dueTextRegex, '<span class="valid">$&</span>')
                setValid(true)
            } else {
                currentVal = currentVal.replace(dueTextRegex, '<span class="invalid">$&</span>')
                setValid(false)
            }
        }
        // Check for scheduled date references
        const scheduledTextMatches = currentVal.match(scheduledTextRegex)
        if (scheduledTextMatches) {
            const scheduledDateText = scheduledTextMatches[0].split(':')[1]

            const scheduledDate = chrono.parse(scheduledDateText)
            if (scheduledDate.length) {
                currentVal = currentVal.replace(scheduledTextRegex, '<span class="valid">$&</span>')
                setValid(true)
            } else {
                currentVal = currentVal.replace(
                    scheduledTextRegex,
                    '<span class="invalid">$&</span>',
                )
                setValid(false)
            }
        }
        // TODO: Decide how I want to handle project stuff
        currentVal = currentVal.replace(projectTextRegex, '<span class="valid">$&</span >')
        currentVal = currentVal.replace(repeatTextRegex, '<span class="valid">$&</span >')
        props.innerRef.current.innerHTML = currentVal
        setEndOfContenteditable(props.innerRef.current)
    }

    return <EditableText {...props} onKeyPress={handleKeyPress} valid={valid} />
}
