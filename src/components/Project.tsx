import React from "react";
import styled, { ThemeProvider } from "styled-components";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { theme } from "../theme";
import {
  updateProjectDescription,
  updateProjectName,
  deleteProject,
  hideDeleteProjectDialog,
  toggleDeleteProjectDialog,
} from "../actions";
import { Title, Header1 } from "./Typography";
import EditableText from "./EditableText";
import FilteredItemList, { FilterEnum } from "../containers/FilteredItemList";
import DeleteProjectDialog from "./DeleteProjectDialog";
import QuickAdd from "./QuickAdd";
import { Uuid } from "@typed/uuid";
import { ProjectType } from "../interfaces";

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
  align-items: flex-end;
`;

export interface ProjectProps {
  deleteProject: (id: Uuid) => void;
  updateDescription: (id: Uuid, input: string) => void;
  project: ProjectType;
}
const Project = (props: ProjectProps) => {
  let history = useHistory();
  let name = React.createRef();
  let description = React.createRef();

  function deleteProject() {
    props.deleteProject(props.project.id);
    history.push("/inbox");
  }

  return (
    <ThemeProvider theme={theme}>
      <ProjectContainer>
        <HeaderContainer>
          <EditableText
            key={props.project.id + "t"}
            input={props.project.name}
            style={Title}
            onUpdate={() => {}}
            readOnly={false}
            singleline={true}
            innerRef={name}
            onUpdate={(input) => {
              props.updateName(props.project.id, input);
            }}
          />
          <DeleteProjectDialog onDelete={() => deleteProject()} />
        </HeaderContainer>
        <EditableText
          key={props.project.id + "d"}
          onUpdate={(input) => {
            props.updateDescription(props.project.id, input);
          }}
          innerRef={description}
          input={props.project.description}
          height="150px"
          width="670px"
          readOnly={false}
        />
        <Header1> Add to project </Header1>
        <QuickAdd projectId={props.project.id} />
        <FilteredItemList
          filter={FilterEnum.ShowFromProjectByType}
          filterParams={{ projectId: props.project.id, type: "NOTE" }}
          listName="Notes"
          isFilterable={false}
          showProject={false}
        />
        <FilteredItemList
          filter={FilterEnum.ShowFromProjectByType}
          filterParams={{ projectId: props.project.id, type: "TODO" }}
          listName="Todos"
          isFilterable={true}
          showProject={false}
        />
      </ProjectContainer>
    </ThemeProvider>
  );
};

const mapStateToProps = (state) => ({
  items: state.items,
});
const mapDispatchToProps = (dispatch) => ({
  updateDescription: (id: Uuid, text: string) => {
    dispatch(updateProjectDescription(id, text));
  },
  updateName: (id: Uuid, text: string) => {
    dispatch(updateProjectName(id, text));
  },
  deleteProject: (id: Uuid) => {
    dispatch(deleteProject(id));
    dispatch(hideDeleteProjectDialog());
  },
  toggleDeleteProjectDialog: () => {
    dispatch(toggleDeleteProjectDialog());
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(Project);
