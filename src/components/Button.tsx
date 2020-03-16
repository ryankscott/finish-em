import React from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";

const StyledButton = styled.button<StyledProps>`
  background-color: ${props => props.theme.backgroundColour};
  color: ${props => props.theme.colour};
  font-size: ${props => props.theme.fontSizes.xsmall};
  padding: 2px 5px;
  height: ${props => (props.compact ? "25px" : "30px")};
  width: ${props => (props.compact ? "60px" : "90px")};
  margin: 2px;
  border-radius: 5px;
  border: 1px solid;
  border-color: ${props => props.theme.borderColour};
  text-align: center;
  &:hover {
    background-color: ${props => props.theme.hoverBackgroundColour};
    border-color: ${props => props.theme.hoverBackgroundColour};
    cursor: pointer;
  }
`;

interface StyledProps {
  compact: boolean;
}

export interface ButtonProps {
  onClick: (x: void) => void;
  compact: boolean;
  type: string;
  children?: React.ReactChild;
}

const getTheme = (type: string) => {
  return theme.button[type];
};

export const Button: React.FunctionComponent<ButtonProps> = props => (
  <ThemeProvider theme={getTheme(props.type)}>
    <StyledButton compact={props.compact} onClick={props.onClick}>
      {props.children}
    </StyledButton>
  </ThemeProvider>
);
