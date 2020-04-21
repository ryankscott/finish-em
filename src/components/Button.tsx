import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { StyledButton, Contents, Icon, Text } from './styled/Button'
import * as ic from '../assets/icons'

const iconMapping = {
    close: (w, h) => ic.closeIcon(w, h),
    expand: (w, h) => ic.expandedIcon(w, h),
    collapse: (w, h) => ic.collapsedIcon(w, h),
    help: (w, h) => ic.helpIcon(w, h),
    repeat: (w, h) => ic.repeatIcon(w, h),
    due: (w, h) => ic.dueIcon(w, h),
    scheduled: (w, h) => ic.scheduledIcon(w, h),
    note: (w, h) => ic.noteIcon(w, h),
    add: (w, h) => ic.addIcon(w, h),
    todo_unchecked: (w, h) => ic.todoUncheckedIcon(w, h),
    todo_checked: (w, h) => ic.todoCheckedIcon(w, h),
    trash: (w, h) => ic.trashIcon(w, h),
    trash_sweep: (w, h) => ic.trashSweepIcon(w, h),
    hide: (w, h) => ic.hideIcon(w, h),
    show: (w, h) => ic.showIcon(w, h),
    sort: (w, h) => ic.sortIcon(w, h),
    inbox: (w, h) => ic.inboxIcon(w, h),
    calendar: (w, h) => ic.calendarIcon(w, h),
    slide_left: (w, h) => ic.slideLeftIcon(w, h),
    slide_right: (w, h) => ic.slideRightIcon(w, h),
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
