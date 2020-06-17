import React, { ReactElement } from 'react'
import { AttributeContainer, AttributeIcon, AttributeText } from './styled/ItemAttribute'
import { Icons } from '../assets/icons'

interface OwnProps {
    type: 'repeat' | 'due' | 'scheduled' | 'subtask'
    text: string
    completed: boolean
}
type ItemAttributeProps = OwnProps

export const ItemAttribute = (props: ItemAttributeProps): ReactElement => {
    return (
        <AttributeContainer completed={props.completed}>
            <AttributeIcon> {Icons[props.type](14, 14)}</AttributeIcon>
            <AttributeText>{props.text}</AttributeText>
        </AttributeContainer>
    )
}
