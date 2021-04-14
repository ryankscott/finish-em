import { ipcMain, app, net, BrowserWindow, globalShortcut } from 'electron'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import applescript from 'applescript'
import * as semver from 'semver'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { schema, rootValue } from './schemas/schema'
import * as sqlite from 'sqlite'
import * as sqlite3 from 'sqlite3'
import morgan from 'morgan'
import fetch from 'cross-fetch'
import * as jwtSign from 'jsonwebtoken'
import jwt from 'express-jwt'
import {
  ApolloClient,
  ApolloError,
  createHttpLink,
  gql,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import { Event } from './generated/typescript-helpers'
import { isEmpty } from 'lodash'
import { Date as sugarDate } from 'sugar-date'
import 'sugar-date/locales'
import util from 'util'
const log = require('electron-log')
log.transports.console.level = 'info'
const executeAppleScript = util.promisify(applescript.execString)
const isDev = process.env.APP_DEV ? process.env.APP_DEV.trim() == 'true' : false

const GRAPHQL_PORT = 8089

type AppleCalendarEvent = {
  id: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  summary: string
  status: string
  allDayEvent: string
  location: string
  tzOffset: string
  attendees: { name: string; email: string }[]
  recurrence: string
}

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

  graphQLApp.use(
    morgan(':date[iso] :status  - :response-time ms', {
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
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
  })
  return client
}

const createCalendar = async (
  client: ApolloClient<NormalizedCacheObject>,
  key: string,
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
      key: key,
      name: name,
      active: active,
    },
  })
  return await result.data
}

const getFeatures = async (client: ApolloClient<NormalizedCacheObject>) => {
  const result = await client.query({
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
  return await result.data
}

const getCalendars = async (client: ApolloClient<NormalizedCacheObject>) => {
  const result = await client.query({
    query: gql`
      query {
        calendars {
          key
          name
        }
      }
    `,
  })
  return await result.data
}

const getMailLink = async () => {
  const script = `
    tell application "Mail"
		set theSelection to selection
		set theMessage to item 1 of theSelection
		set theSubject to subject of theMessage
		set theSender to sender of theMessage
		set theID to message id of theMessage
		set theLink to "message://%3c" & theID & "%3e"
        set theItem to "TODO [" & theSubject & " - " & theSender & " ](" & theLink & ")"
        set the clipboard to theItem
		return theItem
	end tell
`
  const mailLink = await executeAppleScript(script)
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

const saveCalendars = async (client: ApolloClient<NormalizedCacheObject>) => {
  const getAllCalendars = `
	    tell application "Calendar"
	        return name of calendars
        end tell
`
  try {
    log.info(`Getting calendars from Apple Calendar`)
    const cals = await executeAppleScript(getAllCalendars)
    // TODO: We shouldn't smash over calendars every time, we should diff
    log.info(`Found ${cals.length} calendars from Apple Calendar`)
    cals.map((c) => {
      log.info(`Saving calendar - "${c}"`)
      createCalendar(client, uuidv4(), c, false)
    })
  } catch (err) {
    log.error(`Failed to get calendars from Apple Calendar - ${err}`)
  }
}

const saveEventToDB = (evt: AppleCalendarEvent, calendarKey: string) => {
  let eventStartAt, eventEndAt
  try {
    eventStartAt = sugarDate.create(`${evt.startDate} ${evt.startTime}`, 'en-GB')
  } catch (err) {
    log.error(
      `Failed to event start date with error: ${err} when parsing ${evt.startDate}  ${evt.startTime}`,
    )
  }
  try {
    eventEndAt = sugarDate.create(`${evt.endDate} ${evt.endTime}`, 'en-GB')
  } catch (err) {
    log.error(
      `Failed to event end date with error: ${err} when parsing ${evt.startDate} : ${evt.startTime}`,
    )
  }

  const ev: Event = {
    key: evt.id,
    title: evt.summary,
    description: '',
    startAt: eventStartAt,
    endAt: eventEndAt,
    allDay: evt.allDayEvent == 'true',
    location: evt.location == 'missing value' ? '' : evt.location,
    attendees: evt.attendees
      ? evt.attendees.map((a) => {
          return { name: a[0] == 'missing value' ? '' : a[0], email: a[1] }
        })
      : null,
    recurrence: evt.recurrence == 'missing value' ? '' : evt.recurrence,
  }
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
        key: ev.key,
        title: ev.title,
        description: ev.description,
        startAt: ev.startAt ? ev.startAt.toISOString() : new Date(1970, 1, 1),
        endAt: ev.endAt ? ev.endAt.toISOString() : new Date(1970, 1, 1),
        allDay: ev.allDay,
        calendarKey: calendarKey,
        location: ev.location,
        attendees: ev.attendees,
        recurrence: ev.recurrence,
      },
    })
    .catch((e: ApolloError) => {
      log.error(`Failed to insert event with error - ${e}`)
    })
  log.debug(`Saved event with uid - ${evt.id}`)
}

