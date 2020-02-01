import React, { Component } from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { SubTitle, Title, Paragraph } from "./Typography";
import IconButton from "./IconButton";
import { hideShortcutDialog } from "../actions";

import { connect } from "react-redux";

const ShortcutContainer = styled.div`
display: ${props => (props.visible ? "block" : "none")};
  position: absolute;
  background-color: ${props => props.theme.colours.altBackgroundColour}
  color: ${props => props.theme.colours.altTextColour}
  opacity: 0.85
  width: 80%;
  max-width: 650px;
  height: 80%;
  max-height: 500px;
  left: 200px;
  right: 0;
  top: 50px;
  margin-left: auto;
  margin-right: auto;
  flex-direction: row;
  padding: 2px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: baseline;
`;
const Controls = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const Body = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  justify-content: center;
`;

const ShortcutKeys = styled(Paragraph)`
  width: 40px;
  color: ${props => props.theme.colours.primaryColour};
`;

const Shortcut = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 50px;
`;

function ShortcutDialog(props) {
  return (
    <ThemeProvider theme={theme}>
      <ShortcutContainer visible={props.visible}>
        <Controls>
          <IconButton invert onClick={props.closeShortcutDialog}>
            ×
          </IconButton>
        </Controls>
        <Header>
          <Title invert>Shortcuts</Title>
        </Header>
        <Header>
          <SubTitle invert> App </SubTitle>
        </Header>
        <Body>
          <Column>
            <Shortcut>
              <ShortcutKeys>g i</ShortcutKeys>
              <Paragraph invert>Go to Inbox</Paragraph>
            </Shortcut>
            <Shortcut>
              <ShortcutKeys>g d a</ShortcutKeys>
              <Paragraph invert>Go to Daily Agenda</Paragraph>
            </Shortcut>
            <Shortcut>
              <ShortcutKeys>?</ShortcutKeys>
              <Paragraph invert>Show Shortcuts</Paragraph>
            </Shortcut>
            <Shortcut>
              <ShortcutKeys>c p</ShortcutKeys>
              <Paragraph invert>Create Project</Paragraph>
            </Shortcut>
          </Column>
          <Column>
            <Shortcut>
              <ShortcutKeys>g p 1</ShortcutKeys>
              <Paragraph invert>Go to Project 1</Paragraph>
            </Shortcut>
            <Shortcut>
              <ShortcutKeys>g p 2</ShortcutKeys>
              <Paragraph invert>Go to Project 2</Paragraph>
            </Shortcut>
            <Shortcut>
              <ShortcutKeys>g p n</ShortcutKeys>
              <Paragraph invert>Go to Project n</Paragraph>
            </Shortcut>
          </Column>
        </Body>
        <Header>
          <SubTitle invert> Item </SubTitle>
        </Header>
        <Body>
          <Column>
            <Shortcut>
              <ShortcutKeys>r</ShortcutKeys>
              <Paragraph invert>Refile to project</Paragraph>
            </Shortcut>
            <Shortcut>
              <ShortcutKeys>c</ShortcutKeys>
              <Paragraph invert>Complete</Paragraph>
            </Shortcut>
            <Shortcut>
              <ShortcutKeys>d</ShortcutKeys>
              <Paragraph invert>Set Due Date</Paragraph>
            </Shortcut>
          </Column>
          <Column>
            <Shortcut>
              <ShortcutKeys>a</ShortcutKeys>
              <Paragraph invert>Archive</Paragraph>
            </Shortcut>
            <Shortcut>
              <ShortcutKeys>u</ShortcutKeys>
              <Paragraph invert>Uncomplete</Paragraph>
            </Shortcut>
            <Shortcut>
              <ShortcutKeys>s</ShortcutKeys>
              <Paragraph invert>Set Scheduled Date</Paragraph>
            </Shortcut>
          </Column>
        </Body>
      </ShortcutContainer>
    </ThemeProvider>
  );
}

// TODO: Add PropTypes
const mapStateToProps = state => ({
  visible: state.ui.shortcutDialogVisible
});

const mapDispatchToProps = dispatch => ({
  closeShortcutDialog: () => {
    dispatch(hideShortcutDialog());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShortcutDialog);
