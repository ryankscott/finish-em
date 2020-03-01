import React, { Component } from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { Header1, Title, Paragraph } from "./Typography";
import IconButton from "./IconButton";
import { hideShortcutDialog } from "../actions";
import { getApplicationKeyMap } from "react-hotkeys";
import { capitaliseEachWordInString } from "../utils";

import { connect } from "react-redux";

const ShortcutContainer = styled.div`
  display: ${props => (props.isOpen ? "block" : "none")};
  position: absolute;
  background-color: ${props => props.theme.colours.altBackgroundColour}
  color: ${props => props.theme.colours.altTextColour}
  opacity: 0.85
  width: 80%;
  max-width: 650px;
  left: 200px;
  right: 0;
  top: 50px;
  margin-left: auto;
  margin-right: auto;
  flex-direction: row;
  padding: 2px;
  padding-bottom: 40px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: baseline;
  margin-bottom: 20px;
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
`;

const Row = styled.span`
  display: flex;
  flex-direction: row;
  padding: 2px 10px;
  margin-left: 50px;
`;

const ShortcutKeys = styled(Paragraph)`
  width: 60px;
  color: ${props => props.theme.colours.primaryColour};
`;

const Shortcut = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 60px;
`;

class ShortcutDialog extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    document.addEventListener("mousedown", this.handleClick, false);
  }
  componentWillUnount() {
    document.removeEventListener("mousedown", this.handleClick, false);
  }
  handleClick(e) {
    // Don't close if we're clicking on the dialog
    if (e && this.node && this.node.contains(e.target)) {
      return;
    }
    // Only close if it's currently open
    if (this.props.isOpen) {
      this.props.closeShortcutDialog();
    }
  }

  handleKeyDown(e) {
    if (e.key == "Escape") {
      this.props.closeShortcutDialog();
    }
  }

  render() {
    const keymap = getApplicationKeyMap();
    return (
      <ThemeProvider theme={theme}>
        <ShortcutContainer
          ref={node => (this.node = node)}
          isOpen={this.props.isOpen}
          onKeyDown={this.handleKeyDown}
        >
          <Controls>
            <IconButton invert onClick={this.props.closeShortcutDialog}>
              ×
            </IconButton>
          </Controls>
          <Header>
            <Title invert>Shortcuts</Title>
          </Header>

          <Body>
            <Column key={1}>
              {Object.keys(keymap).map((k, i) => {
                if (i % 2 == 1) return;
                const shortcutName = capitaliseEachWordInString(
                  k.replace(/_/gi, " ")
                );
                // TODO this only shows first sequence
                const shortcuts = (
                  <ShortcutKeys key={i + "k"}>
                    {keymap[k].sequences[0].sequence}
                  </ShortcutKeys>
                );

                return (
                  <Row key={i + "d"}>
                    {shortcuts}
                    <Paragraph key={i} invert>
                      {shortcutName}
                    </Paragraph>
                  </Row>
                );
              })}
            </Column>
            <Column key={2}>
              {Object.keys(keymap).map((k, i) => {
                if (i % 2 == 0) return;
                const shortcutName = capitaliseEachWordInString(
                  k.replace(/_/gi, " ")
                );
                // TODO this only shows first sequence
                const shortcuts = (
                  <ShortcutKeys key={i + "k"}>
                    {keymap[k].sequences[0].sequence}
                  </ShortcutKeys>
                );

                return (
                  <Row key={i + "d"}>
                    {shortcuts}
                    <Paragraph key={i} invert>
                      {shortcutName}
                    </Paragraph>
                  </Row>
                );
              })}
            </Column>
          </Body>
        </ShortcutContainer>
      </ThemeProvider>
    );
  }
}

// TODO: Add PropTypes
const mapStateToProps = state => ({
  isOpen: state.ui.shortcutDialogVisible
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
