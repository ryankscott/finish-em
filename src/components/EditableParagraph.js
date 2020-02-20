import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { theme } from "../theme";
import marked from "marked";
import { setEndOfContenteditable } from "../utils";

const StyledDiv = styled.p`
  padding: 2px;
  width: 650px;
  min-height: 100px;
  margin: 2px;
  margin-left: 10px;
  margin-bottom: 10px;
  padding: 5px;
  font-size: ${props => props.theme.fontSizes.small};
  font-family: ${props => props.theme.font.sansSerif};
  border: ${props =>
    props.editing ? "1px solid " + props.theme.colours.borderColour : "none"};
  &:hover {
    background-color: ${props => props.theme.colours.focusBackgroundColour};
  }
  &:focus {
    background-color: ${props => props.theme.colours.focusBackgroundColour};
  }
`;

class EditableParagraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: this.props.input,
      disabled: true
    };
    this.handleBlur = this.handleBlur.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.getMarkdownText = this.getMarkdownText.bind(this);
    this.getRawText = this.getRawText.bind(this);
  }

  handleBlur(e) {
    this.setState({
      disabled: true,
      input: this.editor.innerText
    });
    this.props.onUpdate(this.editor.innerText);
  }

  handleClick(e) {
    this.setState({
      disabled: false
    });

    this.editor.focus();
    e.preventDefault();
  }

  handleKeyPress(e) {
    if (e.key == "e") {
      if (this.state.disabled) {
        this.setState({
          disabled: false
        });
        e.preventDefault();
      }
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
          ref={editor => (this.editor = editor)}
          contentEditable={!this.state.disabled}
          onClick={this.handleClick}
          onBlur={this.handleBlur}
          tabIndex={0}
          onKeyDown={this.handleKeyPress}
          dangerouslySetInnerHTML={
            this.state.disabled ? this.getMarkdownText() : this.getRawText()
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
)(EditableParagraph);
