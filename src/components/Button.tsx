import React from "react";
import { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { StyledButton } from "./styled/Button";

export interface ButtonProps {
  onClick: () => void;
  compact: boolean;
  type: string;
  children?: React.ReactChild;
}

const getTheme = (type: string) => {
  return theme.button[type];
};

export const Button = (props: ButtonProps) => (
  <ThemeProvider theme={getTheme(props.type)}>
    <StyledButton compact={props.compact} onClick={props.onClick}>
      {props.children}
    </StyledButton>
  </ThemeProvider>
);
