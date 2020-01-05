import React, { Component } from "react";
import Project from "../components/Project";
import CreateProject from "../components/CreateProject";
import FilteredItemList from "../containers/FilteredItemList";
import { connect } from "react-redux";
import uuidv4 from "uuid/v4";

class ProjectList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1> Projects </h1>
        {this.props.projects.map(p => {
          return (
            <div key={uuidv4()}>
              <Project
                id={p.id}
                key={p.id}
                name={p.name}
                description={p.description}
              />
              <FilteredItemList
                key={"i" + p.id}
                items={this.props.items}
                filter="SHOW_FROM_PROJECT"
                params={{ projectId: p.id }}
              />
            </div>
          );
        })}
        <CreateProject />
      </div>
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
