import React from "react";
import styled, { ThemeProvider } from "styled-components";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { theme } from "../theme";
import {
  updateProjectDescription,
  deleteProject,
  hideDeleteProjectDialog,
  toggleDeleteProjectDialog
} from "../actions";
import { Title, Header1 } from "./Typography";
import EditableText from "./EditableText";
import FilteredItemList from "../containers/FilteredItemList";
import DeleteProjectDialog from "./DeleteProjectDialog";
import QuickAdd from "./QuickAdd";
import { Uuid } from "@typed/uuid";

const ProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px 50px;
  width: 675px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;
export interface ProjectInterface {
  id: Uuid;
  name: string;
  deleted: boolean;
  description: string;
  lastUpdatedAt: Date;
  deletedAt: Date;
  createdAt: Date;
}

export interface ProjectProps {
  deleteProject: (id: Uuid) => void;
  updateDescription: (id: Uuid, input: string) => void;
  project: ProjectInterface;
}
function Project(props: ProjectProps) {
  let history = useHistory();

  function deleteProject() {
    props.deleteProject(props.project.id);
    history.push("/inbox");
  }

  return (
    <ThemeProvider theme={theme}>
      <ProjectContainer>
        <HeaderContainer>
          <Title>{props.project.name} </Title>
          <DeleteProjectDialog onDelete={() => deleteProject()} />
        </HeaderContainer>
        <EditableText
          key={props.project.id + "d"}
          onUpdate={input => {
            props.updateDescription(props.project.id, input);
          }}
          input={props.project.description}
          height="150px"
          width="670px"
        />
        <Header1> Add to project </Header1>
        <QuickAdd projectId={props.project.id} />
        <FilteredItemList
          filter="SHOW_FROM_PROJECT_BY_TYPE"
          params={{ projectId: props.project.id, type: "NOTE" }}
          listName="Notes"
        />
        <FilteredItemList
          filter="SHOW_FROM_PROJECT_BY_TYPE"
          params={{ projectId: props.project.id, type: "TODO" }}
          sortCriteria="STATUS"
          listName="Todos"
        />
      </ProjectContainer>
    </ThemeProvider>
  );
}

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({
  updateDescription: (id: Uuid, text: string) => {
    dispatch(updateProjectDescription(id, text));
  },
  deleteProject: (id: Uuid) => {
    dispatch(deleteProject(id));
    dispatch(hideDeleteProjectDialog());
  },
  toggleDeleteProjectDialog: () => {
    dispatch(toggleDeleteProjectDialog());
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(Project);