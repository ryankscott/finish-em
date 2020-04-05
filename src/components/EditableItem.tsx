import React, { Component } from "react";
import styled, { ThemeProvider, keyframes } from "styled-components";
import {
  Editor,
  EditorState,
  ContentState,
  CompositeDecorator,
  SelectionState,
  Modifier
} from "draft-js";
import { headShake } from "react-animations";
import isElectron from "is-electron";
import { itemRegex } from "../utils";

import { validateItemString } from "../utils";
import "./EditableItem.css";
import { theme } from "../theme";
import { addIcon } from "../assets/icons";

const Icon = styled.div`
  flex-direction: row;
  justify-content: center;
  align-self: center;
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.large};
  background-color: whitesmoke;
  padding: 0px 10px;
  text-align: center;
  vertical-align: middle;
  color: ${props => props.theme.colours.disabledTextColour};
`;

interface ValidationBoxProps {
  animate: boolean;
  valid: boolean;
}
const headShakeAnimation = keyframes`${headShake}`;
const ValidationBox = styled.div<ValidationBoxProps>`
  animation: 1s ${props => (props.animate ? headShakeAnimation : "none")};
  background-color: whitesmoke;
  display: flex;
  flex-direction: row;
  border: 1px solid;
  border-color: ${props =>
    props.valid
      ? props.theme.colours.borderColour
      : props.theme.colours.errorColour};
  width: 660px;
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.small};
  margin: 2px;
`;

const styles = {
  itemType: {
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.small,
    color: theme.colours.primaryColour
  }
};

const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
};

const itemTypeStrategy = (contentBlock, callback, contentState) => {
  findWithRegex(itemRegex, contentBlock, callback);
};

const itemTypeSpan = props => (
  <span style={styles.itemType} data-offset-key={props.offsetKey}>
    {props.children}
  </span>
);

const compositeDecorator = new CompositeDecorator([
  {
    strategy: itemTypeStrategy,
    component: itemTypeSpan
  }
]);

interface EditableItemProps {
  text: string;
  readOnly: boolean;
  focus: boolean;
  innerRef: React.RefObject<HTMLInputElement>;
  onSubmit: (t: string) => void;
}
interface EditableItemState {
  valid: boolean;
  readOnly: boolean;
  animate: boolean;
  editorState: EditorState;
}
class EditableItem extends Component<EditableItemProps, EditableItemState> {
  constructor(props: EditableItemProps) {
    super(props);
    const es = EditorState.createWithContent(
      ContentState.createFromText(this.props.text ? this.props.text : ""),
      compositeDecorator
    );
    this.state = {
      valid: true,
      readOnly: this.props.readOnly,
      editorState: es,
      animate: false
    };

    this.handleReturn = this.handleReturn.bind(this);
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
    valid
      ? this.setState({
          valid,
          animate: false
        })
      : this.setState({ valid });
  }

  clearInput() {
    let { editorState } = this.state;
    /*
     TODO: There has to be a better way. This doens't work
    this.setState({
      editorState: EditorState.createEmpty(compositeDecorator)
    }); */

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

  handleReturn() {
    if (this.state.valid) {
      this.props.onSubmit(
        this.state.editorState.getCurrentContent().getPlainText("")
      );
      this.clearInput();
      if (isElectron()) {
        window.ipcRenderer.send("close-quickadd");
      }
    } else {
      this.setState(
        {
          animate: true
        },
        () => setTimeout(() => this.setState({ animate: false }), 200)
      );
    }

    return "handled";
  }

  handleKeyDown(e, es, et) {
    if (e.key == "Escape") {
      if (isElectron()) {
        window.ipcRenderer.send("close-quickadd");
      }
    }
    return;
  }

  handleChange(e) {
    this.validateInput();
    this.setState({ editorState: e });
  }

  onFocus(e) {
    this.setState({
      editorState: EditorState.moveFocusToEnd(this.state.editorState)
    });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <ValidationBox animate={this.state.animate} valid={this.state.valid}>
          <Icon>{addIcon()}</Icon>
          <Editor
            ref={this.props.innerRef}
            handleReturn={this.handleReturn}
            editorState={this.state.editorState}
            readOnly={this.state.readOnly}
            onChange={this.handleChange}
            handleKeyCommand={this.handleKeyDown}
            onFocus={this.onFocus}
          />
        </ValidationBox>
      </ThemeProvider>
    );
  }
}

export default React.forwardRef((props, ref) => (
  <EditableItem innerRef={ref} {...props} />
));
