import React, { useState, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";

import { theme } from "../theme";
import { createItem } from "../actions";
import { Header, Title, SubTitle, Paragraph } from "./Typography";
import FilteredItemList from "../containers/FilteredItemList";

const ProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px 50px;
`;

function Project(props) {
  return (
    <ThemeProvider theme={theme}>
      <ProjectContainer id="project-container">
        <Header>{props.project.name} </Header>
        <Paragraph>{props.project.description}</Paragraph>
        <SubTitle> Notes </SubTitle>
        <FilteredItemList
          filter="SHOW_FROM_PROJECT_BY_TYPE"
          params={{ projectId: props.project.id, type: "NOTE" }}
        />
        <SubTitle> Todos </SubTitle>
        <FilteredItemList
          filter="SHOW_FROM_PROJECT_BY_TYPE"
          params={{ projectId: props.project.id, type: "TODO" }}
        />
        <SubTitle> Archive </SubTitle>
        <FilteredItemList
          filter="SHOW_ARCHIVED_FROM_PROJECT"
          params={{ projectId: props.project.id, type: "TODO" }}
        />
      </ProjectContainer>
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
)(Project);
