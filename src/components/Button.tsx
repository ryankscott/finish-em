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
}

// TODO: Change width and height to strings
export interface ButtonProps {
  onClick: () => void
  spacing?: 'compact' | 'default'
  type: 'primary' | 'error' | 'default' | 'invert'
  children?: React.ReactChild
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
        hasChildren={props.children != undefined}
        data-tip
        data-for={props.dataFor}
        tabIndex={-1 || props.tabIndex}
      >
        <Contents>
          {props.icon && <Icon>{iconMapping[props.icon]}</Icon>}
          {props.children && <Text>{props.children}</Text>}
        </Contents>
      </StyledButton>
    </ThemeProvider>
  )
}
