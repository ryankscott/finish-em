import React, { FunctionComponent } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";

import { theme } from "../theme";
import { Title } from "./Typography";
import FilteredItemList from "../containers/FilteredItemList";

const TrashContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px 50px;
  padding-bottom: 50px;
  width: 675px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;

const Trash: FunctionComponent = () => (
  <ThemeProvider theme={theme}>
    <TrashContainer>
      <HeaderContainer>
        <Title> Trash </Title>
      </HeaderContainer>
      <FilteredItemList
        noIndentation={true}
        showSubtasks={true}
        filter="SHOW_DELETED"
        showProject={true}
      />
    </TrashContainer>
  </ThemeProvider>
);

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(Trash);