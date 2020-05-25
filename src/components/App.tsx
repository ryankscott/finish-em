// @ts-nocheck
import React, { ReactElement } from 'react'
import { connect } from 'react-redux'
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components'
import { useHistory, Route, Switch, useParams } from 'react-router-dom'
import { GlobalHotKeys, configure } from 'react-hotkeys'
import DailyAgenda from './DailyAgenda'
import Inbox from './Inbox'
import Trash from './Trash'
import Project from './Project'
import Unscheduled from './Unscheduled'
import Sidebar from './Sidebar'
import Completed from './Completed'
import Focusbar from './Focusbar'
import ShortcutDialog from './ShortcutDialog'
import { app as appKeymap } from '../keymap'
import { theme } from '../theme'
import {
    toggleShortcutDialog,
    showSidebar,
    hideSidebar,
    showCreateProjectDialog,
    hideShortcutDialog,
    hideCreateProjectDialog,
    hideDeleteProjectDialog,
} from '../actions/index'
import {
    Container,
    MainContainer,
    ShortcutIcon,
    FocusContainer,
    SidebarContainer,
} from './styled/App'
import { Button } from './Button'
import { Tooltip } from './Tooltip'
import { Projects } from '../interfaces'
import { ToastContainer, Slide } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

configure({
    logLevel: 'warning',
})

const StyledToastContainer = styled(ToastContainer).attrs((props) => ({
    className: 'toast-container',
    toastClassName: 'toast',
    bodyClassName: 'body',
    progressClassName: 'progress',
}))`
    /* .toast-container */
    width: 400px;
    border: 1px solid;
    border-radius: 5px;
    height: 80px;

    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.small};
    /* .toast is passed to toastClassName */
    .toast {
        background-color: ${(props) =>
            props.theme.colours.darkDialogBackgroundColour};
        color: ${(props) => props.theme.colours.altTextColour};
    }

    /* .body is passed to bodyClassName */
    .body {
    }

    /* .progress is passed to progressClassName */
    .progress {
        background: linear-gradient(
            to right,
            #4cd964,
            #5ac8fa,
            #007aff,
            #34aadc,
            #5856d6,
            #ff2d55
        );
    }
`

// TODO: Fix props for global styles
const GlobalStyle = createGlobalStyle`
* {
    box-sizing: border-box;
}
  html {
    box-sizing: border-box;
  }
  body {
    font-family: ${(props) => props.theme.font.sansSerif};
    color: ${(props) => props.theme.colours.defaultTextColour};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    background-color: ${(props) => props.theme.colours.backgroundColour};
    box-sizing: border-box;
    padding: 0px;
    margin: 0px;
  }
  *:focus {outline:0;}
`
interface ProjectWrapperProps {
    projects: Projects
}
const ProjectWrapper = (props: ProjectWrapperProps): ReactElement => {
    const { id } = useParams()
    const project = props.projects.projects[id]
    return <Project project={project} />
}

interface StateProps {
    sidebarVisible: boolean
    focusbarVisible: boolean
    projects: Projects
}
interface DispatchProps {
    toggleShortcutDialog: () => void
    showSidebar: () => void
    hideSidebar: () => void
    hideDialogs: () => void
    showCreateProjectDialog: () => void
}

type AppProps = StateProps & DispatchProps

const App = (props: AppProps): ReactElement => {
    const history = useHistory()

    function goToDailyAgenda(): void {
        history.push('/dailyAgenda')
        return
    }

    function goToTrash(): void {
        history.push('/trash')
        return
    }

    function goToInbox(): void {
        history.push('/inbox')
        return
    }

    function goToUnscheduled(): void {
        history.push('/unscheduled')
        return
    }

    function goToCompleted(): void {
        history.push('/completed')
        return
    }

    function goToProject(number: number): void {
        const id = props.projects.order[number]
        history.push(`/projects/${id}`)
    }

    function goToNextProject(): void {
        const path = history.location.pathname
        if (!path.includes('projects')) {
            goToProject(1)
            return
        }
        const projectId = path.split('/')[2]
        const projectIndex = props.projects.order.indexOf(projectId)
        if (projectIndex == props.projects.order.length - 1) {
            goToProject(1)
        } else {
            goToProject(projectIndex + 1)
        }
    }

    function goToPreviousProject(): void {
        const path = history.location.pathname
        if (!path.includes('projects')) {
            goToProject(props.projects.order.length - 1)
            return
        }
        const projectId = path.split('/')[2]
        const projectIndex = props.projects.order.indexOf(projectId)
        if (projectIndex == 1) {
            goToProject(props.projects.order.length - 1)
        } else {
            goToProject(projectIndex - 1)
        }
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
        GO_TO_NEXT_PROJECT: () => goToNextProject(),
        GO_TO_PREV_PROJECT: () => goToPreviousProject(),
        GO_TO_INBOX: () => goToInbox(),
        GO_TO_TRASH: () => goToTrash(),
        GO_TO_COMPLETED: () => goToCompleted(),
        GO_TO_UNSCHEDULED: () => goToUnscheduled(),
        SHOW_SIDEBAR: () => props.showSidebar(),
        HIDE_SIDEBAR: () => props.hideSidebar(),
        TOGGLE_SHORTCUT_DIALOG: () => props.toggleShortcutDialog(),
        ESCAPE: () => props.hideDialogs(),
        SHOW_CREATE_PROJECT_DIALOG: (e) => {
            props.showCreateProjectDialog()
            e.preventDefault()
        },
    }

    const { sidebarVisible, focusbarVisible, toggleShortcutDialog } = props
    return (
        <ThemeProvider theme={theme}>
            <GlobalHotKeys keyMap={appKeymap} handlers={handlers} />
            <GlobalStyle theme={theme} />
            <Container>
                <SidebarContainer visible={sidebarVisible}>
                    <Sidebar />
                </SidebarContainer>
                <MainContainer visible={sidebarVisible}>
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
                <FocusContainer visible={focusbarVisible}>
                    <Focusbar />
                </FocusContainer>
                <ShortcutIcon id="shortcut-icon">
                    <Button
                        dataFor="shortcut-button"
                        id="shortcut-button"
                        type="subtleInvert"
                        icon="help"
                        iconColour="#CCC"
                        onClick={toggleShortcutDialog}
                    ></Button>
                    <Tooltip
                        id="shortcut-button"
                        text={'Show shortcuts'}
                    ></Tooltip>
                </ShortcutIcon>
            </Container>
            <StyledToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                transition={Slide}
            />
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    projects: state.projects,
    sidebarVisible: state.ui.sidebarVisible,
    focusbarVisible: state.ui.focusbarVisible,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    toggleShortcutDialog: () => {
        dispatch(toggleShortcutDialog())
    },
    showCreateProjectDialog: () => {
        dispatch(showCreateProjectDialog())
    },
    hideSidebar: () => {
        dispatch(hideSidebar())
    },
    showSidebar: () => {
        dispatch(showSidebar())
    },
    hideDialogs: () => {
        dispatch(hideShortcutDialog())
        dispatch(hideCreateProjectDialog())
        dispatch(hideDeleteProjectDialog())
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(App)
