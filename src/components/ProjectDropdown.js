import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import CreatableSelect from "react-select/creatable";
import uuidv4 from "uuid/v4";
import { theme } from "../theme";

import { connect } from "react-redux";
import { createItem, createProject } from "../actions";
const customStyles = {
  input: () => ({
    padding: "5px",
    fontFamily: theme.font.sansSerif
  }),
  menu: (provided, state) => ({
    margin: "4px 0px 0px 0px",
    padding: "0px",
    border: "1px solid",
    backgroundColor: theme.colours.backgroundColour,
    borderColor: theme.colours.borderColour
  }),
  option: (provided, state) => ({
    ...provided,
    color: theme.colours.defaultTextColour,
    backgroundColor: state.isFocused
      ? theme.colours.focusBackgroundColour
      : "white",
    padding: "5px 10px",
    margin: 0,
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.small,
    fontWeight: state.isFocused
      ? theme.fontWeights.bold
      : theme.fontWeights.regular
  }),
  control: () => ({
    width: "100%",
    margin: 0,
    padding: 0,
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.small
  }),
  singleValue: (provided, state) => ({}),
  indicatorsContainer: () => ({ display: "none" }),
  dropdownIndicator: () => ({
    display: "none"
  }),
  noOptionsMessage: () => ({
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.xsmall,
    fontWeight: theme.fontWeights.thin,
    padding: "2px 5px"
  })
};

const Container = styled.div`
  position: inline;
  box-styling: border-box;
  display: flex;
  flex-direction: column;
  border: 1px solid;
  border-color: ${props => props.theme.colours.borderColour};
  height: 35px;
  padding: 0px;
  display: ${props => (!props.visible ? "none" : null)};
  background-color: #fff;
  width: 250px;
`;

const generateOptions = options => {
  return options
    .filter(m => m.id != null)
    .filter(m => m.deleted == false)
    .map(m => ({ value: m.id, label: m.name }));
};

class ProjectDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedOption: null };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      this.selectRef.focus();
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
            ref={ref => {
              this.selectRef = ref;
            }}
            autoFocus={true}
            placeholder={this.props.placeholder}
            isSearchable
            value={this.state.selectedOption}
            onChange={this.handleChange}
            options={generateOptions(this.props.projects)}
            styles={customStyles}
          />
        </Container>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  projects: state.projects
});
const mapDispatchToProps = dispatch => ({
  createProject: (id, name) => {
    dispatch(createProject(id, name, ""));
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectDropdown);
