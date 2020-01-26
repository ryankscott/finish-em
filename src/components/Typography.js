import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";

export const Header = styled.h1`
  font-size: ${props => props.theme.fontSizes.xlarge};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colours.primaryColour};
  padding-top: 20px;
`;

export const Title = styled.h2`
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: ${props => props.theme.fontWeights.regular};
  color: ${props =>
    props.invert
      ? props.theme.colours.altTextColour
      : props.theme.colours.defaultTextColour};
  padding-top: 20px;
`;

export const SubTitle = styled.h2`
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: ${props => props.theme.fontWeights.regular};
  color: ${props =>
    props.invert
      ? props.theme.colours.altTextColour
      : props.theme.colours.defaultTextColour};
  padding-top: 20px;
`;

export const Paragraph = styled.p`
  font-size: ${props => props.theme.fontSizes.small};
  font-family: ${props => props.theme.font.sansSerif};
  margin: 2px 0px;
`;
