import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";

import { theme } from "../theme";
import { updateProjectDescription } from "../actions";
import { Header, Title, SubTitle } from "./Typography";
import EditableParagraph from "./EditableParagraph";
import FilteredItemList from "../containers/FilteredItemList";

const ProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px 50px;
`;

class Project extends Component {
  constructor(props) {
    super(props);
    this.updateDescription = this.updateDescription.bind(this);
  }

  updateDescription(input) {
    this.props.updateDescription(this.props.project.id, input);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <ProjectContainer>
          <Header>{this.props.project.name} </Header>
          <EditableParagraph
            key={this.props.project.id}
            onUpdate={input => this.updateDescription(input)}
            input={this.props.project.description}
          />
          <SubTitle> Notes </SubTitle>
          <FilteredItemList
            filter="SHOW_FROM_PROJECT_BY_TYPE"
            params={{ projectId: this.props.project.id, type: "NOTE" }}
          />
          <SubTitle> Todos </SubTitle>
          <FilteredItemList
            filter="SHOW_FROM_PROJECT_BY_TYPE"
            params={{ projectId: this.props.project.id, type: "TODO" }}
          />
          <SubTitle> Archive </SubTitle>
          <FilteredItemList
            filter="SHOW_ARCHIVED_FROM_PROJECT"
            params={{ projectId: this.props.project.id, type: "TODO" }}
          />
        </ProjectContainer>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({
  updateDescription: (id, text) => {
    dispatch(updateProjectDescription(id, text));
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Project);
