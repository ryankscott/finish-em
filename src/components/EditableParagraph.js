import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { theme } from "../theme";
import { Paragraph } from "./Typography";

const StyledParagraph = styled(Paragraph)`
  padding: 2px;
  height: 100px;
  width: 650px;
  margin: 2px;
  padding: 5px;
  border: ${props =>
    props.editing ? "1px solid " + props.theme.colours.borderColour : "none"};
  &:hover {
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

  render() {
    return (
      <ThemeProvider theme={theme}>
        <StyledParagraph
          editing={this.state.editing}
          contentEditable={true}
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
