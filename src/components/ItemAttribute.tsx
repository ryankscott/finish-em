import React, { ReactElement } from 'react'
import { AttributeContainer, AttributeIcon, AttributeText } from './styled/ItemAttribute'
import { repeat, due, scheduled, subtask } from '../assets/icons'

interface OwnProps {
    type: 'repeat' | 'due' | 'scheduled' | 'parent'
    text: string
    completed: boolean
}
type ItemAttributeProps = OwnProps

const getIcon = (icon: 'repeat' | 'due' | 'scheduled' | 'parent'): React.SVGProps<SVGElement> => {
    switch (icon) {
        case 'repeat':
            return repeat(14, 14)
        case 'due':
            return due(14, 14)
        case 'scheduled':
            return scheduled(14, 14)
        case 'parent':
            return subtask(14, 14)
        default:
            break
    }
}

export const ItemAttribute = (props: ItemAttributeProps): ReactElement => {
    return (
        <AttributeContainer completed={props.completed}>
            <AttributeIcon> {getIcon(props.type)}</AttributeIcon>
            <AttributeText>{props.text}</AttributeText>
        </AttributeContainer>
    )
}
