import React from "react";
import { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { StyledButton, Contents, Icon, Text } from "./styled/Button";
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
} from "../assets/icons";

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
};

export interface ButtonProps {
  onClick: () => void;
  spacing?: "compact" | "default";
  type: "primary" | "error" | "default" | "invert";
  children?: React.ReactChild;
  dataFor?: string;
  width?: number;
  height?: number;
  icon?:
    | "close"
    | "expand"
    | "collapse"
    | "help"
    | "repeat"
    | "due"
    | "scheduled"
    | "note"
    | "add"
    | "todo_unchecked"
    | "todo_checked"
    | "trash"
    | "show"
    | "hide";
}

const getTheme = (type: string) => {
  return theme.button[type];
};

export const Button = (props: ButtonProps) => {
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
      >
        <Contents>
          {props.icon && <Icon>{iconMapping[props.icon]}</Icon>}
          {props.children && <Text>{props.children}</Text>}
        </Contents>
      </StyledButton>
    </ThemeProvider>
  );
};
