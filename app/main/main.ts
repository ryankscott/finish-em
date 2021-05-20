import {
  ApolloClient,
  ApolloError,
  createHttpLink,
  from,
  gql,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import { RetryLink } from '@apollo/client/link/retry'
import applescript from 'applescript'
import fetch from 'cross-fetch'
import { parseJSON } from 'date-fns'
import { app, BrowserWindow, globalShortcut, ipcMain, net } from 'electron'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import jwt from 'express-jwt'
import * as jwtSign from 'jsonwebtoken'
import morgan from 'morgan'
import * as path from 'path'
import * as semver from 'semver'
import * as sqlite from 'sqlite'
import * as sqlite3 from 'sqlite3'
import 'sugar-date/locales'
import util from 'util'
import { v4 as uuidv4 } from 'uuid'
import { createNote, getAllTodos } from '../renderer/utils/bear'
import {
  AppleCalendarEvent,
  appleMailLinkScript,
  getAppleCalendars,
  getEventsForCalendar,
  getRecurringEventsForCalendar,
  setupAppleCalDatabase,
} from './appleCalendar'
import { AttendeeInput, Event, Feature } from './generated/typescript-helpers'
import { getOutlookLink, openOutlookLink } from './outlook'
import { rootValue, schema } from './schemas/schema'
var crypto = require('crypto')

const { zonedTimeToUtc } = require('date-fns-tz')

const log = require('electron-log')
log.transports.console.level = 'info'
const executeAppleScript = util.promisify(applescript.execString)
const isDev = process.env.APP_DEV ? process.env.APP_DEV.trim() == 'true' : false

const GRAPHQL_PORT = 8089

if (isDev) {
  log.info('Running in development')
} else {
  log.info('Running in production')
}

const setUpDatabase = async (): Promise<sqlite.Database<sqlite3.Database, sqlite3.Statement>> => {
  const databasePath = isDev ? './database.db' : path.join(app.getPath('userData'), './database.db')
  log.info(`Loading database at: ${databasePath}`)

  const db = await sqlite.open({
    filename: databasePath,
    driver: sqlite3.Database,
  })
  await db.run('PRAGMA foreign_keys=on')
  const migrationsPath = isDev
    ? path.join(__dirname, '../../app/main/migrations')
    : path.join(process.resourcesPath, '/migrations/')

  log.info(`Loading migrations at: ${migrationsPath}`)
  await db.migrate({
    migrationsPath: migrationsPath,
  })
  // await db.on('trace', (data) => {
  //   console.log(data)
  // })

  log.info('Migrations complete')
  return db
}

const startGraphQL = async () => {
  const graphQLApp = await express()
  morgan.token('body', function (req, res) {
    return JSON.stringify(req.body)
  })

  graphQLApp.use(
    morgan(':date[iso] :req[header] :url :status - :response-time ms :body', {
      skip: function (req, res) {
        return res.statusCode < 400
      },
    }),
  )
  if (!isDev) {
    graphQLApp.use(jwt({ secret: 'super_secret', algorithms: ['HS256'] }))
  }

  graphQLApp.use('/graphql', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Content-Length, X-Requested-With',
    )
    if (req.method === 'OPTIONS') {
      res.sendStatus(200)
    } else {
      if (!isDev) {
        if (req.user.user != 'app') {
          res.sendStatus(401)
        }
      }
      next()
    }
  })

  graphQLApp.use(
    '/graphql',
    graphqlHTTP({
      rootValue: rootValue,
      graphiql: true,
      pretty: true,
      schema: schema,
      context: {
        db: {
          get: (...args) => db.get(...args),
          all: (...args) => db.all(...args),
          run: (...args) => db.run(...args),
        },
      },
    }),
  )

  await graphQLApp.listen(GRAPHQL_PORT, () => {
    log.info(`GraphQL server is now running on http://localhost:${GRAPHQL_PORT}`)
  })

  return graphQLApp
}

