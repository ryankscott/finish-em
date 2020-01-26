import React, { Component } from "react";
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

class Project extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const project = this.props.projects.find(p => {
      return p.id == this.props.projectId;
    });

    return (
      <ThemeProvider theme={theme}>
        <ProjectContainer>
          <Header>{project.name} </Header>
          <Paragraph>{project.description}</Paragraph>
          <SubTitle> Notes </SubTitle>
          <FilteredItemList
            filter="SHOW_FROM_PROJECT"
            params={{ projectId: this.props.projectId, type: "NOTE" }}
          />
          <SubTitle> Todos </SubTitle>
          <FilteredItemList
            filter="SHOW_FROM_PROJECT"
            params={{ projectId: this.props.projectId, type: "TODO" }}
          />
        </ProjectContainer>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  projects: state.projects,
  items: state.items
});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Project);
