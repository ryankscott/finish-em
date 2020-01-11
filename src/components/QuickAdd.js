import React, { Component } from "react";
import styled from "styled-components";
import { MentionsInput, Mention } from "react-mentions";
import { connect } from "react-redux";
import { getItemTypeFromString } from "../utils";
import styles from "./QuickAddStyles";

import { createItem } from "../actions";

const itemAutoComplete = [
  {
    id: "todo",
    display: "TODO"
  },
  {
    id: "note",
    display: "NOTE"
  }
];

const dateAutoComplete = [
  {
    id: "today",
    display: "Today"
  },
  {
    id: "tomorrow",
    display: "Tomorrow"
  }
];

class QuickAdd extends Component {
  constructor(props) {
    super(props);
    this.state = { text: "", plainText: "" };
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleChange(event, newValue, newPlainTextValue, mentions) {
    this.setState({ text: newValue, plainText: newPlainTextValue });
  }

  handleKeyDown(event) {
    if (event.key == "Enter") {
      // TODO: Validation
      // TODO: We should send a message to close the quickAdd window
      this.props.onSubmit(this.state.plainText, this.state.text);
      this.setState({ text: "", plainText: "" });
    }
  }

  render() {
    // Starting with tnTN and then any following characters
    // Has to be in a capture group...
    const inputRegex = new RegExp("((^[tnTN].*))");
    return (
      <MentionsInput
        singleLine
        value={this.state.text}
        onChange={this.handleChange}
        autoFocus
        onKeyDown={this.handleKeyDown}
        style={styles.mentionInputStyle}
      >
        <Mention
          trigger={inputRegex}
          data={itemAutoComplete}
          appendSpaceOnAdd
          style={styles.itemMentionStyle}
        />
        <Mention
          trigger="@s"
          data={dateAutoComplete}
          style={styles.dateMentionStyle}
          appendSpaceOnAdd
        />
      </MentionsInput>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  onSubmit: text => {
    dispatch(createItem(text));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuickAdd);
