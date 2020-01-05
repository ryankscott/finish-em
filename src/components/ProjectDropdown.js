import React, { Component } from "react";
import styled from "styled-components";

import { connect } from "react-redux";
import { createItem } from "../actions";


// TODO work out how to display this overlapping the next item
const Container = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  margin: 0px;
  padding: 0px;
  width: 150px;
  display: ${props => (!props.visible ? "none" : null)};
  border-radius: 5px;
z-index: 2;
`;

const ProjectItem = styled.div`
  display: flex;
  height: 30px;
  padding: 2px 5px;
  align-items: center;
  &:hover {
    background-color: red;
  }
  &:focus {
    background-color: #acdaef;
    color: #555;
  }
  border-bottom: 1px solid #ccc;
`;

class ProjectDropdown extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    if (e.key == "Enter") {
      this.props.onSubmit(e.target.id);
    }
  }

  render() {
    const { projects } = this.props;
    return (
      // Only render if it's not just the Inbox project that exists
      <Container visible={this.props.visible && projects.length > 1}>
        {projects.map(p => {
          if (p.id != null) {
            return (
              <ProjectItem
                id={p.id}
                key={p.id}
                tabIndex={0}
                onKeyDown={this.handleSubmit}
              >
                {p.name}
              </ProjectItem>
            );
          }
        })}
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  projects: state.projects
});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectDropdown);
