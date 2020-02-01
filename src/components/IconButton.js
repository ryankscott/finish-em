import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { theme } from "../theme";

const StyledButton = styled.button`
  background-color: inherit;
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
  text-align: center;
  float: right;
  &:hover {
    cursor: pointer;
  }
`;

function IconButton(props) {
  return (
    <ThemeProvider theme={theme}>
      <StyledButton invert={props.invert} onClick={props.onClick}>
        {props.children}
      </StyledButton>
    </ThemeProvider>
  );
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IconButton);
