import React, { Component } from "react";
import styled from "styled-components";
import { connect } from "react-redux";

import { createProject } from "../actions";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 350px;
`;
const ProjectNameInput = styled.input``;
const ProjectDescriptionInput = styled.input``;

class CreateProject extends Component {
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
    this.setState({ projectName: "", projectDescription: "" });
    this.props.onSubmit(projectName, projectDescription);
  }

  render() {
    return (
      <Container>
        <h3> Create Project </h3>
        <ProjectNameInput
          id="createProjectName"
          type="text"
          value={this.state.projectName}
          onChange={this.handleChange}
          required
          placeholder="Project name"
        />
        <ProjectDescriptionInput
          id="createProjectDescription"
          type="text"
          value={this.state.projectDescription}
          onChange={this.handleChange}
          placeholder="Project description"
        />
        <button onClick={this.handleSubmit}> Create </button>
      </Container>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  onSubmit: (name, description) => {
    dispatch(createProject(name, description));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateProject);
