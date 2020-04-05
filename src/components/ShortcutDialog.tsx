import React, { Component } from "react";
import { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { Title, Header1 } from "./Typography";
import IconButton from "./IconButton";
import { hideShortcutDialog } from "../actions";
import { capitaliseEachWordInString } from "../utils";

import { app as appKeymap, item as itemKeymap } from "../keymap";

import { connect } from "react-redux";
import {
  Row,
  Data,
  ShortcutName,
  ShortcutKeys,
  ShortcutContainer,
  Controls,
  ShortcutTable,
  Body,
  Header
} from "./styled/ShortcutDialog";
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
  constructor(props: ShortcutDialogProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.node = React.createRef();
  }
  componentDidMount() {
    document.addEventListener("mousedown", this.handleClick, false);
  }
  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClick, false);
  }

  handleClick(e: React.MouseEvent) {
    // Don't handle if we're clicking on the shortcut icon again
    if (e.target?.parentElement?.id == "shortcut-icon") return;
    // Don't close if we're clicking on the dialog
    if (e && this?.node?.current?.contains(e.target)) return;
    // Only close if it's currently open
    if (this.props.isOpen) {
      this.props.closeShortcutDialog();
    }
  }

  handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key == "Escape") {
      this.props.closeShortcutDialog();
    }
    return;
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <ShortcutContainer
          ref={this.node}
          isOpen={this.props.isOpen}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
            this.handleKeyDown(e)
          }
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