const getActiveCalendarRecurringEvents = async (client: ApolloClient<NormalizedCacheObject>) => {
  const data = await client.query({
    query: gql`
      query {
        activeCalendar: getActiveCalendar {
          key
          name
          active
        }
      }
    `,
  })
  const activeCalendar = data.data.activeCalendar
  if (isEmpty(activeCalendar)) {
    log.info(`Not getting events - no active calendar`)
    return
  }

  log.info(`Getting recurring events from the last 180 days from calendar - ${activeCalendar.name}`)
  const getRecurringEventsQuery = `
     set theStartDate to (current date) - (180 * days)
     set theEndDate to (current date)
     set output to {}
     tell application "Calendar"
     tell calendar "${activeCalendar.name}"
         set allEvents to (every event whose (start date) is greater than or equal to theStartDate and (start date) is less than or equal to theEndDate and recurrence is not equal to "")
         repeat with e in allEvents
        set startDate to (start date of e)
        set endDate to (end date of e)
        set attendeesOutput to {}
        repeat with a in (attendees of e)
          copy {(display name of a), (email of a)} to end of attendeesOutput
        end repeat
        copy {(uid of e), (short date string of startDate), (time string of startDate), (short date string of endDate), (time string of endDate), (summary of e), (status of e), (allday event of e), (location of e), (time to GMT) / hours, attendeesOutput, (recurrence of e)} to end of output
         end repeat
       end tell
     end tell
     return output
   `

  try {
    const recurringEvents = await executeAppleScript(getRecurringEventsQuery)
    log.info(`Received ${recurringEvents?.length} recurring  events from Apple Calendar`)

    const events = translateAppleScriptToEvent(recurringEvents)
    events.forEach((e, i) => {
      log.debug(`Saving event ${i + 1} / ${events.length} to DB`)
      saveEventToDB(e, activeCalendar.key)
    })
  } catch (err) {
    setTimeout(() => getActiveCalendarRecurringEvents(client), 1000 * 60 * 60 * 4)
    log.error(`Failed to get recurring events from Apple Calendar - ${err}`)
    return
  }
}

const getActiveCalendarEvents = async (
  client: ApolloClient<NormalizedCacheObject>,
  days?: number,
) => {
  const data = await client.query({
    query: gql`
      query {
        activeCalendar: getActiveCalendar {
          key
          name
          active
        }
      }
    `,
  })
  const activeCalendar = data.data.activeCalendar
  if (isEmpty(activeCalendar)) {
    log.info(`Not getting events - no active calendar`)
    return
  }

  log.info(`Getting events for the next week for calendar - ${activeCalendar.name}`)
  const getEventsForWeek = `
        set theStartDate to current date
        set hours of theStartDate to 0
        set minutes of theStartDate to 0
        set seconds of theStartDate to 0
        set theEndDate to theStartDate + (${days ? days : 7} * days) - 1 
        set output to {}
        tell application "Calendar"
          tell calendar "${activeCalendar.name}"
		set allEvents to (every event whose (start date) is greater than or equal to theStartDate and (start date) is less than theEndDate)
		repeat with e in allEvents
			set startDate to (start date of e)
			set endDate to (end date of e)
			set attendeesOutput to {}
			repeat with a in (attendees of e)
				copy {(display name of a), (email of a)} to end of attendeesOutput
			end repeat
			copy {(uid of e), (short date string of startDate), (time string of startDate), (short date string of endDate), (time string of endDate), (summary of e), (status of e), (allday event of e), (location of e), (time to GMT) / hours, attendeesOutput, (recurrence of e)} to end of output
		end repeat
	end tell
end tell
return output`

  try {
    const allEvents = await executeAppleScript(getEventsForWeek)
    log.info(`Received ${allEvents?.length} calendar events from Apple Calendar`)

    const events = translateAppleScriptToEvent(allEvents)

    events.forEach((e, i) => {
      log.debug(`Saving event ${i + 1} / ${events.length} to DB`)
      saveEventToDB(e, activeCalendar.key)
    })
  } catch (err) {
    log.error(`Failed to get events from Apple Calendar - ${err}`)
    return
  }

  log.info(`All events saved`)
  mainWindow.webContents.send('events-refreshed')
}

const translateAppleScriptToEvent = (appleScriptOutput: string): AppleCalendarEvent[] => {
  const headers = [
    'id',
    'startDate',
    'startTime',
    'endDate',
    'endTime',
    'summary',
    'status',
    'allDayEvent',
    'location',
    'tzOffset',
    'attendees',
    'recurrence',
  ]
  const events = Object.values(appleScriptOutput).map((r) => {
    return r.reduce((acc, cur, index) => {
      acc[headers[index]] = cur
      return acc
    }, {})
  })

  return events
}

const getOutlookLink = async () => {
  const script = `
    tell application "Microsoft Outlook"
    set theSelection to selection
    set theMessage to item 1 of theSelection
    set theSubject to subject of theMessage
    set theSender to sender of theMessage
    set theID to message id of theMessage
    set theLink to "outlook://" & theID
    set theItem to "TODO [" & theSubject & " - " & theSender & " ](" & theLink & ")"
    set the clipboard to theItem
    return theItem
end tell
`
  const link = await executeAppleScript(script)
  if (!link) {
    log.error(`Failed to get Outlook link`)
  }
}

const openOutlookLink = async (url: string) => {
  const script = `
	set the messageId to text 11 thru -1 of ${url}
	tell application "Microsoft Outlook"
        open message id messageId
        activate
	end tell
`
  const link = await executeAppleScript(script)
  if (!link) {
    log.error(`Failed to open Outlook link`)
  }
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
    width: 580,
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

let mainWindow, quickAddWindow, db, client
const startApp = async () => {
  db = await setUpDatabase()
  await startGraphQL()
  client = createApolloClient()
  await getFeatures(client)
  await saveCalendars(client)
  await getActiveCalendarEvents(client)
  await getActiveCalendarRecurringEvents(client)
  setInterval(() => {
    log.info(`Getting active calendar events `)
    getActiveCalendarEvents(client)
  }, 1000 * 60 * 10)
}

startApp()

app.on('ready', () => {
  createMainWindow()
  globalShortcut.register('Command+Shift+N', createQuickAddWindow)
  globalShortcut.register('Command+Shift+A', getMailLink)
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

ipcMain.on('get-todays-events', (event, arg) => {
  getActiveCalendarEvents(client, 1)
})
