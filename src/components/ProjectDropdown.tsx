import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import CreatableSelect from "react-select/creatable";
import uuidv4 from "uuid/v4";
import { theme, selectStyles } from "../theme";
import { Uuid } from "@typed/uuid";

import { connect } from "react-redux";
import { createProject } from "../actions";

interface ContainerProps {
  visible: boolean;
}
const Container = styled.div<ContainerProps>`
  position: inline;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 35px;
  padding: 0px;
  display: ${(props) => (!props.visible ? "none" : null)};
  background-color: #fff;
  width: 250px;
`;

const generateOptions = (options) => {
  return options
    .filter((m) => m.id != null)
    .filter((m) => m.deleted == false)
    .map((m) => ({ value: m.id, label: m.name }));
};
interface ProjectDropdownProps {
  visible: boolean;
  onSubmit: (value: string) => void;
  onEscape?: () => void;
  createProject: (id: Uuid, value: string) => void;
  placeholder: string;
  projects: Object[];
}
interface ProjectDropdownState {
  selectedOption: {};
}
class ProjectDropdown extends Component<
  ProjectDropdownProps,
  ProjectDropdownState
> {
  private selectRef: React.RefObject<HTMLInputElement>;
  constructor(props) {
    super(props);
    this.state = { selectedOption: null };
    this.handleChange = this.handleChange.bind(this);
    this.selectRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      this.selectRef.current.focus();
    }
  }

  handleChange(newValue, actionMeta) {
    if (actionMeta.action == "select-option") {
      this.props.onSubmit(newValue.value);
    } else if (actionMeta.action == "create-option") {
      const newProjectId = uuidv4();
      this.props.createProject(newProjectId, newValue.value);
      this.props.onSubmit(newProjectId);
    }
  }

  render() {
    const { projects } = this.props;
    // Only render if it's not just the Inbox project that exists
    return (
      <ThemeProvider theme={theme}>
        <Container visible={this.props.visible && projects.length > 1}>
          <CreatableSelect
            ref={this.selectRef}
            autoFocus={true}
            placeholder={this.props.placeholder}
            isSearchable
            value={this.state.selectedOption}
            onChange={this.handleChange}
            options={generateOptions(this.props.projects)}
            styles={selectStyles}
            escapeClearsValue={true}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key == "Escape") {
                this.props.onEscape();
              }
            }}
          />
        </Container>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  projects: state.projects,
});
const mapDispatchToProps = (dispatch) => ({
  createProject: (id, name) => {
    dispatch(createProject(id, name, ""));
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(ProjectDropdown);
