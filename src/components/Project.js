import React, { useState, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import { useParams, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import * as Mousetrap from "Mousetrap";
import { theme } from "../theme";
import {
  updateProjectDescription,
  deleteProject,
  hideDeleteProjectDialog,
  toggleDeleteProjectDialog
} from "../actions";
import { Header, Title, Header1 } from "./Typography";
import EditableParagraph from "./EditableParagraph";
import FilteredItemList from "../containers/FilteredItemList";
import Button from "./Button";
import DeleteProjectDialog from "./DeleteProjectDialog";
import QuickAdd from "./QuickAdd";

const ProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px 50px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;

function Project(props) {
  let history = useHistory();

  function deleteProject() {
    props.deleteProject(props.project.id);
    history.push("/inbox");
  }

  useEffect(() => {
    Mousetrap.bind("d p", () => props.toggleDeleteProjectDialog());
    return function cleanup() {
      Mousetrap.unbind("d p");
    };
  });

  return (
    <ThemeProvider theme={theme}>
      <ProjectContainer>
        <HeaderContainer>
          <Title>{props.project.name} </Title>
          <DeleteProjectDialog onDelete={() => deleteProject()} />
        </HeaderContainer>
        <EditableParagraph
          key={props.project.id}
          onUpdate={input => {
            props.updateDescription(props.project.id, input);
          }}
          input={props.project.description}
        />
        <Header1> Add to project </Header1>
        <QuickAdd projectId={props.project.id} />
        <Header1> Notes </Header1>
        <FilteredItemList
          filter="SHOW_FROM_PROJECT_BY_TYPE"
          params={{ projectId: props.project.id, type: "NOTE" }}
        />
        <Header1> Todos </Header1>
        <FilteredItemList
          filter="SHOW_FROM_PROJECT_BY_TYPE"
          params={{ projectId: props.project.id, type: "TODO" }}
        />
        <Header1> Archive </Header1>
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
const mapDispatchToProps = dispatch => ({
  updateDescription: (id, text) => {
    dispatch(updateProjectDescription(id, text));
  },
  deleteProject: id => {
    dispatch(deleteProject(id));
    dispatch(hideDeleteProjectDialog());
  },
  toggleDeleteProjectDialog: () => {
    dispatch(toggleDeleteProjectDialog());
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Project);
