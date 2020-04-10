import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import marked from "marked";
import { setEndOfContenteditable } from "../utils";

interface ContainerProps {
  width: number;
  height: number;
  readOnly: boolean;
  editing: boolean;
}
const Container = styled.div<ContainerProps>`
  overflow: hidden;
  overflow-y: scroll;
  height: ${(props) => props.height || "auto"};
  width: ${(props) => props.width || "100%"};
  margin: 0px;
  padding: 5px 5px;
  cursor: ${(props) => (props.readOnly ? "default" : "text")};
  font-size: ${(props) => props.theme.fontSizes.small};
  font-family: ${(props) => props.theme.font.sansSerif};
  border: ${(props) =>
    props.editing ? "1px solid " + props.theme.colours.borderColour : "none"};
  &:hover {
    background-color: ${(props) =>
      props.readOnly
        ? props.theme.colours.backgroundColour
        : props.theme.colours.focusBackgroundColour};
  }
  &:focus {
    background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  }
  & > p {
    padding: 0px 0px;
    margin: 0px;
  }
`;

interface EditableTextProps {
  readOnly: boolean;
  input: string;
  width?: number;
  height?: number;
  singleline: boolean;
  innerRef: React.RefObject<HTMLInputElement>;
  onUpdate: (input: string) => void;
}
interface EditableTextState {
  input: string;
  editable: boolean;
}

class EditableText extends Component<EditableTextProps, EditableTextState> {
  constructor(props) {
    super(props);
    this.state = {
      input: this.props.input,
      editable: false,
    };
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.getMarkdownText = this.getMarkdownText.bind(this);
    this.getRawText = this.getRawText.bind(this);
  }

  handleBlur(e) {
    // Ignore events if it's read only
    if (this.props.readOnly) return;
    // Ignore events if we're not editing
    if (!this.state.editable) return;
    this.setState({
      editable: false,
      input: this.props.innerRef.current.innerText,
    });
    this.props.onUpdate(this.props.innerRef.current.innerText);
  }

  handleClick(e) {
    if (this.props.readOnly) return;
    // Handle links normally
    if (e.target.nodeName == "A") {
      return;
    }
    // Ignore clicks if it's already editable
    if (this.state.editable) return;
    this.setState({ editable: true });
  }

  handleKeyPress(e) {
    if (this.props.readOnly) return;
    // TODO: We should be able to call this at the Item and have the ability to update the text
    if (e.key == "Enter" && this.props.singleline) {
      this.setState({
        editable: false,
        input: this.props.innerRef.current.innerText,
      });
      this.props.onUpdate(this.props.innerRef.current.innerText);
      this.props.innerRef.current.blur();
      e.preventDefault();
    } else if (e.key == "Escape") {
      this.setState({
        editable: false,
        input: this.props.innerRef.current.innerText,
      });
      this.props.innerRef.current.blur();
      e.preventDefault();
    }
  }

  // NOTE: We have to replace newlines with HTML breaks
  getRawText() {
    return { __html: this.state.input.replace(/\n/gi, "<br/>") };
  }

  getMarkdownText() {
    return { __html: marked(this.state.input) };
  }

  handleFocus(e) {
    // NOTE: Weirdly Chrome sometimes fires a focus event before a click
    if (e.target.nodeName == "A") {
      return;
    }
    if (!this.state.editable) {
      this.setState({ editable: true }, () => {
        setEndOfContenteditable(this.props.innerRef.current);
      });
    }
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Container
          readOnly={this.props.readOnly}
          ref={this.props.innerRef}
          width={this.props.width}
          height={this.props.height}
          contentEditable={this.state.editable}
          onClick={this.handleClick}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          tabIndex={-1}
          editing={this.state.editable}
          onKeyPress={this.handleKeyPress}
          dangerouslySetInnerHTML={
            this.state.editable ? this.getRawText() : this.getMarkdownText()
          }
        />
      </ThemeProvider>
    );
  }
}

export default React.forwardRef(
  (props, ref: React.RefObject<HTMLInputElement>) => (
    <EditableText innerRef={ref} {...props} />
  )
);
