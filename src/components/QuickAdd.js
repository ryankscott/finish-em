import React, { Component } from "react";
import styled from "styled-components";
import { MentionsInput, Mention } from "react-mentions";
import { connect } from "react-redux";
import { getItemTypeFromString } from "../utils";

import { createItem } from "../actions";

const styles = {
  mentionStyle: {
    display: "inline-block",
    position: "relative",
    fontSize: "16px",
    fontWeight: "normal",
    fontFamily: "Helvetica",
    color: "#FFFFFF",
    zIndex: 2,
    backgroundColor: "#ff9e80",
    border: "1px solid #ff8e80",
    borderRadius: "5px",
    padding: "3px 2px 2px 3px",
    margin: "11px 0px 0px -5px"
  },
  mentionInputStyle: {
    control: {
      backgroundColor: "#fff",
      fontSize: "16px",
      fontFamily: "Helvetica",
      fontWeight: "normal"
    },

    highlighter: {
      overflow: "hidden"
    },

    input: {
      margin: "0px 0px 0px 0px",
      padding: "0px 0px 0px 10px",
      border: "1px solid #eee", // TODO: Remove me
      width: "100%",
      maxWidth: "800px",
      height: "50px",
      outline: "none"
    },

    suggestions: {
      list: {
        backgroundColor: "#FEFEFE",
        fontFamily: "Helvetica",
        borderRadius: "5px",
        border: "1px solid rgba(100,100,100,0.20)",
        fontSize: "14px",
        width: "60px"
      },

      item: {
        color: "#777777",
        margin: "0px",
        padding: "5px 0px 5px 5px",
        borderBottom: "1px solid rgba(100,100,100,0.25)",
        "&focused": {
          backgroundColor: "#ff9e80",
          color: "#FEFEFE",
          fontWeight: "normal",
          borderRadius: "5px 5px 5px 5px" // TODO: Fix this using first-child
        }
      }
    }
  }
};

const autoComplete = [
  {
    id: "todo",
    display: "TODO "
  },
  {
    id: "note",
    display: "NOTE "
  }
];

const defaultMentionStyle = {
  backgroundColor: "#cee4e5"
};

class QuickAdd extends Component {
  constructor(props) {
    super(props);
    this.state = { value: "", valid: true, plainValue: "" };
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleChange(event, newValue, newPlainTextValue, mentions) {
    //this.validateInput(event.target.value);
    // TODO: Add a space if it's a
    this.setState({ value: newValue, plainValue: newPlainTextValue });
  }

  handleKeyDown(event) {
    if (event.key == "Enter") {
      // TODO: Validation
      // TODO: We should send a message to close the quickAdd window
      this.props.onSubmit(this.state.plainValue);
      this.setState({ value: "", plainValue: "", valid: false });
    }
  }

  render() {
    // Starting with tnTN and then any following characters
    // Has to be in a capture group...
    const inputRegex = new RegExp("((^[tnTN].*))");
    return (
      <MentionsInput
        singleLine
        value={this.state.value}
        onChange={this.handleChange}
        autoFocus
        onKeyDown={this.handleKeyDown}
        style={styles.mentionInputStyle}
      >
        <Mention
          trigger={inputRegex}
          data={autoComplete}
          style={styles.mentionStyle}
          appendSpaceOnAdd
        />
      </MentionsInput>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  onSubmit: value => {
    dispatch(createItem(value));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuickAdd);
