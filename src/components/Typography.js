import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";

export const Title = styled.h1`
  font-size: ${props => props.theme.fontSizes.xlarge};
  font-weight: ${props => props.theme.fontWeights.regular};
  color: ${props => props.theme.colours.primaryColour};
  padding-top: 20px;
`;

export const Header = styled.h2`
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: ${props => props.theme.fontWeights.regular};
  color: ${props => props.theme.colours.primaryColour};
  padding-top: 15px;
  margin: 10px 0px;
`;

export const Header1 = styled.h2`
  font-size: ${props => props.theme.fontSizes.regular};
  font-weight: ${props => props.theme.fontWeights.regular};
  color: ${props =>
    props.invert
      ? props.theme.colours.altTextColour
      : props.theme.colours.defaultTextColour};
  padding-top: 8px;
  margin: 8px 5px;
`;
export const Header2 = styled.h2`
  font-size: ${props => props.theme.fontSizes.regular};
  font-weight: ${props => props.theme.fontWeights.regular};
  color: ${props =>
    props.invert
      ? props.theme.colours.altTextColour
      : props.theme.colours.defaultTextColour};
  padding-top: 0px;
  margin: 0px 5px 5px 5px;
`;

export const Paragraph = styled.p`
  font-size: ${props => props.theme.fontSizes.xsmall};
  font-family: ${props => props.theme.font.sansSerif};
  color: ${props =>
    props.invert
      ? props.theme.colours.altTextColour
      : props.theme.colours.defaultTextColour};
  margin: 2px 5px;
  margin: 2px 2px;
`;
