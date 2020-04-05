import React from "react";
import Project from "../components/Project";
import { connect } from "react-redux";
import uuidv4 from "uuid/v4";
import { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { ProjectType } from "../interfaces";

interface ProjectListProps {
  projects: ProjectType[];
}
const ProjectList = (props: ProjectListProps) => {
  <ThemeProvider theme={theme}>
    <div>
      {props.projects.map((p: ProjectType) => {
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
  </ThemeProvider>;
};

const mapStateToProps = state => ({
  projects: state.projects
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);
