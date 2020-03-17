import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { theme } from "../theme";
import { closeIcon } from "../assets/icons";

interface StyledButtonProps {
  invert: boolean;
}
const StyledButton = styled.button<StyledButtonProps>`
  background-color: ${props =>
    props.invert
      ? props.theme.colours.darkDialogBackgroundColour
      : props.theme.colours.lightDialogBackgroundColour};
  color: ${props =>
    props.invert
      ? props.theme.colours.altTextColour
      : props.theme.colours.defaultTextColour};
  font-size: ${props => props.theme.fontSizes.xsmall};
  padding: 2px;
  border: none;
  height: 20px;
  width: 20px;
  margin: 2px;
  border-radius: 50%;
  text-align: center;
  float: right;
  &:hover {
    cursor: pointer;
    background-color: ${props =>
      props.invert
        ? props.theme.colours.focusDarkDialogBackgroundColour
        : props.theme.colours.focusLightDialogBackgroundColour};
  }
`;

interface CloseButtonProps {
  invert: boolean;
  onClick: () => void;
}
const CloseButton = (props: CloseButtonProps) => {
  return (
    <ThemeProvider theme={theme}>
      <StyledButton invert={props.invert} onClick={props.onClick}>
        {closeIcon}
      </StyledButton>
    </ThemeProvider>
  );
};

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(CloseButton);
