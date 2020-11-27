import { gql, useQuery } from '@apollo/client'
import { ThemeProvider } from '../StyledComponents'
import React, { ReactElement, useEffect } from 'react'
import { connect } from 'react-redux'
import { useHistory, Route, Switch, useParams } from 'react-router-dom'
import { parseISO, parse, isSameMinute } from 'date-fns'
import DailyAgenda from './DailyAgenda'
import WeeklyAgenda from './WeeklyAgenda'
import Sidebar from './Sidebar'
import Focusbar from './Focusbar'
import ShortcutDialog from './ShortcutDialog'
import Settings from './Settings'
import Inbox from './Inbox'
import Project from './Project'
import View from './View'
import Help from './Help'
import Area from './Area'
import { themes, GlobalStyle } from '../theme'
import { app as appKeymap } from '../keymap'
import { sidebarVisibleVar, focusbarVisibleVar } from '../index'
import {
  showCreateProjectDialog,
  hideShortcutDialog,
  toggleShortcutDialog,
  hideCreateProjectDialog,
  createItem,
  createEvent,
  setActiveItem,
} from '../actions/index'
import {
  Container,
  MainContainer,
  FocusContainer,
  SidebarContainer,
  StyledToastContainer,
  HeaderContainer,
  BodyContainer,
} from './styled/App'

import { convertToProperTzOffset } from '../utils'
import { Projects, Views, Areas, FeatureType, EventType, Reminders, ThemeType } from '../interfaces'
import { Slide, toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import { useHotkeys } from 'react-hotkeys-hook'
import cron from 'node-cron'

import Headerbar from './Headerbar'
const electron = window.require('electron')

export const MIN_WIDTH_FOR_SIDEBAR = 1050
export const MIN_WIDTH_FOR_FOCUSBAR = 925

const GET_SIDEBAR = gql`
  query {
    sidebarVisible @client
    focusbarVisible @client
    theme @client
  }
`

type StateProps = {
  projects: Projects
  views: Views
  areas: Areas
  reminders: Reminders
  features: FeatureType
}
type DispatchProps = {
  createEvent: (e: EventType) => void
  hideDialogs: () => void
  showCreateProjectDialog: () => void
  toggleShortcutDialog: () => void
  setActiveItem: (id: string) => void
  createItem: (text: string, projectId: string | '0') => void
}

type AppProps = StateProps & DispatchProps

const App = (props: AppProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_SIDEBAR)
  if (loading) return null
  if (error) return null

  const theme: ThemeType = themes[data.theme]
  const history = useHistory()
  const searchRef = React.useRef<HTMLSelectElement>()

  const ProjectWrapper = (): ReactElement => {
    const { id } = useParams()
    return <Project projectKey={id} />
  }

  const ViewWrapper = (): ReactElement => {
    const { id } = useParams()
    return <View viewKey={id} />
  }
  const AreaWrapper = (): ReactElement => {
    const { id } = useParams()
    return <Area areaKey={id} />
  }

  // TODO: Work out the best way to expand the width here
  useEffect(() => {
    if (window.innerWidth <= MIN_WIDTH_FOR_FOCUSBAR && data.focusbarVisible) {
      // window.resizeBy(400, 0)
    }
  }, [data.focusbarVisible])

  useEffect(() => {
    window.addEventListener('resize', () => {
      clearTimeout(window.resizeFinished)
      window.resizedFinished = setTimeout(() => {
        if (window.innerWidth < MIN_WIDTH_FOR_SIDEBAR && data.sidebarVisible) {
          sidebarVisibleVar(false)
        }
        if (window.innerWidth < MIN_WIDTH_FOR_FOCUSBAR && data.focusbarVisible) {
          focusbarVisibleVar(false)
        }
      }, 250)
      return () => {
        window.removeEventListener('resize')
      }
    })
  })

  useEffect(() => {
    // Handle Electron events
    electron.ipcRenderer.on('create-task', (event, arg) => {
      props.createItem(arg.text, arg?.projectId)
      if (arg.source) {
        toast.dark(`Task added from ${arg.source}`)
      } else {
        toast.dark(`Task added`)
      }
    })
    electron.ipcRenderer.on('new-version', (event, arg) => {
      toast(
        <div>
          <p>
            <strong>New version available 🎉</strong>
            <br />
            Download the new version <a href={arg.downloadUrl}>here </a>
            <br />
            Or checkout the release <a href={arg.releaseURL}> notes</a> `for what's` changed
          </p>
        </div>,
        { autoClose: false },
      )
    })

    electron.ipcRenderer.on('events', (event, calEvents) => {
      const parsedEvents = calEvents.map((c) => {
        const tz = convertToProperTzOffset(c.tzOffset)
        const ev: EventType = {
          id: c.id,
          start: parse(
            `${c.startDate} ${c.startTime} ${tz}`,
            'dd/MM/yy HH:mm:ss x',
            new Date(),
          ).toISOString(),
          end: parse(
            `${c.endDate} ${c.endTime} ${tz}`,
            'dd/MM/yy HH:mm:ss x',
            new Date(),
          ).toISOString(),
          title: c.summary,
          description: c.description,
        }
        return ev
      })

      parsedEvents.map((e) => {
        props.createEvent(e)
      })
    })

    electron.ipcRenderer.on('get-features', (event) => {
      event.sender.send('get-features-reply', props.features)
    })
  }, [])

  useEffect(() => {
    cron.schedule('* * * * * ', () => {
      props.reminders.map((r) => {
        if (isSameMinute(parseISO(r.remindAt), new Date())) {
          const myNotification = new Notification('Reminder', {
            body: r.text,
          })
        }
      })
    })
  }, [])

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
    SHOW_SIDEBAR: () => sidebarVisibleVar(true),
    HIDE_SIDEBAR: () => sidebarVisibleVar(false),
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
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle theme={theme} />
      <Container>
        <HeaderContainer>
          <Headerbar searchRef={searchRef} />
        </HeaderContainer>
        <BodyContainer>
          <SidebarContainer visible={data.sidebarVisible}>
            <Sidebar />
          </SidebarContainer>
          <MainContainer visible={data.sidebarVisible}>
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
              <Route path="/views/:id">
                <ViewWrapper />
              </Route>
              <Route path="/areas/:id">
                <AreaWrapper />
              </Route>
              <Route path="/projects/:id">
                <ProjectWrapper />
              </Route>
              <Route path="/Settings">
                <Settings />
              </Route>
              <Route path="/weeklyAgenda">
                <WeeklyAgenda />
              </Route>
              <Route path="/">
                <Inbox />
              </Route>
            </Switch>
          </MainContainer>
          <FocusContainer visible={data.focusbarVisible}>
            <Focusbar />
          </FocusContainer>
        </BodyContainer>
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
  areas: state.areas,
  reminders: state.reminders,
  views: state.ui.views,
  features: state.features,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
  setActiveItem: (id: string) => {
    dispatch(setActiveItem(id))
  },
  createEvent: (e: EventType) => {
    dispatch(createEvent(e))
  },
  toggleShortcutDialog: () => {
    dispatch(toggleShortcutDialog())
  },
  showCreateProjectDialog: () => {
    dispatch(showCreateProjectDialog())
  },
  hideDialogs: () => {
    dispatch(hideShortcutDialog())
    dispatch(hideCreateProjectDialog())
  },
  createItem: (text: string, projectId: string | '0') => {
    dispatch(createItem(uuidv4(), text, projectId))
  },
})
export default connect(mapStateToProps, mapDispatchToProps)(App)
