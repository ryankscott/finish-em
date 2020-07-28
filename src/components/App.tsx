import { ThemeProvider } from '../StyledComponents'
import React, { ReactElement, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useHistory, Route, Switch, useParams } from 'react-router-dom'
import DailyAgenda from './DailyAgenda'
import Sidebar from './Sidebar'
import Focusbar from './Focusbar'
import ShortcutDialog from './ShortcutDialog'
import Settings from './Settings'
import Inbox from './Inbox'
import Project from './Project'
import { Project as ProjectType } from '../interfaces/project'
import View from './View'
import Help from './Help'
import { themes, GlobalStyle, selectStyles } from '../theme'
import { app as appKeymap } from '../keymap'
import {
    toggleShortcutDialog,
    showSidebar,
    hideSidebar,
    showCreateProjectDialog,
    hideShortcutDialog,
    hideCreateProjectDialog,
    hideDeleteProjectDialog,
    createItem,
    setActiveItem,
    showFocusbar,
} from '../actions/index'
import {
    Container,
    MainContainer,
    ShortcutIcon,
    FocusContainer,
    SidebarContainer,
    StyledToastContainer,
    HeaderContainer,
} from './styled/App'
import Button from './Button'
import Tooltip from './Tooltip'
import { Projects, Views, Item, Items } from '../interfaces'
import { Slide } from 'react-toastify'
import uuidv4 from 'uuid'
import { useHotkeys } from 'react-hotkeys-hook'
import { Uuid } from '@typed/uuid'
import { Icons } from '../assets/icons'
import ItemCreator from './ItemCreator'
import { transparentize, lighten } from 'polished'
import Select, { GroupType } from 'react-select'
import { removeItemTypeFromString } from '../utils'

const MIN_WIDTH_FOR_SIDEBAR = 700

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
    theme: string
    projects: Projects
    items: Items
    views: Views
}
interface DispatchProps {
    toggleShortcutDialog: () => void
    showSidebar: () => void
    hideSidebar: () => void
    hideDialogs: () => void
    showCreateProjectDialog: () => void
    createItem: (text: string, projectId: Uuid | '0') => void
    setActiveItem: (id: Uuid) => void
}

type AppProps = StateProps & DispatchProps
type OptionType = { label: string; value: () => void }

const App = (props: AppProps): ReactElement => {
    const history = useHistory()
    const searchRef = React.useRef<HTMLSelectElement>()
    const generateOptions = (projects: ProjectType, items: Item): GroupType<OptionType>[] => {
        const itemOptions = Object.values(items).map((i) => {
            return {
                label: removeItemTypeFromString(i.text),
                value: () => props.setActiveItem(i.id),
            }
        })
        const projectOptions = Object.values(projects).map((p) => {
            return {
                label: p.name,
                value: () => history.push(`/projects/${p.id}`),
            }
        })

        return [
            { label: 'Items', options: itemOptions },
            { label: 'Projects', options: projectOptions },
        ]
    }

    useEffect(() => {
        window.addEventListener('resize', () => {
            if (window.innerWidth < MIN_WIDTH_FOR_SIDEBAR && props.sidebarVisible == true) {
                props.hideSidebar()
            }
        })
    })

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

    function goToStale(): void {
        history.push('/stale')
        return
    }

    function goToSettings(): void {
        history.push('/settings')
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
        GO_TO_SEARCH: (e) => {
            searchRef.current.focus()
            e.preventDefault()
        },
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
        GO_TO_STALE: () => goToStale(),
        GO_TO_COMPLETED: () => goToCompleted(),
        GO_TO_UNSCHEDULED: () => goToUnscheduled(),
        SHOW_SIDEBAR: () => props.showSidebar(),
        HIDE_SIDEBAR: () => props.hideSidebar(),
        TOGGLE_SHORTCUT_DIALOG: () => {
            props.toggleShortcutDialog()
        },
        ESCAPE: () => props.hideDialogs(),
        SHOW_CREATE_PROJECT_DIALOG: (e) => {
            props.showCreateProjectDialog()
            e.preventDefault()
        },
    }

    Object.entries(appKeymap).map(([k, v]) => {
        useHotkeys(v, handlers[k])
    })

    const { sidebarVisible, focusbarVisible, toggleShortcutDialog } = props
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <GlobalStyle theme={themes[props.theme]} />
            <Container>
                <HeaderContainer>
                    <div style={{ gridArea: 'logo', padding: '5px 10px' }}>
                        {Icons['todoChecked'](32, 32, 'white')}
                    </div>
                    <div style={{ gridArea: 'name', fontSize: '18px' }}>{'Finish Em'}</div>
                    <div
                        style={{
                            borderRadius: '5px',
                            gridArea: 'add',
                            backgroundColor: transparentize(
                                0.4,
                                themes[props.theme].colours.headerBackgroundColour,
                            ),
                        }}
                    >
                        <ItemCreator
                            backgroundColour={lighten(
                                0.2,
                                themes[props.theme].colours.headerBackgroundColour,
                            )}
                            hideButton={true}
                            type="item"
                            initiallyExpanded={true}
                            shouldCloseOnSubmit={false}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gridArea: 'search',
                            padding: '0px 10px',
                        }}
                    >
                        <Select
                            controlShouldRenderValue={false}
                            escapeClearsValue={true}
                            ref={searchRef}
                            width="400px"
                            height="25px"
                            placeholder="Search for items..."
                            onChange={(selected) => {
                                selected.value()
                            }}
                            options={generateOptions(props.projects.projects, props.items.items)}
                            styles={selectStyles({
                                fontSize: 'xsmall',
                                theme: themes[props.theme],
                                width: '400px',
                                backgroundColour: lighten(
                                    0.2,
                                    themes[props.theme].colours.headerBackgroundColour,
                                ),
                            })}
                        />
                    </div>
                    <ShortcutIcon id="shortcut-icon">
                        <Button
                            dataFor="shortcut-button"
                            id="shortcut-button"
                            type="subtle"
                            icon="help"
                            iconSize="20px"
                            iconColour={themes[props.theme].colours.altTextColour}
                            onClick={toggleShortcutDialog}
                        ></Button>
                        <Tooltip id="shortcut-button" text={'Show shortcuts'}></Tooltip>
                    </ShortcutIcon>
                </HeaderContainer>
                <SidebarContainer visible={sidebarVisible}>
                    <Sidebar />
                </SidebarContainer>
                <MainContainer visible={sidebarVisible}>
                    <ShortcutDialog />
                    <Switch>
                        <Route path="/help">
                            <Help />
                        </Route>
                        <Route path="/dailyAgenda">
                            <DailyAgenda />
                        </Route>
                        <Route path="/inbox">
                            <Inbox />
                        </Route>

                        {Object.values(props.views.order).map((v) => {
                            const view = props.views.views[v]
                            if (view.type == 'default') return
                            return (
                                <Route key={view.id} path={`/${view.name}`}>
                                    <View
                                        key={view.id}
                                        id={view.id}
                                        name={view.name}
                                        icon={view.icon}
                                    />
                                </Route>
                            )
                        })}

                        <Route path="/Settings">
                            <Settings />
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
    items: state.items,
    sidebarVisible: state.ui.sidebarVisible,
    focusbarVisible: state.ui.focusbarVisible,
    theme: state.ui.theme,
    views: state.ui.views,
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
    createItem: (text: string, projectId: Uuid | '0') => {
        dispatch(createItem(uuidv4(), text, projectId))
    },
    setActiveItem: (id: Uuid) => {
        dispatch(showFocusbar())
        dispatch(setActiveItem(id))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(App)
