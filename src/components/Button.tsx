import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { StyledButton, Contents, Icon, Text } from './styled/Button'
import {
    closeIcon,
    expandedIcon,
    collapsedIcon,
    dueIcon,
    scheduledIcon,
    todoCheckedIcon,
    todoUncheckedIcon,
    helpIcon,
    repeatIcon,
    noteIcon,
    addIcon,
    trashIcon,
    hideIcon,
    showIcon,
    sortIcon,
} from '../assets/icons'

const iconMapping = {
    close: closeIcon(),
    expand: expandedIcon(),
    collapse: collapsedIcon(),
    help: helpIcon(),
    repeat: repeatIcon(),
    due: dueIcon(),
    scheduled: scheduledIcon(),
    note: noteIcon(),
    add: addIcon(),
    todo_unchecked: todoUncheckedIcon(),
    todo_checked: todoCheckedIcon(),
    trash: trashIcon(),
    hide: hideIcon(),
    show: showIcon(),
    sort: sortIcon(),
}

// TODO: Change width and height to strings
export interface ButtonProps {
    onClick: () => void
    spacing?: 'compact' | 'default'
    type: 'primary' | 'error' | 'default' | 'invert'
    text?: string
    tabIndex?: number
    dataFor?: string
    width?: string
    height?: string
    icon?:
        | 'close'
        | 'expand'
        | 'collapse'
        | 'help'
        | 'repeat'
        | 'due'
        | 'scheduled'
        | 'note'
        | 'add'
        | 'todo_unchecked'
        | 'todo_checked'
        | 'trash'
        | 'show'
        | 'hide'
        | 'sort'
}

const getTheme = (type: string): {} => {
    return theme.button[type]
}

export const Button = (props: ButtonProps): ReactElement => {
    return (
        <ThemeProvider theme={getTheme(props.type)}>
            <StyledButton
                spacing={props.spacing}
                height={props.height}
                width={props.width}
                onClick={props.onClick}
                data-tip
                data-for={props.dataFor}
                tabIndex={-1 || props.tabIndex}
                iconOnly={props.icon && !props.text}
            >
                <Contents>
                    {props.icon && <Icon>{iconMapping[props.icon]}</Icon>}
                    {props.text && (
                        <Text hasIcon={props.icon != undefined}>
                            {props.text}
                        </Text>
                    )}
                </Contents>
            </StyledButton>
        </ThemeProvider>
    )
}
