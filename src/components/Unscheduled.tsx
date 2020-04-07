import React from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";

import { theme } from "../theme";
import { Title } from "./Typography";
import FilteredItemList, { FilterEnum } from "../containers/FilteredItemList";
import { RenderingStrategy } from "./ItemList";

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
        filter={FilterEnum.ShowOverdue}
        showProject={true}
        listName="Overdue"
        isFilterable={true}
        renderingStrategy={RenderingStrategy.Orphan}
      />
      <FilteredItemList
        filter={FilterEnum.ShowNotScheduled}
        showProject={true}
        listName="Unscheduled"
        isFilterable={true}
        renderingStrategy={RenderingStrategy.Orphan}
      />
    </UnscheduledContainer>
  </ThemeProvider>
);

const mapStateToProps = (state) => ({
  items: state.items,
});
const mapDispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, mapDispatchToProps)(Unscheduled);
