import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";

import { theme } from "../theme";
import { Button } from "./Button";
import CreateProjectDialog from "./CreateProjectDialog";
import { Header, SubTitle } from "./Typography";
import { showCreateProjectDialog } from "../actions";

const Container = styled.div`
  opacity: ${props => (props.visible ? "1" : "0")};
  background-color: ${props => props.theme.colours.altBackgroundColour};
  padding: ${props => (props.visible ? "20px" : "0px")};
  width: ${props => (props.visible ? "250px" : "0px")};
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease-in-out;
  height: 100%;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
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
      <Container visible={props.sidebarVisible}>
        <SectionHeader>
          <Header invert> Views </Header>
        </SectionHeader>
        <StyledNavLink
          to="/inbox"
          activeStyle={{ fontWeight: theme.fontWeights.bold }}
        >
          {"📥  Inbox"}
        </StyledNavLink>
        <StyledNavLink
          to="/dailyAgenda"
          activeStyle={{ fontWeight: theme.fontWeights.bold }}
        >
          {"📅 Daily Agenda "}
        </StyledNavLink>
        <StyledNavLink
          to="/unscheduled"
          activeStyle={{ fontWeight: theme.fontWeights.bold }}
        >
          {"🗓 Unscheduled"}
        </StyledNavLink>
        <StyledNavLink
          to="/trash"
          activeStyle={{ fontWeight: theme.fontWeights.bold }}
        >
          {"🗑 Trash"}
        </StyledNavLink>
        <StyledNavLink
          to="/completed"
          activeStyle={{ fontWeight: theme.fontWeights.bold }}
        >
          {"✅ Completed"}
        </StyledNavLink>
        <SectionHeader>
          <Header invert>Projects</Header>
          <CreateProjectDialog />
        </SectionHeader>
        {props.projects.map(p => {
          const pathName = "/projects/" + p.id;
          if (!(p.id == null || p.deleted == true)) {
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
  projects: state.projects,
  sidebarVisible: state.ui.sidebarVisible
});
const mapDispatchToProps = dispatch => ({
  showCreateProjectDialog: () => {
    dispatch(showCreateProjectDialog());
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
