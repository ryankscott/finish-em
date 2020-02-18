import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { theme } from "../theme";
import { Paragraph } from "./Typography";
import { setEndOfContenteditable } from "../utils";

const StyledParagraph = styled(Paragraph)`
  padding: 2px;
  height: 100px;
  width: 650px;
  margin: 2px;
  margin-left: 10px;
  margin-bottom: 10px;
  padding: 5px;
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
      editing: false
    };
    this.handleBlur = this.handleBlur.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }
  handleBlur(e) {
    this.setState({
      editing: false
    });
    this.props.onUpdate(e.target.innerText);
  }

  handleClick(e) {
    this.setState({
      editing: true
    });
  }

  handleKeyPress(event) {
    // On e start editing
    if (event.key == "e") {
      if (this.state.editing == false) {
        this.setState({
          editing: true
        });
        event.preventDefault();
        setEndOfContenteditable(event.target);
      }
    }
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <StyledParagraph
          tabIndex={0}
          onKeyDown={this.handleKeyPress}
          contentEditable={this.state.editing}
          onBlur={this.handleBlur}
          onClick={this.handleClick}
          suppressContentEditableWarning={true}
        >
          {this.state.input}
        </StyledParagraph>
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
