import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import uuidv4 from "uuid/v4";
import { Uuid } from "@typed/uuid";

import { Header2 } from "./Typography";
import { theme } from "../theme";
import {
  createProject,
  toggleCreateProjectDialog,
  hideCreateProjectDialog
} from "../actions";
import { Button } from "./Button";
import InlineDialog from "./InlineDialog";

const StyledInput = styled.input`
  font-size: ${props => props.theme.fontSizes.xsmall};
  padding: 2px 5px;
  margin: 2px 2px;
  height: 25px;
  width: 150px;
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 5px 0px;
  padding: 0px 0px 10px 0px;
`;

export interface CreateProjectDialogProps {
  visible: boolean;
  createProject: (id: Uuid, name: string, description: string) => void;
  closeCreateProjectDialog: () => void;
  toggleCreateProjectDialog: () => void;
}
interface CreateProjectDialogState {
  projectName: string;
  projectDescription: string;
}
class CreateProjectDialog extends Component<
  CreateProjectDialogProps,
  CreateProjectDialogState
> {
  private createProjectInput: React.RefObject<HTMLInputElement>;
  constructor(props) {
    super(props);
    this.state = {
      projectName: "",
      projectDescription: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.createProjectInput = React.createRef();
  }
  handleChange(e) {
    e.target.id == "createProjectName"
      ? this.setState({ projectName: e.target.value })
      : this.setState({ projectDescription: e.target.value });
  }

  handleSubmit() {
    const { projectName, projectDescription } = this.state;
    if (projectName == "") return;
    this.setState({ projectName: "", projectDescription: "" });
    const projectId = uuidv4();
    this.props.createProject(projectId, projectName, projectDescription);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <InlineDialog
          onClose={() => this.props.closeCreateProjectDialog()}
          placement={"bottom-start"}
          isOpen={this.props.visible}
          onOpen={() => this.createProjectInput.current.focus()}
          content={
            <div>
              <Header2>Create Project</Header2>
              <BodyContainer>
                <StyledInput
                  autoFocus
                  id="createProjectName"
                  type="text"
                  value={this.state.projectName}
                  onChange={this.handleChange}
                  required
                  placeholder="Project name"
                  tabIndex={0}
                  ref={this.createProjectInput}
                />
                <StyledInput
                  id="createProjectDescription"
                  type="text"
                  value={this.state.projectDescription}
                  onChange={this.handleChange}
                  placeholder="Project description"
                  tabIndex={0}
                />
              </BodyContainer>
              <Button
                compact={false}
                type="primary"
                onClick={this.handleSubmit}
              >
                Create
              </Button>
            </div>
          }
        >
          <Button
            compact={false}
            type="primary"
            onClick={() => this.props.toggleCreateProjectDialog()}
          >
            Add Project
          </Button>
        </InlineDialog>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  visible: state.ui.createProjectDialogVisible
});

const mapDispatchToProps = dispatch => ({
  createProject: (id, name, description) => {
    dispatch(createProject(id, name, description));
    dispatch(hideCreateProjectDialog());
  },
  closeCreateProjectDialog: () => {
    dispatch(hideCreateProjectDialog());
  },
  toggleCreateProjectDialog: () => {
    dispatch(toggleCreateProjectDialog());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateProjectDialog);
