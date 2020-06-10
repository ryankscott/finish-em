import React, { ReactElement } from 'react'
import {
    AttributeContainer,
    AttributeIcon,
    AttributeText,
} from './styled/ItemAttribute'
import {
    repeatIcon,
    dueIcon,
    scheduledIcon,
    subtaskIcon,
} from '../assets/icons'

interface OwnProps {
    type: 'repeat' | 'due' | 'scheduled' | 'parent'
    text: string
    completed: boolean
}
type ItemAttributeProps = OwnProps

const getIcon = (
    icon: 'repeat' | 'due' | 'scheduled' | 'parent',
): React.SVGProps<SVGElement> => {
    switch (icon) {
        case 'repeat':
            return repeatIcon(14, 14)
        case 'due':
            return dueIcon(14, 14)
        case 'scheduled':
            return scheduledIcon(14, 14)
        case 'parent':
            return subtaskIcon(14, 14)
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
