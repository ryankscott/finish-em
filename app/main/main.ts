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
  createHttpLink,
  gql,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import { convertToProperTzOffset } from '../renderer/utils'
import { parse } from 'date-fns'
import { Event } from './generated/typescript-helpers'
import { isEmpty } from 'lodash'
const log = require('electron-log')
const GRAPHQL_PORT = 8089

const isDev = process.env.APP_DEV ? process.env.APP_DEV.trim() == 'true' : false

if (isDev) {
  log.info('Running in development')
} else {
  log.info('Running in production')
}

const setUpDatabase = async () => {
  const databasePath = isDev ? './database.db' : path.join(app.getPath('userData'), './database.db')
  path.resolve(__dirname, '/database.db')
  log.info(`Loading database at: ${databasePath}`)

  const db = await sqlite.open({
    filename: databasePath,
    driver: sqlite3.Database,
  })
  await db.run('PRAGMA foreign_keys=on')
  const migrationsPath = isDev
    ? path.join(__dirname, '../../app/main/migrations')
    : path.join(process.resourcesPath, '/resources/')

  log.info(`Loading migrations at: ${migrationsPath}`)
  await db.migrate({
    migrationsPath: migrationsPath,
  })
  // await db.on('trace', (data) => {
  //   console.log(data)
  // })

  log.info('Migrations  complete')
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
  log.info(`Enabling CORS`)
  // Enable cors

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

const getMailLink = () => {
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
  applescript.execString(script, (err, rtn) => {
    if (err) {
      console.log(err)
    }
    mainWindow.webContents.send('create-item', {
      key: uuidv4(),
      type: 'TODO',
      text: rtn,
    })
    mainWindow.webContents.send('send-notification', {
      text: `Task added from Apple Mail`,
      type: 'info',
    })
  })
}

const saveCalendars = (client: ApolloClient<NormalizedCacheObject>) => {
  const script = `
	    tell application "Calendar"
	        return name of calendars
        end tell
`
  applescript.execString(script, (err, cals) => {
    if (err) {
      console.log(err)
    }
    cals.map((c) => {
      createCalendar(client, uuidv4(), c, false)
    })
  })
}

const getActiveCalendarEvents = async (client: ApolloClient<NormalizedCacheObject>) => {
  const data = await client.query({
    query: gql`
      query {
        activeCalendar: getActiveCalendar {
          key
          name
        }
      }
    `,
  })
  // TODO: Fix me
  const activeCalendar = data.data.activeCalendar
  if (isEmpty(activeCalendar)) {
    log.info('No active calendar')
    return
  }
  log.info(`Getting events for calendar - ${data.data.activeCalendar.name}`)
  const script = `
        set theStartDate to current date
        set hours of theStartDate to 0
        set minutes of theStartDate to 0
        set seconds of theStartDate to 0
        set theEndDate to theStartDate + (7 * days) - 1
        set output to {}
        tell application "Calendar"
            tell calendar "${activeCalendar.name}"
                set allEvents to (every event whose (start date) is greater than or equal to theStartDate and (start date) is less than theEndDate)
                repeat with e in allEvents
                  set startDate to (start date of e)
                  set endDate to (end date of e)
                  if eventDescription is missing value then
                    set eventDescription to ""
                  end if
                  copy {(uid of e), (short date string of startDate), (time string of startDate), (short date string of endDate), (time string of endDate), (summary of e), (eventDescription), (status of e), (time to GMT) / hours} to end of output
              end repeat
            end tell
        end tell
        return output
        `

  applescript.execString(script, (err, rtn) => {
    if (err) {
      console.log(err)
    }
    const headers = [
      'id',
      'startDate',
      'startTime',
      'endDate',
      'endTime',
      'summary',
      'description',
      'status',
      'tzOffset',
    ]
    const events = Object.values(rtn).map((r) => {
      return r.reduce((acc, cur, index) => {
        acc[headers[index]] = cur
        return acc
      }, {})
    })

    log.info(`Saving ${events.length} events to the database`)
    events.map((c) => {
      let eventStartAt, eventEndAt
      const tz = convertToProperTzOffset(c.tzOffset)
      try {
        eventStartAt = parse(
          `${c.startDate} ${c.startTime} ${tz}`,
          'dd/MM/yy h:mm:ss a x',
          new Date(),
        )
      } catch (e) {
        log.error(
          `Failed to event start date with error: ${e}  when parsing ${c.startDate} : ${c.startTime}`,
        )
      }
      try {
        eventEndAt = parse(`${c.endDate} ${c.endTime} ${tz}`, 'dd/MM/yy h:mm:ss a x', new Date())
      } catch (e) {
        log.error(
          `Failed to event end date with error: ${e}  when parsing ${c.startDate} : ${c.startTime}`,
        )
      }

      const ev: Event = {
        key: c.id,
        title: c.summary,
        description: c.description,
        startAt: null,
        endAt: null,
        allDay: false,
      }

      const result = client.mutate({
        mutation: gql`
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
        `,
        variables: {
          key: ev.key,
          title: ev.title,
          description: ev.description,
          startAt: ev.startAt ? ev.startAt.toISOString() : new Date(1970, 1, 1),
          endAt: ev.endAt ? ev.endAt.toISOString() : new Date(1970, 1, 1),
          allDay: ev.allDay,
          calendarKey: activeCalendar.key,
        },
      })
    })
  })
}

const getOutlookLink = () => {
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
  applescript.execString(script, (err, rtn) => {
    if (err) {
      console.log(err)
    }
  })
}

const openOutlookLink = (url: string) => {
  const script = `
	set the messageId to text 11 thru -1 of ${url}
	tell application "Microsoft Outlook"
        open message id messageId
        activate
	end tell
`
  applescript.execString(script, (err, rtn) => {
    if (err) {
      console.log(err)
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
        console.error(e.message)
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
      nodeIntegration: true,
      enableRemoteModule: true,
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
      nodeIntegration: true,
      enableRemoteModule: true,
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
  const features = await getFeatures(client)
  const data = await getCalendars(client)
  if (data.calendars.length == 0) {
    saveCalendars(client)
  }
  getActiveCalendarEvents(client)
  setInterval(() => {
    log.info(`Getting active calendar events `)
    getActiveCalendarEvents(client)
  }, 1000 * 60)
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
