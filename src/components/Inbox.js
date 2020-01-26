import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { format } from "date-fns";
import { connect } from "react-redux";
import { theme } from "../theme";
import FilteredItemList from "../containers/FilteredItemList";
import QuickAdd from "./QuickAdd";
import { Header, SubTitle } from "./Typography";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px 0px 0px 50px;
`;

class Inbox extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Header> Inbox </Header>
          <SubTitle> Add an item </SubTitle>
          <QuickAdd />
          <SubTitle> Items in inbox </SubTitle>
          <FilteredItemList filter="SHOW_INBOX" />
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
