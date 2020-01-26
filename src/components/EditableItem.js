import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { configure, HotKeys } from "react-hotkeys";
import {
  Editor,
  EditorState,
  ContentState,
  CompositeDecorator,
  SelectionState,
  KeyBindingUtil,
  Modifier
} from "draft-js";
import chrono from "chrono-node";
import { theme } from "../theme";

import { validateItemString } from "../utils";
import "./EditableItem.css";

const ValidationBox = styled.div`
  border: 1px solid;
  border-color: ${props =>
    props.valid
      ? props.focus
        ? props.theme.colours.neutralColour
        : props.theme.colours.borderColour
      : props.theme.colours.errorColour};
  width: 660px;
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.medium};
  margin-left: 10px;
`;

// React-hotkeys configuration
configure({
  logLevel: "warn",
  ignoreRepeatedEventsWhenKeyHeldDown: false
});

const styles = {
  itemType: {
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.medium,
    color: theme.colours.tertiaryColour,
    textDecoration: "underline"
  },
  date: {
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.medium,
    color: theme.colours.primaryColour
  }
};

const itemTypeRegex = new RegExp("^(TODO)|(NOTE)s*", "gi");

const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
};
const itemTypeStrategy = (contentBlock, callback, contentState) => {
  findWithRegex(itemTypeRegex, contentBlock, callback);
};

const dateStrategy = (contentBlock, callback, contentState) => {
  const foundDates = chrono.parse(contentBlock.getText());
  foundDates.forEach((item, index) => {
    callback(item.index, item.index + item.text.length);
  });
};
const dateSpan = props => (
  <span style={styles.date} data-offset-key={props.offsetKey}>
    {props.children}
  </span>
);

const itemTypeSpan = props => (
  <span style={styles.itemType} data-offset-key={props.offsetKey}>
    {props.children}
  </span>
);

const compositeDecorator = new CompositeDecorator([
  {
    strategy: itemTypeStrategy,
    component: itemTypeSpan
  },
  {
    strategy: dateStrategy,
    component: dateSpan
  }
]);
const moveSelectionToEnd = editorState => {
  const content = editorState.getCurrentContent();
  const blockMap = content.getBlockMap();

  const key = blockMap.last().getKey();
  const length = blockMap.last().getLength();

  const selection = new SelectionState({
    anchorKey: key,
    anchorOffset: length,
    focusKey: key,
    focusOffset: length
  });
  return EditorState.forceSelection(editorState, selection);
};

class EditableItem extends Component {
  constructor(props) {
    super(props);
    const es = EditorState.createWithContent(
      ContentState.createFromText(this.props.text ? this.props.text : ""),
      compositeDecorator
    );
    this.state = {
      id: this.props.id,
      projectDropdownVisible: false,
      valid: true,
      readOnly: this.props.readOnly,
      focus: false,
      editorState: moveSelectionToEnd(es)
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.validateInput = this.validateInput.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  validateInput() {
    const text = this.state.editorState
      .getCurrentContent()
      .getPlainText("\u0001");
    const valid = validateItemString(text);
    this.setState({ valid });
  }

  clearInput() {
    let { editorState } = this.state;
    let contentState = editorState.getCurrentContent();
    const firstBlock = contentState.getFirstBlock();
    const lastBlock = contentState.getLastBlock();
    const allSelected = new SelectionState({
      anchorKey: firstBlock.getKey(),
      anchorOffset: 0,
      focusKey: lastBlock.getKey(),
      focusOffset: lastBlock.getLength(),
      hasFocus: true
    });
    contentState = Modifier.removeRange(contentState, allSelected, "backward");
    editorState = EditorState.push(editorState, contentState, "remove-range");
    editorState = EditorState.forceSelection(
      editorState,
      contentState.getSelectionAfter()
    );

    this.setState({ editorState });
  }

  handleKeyDown(e) {
    // Clear input on Enter
    if (e.key == "Enter" && this.state.valid) {
      this.props.onSubmit(
        this.state.id,
        this.state.editorState.getCurrentContent().getPlainText("")
      );
      this.clearInput();
    }
  }

  handleChange(e) {
    this.validateInput();
    this.setState({ editorState: e });
  }

  onFocus(e) {
    this.setState({
      editorState: moveSelectionToEnd(this.state.editorState)
    });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <ValidationBox valid={this.state.valid}>
          <Editor
            editorState={this.state.editorState}
            readOnly={this.state.readOnly}
            onChange={this.handleChange}
            keyBindingFn={this.handleKeyDown}
            onFocus={this.onFocus}
          />
        </ValidationBox>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditableItem);
