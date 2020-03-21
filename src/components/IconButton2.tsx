import React, { ReactElement } from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import {
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
  visible?: boolean;
  width?: number;
  height?: number;
  invert?: boolean;
  coloured?: boolean;
}
// TODO: Add background colour and invert props
const Container = styled.div<ContainerProps>`
  display: ${props => (props.visible ? "flex" : "none")};

  background-color: ${props =>
    props.coloured
      ? props.invert
        ? props.theme.colours.darkDialogBackgroundColour
        : props.theme.colours.lightDialogBackgroundColour
      : null}

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
  border-radius: 50%;
  text-align: center;
  float: right;
  &:hover {
    cursor: pointer;
    background-color: ${props =>
      props.coloured
        ? props.invert
          ? props.theme.colours.focusDarkDialogBackgroundColour
          : props.theme.colours.focusLightDialogBackgroundColour
        : null}
  }
`;

interface Props {
  onClick: () => void;
  visible: boolean;
  height?: number;
  width?: number;
  invert?: boolean;
  icon:
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
      >
        {iconMapping[props.icon](props.width, props.height)}
      </Container>
    </ThemeProvider>
  );
};

export default IconButton;
