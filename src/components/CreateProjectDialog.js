import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import uuidv4 from "uuid/v4";

import { theme } from "../theme";
import { createProject, hideCreateProjectDialog } from "../actions";
import Button from "./Button";
import IconButton from "./IconButton";
// TODO: IconButton is shit

const Container = styled.div`
  position: absolute;
  top: 230px;
  box-sizing: border-box;
  display: ${props => (props.visible ? "flex" : "none")};
  flex-direction: column;
  width: 200px;
  background-color: ${props => props.theme.colours.lightDialogBackgroundColour};
  z-index: 2;
  padding: 5px 5px 8px 5px;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
`;

const InputContainer = styled.div`
display: flex;
flex-direction column;
margin-bottom: 10px;
`;

const StyledInput = styled.input`
  font-size: ${props => props.theme.fontSizes.xsmall};
  padding: 2px 5px;
  margin: 2px 2px;
  height: 25px;
  width: 150px;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 5px;
`;

class CreateProjectDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectName: "",
      projectDescription: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
        <Container visible={this.props.visible}>
          <Header>
            <IconButton onClick={this.props.closeCreateProjectDialog}>
              ×
            </IconButton>
          </Header>
          <InputContainer>
            <StyledInput
              id="createProjectName"
              type="text"
              value={this.state.projectName}
              onChange={this.handleChange}
              required
              placeholder="Project name"
              tabIndex="0"
            />
            <StyledInput
              id="createProjectDescription"
              type="text"
              value={this.state.projectDescription}
              onChange={this.handleChange}
              placeholder="Project description"
              tabIndex="0"
            />
          </InputContainer>
          <Button onClick={this.handleSubmit}>Create</Button>
        </Container>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  visible: state.ui.showCreateProjectDialog
});

const mapDispatchToProps = dispatch => ({
  createProject: (id, name, description) => {
    dispatch(createProject(id, name, description));
    dispatch(hideCreateProjectDialog());
  },
  closeCreateProjectDialog: () => {
    dispatch(hideCreateProjectDialog());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateProjectDialog);
