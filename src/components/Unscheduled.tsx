import React from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";

import { theme } from "../theme";
import { Title } from "./Typography";
import FilteredItemList from "../containers/FilteredItemList";

const UnscheduledContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px 50px;
  padding-bottom: 50px;
  width: 675px;
`;

const Unscheduled = () => (
  <ThemeProvider theme={theme}>
    <UnscheduledContainer>
      <Title> Unscheduled </Title>
      <FilteredItemList
        filter="SHOW_OVERDUE"
        sortCriteria="DUE"
        showProject={true}
        listName="Overdue"
        hideCompleted={true}
      />
      <FilteredItemList
        filter="SHOW_NOT_SCHEDULED"
        sortCriteria="DUE"
        showProject={true}
        listName="Unscheduled"
        hideCompleted={true}
      />
    </UnscheduledContainer>
  </ThemeProvider>
);

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(Unscheduled);
