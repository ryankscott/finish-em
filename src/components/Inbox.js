import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { format } from "date-fns";
import { connect } from "react-redux";
import { theme } from "../theme";
import FilteredItemList from "../containers/FilteredItemList";
import QuickAdd from "./QuickAdd";
import { Header1, Title } from "./Typography";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px 0px 0px 50px;
  width: 675px;
`;

class Inbox extends Component {
  constructor(props) {
    super(props);
  }
  // TODO: Hack fix to stop React crashing
  // https://github.com/facebook/draft-js/issues/1320
  componentDidCatch() {
    this.forceUpdate();
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Title> Inbox </Title>
          <Header1> Add an item </Header1>
          <QuickAdd />
          <Header1> Items </Header1>
          <FilteredItemList items={this.props.items} filter="SHOW_INBOX" />
        </Container>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Inbox);
