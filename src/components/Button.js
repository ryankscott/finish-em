import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { theme } from "../theme";

const StyledButton = styled.button`
  background-color: ${props => props.theme.backgroundColour}
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

const getTheme = type => {
  return theme.button[type];
};

function Button(props) {
  return (
    <ThemeProvider theme={getTheme(props.type)}>
      <StyledButton compact={props.compact} onClick={props.onClick}>
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
)(Button);
