import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { theme } from "../theme";

const StyledButton = styled.button`
  background-color: ${props => props.theme.colours.primaryColour};
  color: ${props => props.theme.colours.altTextColour};
  font-size: ${props => props.theme.fontSizes.xsmall};
  padding: 2px 5px;
  height: 30px;
  width: 90px;
  margin: 2px;
  border-radius: 5px;
  border: 1px solid;
  border-color: ${props => props.theme.colours.primaryColour};
  text-align: center;
  &:hover {
    background-color: ${props => props.theme.colours.primaryHoverColour};
    border-color: ${props => props.theme.colours.primaryHoverColour};
  }
`;

function Button(props) {
  return (
    <ThemeProvider theme={theme}>
      <StyledButton onClick={props.onClick}>{props.children}</StyledButton>
    </ThemeProvider>
  );
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Button);
