import React, { Component } from "react";
import Project from "../components/Project";
import FilteredItemList from "../containers/FilteredItemList";
import { connect } from "react-redux";
import uuidv4 from "uuid/v4";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { Header, SubTitle } from "../components/Typography";

class ProjectList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <div>
          {this.props.projects.map(p => {
            return (
              <div key={uuidv4()}>
                <Project
                  id={p.id}
                  key={p.id}
                  name={p.name}
                  description={p.description}
                />
              </div>
            );
          })}
        </div>
      </ThemeProvider>
    );
  }
}

// TODO: Add PropTypes
const mapStateToProps = state => ({
  projects: state.projects
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectList);
