import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { StyledButton, Contents, Icon, Text } from './styled/Button'
import * as ic from '../assets/icons'

const iconMapping = {
    close: (w, h, c) => ic.closeIcon(w, h, c),
    expand: (w, h, c) => ic.expandedIcon(w, h, c),
    collapse: (w, h, c) => ic.collapsedIcon(w, h, c),
    help: (w, h, c) => ic.helpIcon(w, h, c),
    repeat: (w, h, c) => ic.repeatIcon(w, h, c),
    due: (w, h, c) => ic.dueIcon(w, h, c),
    scheduled: (w, h, c) => ic.scheduledIcon(w, h, c),
    note: (w, h, c) => ic.noteIcon(w, h, c),
    add: (w, h, c) => ic.addIcon(w, h, c),
    todo_unchecked: (w, h, c) => ic.todoUncheckedIcon(w, h, c),
    todo_checked: (w, h, c) => ic.todoCheckedIcon(w, h, c),
    trash: (w, h, c) => ic.trashIcon(w, h, c),
    trash_sweep: (w, h, c) => ic.trashSweepIcon(w, h, c),
    hide: (w, h, c) => ic.hideIcon(w, h, c),
    show: (w, h, c) => ic.showIcon(w, h, c),
    sort: (w, h, c) => ic.sortIcon(w, h, c),
    inbox: (w, h, c) => ic.inboxIcon(w, h, c),
    calendar: (w, h, c) => ic.calendarIcon(w, h, c),
    slide_left: (w, h, c) => ic.slideLeftIcon(w, h, c),
    slide_right: (w, h, c) => ic.slideRightIcon(w, h, c),
    up_level: (w, h, c) => ic.upLevelIcon(w, h, c),
    back: (w, h, c) => ic.backIcon(w, h, c),
    forward: (w, h, c) => ic.forwardIcon(w, h, c),
    settings: (w, h, c) => ic.settingsIcon(w, h, c),
    subtask: (w, h, c) => ic.subtaskIcon(w, h, c),
}

// TODO: Change width and height to strings
export interface ButtonProps {
    id?: string
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    spacing?: 'compact' | 'default'
    type: 'primary' | 'error' | 'default' | 'invert' | 'subtle' | 'subtleInvert'
    text?: string
    textSize?: 'xsmall' | 'small' | 'regular' | 'large'
    iconSize?: string
    iconColour?: string
    tabIndex?: number
    dataFor?: string
    width?: string
    height?: string
    iconPosition?: 'before' | 'after'
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
        | 'up_level'
        | 'back'
        | 'forward'
        | 'settings'
        | 'subtask'
}

const getTheme = (type: string): {} => {
    return theme.button[type]
}

export const Button = (props: ButtonProps): ReactElement => {
    return (
        <ThemeProvider theme={getTheme(props.type)}>
            <StyledButton
                id={props.id}
                spacing={props.spacing}
                height={props.height}
                width={props.width}
                onClick={props.onClick}
                data-tip
                data-for={props.dataFor}
                tabIndex={props.tabIndex != undefined ? props.tabIndex : -1}
                iconOnly={props.icon && !props.text}
            >
                <Contents>
                    {props.icon && !(props.iconPosition == 'after') && (
                        <Icon iconPosition={props.iconPosition}>
                            {iconMapping[props.icon](
                                props.iconSize || null,
                                props.iconSize || null,
                                props.iconColour || null,
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
                    {props.icon && props.iconPosition == 'after' && (
                        <Icon iconPosition={props.iconPosition}>
                            {iconMapping[props.icon](
                                props.iconSize || null,
                                props.iconSize || null,
                                props.iconColour || null,
                            )}
                        </Icon>
                    )}
                </Contents>
            </StyledButton>
        </ThemeProvider>
    )
}