const createApolloClient = () => {
  // Creating a client for use in the backend
  const token = jwtSign.sign({ user: 'app' }, 'super_secret', { algorithm: 'HS256' })
  const httpLink = createHttpLink({
    uri: 'http://localhost:8089/graphql',
    fetch,
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: Infinity,
      jitter: true,
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error,
    },
  })

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: from([retryLink, httpLink]),
  })
  return client
}

const createCalendar = async (
  client: ApolloClient<NormalizedCacheObject>,
  key: number,
  name: string,
  active: boolean,
) => {
  const result = await client.mutate({
    mutation: gql`
      mutation CreateCalendar($key: String!, $name: String!, $active: Boolean!) {
        createCalendar(input: { key: $key, name: $name, active: $active }) {
          key
        }
      }
    `,
    variables: {
      key: key.toString(),
      name: name,
      active: active,
    },
  })
  return await result.data
}

const getFeatures = async (client: ApolloClient<NormalizedCacheObject>): Promise<any> => {
  const result = await client
    .query({
      query: gql`
        query {
          features {
            key
            name
            enabled
          }
        }
      `,
    })
    .catch((e: ApolloError) => {
      log.error(`Failed to get features - ${e}`)
      return null
    })
  return result?.data
}

const createItemFromAppleMail = async () => {
  const mailLink = await executeAppleScript(appleMailLinkScript)
  if (mailLink) {
    mainWindow.webContents.send('create-item', {
      key: uuidv4(),
      type: 'TODO',
      text: mailLink,
    })
    mainWindow.webContents.send('send-notification', {
      text: `Task added from Apple Mail`,
      type: 'info',
    })
  } else {
    log.error(`Failed to get mail link`)
  }
}

const saveCalendars = async (
  client: ApolloClient<NormalizedCacheObject>,
  cals: { id: number; title: string }[],
  activeCalKey: string,
) => {
  log.info(`Getting calendars from Apple Calendar`)
  log.info(`Saving ${cals.length} calendars from Apple Calendar`)
  cals?.map((c) => {
    try {
      createCalendar(client, c.id, c.title, c.id.toString() == activeCalKey ? true : false)
    } catch (err) {
      log.error(`Failed to create calendar - ${err}`)
    }
  })
  log.info(`All calendars saved`)
}

const saveEventsToDB = (
  client: ApolloClient<NormalizedCacheObject>,
  events: Event[],
  calendarKey: string,
) => {
  log.info(`Saving ${events.length} events to DB`)
  events.forEach(async (e, idx) => {
    try {
      saveEventToDB(client, e, calendarKey)
    } catch (err) {
      log.error(`Failed to save event to db - ${err}`)
    }
  })
  log.info(`Saved ${events.length} events to DB`)
}

const saveEventToDB = (
  client: ApolloClient<NormalizedCacheObject>,
  ev: Event,
  calendarKey: string,
) => {
  client
    .mutate({
      mutation: gql`
        mutation CreateEvent(
          $key: String!
          $title: String!
          $startAt: DateTime
          $endAt: DateTime
          $description: String
          $allDay: Boolean
          $calendarKey: String
          $location: String
          $attendees: [AttendeeInput]
          $recurrence: String
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
              location: $location
              attendees: $attendees
              recurrence: $recurrence
            }
          ) {
            key
          }
        }
      `,
      variables: {
        key: ev.key.toString(),
        title: ev.title,
        description: ev.description,
        startAt: parseJSON(ev.startAt),
        endAt: parseJSON(ev.endAt),
        allDay: ev.allDay,
        calendarKey: calendarKey,
        location: ev.location,
        attendees: ev.attendees,
        recurrence: ev.recurrence,
      },
    })
    .catch((e: ApolloError) => {
      log.error(`Failed to save event with error - ${e}`)
    })
  log.debug(`Saved event with uid - ${ev.key}`)
}

