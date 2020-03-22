import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { Title, Paragraph } from "./Typography";
import IconButton from "./IconButton";
import { hideShortcutDialog } from "../actions";
import { capitaliseEachWordInString } from "../utils";

import { app as appKeymap, item as itemKeymap } from "../keymap";

import { connect } from "react-redux";

interface ShortcutContainerProps {
  isOpen: boolean;
}
const ShortcutContainer = styled.div<ShortcutContainerProps>`
  display: ${props => (props.isOpen ? "block" : "none")};
  position: fixed;
  background-color: ${props => props.theme.colours.altBackgroundColour};
  color: ${props => props.theme.colours.altTextColour};
  opacity: 0.85;
  width: 80%;
  max-width: 650px;
  min-height: 580px;
  top: 50%;
  left: calc(50% + 145px);
  transform: translate(-50%, -50%);
  padding: 2px;
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
  width: 80px;
  color: ${props => props.theme.colours.primaryColour};
`;

// TODO: Refactor me
interface ShortcutDialogProps {
  isOpen: boolean;
  closeShortcutDialog: () => void;
}
interface ShortcutDialogState {}
class ShortcutDialog extends Component<
  ShortcutDialogProps,
  ShortcutDialogState
> {
  private node: React.RefObject<HTMLInputElement>;
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.node = React.createRef();
  }
  componentDidMount() {
    document.addEventListener("mousedown", this.handleClick, false);
  }
  componentWillUnount() {
    document.removeEventListener("mousedown", this.handleClick, false);
  }
  handleClick(e) {
    // Don't close if we're clicking on the dialog
    if (e && this.node && this.node.current.contains(e.target)) {
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

  // TODO fix this to have a split between app or item keywords
  render() {
    return (
      <ThemeProvider theme={theme}>
        <ShortcutContainer
          ref={this.node}
          isOpen={this.props.isOpen}
          onKeyDown={this.handleKeyDown}
        >
          <Controls>
            <IconButton
              icon="CLOSE"
              visible
              invert
              onClick={this.props.closeShortcutDialog}
            />
          </Controls>
          <Header>
            <Title>Shortcuts</Title>
          </Header>
          <Body>
            <Column key={1}>
              {Object.keys(appKeymap).map((k, i) => {
                const shortcutName = capitaliseEachWordInString(
                  k.replace(/_/gi, " ")
                );
                // TODO this only shows first sequence
                const shortcuts = (
                  <ShortcutKeys key={i + "k"}>{appKeymap[k]}</ShortcutKeys>
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
              {Object.keys(itemKeymap).map((k, i) => {
                const shortcutName = capitaliseEachWordInString(
                  k.replace(/_/gi, " ")
                );
                // TODO this only shows first sequence
                const shortcuts = (
                  <ShortcutKeys key={i + "k"}>{itemKeymap[k]}</ShortcutKeys>
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

const mapStateToProps = state => ({
  isOpen: state.ui.shortcutDialogVisible
});

const mapDispatchToProps = dispatch => ({
  closeShortcutDialog: () => {
    dispatch(hideShortcutDialog());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ShortcutDialog);
