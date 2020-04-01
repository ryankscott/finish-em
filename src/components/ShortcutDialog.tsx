import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { Title, Paragraph, Header1 } from "./Typography";
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
  width: 650px;
  top: 50%;
  left: calc(50% + 145px);
  transform: translate(-50%, -50%);
  padding: 2px;
  z-index: 99;
  height: 580px;
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
  padding: 2px;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const Data = styled.div`
  display: flex;
  width: 50%;
  justify-content: center;
`;

const ShortcutTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ShortcutName = styled(Paragraph)`
  width: 180px;
  color: ${props => props.theme.colours.altTextColour};
`;

const ShortcutKeys = styled(Paragraph)`
  width: 40px;
  color: ${props => props.theme.colours.primaryColour};
`;

const generateRows = (keymap: { [key: string]: string }): any => {
  const shortcuts = Object.entries(keymap);
  const numberOfShortcuts = shortcuts.length;

  return shortcuts.map((value, idx) => {
    if (idx < numberOfShortcuts - 1) {
      if (idx % 2 == 1) return;
      return (
        <Row key={"row-" + idx}>
          <Data key={"data-" + idx}>
            <ShortcutName key={"shortcutname-" + idx}>
              {capitaliseEachWordInString(
                shortcuts[idx][0].replace(/_/gi, " ")
              )}
            </ShortcutName>
            <ShortcutKeys key={"shortcutkey-" + idx}>
              {shortcuts[idx][1]}
            </ShortcutKeys>
          </Data>
          <Data key={"data-" + (idx + 1)}>
            <ShortcutName key={"shortcutname-" + (idx + 1)}>
              {capitaliseEachWordInString(
                shortcuts[idx + 1][0].replace(/_/gi, " ")
              )}
            </ShortcutName>
            <ShortcutKeys key={"shortcutkey-" + (idx + 1)}>
              {shortcuts[idx + 1][1]}
            </ShortcutKeys>
          </Data>
        </Row>
      );
    } else {
      return (
        <Row key={"row-" + idx}>
          <Data key={"data-" + idx}>
            <ShortcutName key={"shortcutname-" + idx}>
              {capitaliseEachWordInString(
                shortcuts[idx][0].replace(/_/gi, " ")
              )}
            </ShortcutName>
            <ShortcutKeys key={idx + "k"}>{shortcuts[idx][1]}</ShortcutKeys>
          </Data>
        </Row>
      );
    }
  });
};

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
    if (e.target.parentElement.id == "shortcut-icon") return;
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
              coloured
              onClick={this.props.closeShortcutDialog}
            />
          </Controls>
          <Header>
            <Title>Shortcuts</Title>
          </Header>
          <Body>
            <Header1 invert>App</Header1>
            <ShortcutTable>{generateRows(appKeymap)}</ShortcutTable>
            <Header1 invert>Item</Header1>
            <ShortcutTable>{generateRows(itemKeymap)}</ShortcutTable>
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
