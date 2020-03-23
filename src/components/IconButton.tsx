import React, { ReactElement } from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
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
  addIcon
} from "../assets/icons";

const iconMapping = {
  CLOSE: closeIcon,
  EXPAND: expandedIcon,
  COLLAPSE: collapsedIcon,
  HELP: helpIcon,
  REPEAT: repeatIcon,
  DUE: dueIcon,
  SCHEDULED: scheduledIcon,
  NOTE: noteIcon,
  ADD: addIcon,
  TODO_UNCHECKED: todoUncheckedIcon,
  TODO_CHECKED: todoCheckedIcon
};

interface ContainerProps {
  text?: boolean;
  visible?: boolean;
  width?: number;
  height?: number;
  invert?: boolean;
  coloured?: boolean;
}
// TODO: Add background colour and invert props
const Container = styled.div<ContainerProps>`
  display: ${props => (props.visible ? "flex" : "none")};
  align-items: center;
  font-size: ${props => props.theme.fontSizes.xsmall};
  background-color: ${props =>
    props.coloured
      ? props.invert
        ? props.theme.colours.darkDialogBackgroundColour
        : props.theme.colours.lightDialogBackgroundColour
      : null};
  color: ${props =>
    props.coloured
      ? props.invert
        ? props.theme.colours.altTextColour
        : props.theme.colours.defaultTextColour
      : null};
  font-size: ${props => props.theme.fontSizes.xsmall};
  padding: 2px;
  border: none;
  margin: 2px;
  border-radius: ${props => (props.text ? "5px" : "50%")};
  text-align: center;
  float: right;
  &:hover {
    cursor: pointer;
    background-color: ${props =>
      props.coloured
        ? props.invert
          ? props.theme.colours.focusDarkDialogBackgroundColour
          : props.theme.colours.focusLightDialogBackgroundColour
        : null};
  }
`;

const Text = styled.div`
  padding: 0px 5px;
`;

interface Props {
  onClick: (event?: React.MouseEvent) => void;
  visible: boolean;
  height?: number;
  width?: number;
  invert?: boolean;
  text?: string;
  coloured?: boolean;
  icon:
    | "CLOSE"
    | "EXPAND"
    | "COLLAPSE"
    | "HELP"
    | "REPEAT"
    | "DUE"
    | "SCHEDULED"
    | "NOTE"
    | "ADD"
    | "TODO_UNCHECKED"
    | "TODO_CHECKED";
}

const IconButton = (props: Props): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <Container
        height={props.height}
        width={props.width}
        visible={props.visible}
        onClick={props.onClick}
        invert={props.invert}
        coloured={props.coloured}
        text={props.text != undefined}
      >
        {iconMapping[props.icon](props.width, props.height)}
        {props.text && <Text>{props.text}</Text>}
      </Container>
    </ThemeProvider>
  );
};

export default IconButton;
