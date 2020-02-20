import React, { useState, useEffect } from "react";
import QuickAdd from "./QuickAdd";
import FilteredItemList from "../containers/FilteredItemList";
import ProjectList from "../containers/ProjectList";
import DailyAgenda from "../components/DailyAgenda";
import Inbox from "../components/Inbox";
import Trash from "../components/Trash";
import Archive from "../components/Archive";
import Project from "../components/Project";
import Sidebar from "../components/Sidebar";
import ShortcutDialog from "../components/ShortcutDialog";
import { connect } from "react-redux";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { theme } from "../theme";
import {
  useHistory,
  Route,
  Switch,
  useParams,
  BrowserRouter as Router
} from "react-router-dom";
import * as Mousetrap from "Mousetrap";
import {
  showSidebar,
  hideSidebar,
  showCreateProjectDialog,
  hideShortcutDialog,
  hideCreateProjectDialog,
  hideDeleteProjectDialog,
  toggleShortcutDialog
} from "../actions";

const GlobalStyle = createGlobalStyle`
  html {
    height: 100%;
  }

  body {
    font-family: ${props => props.theme.font.sansSerif};
    color: ${props => props.theme.colours.defaultTextColour};
    font-weight: ${props => props.theme.fontWeights.regular};
    background-color: ${props => props.theme.colours.backgroundColour};
    box-sizing: border-box;
    padding: 0px;
    margin: 0px;
    height: 100%;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0px;
  width: 100%;
  height: 100%;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  margin-left: ${props => (props.sidebarVisible ? "270px" : "0px")};
  transition: all 0.2s ease-in-out;
`;

const ProjectWrapper = props => {
  let { id } = useParams();
  const project = props.projects.find(p => {
    return p.id == id;
  });
  return <Project project={project} />;
};

function App(props) {
  let history = useHistory();

  function goToDailyAgenda() {
    history.push("/dailyAgenda");
  }

  function goToInbox() {
    history.push("/inbox");
  }

  function goToProject(number) {
    if (number >= props.projects.length) return;
    const id = props.projects[number].id;
    history.push("/projects/" + id);
  }

  useEffect(() => {
    Mousetrap.bind("g d a", () => goToDailyAgenda());
    Mousetrap.bind("g i", () => goToInbox());
    Mousetrap.bind("g p 1", () => goToProject(1));
    Mousetrap.bind("g p 2", () => goToProject(2));
    Mousetrap.bind("g p 3", () => goToProject(3));
    Mousetrap.bind("g p 4", () => goToProject(4));
    Mousetrap.bind("g p 5", () => goToProject(5));
    Mousetrap.bind("g p 6", () => goToProject(6));
    Mousetrap.bind("g p 7", () => goToProject(7));
    Mousetrap.bind("g p 8", () => goToProject(8));
    Mousetrap.bind("g p 9", () => goToProject(9));
    Mousetrap.bind("[", props.hideSidebar);
    Mousetrap.bind("]", props.showSidebar);
    Mousetrap.bind("?", props.toggleShortcutDialog);
    Mousetrap.bind("escape", props.hideDialogs);
    Mousetrap.bind("c p", props.showCreateProjectDialog);
    return function cleanup() {
      Mousetrap.unbind("g a");
      Mousetrap.unbind("g i");
      Mousetrap.unbind("g 1");
      Mousetrap.unbind("g 2");
      Mousetrap.unbind("g 3");
      Mousetrap.unbind("g 4");
      Mousetrap.unbind("g 5");
      Mousetrap.unbind("g 6");
      Mousetrap.unbind("g 7");
      Mousetrap.unbind("g 8");
      Mousetrap.unbind("g 9");
      Mousetrap.unbind("?");
    };
  });

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <Sidebar />
        <MainContainer sidebarVisible={props.sidebarVisible}>
          <Switch>
            <Route exact path="/" component={Inbox} />
            <Route exact path="/inbox" component={Inbox} />
            <Route exact path="/dailyAgenda" component={DailyAgenda} />
            <Route exact path="/trash" component={Trash} />
            <Route exact path="/archive" component={Archive} />
            <Route
              path="/projects/:id"
              children={<ProjectWrapper projects={props.projects} />}
            />
          </Switch>
          <ShortcutDialog />
        </MainContainer>
      </Container>
    </ThemeProvider>
  );
}

const mapStateToProps = state => ({
  projects: state.projects,
  sidebarVisible: state.ui.sidebarVisible
});

const mapDispatchToProps = dispatch => ({
  toggleShortcutDialog: () => {
    dispatch(toggleShortcutDialog());
  },
  showCreateProjectDialog: () => {
    dispatch(showCreateProjectDialog());
  },
  hideSidebar: () => {
    dispatch(hideSidebar());
  },

  showSidebar: () => {
    dispatch(showSidebar());
  },
  hideDialogs: () => {
    dispatch(hideShortcutDialog());
    dispatch(hideCreateProjectDialog());
    dispatch(hideDeleteProjectDialog());
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
