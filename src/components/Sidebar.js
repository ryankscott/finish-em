import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";

import { theme } from "../theme";
import FilteredItemList from "../containers/FilteredItemList";
import Button from "./Button";
import CreateProjectDialog from "./CreateProjectDialog";
import { Header, SubTitle } from "./Typography";
import { showCreateProjectDialog } from "../actions";

const Container = styled.div`
  background-color: ${props => props.theme.colours.altBackgroundColour};
  padding: 20px;
  height: 100%;
  width: 250px;
  display: flex;
  flex-direction: column;
`;

const StyledNavLink = styled(NavLink)`
  font-size: ${props => props.theme.fontSizes.regular};
  font-weight: ${props => props.theme.fontWeights.regular};
  color: ${props => props.theme.colours.altTextColour};
  text-decoration: none;
  margin: 5px 0px 5px 10px;
  outline: none;
  &:active: {
    outline: none;
  }
  &:focus: {
    outline: none;
  }
`;
const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: first baseline;
  justify-content: space-between;
`;

function Sidebar(props) {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <SectionHeader>
          <Header invert> Views </Header>
        </SectionHeader>
        <StyledNavLink to="/inbox"> Inbox </StyledNavLink>
        <StyledNavLink to="/dailyAgenda"> Daily Agenda </StyledNavLink>
        <SectionHeader>
          <Header invert>Projects</Header>
          <Button onClick={props.showCreateProjectDialog}> Add Project </Button>
          <CreateProjectDialog />
        </SectionHeader>
        {props.projects.map(p => {
          const pathName = "/projects/" + p.id;
          if (p.id != null) {
            return (
              <StyledNavLink
                key={p.id}
                to={pathName}
                activeStyle={{ fontWeight: theme.fontWeights.bold }}
              >
                {p.name}
              </StyledNavLink>
            );
          }
        })}
      </Container>
    </ThemeProvider>
  );
}

const mapStateToProps = state => ({
  projects: state.projects
});
const mapDispatchToProps = dispatch => ({
  showCreateProjectDialog: () => {
    dispatch(showCreateProjectDialog());
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
