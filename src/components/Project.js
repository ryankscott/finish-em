import React, { Component } from "react";
import styled from "styled-components";

import { connect } from "react-redux";
import { createItem } from "../actions";

const ProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 0px;
`;

const ProjectName = styled.h2`
  padding: 2px;
  margin: 2px;
  font-size: 18px;
  font-family: "Helvetica", sans-serif;
`;

const ProjectDescription = styled.p`
  font-size: 12px;
  font-family: "Helvetica", sans-serif;
  margin: 2px 0px;
`;

const HorizontalRule = styled.hr`
  margin: 5px 0px;
  border: none;
  width: 250px;
  height: 1px;
  color: #333;
  background-color: #333;
`;

class Project extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ProjectContainer id={this.props.id}>
        <ProjectName>{this.props.name}</ProjectName>
        <HorizontalRule />
        <ProjectDescription>{this.props.description}</ProjectDescription>
      </ProjectContainer>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Project);