const saveTodosFromBear = async (client: ApolloClient<NormalizedCacheObject>) => {
  const todos = await getAllTodos()
  log.info(`Found ${todos.length} notes with todos`)
  todos.map((t) => {
    const [id, noteTodos] = t
    log.info(`Saving todos from note with id ${id}`)
    // We're using the order we found them as the unique key
    noteTodos.map((m, idx) => {
      mainWindow.webContents.send('create-item', {
        key: crypto
          .createHash('md5')
          .update(id + idx)
          .digest('hex'),
        type: 'TODO',
        text: m,
      })
    })
  })
  log.info('Finished saving todos from notes')
}

const getActiveCalendar = async (client: ApolloClient<NormalizedCacheObject>): Promise<any> => {
  log.info(`Getting active calendar`)
  const result = await client.query({
    query: gql`
      query {
        getActiveCalendar {
          key
          name
          active
        }
      }
    `,
  })
  return await result.data
}

const translateAppleEventToEvent = (events: AppleCalendarEvent[]): Event[] => {
  return events.map((e) => {
    const attendees: AttendeeInput[] = e.attendees?.split(',').map((a) => ({ name: a, email: a }))
    const startDate = e.timezone ? zonedTimeToUtc(e.startDate, e.timezone) : e.startDate
    const endDate = e.timezone ? zonedTimeToUtc(e.endDate, e.timezone) : e.endDate
    return {
      key: e.id,
      title: e.title,
      summary: e.summary,
      startAt: startDate,
      endAt: endDate,
      attendees: attendees,
      allDay: !!e.allDayEvent,
      location: e.location,
      recurrence: e.recurrence,
    }
  })
}

const checkForNewVersion = () => {
  const releasesURL = ' https://api.github.com/repos/ryankscott/finish-em/releases'

  const request = net.request(releasesURL)
  request.on('response', (response) => {
    let rawData = ''
    response.on('data', (chunk) => {
      rawData += chunk
    })
    response.on('end', () => {
      try {
        const response = JSON.parse(rawData)
        // Get rid of draft versions and prereleases and get the last published
        const sortedReleases = response
          .filter((r) => r.draft == false)
          .filter((r) => r.prerelease == false)
          .sort((a, b) => b.published_at - a.published_at)
        // Get the semver of the release
        const latestRelease = sortedReleases[0]
        if (!latestRelease) {
          log.info('Not updating - no new releases')
          return
        }
        // If there's a new version
        if (semver.gt(latestRelease.name, app.getVersion())) {
          const macRelease = latestRelease.assets.find((a) => a.name.endsWith('.dmg'))
          // Send an event to the front-end to push a notification
          mainWindow.webContents.send('new-version', {
            version: latestRelease.name,
            publishedAt: latestRelease.published_at,
            downloadUrl: macRelease.browser_download_url,
            releaseURL: latestRelease.html_url,
            releaseNotes: latestRelease.body,
          })
        }
      } catch (e) {
        log.error(`Failed to check for new version - ${e.message}`)
      }
    })
  })
  request.on('error', (error) => {
    setTimeout(checkForNewVersion, 60 * 60 * 1000)
  })
  request.end()
}

function createQuickAddWindow() {
  if (quickAddWindow) return
  quickAddWindow = new BrowserWindow({
    width: 560,
    height: 45,
    transparent: true,
    frame: false,
    resizable: false,
    movable: true,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: isDev
        ? path.join(__dirname + '../../../preload.js')
        : path.join(process.resourcesPath, '/preload.js'),
    },
  })

  quickAddWindow.loadURL(
    isDev
      ? 'http://localhost:1124?quickAdd'
      : `file://${path.join(__dirname, '../renderer/production/index.html?quickAdd')}`,
  )
  // Open dev tools
  // quickAddWindow.webContents.openDevTools()

  // On closing derefernce
  quickAddWindow.on('closed', () => {
    quickAddWindow = null
  })
}

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 550,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
      preload: isDev
        ? path.join(__dirname + '../../../preload.js')
        : path.join(process.resourcesPath, '/preload.js'),
    },
  })

  // Load the index.html of the app.
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:1124?main'
      : `file://${path.join(__dirname, '../renderer/production/index.html?main')}`,
  )

  // Open dev tools
  // mainWindow.webContents.openDevTools()

  // On closing derefernce
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const handleRedirect = (e, url) => {
    if (url != mainWindow.getURL()) {
      e.preventDefault()
      require('electron').shell.openExternal(url)
    }
  }

  mainWindow.webContents.on('will-navigate', handleRedirect)
  mainWindow.webContents.on('new-window', handleRedirect)
}

