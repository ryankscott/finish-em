import { gql, useMutation, useQuery } from '@apollo/client'
import { isSameMinute, parse, parseISO } from 'date-fns'
import cron from 'node-cron'
import React, { ReactElement, useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Route, Switch, useHistory, useParams } from 'react-router-dom'
import { Slide, toast } from 'react-toastify'
import { focusbarVisibleVar, shortcutDialogVisibleVar, sidebarVisibleVar } from '../index'
import { ThemeType } from '../interfaces'
import { app as appKeymap } from '../keymap'
import { ThemeProvider } from '../StyledComponents'
import { GlobalStyle, themes } from '../theme'
import Area from './Area'
import DailyAgenda from './DailyAgenda'
import Focusbar from './Focusbar'
import Headerbar from './Headerbar'
import Help from './Help'
import Inbox from './Inbox'
import Project from './Project'
import Settings from './Settings'
import ShortcutDialog from './ShortcutDialog'
import Sidebar from './Sidebar'
import {
  BodyContainer,
  Container,
  FocusContainer,
  HeaderContainer,
  MainContainer,
  SidebarContainer,
  StyledToastContainer,
} from './styled/App'
import View from './View'
import WeeklyAgenda from './WeeklyAgenda'

const electron = window.require('electron')

export const MIN_WIDTH_FOR_SIDEBAR = 1125
export const MIN_WIDTH_FOR_FOCUSBAR = 1125

const GET_DATA = gql`
  query {
    projects(input: { deleted: false }) {
      key
      sortOrder {
        sortOrder
      }
    }

    reminders {
      key
      text
      remindAt
    }
    features {
      key
      enabled
    }

    sidebarVisible @client
    focusbarVisible @client
    theme @client
    activeItem @client
    shortcutDialogVisible @client
  }
`

const CREATE_EVENT = gql`
  mutation CreateEvent(
    $key: String!
    $title: String!
    $startAt: DateTime
    $endAt: DateTime
    $description: String
    $allDay: Boolean
    $calendarKey: String
  ) {
    createEvent(
      input: {
        key: $key
        title: $title
        startAt: $startAt
        endAt: $endAt
        description: $description
        allDay: $allDay
        calendarKey: $calendarKey
      }
    ) {
      key
    }
  }
`

const CREATE_ITEM = gql`
  mutation CreateItem(
    $key: String!
    $type: String!
    $text: String!
    $parentKey: String
    $projectKey: String
  ) {
    createItem(
      input: { key: $key, type: $type, text: $text, parentKey: $parentKey, projectKey: $projectKey }
    ) {
      key
      type
      text
      project {
        key
      }
    }
  }
`

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

type AppProps = {}

const App = (props: AppProps): ReactElement => {
  const history = useHistory()
  const searchRef = React.useRef<HTMLSelectElement>()

  const goToDailyAgenda = (): void => {
    history.push('/dailyAgenda')
    return
  }

  const goToTrash = (): void => {
    history.push('/trash')
    return
  }

  const goToInbox = (): void => {
    history.push('/inbox')
    return
  }

  const goToUnscheduled = (): void => {
    history.push('/unscheduled')
    return
  }

  const goToCompleted = (): void => {
    history.push('/completed')
    return
  }

  const goToStale = (): void => {
    history.push('/stale')
    return
  }

  const goToSettings = (): void => {
    history.push('/settings')
  }

  const goToProject = (number: number): void => {
    const key = data.projects[number]
    history.push(`/projects/${key}`)
  }

  const goToNextProject = (): void => {
    const path = history.location.pathname
    if (!path.includes('projects')) {
      goToProject(1)
      return
    }
    const projectKey = path.split('/')[2]
    const projectIndex = data.projects.findIndex((p) => p.key == projectKey)
    if (projectIndex == data.projects.length - 1) {
      goToProject(1)
    } else {
      goToProject(projectIndex + 1)
    }
  }

  const goToPreviousProject = (): void => {
    const path = history.location.pathname
    if (!path.includes('projects')) {
      goToProject(data.projects.length - 1)
      return
    }
    const projectKey = path.split('/')[2]
    const projectIndex = data.projects.findIndex((p) => p.key == projectKey)
    if (projectIndex == 1) {
      goToProject(data.projects.length - 1)
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
      shortcutDialogVisibleVar(!data.shortcutDialogVisible)
    },
    ESCAPE: () => {} /*props.hideDialogs()*/,
    SHOW_CREATE_PROJECT_DIALOG: (e) => {
      //props.showCreateProjectDialog()
      e.preventDefault()
    },
  }

  Object.entries(appKeymap).map(([k, v]) => {
    useHotkeys(v, handlers[k])
  })

  useEffect(() => {
    // Handle Electron events
    electron.ipcRenderer.on('create-item', (event, arg) => {
      createItem({
        variables: {
          key: arg.key,
          type: arg.type,
          text: arg.text,
          projectKey: arg?.projectKey,
        },
      })
    })
    electron.ipcRenderer.on('send-notification', (event, arg) => {
      // TODO: Implement multiple notification types
      toast.dark(`${arg.text}`)
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
  }, [])
  const [createItem] = useMutation(CREATE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  })
  const { loading, error, data } = useQuery(GET_DATA)
  if (loading) return null
  if (error) return null

  const theme: ThemeType = themes[data.theme]

  // TODO: Work out the best way to expand the width here
  const handleResize = () => {
    if (window.innerWidth < MIN_WIDTH_FOR_SIDEBAR && data.sidebarVisible) {
      sidebarVisibleVar(false)
    }
    if (data.focusbarVisible) {
      if (window.innerWidth < MIN_WIDTH_FOR_FOCUSBAR && data.focusbarVisible) {
        focusbarVisibleVar(false)
      }
    }
  }
  window.addEventListener('resize', () => {
    setTimeout(handleResize, 250)
  })

  if (data?.reminders) {
    cron.schedule('* * * * * ', () => {
      data.reminders.map((r) => {
        if (isSameMinute(parseISO(r.remindAt), new Date())) {
          const _ = new Notification('Reminder', {
            body: r.text,
          })
        }
      })
    })
  }

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

export default App
