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
    trashSweepIcon,
    hideIcon,
    showIcon,
    sortIcon,
    inboxIcon,
    calendarIcon,
    slideLeftIcon,
    slideRightIcon,
} from '../assets/icons'

const iconMapping = {
    close: (w, h) => closeIcon(w, h),
    expand: (w, h) => expandedIcon(w, h),
    collapse: (w, h) => collapsedIcon(w, h),
    help: (w, h) => helpIcon(w, h),
    repeat: (w, h) => repeatIcon(w, h),
    due: (w, h) => dueIcon(w, h),
    scheduled: (w, h) => scheduledIcon(w, h),
    note: (w, h) => noteIcon(w, h),
    add: (w, h) => addIcon(w, h),
    todo_unchecked: (w, h) => todoUncheckedIcon(w, h),
    todo_checked: (w, h) => todoCheckedIcon(w, h),
    trash: (w, h) => trashIcon(w, h),
    trash_sweep: (w, h) => trashSweepIcon(w, h),
    hide: (w, h) => hideIcon(w, h),
    show: (w, h) => showIcon(w, h),
    sort: (w, h) => sortIcon(w, h),
    inbox: (w, h) => inboxIcon(w, h),
    calendar: (w, h) => calendarIcon(w, h),
    slide_left: (w, h) => slideLeftIcon(w, h),
    slide_right: (w, h) => slideRightIcon(w, h),
}

// TODO: Change width and height to strings
export interface ButtonProps {
    onClick: () => void
    spacing?: 'compact' | 'default'
    type: 'primary' | 'error' | 'default' | 'invert'
    text?: string
    textSize?: 'xsmall' | 'small' | 'regular' | 'large'
    iconSize?: string
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
        | 'trash_sweep'
        | 'show'
        | 'hide'
        | 'sort'
        | 'inbox'
        | 'calendar'
        | 'slide_right'
        | 'slide_left'
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
                    {props.icon && (
                        <Icon>
                            {iconMapping[props.icon](
                                props.iconSize || null,
                                props.iconSize || null,
                            )}
                        </Icon>
                    )}
                    {props.text && (
                        <Text
                            textSize={props.textSize}
                            hasIcon={props.icon != undefined}
                        >
                            {props.text}
                        </Text>
                    )}
                </Contents>
            </StyledButton>
        </ThemeProvider>
    )
}
