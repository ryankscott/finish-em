import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { useParams, useHistory } from "react-router-dom";
import { connect } from "react-redux";

import { theme } from "../theme";
import { Header, Title } from "./Typography";
import FilteredItemList from "../containers/FilteredItemList.tsx";

const UnscheduledContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px 50px;
  padding-bottom: 50px;
  width: 675px;
`;

function Unscheduled(props) {
  return (
    <ThemeProvider theme={theme}>
      <UnscheduledContainer>
        <Title> Unscheduled </Title>
        <FilteredItemList
          filter="SHOW_OVERDUE"
          sortCriteria="DUE"
          showProject={true}
          listName="Overdue"
        />
        <FilteredItemList
          filter="SHOW_NOT_SCHEDULED"
          sortCriteria="DUE"
          showProject={true}
          listName="Unscheduled"
        />
      </UnscheduledContainer>
    </ThemeProvider>
  );
}

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Unscheduled);
