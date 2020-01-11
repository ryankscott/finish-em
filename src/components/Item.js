import React, { Component } from "react";
import styled from "styled-components";
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

import ProjectDropdown from "../components/ProjectDropdown";
import { validateItemString } from "../utils";
import "./Item.css";

const ValidationBox = styled.div`
  border: 1px solid;
  border-color: ${props =>
    props.valid ? (props.focus ? "blue" : "grey") : "red"};
  width: 360px;
`;

// React-hotkeys configuration
configure({
  logLevel: "warn",
  ignoreRepeatedEventsWhenKeyHeldDown: false
});

const styles = {
  itemType: {
    color: "red",
    textDecoration: "underline"
  },
  date: {
    color: "green"
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

class Item extends Component {
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

    this.refileItem = this.refileItem.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.validateInput = this.validateInput.bind(this);
    this.clearInput = this.clearInput.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  refileItem(projectId) {
    this.props.onRefile(this.props.id, projectId);
    this.setState({ projectDropdownVisible: false });
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
    const { hasCommandModifier } = KeyBindingUtil;

    if (e.key == "r" && hasCommandModifier(e)) {
      e.preventDefault();
      this.setState({
        projectDropdownVisible: true
      });
    }

    if (e.key == "x" && hasCommandModifier(e)) {
      e.preventDefault();
      this.props.onDelete(this.state.id);
    }

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
      <ValidationBox valid={this.state.valid}>
        <Editor
          editorState={this.state.editorState}
          readOnly={this.state.readOnly}
          onChange={this.handleChange}
          keyBindingFn={this.handleKeyDown}
          onFocus={this.onFocus}
        />
        <ProjectDropdown
          onSubmit={this.refileItem}
          visible={this.state.projectDropdownVisible}
        />
      </ValidationBox>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item);
