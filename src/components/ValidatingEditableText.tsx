import React, { useState, ReactElement } from 'react'
import EditableText, { OwnProps } from './EditableText'

type ValidatingEditableTextProps = OwnProps & {
    validation: (input: string) => boolean
}
export const ValidatingEditableText = (props: ValidatingEditableTextProps): ReactElement => {
    return <EditableText {...props} />
}
