import { gql, useMutation, useQuery } from '@apollo/client'
import { Flex } from '@chakra-ui/react'
import { isSameMinute, parseISO } from 'date-fns'
import React, { ReactElement, useEffect } from 'react'
import { Route, Switch, useHistory, useParams } from 'react-router-dom'
import { Slide, toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { activeItemVar, focusbarVisibleVar, sidebarVisibleVar } from '../index'
import { ActionBar } from './ActionBar'
import Area from './Area'
import DailyAgenda from './DailyAgenda'
import Focusbar from './Focusbar'
import Headerbar from './Headerbar'
import Help from './Help'
import Inbox from './Inbox'
import Settings from './Settings'
import ShortcutDialog from './ShortcutDialog'
import Sidebar from './Sidebar'
import View from './View'
import WeeklyAgenda from './WeeklyAgenda'
import '../filterBoxStyles.css'

export const MIN_WIDTH_FOR_SIDEBAR = 1125
export const MIN_WIDTH_FOR_FOCUSBAR = 1125

const GET_DATA = gql`
  query getAppData {
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
    activeItem @client
    shortcutDialogVisible @client
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
  useEffect(() => {
    // Handle Electron events
    window.electron.onReceiveMessage('create-item', async (event, arg) => {
      try {
        const item = await createItem({
          variables: {
            key: arg.key,
            type: arg.type,
            text: arg.text,
            projectKey: arg?.projectKey,
          },
        })
      } catch (err) {
        // TODO: Have a think about the best way to handle a failed insert
        return
      }
      toast.dark(`New item added from Bear - ${arg.text}`)
    })

    window.electron.onReceiveMessage('send-notification', (event, arg) => {
      // TODO: Implement multiple notification types
      toast.dark(`${arg.text}`)
    })

    window.electron.onReceiveMessage('new-version', (event, arg) => {
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

  // TODO: Work out the best way to expand the width here
  const handleResize = () => {
    if (window.innerWidth < MIN_WIDTH_FOR_SIDEBAR && sidebarVisibleVar()) {
      sidebarVisibleVar(false)
    }
    if (focusbarVisibleVar()) {
      if (window.innerWidth < MIN_WIDTH_FOR_FOCUSBAR && focusbarVisibleVar()) {
        focusbarVisibleVar(false)
      }
    }
  }
  window.addEventListener('resize', () => {
    setTimeout(handleResize, 250)
  })

  if (data?.reminders) {
    setInterval(
      data.reminders.map((r) => {
        if (r.deleted) return
        if (isSameMinute(parseISO(r.remindAt), new Date())) {
          const _ = new Notification('Reminder', {
            body: r.text,
          })
        }
      }),
      1000 * 60,
    )
  }

  return (
    <Flex direction={'column'} h={'100vh'} w={'100%'}>
      <Flex
        sx={{
          WebkitAppRegion: 'drag',
        }}
        zIndex={999}
        position={'fixed'}
        h={'50px'}
        w={'100%'}
        shadow="md"
      >
        <Headerbar searchRef={searchRef} />
      </Flex>
      <Flex pt={'50px'} overflowY={'scroll'} h={'100%'} direction={'row'}>
        <Sidebar />
        <Flex overflowY={'scroll'} w={'100%'} h={'100%'} justifyContent={'center'}>
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
        </Flex>
        <Focusbar />
      </Flex>
      {activeItemVar().length > 1 && <ActionBar />}
      <ToastContainer
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
    </Flex>
  )
}

export default App
