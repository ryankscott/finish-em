import React from "react";
import Project, { ProjectInterface } from "../components/Project";
import { connect } from "react-redux";
import uuidv4 from "uuid/v4";
import { ThemeProvider } from "styled-components";
import { theme } from "../theme";

interface ProjectListProps {
  projects: ProjectInterface[];
}
const ProjectList = (props: ProjectListProps) => {
  <ThemeProvider theme={theme}>
    <div>
      {props.projects.map((p: ProjectInterface) => {
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