const saveAppleCalendarEvents = async (
  client: ApolloClient<NormalizedCacheObject>,
  getRecurringEvents: boolean,
) => {
  const db2 = await setupAppleCalDatabase()
  const data = await getActiveCalendar(client)

  const activeCal = data?.getActiveCalendar
  const cals = await getAppleCalendars(db2)
  await saveCalendars(client, cals, activeCal?.key)
  const appleEvents: AppleCalendarEvent[] = await getEventsForCalendar(db2, activeCal?.key)
  const events = translateAppleEventToEvent(appleEvents)
  saveEventsToDB(client, events, activeCal?.key)

  if (getRecurringEvents) {
    const recurringAppleEvents: AppleCalendarEvent[] = await getRecurringEventsForCalendar(
      db2,
      activeCal?.key,
    )
    const recurringEvents = translateAppleEventToEvent(recurringAppleEvents)
    saveEventsToDB(client, recurringEvents, activeCal?.key)
  }
}

let mainWindow, quickAddWindow, db, client
const startApp = async () => {
  db = await setUpDatabase()

  await startGraphQL()
  client = createApolloClient()

  const featureResult = await getFeatures(client)
  const features = featureResult.features
  const calendarIntegration = await features?.find((f) => f.name == 'calendarIntegration')

  if (calendarIntegration?.enabled) {
    //   await saveAppleCalendarEvents(client, true)
    // Get events every 5 mins
    setInterval(async () => {
      await saveAppleCalendarEvents(client, false)
    }, 1000 * 60 * 5)
  }

  const bearNotesIntegration = await features?.find((f) => f.name == 'bearNotesIntegration')
  if (bearNotesIntegration?.enabled) {
    // await saveTodosFromBear(client)
    // Get todos from bear
    setInterval(async () => {
      saveTodosFromBear(client)
    }, 1000 * 60 * 5)
  }
}

startApp()

app.on('ready', () => {
  createMainWindow()
  globalShortcut.register('Command+Shift+N', createQuickAddWindow)
  globalShortcut.register('Command+Shift+A', createItemFromAppleMail)
  globalShortcut.register('Command+Shift+O', getOutlookLink)
  try {
    checkForNewVersion()
  } catch (e) {
    log.error(`Failed to get new version, trying again in 1hr: ${e}`)
    setTimeout(checkForNewVersion, 1000 * 60 * 60 * 24)
  }
})

// Quit when a  ll windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
  globalShortcut.unregisterAll()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow()
  }
})

ipcMain.on('close-quickadd', (event, arg) => {
  if (quickAddWindow) {
    quickAddWindow.close()
  }
})

ipcMain.on('open-outlook-link', (event, arg) => {
  openOutlookLink(arg.url)
})

// This is to send events between quick add and main window
// Don't try to do this in the backend because invalidating the cache won't work
ipcMain.on('create-task', (event, arg) => {
  mainWindow.webContents.send('create-item', {
    key: uuidv4(),
    type: 'TODO',
    text: arg.text,
    projectKey: arg?.projectId,
  })
  mainWindow.webContents.send('send-notification', {
    text: `Task added from Quick Add`,
    type: 'info',
  })
})

ipcMain.on('create-bear-note', (event, arg) => {
  createNote(arg.title, arg.content)
})
