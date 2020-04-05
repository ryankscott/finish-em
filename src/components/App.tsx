import React from "react";
import DailyAgenda from "./DailyAgenda";
import Inbox from "./Inbox";
import Trash from "./Trash";
import Project from "./Project";
import Unscheduled from "./Unscheduled";
import Sidebar from "./Sidebar";
import Completed from "./Completed";
import ShortcutDialog from "./ShortcutDialog";
import { app as appKeymap } from "../keymap";
import { connect } from "react-redux";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { theme } from "../theme";
import { ProjectType } from "../interfaces";
import { useHistory, Route, Switch, useParams } from "react-router-dom";
import { GlobalHotKeys, configure } from "react-hotkeys";
import {
  toggleShortcutDialog,
  showSidebar,
  hideSidebar,
  showCreateProjectDialog,
  hideShortcutDialog,
  hideCreateProjectDialog,
  hideDeleteProjectDialog
} from "../actions";
import { helpIcon } from "../assets/icons.js";
import { Container, MainContainer, ShortcutIcon } from "./styled/App";

configure({
  logLevel: "warning"
});

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

interface ProjectWrapperProps {
  projects: ProjectType[];
}
const ProjectWrapper = (props: ProjectWrapperProps) => {
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

  function goToTrash() {
    history.push("/trash");
  }

  function goToInbox() {
    history.push("/inbox");
  }

  function goToUnscheduled() {
    history.push("/unscheduled");
  }

  function goToCompleted() {
    history.push("/completed");
  }

  function goToProject(number) {
    const activeProjects = props.projects.filter(p => p.deleted == false);
    if (number >= activeProjects.length) return;
    const id = activeProjects[number].id;
    history.push("/projects/" + id);
  }

  const handlers = {
    GO_TO_PROJECT_1: () => goToProject(1),
    GO_TO_PROJECT_2: () => goToProject(2),
    GO_TO_PROJECT_3: () => goToProject(3),
    GO_TO_PROJECT_4: () => goToProject(4),
    GO_TO_PROJECT_5: () => goToProject(5),
    GO_TO_PROJECT_6: () => goToProject(6),
    GO_TO_PROJECT_7: () => goToProject(7),
    GO_TO_PROJECT_8: () => goToProject(8),
    GO_TO_PROJECT_9: () => goToProject(9),
    GO_TO_DAILY_AGENDA: () => goToDailyAgenda(),
    GO_TO_INBOX: () => goToInbox(),
    GO_TO_TRASH: () => goToTrash(),
    GO_TO_COMPLETED: () => goToCompleted(),
    GO_TO_UNSCHEDULED: () => goToUnscheduled(),
    SHOW_SIDEBAR: () => props.showSidebar(),
    HIDE_SIDEBAR: () => props.hideSidebar(),
    TOGGLE_SHORTCUT_DIALOG: () => props.toggleShortcutDialog(),
    ESCAPE: () => props.hideDialogs(),
    SHOW_CREATE_PROJECT_DIALOG: e => {
      props.showCreateProjectDialog();
      e.preventDefault();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalHotKeys keyMap={appKeymap} handlers={handlers} />
      <GlobalStyle />
      <Container>
        <Sidebar />
        <MainContainer sidebarVisible={props.sidebarVisible}>
          <ShortcutDialog />
          <Switch>
            <Route path="/inbox">
              <Inbox />
            </Route>
            <Route path="/dailyAgenda">
              <DailyAgenda />
            </Route>
            <Route path="/trash">
              <Trash />
            </Route>
            <Route path="/unscheduled">
              <Unscheduled />
            </Route>
            <Route path="/completed">
              <Completed />
            </Route>
            <Route path="/projects/:id">
              <ProjectWrapper projects={props.projects} />
            </Route>
            <Route path="/">
              <Inbox />
            </Route>
          </Switch>
        </MainContainer>
        <ShortcutIcon id="shortcut-icon" onClick={props.toggleShortcutDialog}>
          {helpIcon()}
        </ShortcutIcon>
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
export default connect(mapStateToProps, mapDispatchToProps)(App);
