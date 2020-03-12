import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { theme } from "../theme";
import marked from "marked";
import { setEndOfContenteditable } from "../utils";

const StyledDiv = styled.div`
  overflow: hidden;
  overflow-y: scroll;
  height: ${props => props.height || "auto"};
  width: ${props => props.width || "100%"};
  margin: 0px;
  padding: 5px 5px;
  cursor: ${props => (props.readOnly ? "default" : "text")};
  font-size: ${props => props.theme.fontSizes.small};
  font-family: ${props => props.theme.font.sansSerif};
  border: ${props =>
    props.editing ? "1px solid " + props.theme.colours.borderColour : "none"};
  &:hover {
    background-color: ${props =>
      props.readOnly
        ? props.theme.colours.backgroundColour
        : props.theme.colours.focusBackgroundColour};
  }
  &:focus {
    background-color: ${props => props.theme.colours.focusBackgroundColour};
  }
  & > p {
    padding: 0px 0px;
    margin: 0px;
  }
`;

class EditableText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: this.props.input,
      editable: false
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
      input: this.editableText.innerText
    });
    this.props.onUpdate(this.editableText.innerText);
  }

  handleClick(e) {
    if (this.props.readOnly) return;
    // Handle links normally
    if (e.target.nodeName == "A") {
      return;
    }
    // Ignore clicks if it's already editable
    if (this.state.editable) return;
    this.setState(
      {
        editable: true
      },
      () => {
        this.editableText.focus();
        setEndOfContenteditable(this.editableText);
      }
    );
  }

  handleFocus(e) {}

  handleKeyPress(e) {
    if (this.props.readOnly) return;
    if (e.key == "e") {
      if (!this.state.editable) {
        this.setState(
          {
            editable: true
          },
          () => {
            // The item should be focussed here but double check
            this.editableText.focus();
            setEndOfContenteditable(this.editableText);
          }
        );
        e.preventDefault();
      }
    }
    if (e.key == "Enter" && this.props.singleline) {
      this.setState({
        editable: false,
        input: this.editableText.innerText
      });
      this.props.onUpdate(this.editableText.innerText);
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

  render() {
    return (
      <ThemeProvider theme={theme}>
        <StyledDiv
          readOnly={this.props.readOnly}
          ref={editableText => (this.editableText = editableText)}
          width={this.props.width}
          height={this.props.height}
          contentEditable={this.state.editable}
          onClick={this.handleClick}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          tabIndex={
            this.props.tabIndex
              ? this.props.tabIndex
              : this.props.readOnly
              ? -1
              : 0
          }
          autoFocus
          onKeyDown={this.handleKeyPress}
          singleline={this.props.singleline}
          dangerouslySetInnerHTML={
            this.state.editable ? this.getRawText() : this.getMarkdownText()
          }
        />
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditableText);
