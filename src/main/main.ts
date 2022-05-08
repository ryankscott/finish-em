import log from 'electron-log';
import path from 'path';
import {
  ApolloClient,
  ApolloError,
  createHttpLink,
  from,
  gql,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import applescript from 'applescript';
import fetch from 'cross-fetch';
import { parseJSON } from 'date-fns';
import { app, BrowserWindow, globalShortcut, ipcMain, net } from 'electron';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import morgan from 'morgan';
import * as semver from 'semver';
import * as sqlite from 'sqlite';
import * as sqlite3 from 'sqlite3';
import 'sugar-date/locales';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';
import { ApolloServer } from 'apollo-server';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';
import { CAL_SYNC_INTERVAL, GRAPHQL_PORT } from '../consts';
import {
  AppleCalendarEvent,
  appleMailLinkScript,
  getAppleCalendars,
  getEventsForCalendar,
  getRecurringEventsForCalendar,
  setupAppleCalDatabase,
} from './appleCalendar';
import { rootValue, schema } from './schemas/schema';
import { createNote } from './bear';
import AppDatabase from './database';
import resolvers from './resolvers';

const { zonedTimeToUtc } = require('date-fns-tz');

const executeAppleScript = util.promisify(applescript.execString);

log.transports.console.level = 'debug';

const isDev =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
log.info(`Running in ${isDev ? 'development' : 'production'}`);
let mainWindow: BrowserWindow | null = null;
let quickAddWindow: BrowserWindow | null = null;
let db: sqlite.Database<sqlite3.Database>;
let client: ApolloClient<NormalizedCacheObject>;
let calendarSyncInterval: NodeJS.Timer;

/* Use Apollo Server */

const startApolloServer = async () => {
  const knexConfig = {
    client: 'sqlite3',
    connection: {
      filename: isDev
        ? './database.db'
        : path.join(app.getPath('userData'), './database.db'),
    },
    useNullAsDefault: true,
  };
  const apolloDb = new AppDatabase(knexConfig);

  const typeDefs = await loadSchema('./src/main/schemas/*.graphql', {
    loaders: [new GraphQLFileLoader()],
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({ apolloDb }),
  });

  // The `listen` method launches a web server.
  server
    .listen()
    // eslint-disable-next-line promise/always-return
    .then(({ url }) => {
      console.log(`🚀 Server ready at ${url}`);
    })
    .catch((err) => {
      console.log(`😢 Server startup failed: ${err}`);
      app.exit();
    });
};

const setUpDatabase = async (): Promise<
  sqlite.Database<sqlite3.Database, sqlite3.Statement>
> => {
  const databasePath = isDev
    ? './database.db'
    : path.join(app.getPath('userData'), './database.db');

  log.info(`Loading database at: ${databasePath}`);

  db = await sqlite.open({
    filename: databasePath,
    driver: sqlite3.Database,
  });
  await db.run('PRAGMA foreign_keys=on');
  const migrationsPath = isDev
    ? path.join(__dirname, '../../src/main/migrations')
    : path.join(process.resourcesPath, '/migrations/');

  log.info(`Loading migrations at: ${migrationsPath}`);
  await db.migrate({
    migrationsPath,
  });
  // await db.on('trace', (data) => {
  //   console.log(data)
  // })

  log.info('Migrations complete');
  return db;
};

const startGraphQL = async () => {
  const graphQLApp = await express();
  morgan.token('body', function (req, res) {
    return JSON.stringify(req.body);
  });

  graphQLApp.use(
    morgan(':date[iso] :req[header] :url :status - :response-time ms :body', {
      skip(req, res) {
        return res.statusCode < 400;
      },
    })
  );

  graphQLApp.use('/graphql', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Content-Length, X-Requested-With'
    );
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  graphQLApp.use(
    '/graphql',
    graphqlHTTP({
      rootValue,
      graphiql: true,
      pretty: true,
      schema,
      context: {
        db: {
          get: (...args) => db.get(...args),
          all: (...args) => db.all(...args),
          run: (...args) => db.run(...args),
        },
      },
    })
  );

  await graphQLApp.listen(GRAPHQL_PORT, () => {
    log.info(
      `GraphQL server is now running on http://localhost:${GRAPHQL_PORT}`
    );
  });

  return graphQLApp;
};

const createApolloClient = () => {
  // Creating a client for use in the backend
  const httpLink = createHttpLink({
    uri: 'http://localhost:8089/graphql',
    fetch,
    headers: {},
  });
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
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: from([retryLink, httpLink]),
  });
  return client;
};

const createCalendar = async (
  client: ApolloClient<NormalizedCacheObject>,
  key: number,
  name: string,
  active: boolean
) => {
  const result = await client.mutate({
    mutation: gql`
      mutation CreateCalendar(
        $key: String!
        $name: String!
        $active: Boolean!
      ) {
        createCalendar(input: { key: $key, name: $name, active: $active }) {
          key
        }
      }
    `,
    variables: {
      key: key.toString(),
      name,
      active,
    },
  });
  return await result.data;
};

const getFeatures = async (
  client: ApolloClient<NormalizedCacheObject>
): Promise<any> => {
  const result = await client
    .query({
      query: gql`
        query {
          features {
            key
            name
            enabled
            metadata
          }
        }
      `,
    })
    .catch((e: ApolloError) => {
      log.error(`Failed to get features - ${e}`);
      return null;
    });
  return result?.data;
};

const createItemFromAppleMail = async () => {
  const mailLink = await executeAppleScript(appleMailLinkScript);
  if (mailLink) {
    mainWindow.webContents.send('create-item', {
      key: uuidv4(),
      type: 'TODO',
      text: mailLink,
    });
    mainWindow.webContents.send('send-notification', {
      text: `Task added from Apple Mail`,
      type: 'info',
    });
  } else {
    log.error(`Failed to get mail link`);
  }
};

const saveCalendars = async (
  client: ApolloClient<NormalizedCacheObject>,
  cals: { id: number; title: string }[],
  activeCalKey: string
) => {
  log.info(`Getting calendars from Apple Calendar`);
  log.info(`Saving ${cals.length} calendars from Apple Calendar`);
  cals?.map((c) => {
    try {
      createCalendar(client, c.id, c.title, c.id.toString() === activeCalKey);
    } catch (err) {
      log.error(`Failed to create calendar - ${err}`);
    }
  });
  log.info(`All calendars saved`);
};

const saveEventToDB = (
  client: ApolloClient<NormalizedCacheObject>,
  ev: Event,
  calendarKey: string
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
        calendarKey,
        location: ev.location,
        attendees: ev.attendees,
        recurrence: ev.recurrence,
      },
    })
    .catch((e: ApolloError) => {
      log.error(`Failed to save event with error - ${e}`);
    });
  log.debug(`Saved event with uid - ${ev.key}`);
};

const saveEventsToDB = (
  client: ApolloClient<NormalizedCacheObject>,
  events: Event[],
  calendarKey: string
) => {
  log.info(`Saving ${events.length} events to DB`);
  events.forEach(async (e, idx) => {
    try {
      saveEventToDB(client, e, calendarKey);
    } catch (err) {
      log.error(`Failed to save event to db - ${err}`);
    }
  });
  log.info(`Saved ${events.length} events to DB`);
};

const getActiveCalendar = async (
  client: ApolloClient<NormalizedCacheObject>
): Promise<any> => {
  log.info(`Getting active calendar`);
  try {
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
    });
    return result.data;
  } catch (e) {
    console.log(`Failed to get active calendar - ${e}`);
    return null;
  }
};

const translateAppleEventToEvent = (events: AppleCalendarEvent[]): Event[] => {
  return events.map((e) => {
    const attendees: AttendeeInput[] = e.attendees
      ?.split(',')
      .map((a) => ({ name: a, email: a }));
    const startDate = e.timezone
      ? zonedTimeToUtc(e.startDate, e.timezone)
      : e.startDate;
    const endDate = e.timezone
      ? zonedTimeToUtc(e.endDate, e.timezone)
      : e.endDate;
    return {
      key: e.id,
      title: e.title,
      summary: e.summary,
      startAt: startDate,
      endAt: endDate,
      attendees,
      allDay: !!e.allDayEvent,
      location: e.location,
      recurrence: e.recurrence,
    };
  });
};

const checkForNewVersion = () => {
  const releasesURL =
    ' https://api.github.com/repos/ryankscott/finish-em/releases';

  const request = net.request(releasesURL);
  request.on('response', (response) => {
    let rawData = '';
    response.on('data', (chunk) => {
      rawData += chunk;
    });
    response.on('end', () => {
      try {
        const response = JSON.parse(rawData);
        // Get rid of draft versions and prereleases and get the last published
        const sortedReleases = response
          .filter((r) => r.draft === false)
          .filter((r) => r.prerelease === false)
          .sort((a, b) => b.published_at - a.published_at);
        // Get the semver of the release
        const latestRelease = sortedReleases[0];
        if (!latestRelease) {
          log.info('Not updating - no new releases');
          return;
        }
        // If there's a new version
        if (semver.gt(latestRelease.name, app.getVersion())) {
          const macRelease = latestRelease.assets.find((a) =>
            a.name.endsWith('.dmg')
          );
          // Send an event to the front-end to push a notification
          mainWindow.webContents.send('new-version', {
            version: latestRelease.name,
            publishedAt: latestRelease.published_at,
            downloadUrl: macRelease.browser_download_url,
            releaseURL: latestRelease.html_url,
            releaseNotes: latestRelease.body,
          });
        }
      } catch (e) {
        log.error(`Failed to check for new version - ${e.message}`);
      }
    });
  });
  request.on('error', (error) => {
    setTimeout(checkForNewVersion, 60 * 60 * 1000);
  });
  request.end();
};

function createQuickAddWindow() {
  if (quickAddWindow) return;
  quickAddWindow = new BrowserWindow({
    width: 560,
    height: 45,
    transparent: true,
    frame: false,
    resizable: false,
    movable: true,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  quickAddWindow.loadURL(
    isDev
      ? 'http://localhost:1212?quickAdd'
      : `file://${path.join(__dirname, '../renderer/index.html?quickAdd')}`
  );
  // Open dev tools
  // quickAddWindow.webContents.openDevTools()

  // On closing derefernce
  quickAddWindow.on('closed', () => {
    quickAddWindow = null;
  });
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
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the index.html of the app.
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:1212?main'
      : `file://${path.join(__dirname, '../renderer/index.html?main')}`
  );

  // Open dev tools
  // mainWindow.webContents.openDevTools()

  // On closing derefernce
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const handleRedirect = (e, url) => {
    if (url != mainWindow.getURL()) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    }
  };

  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);
}

const saveAppleCalendarEvents = async (
  client: ApolloClient<NormalizedCacheObject>,
  getRecurringEvents: boolean
) => {
  const db2 = await setupAppleCalDatabase();
  if (!db2) {
    log.error('Failed to set up Apple calendar db');
    return;
  }
  const data = await getActiveCalendar(client);
  if (!data) {
    log.error('Failed to get active calendar when saving events');
    return;
  }

  const activeCal = data?.getActiveCalendar;
  const cals = await getAppleCalendars(db2);
  if (!cals) {
    log.error('Failed to get calendars from Apple calendar cache');
    return;
  }

  await saveCalendars(client, cals, activeCal?.key);
  if (!activeCal) {
    log.info('Not getting events as active calendar is not set');
    return;
  }

  const appleEvents: AppleCalendarEvent[] = await getEventsForCalendar(
    db2,
    activeCal?.key
  );
  const events = translateAppleEventToEvent(appleEvents);
  saveEventsToDB(client, events, activeCal?.key);

  if (getRecurringEvents) {
    const recurringAppleEvents: AppleCalendarEvent[] =
      await getRecurringEventsForCalendar(db2, activeCal?.key);
    const recurringEvents = translateAppleEventToEvent(recurringAppleEvents);
    saveEventsToDB(client, recurringEvents, activeCal?.key);
  }
};

const startApp = async () => {
  db = await setUpDatabase();

  await startApolloServer();

  await startGraphQL();
  client = createApolloClient();

  const featureResult = await getFeatures(client);
  const { features } = featureResult;
  const calendarIntegration = await features?.find(
    (f) => f.name === 'calendarIntegration'
  );

  if (calendarIntegration?.enabled) {
    log.info('Calendar integration enabled - turning on sync');
    // Get events every 5 mins
    calendarSyncInterval = setInterval(async () => {
      await saveAppleCalendarEvents(client, false);
    }, CAL_SYNC_INTERVAL);
  }

  const bearNotesIntegration = await features?.find(
    (f) => f.name === 'bearNotesIntegration'
  );
  if (bearNotesIntegration?.enabled) {
    log.info('Bear notes integration enabled - turning on sync');
    const metadata = bearNotesIntegration?.metadata;
    if (!metadata) {
      log.error('No metadata attached to bear notes');
      return;
    }
    const token = JSON.parse(metadata)?.apiToken;
    if (!token) {
      log.error(`Failed to get API token for bear notes integration`);
    }
  }
};

startApp();

app.on('ready', () => {
  createMainWindow();
  globalShortcut.register('Command+Shift+N', createQuickAddWindow);
  globalShortcut.register('Command+Shift+A', createItemFromAppleMail);
  try {
    checkForNewVersion();
  } catch (e) {
    log.error(`Failed to get new version, trying again in 1hr: ${e}`);
    setTimeout(checkForNewVersion, 1000 * 60 * 60 * 24);
  }
});

// Quit when a  ll windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

ipcMain.on('close-quickadd', (event, arg) => {
  if (quickAddWindow) {
    quickAddWindow.close();
  }
});

// This is to send events between quick add and main window
// Don't try to do this in the backend because invalidating the cache won't work
ipcMain.on('create-task', (event, arg) => {
  mainWindow.webContents.send('create-item', {
    key: uuidv4(),
    type: 'TODO',
    text: arg.text,
    projectKey: arg?.projectId,
  });
  mainWindow.webContents.send('send-notification', {
    text: `Task added from Quick Add`,
    type: 'info',
  });
});

ipcMain.on('create-bear-note', (event, arg) => {
  createNote(arg.title, arg.content);
});

ipcMain.on('active-calendar-set', (event, arg) => {
  log.info('Active calendar set');
  saveAppleCalendarEvents(client, false);
});

ipcMain.on('feature-toggled', (event, arg) => {
  if (arg.name === 'calendarIntegration') {
    if (arg.enabled) {
      log.info('Enabling calendar sync');
      saveAppleCalendarEvents(client, false);
      calendarSyncInterval = setInterval(async () => {
        await saveAppleCalendarEvents(client, false);
      }, CAL_SYNC_INTERVAL);
    } else {
      log.info('Disabling calendar sync');
      clearInterval(calendarSyncInterval);
    }
  }

  if (arg.name === 'bearNotesIntegration') {
    if (arg.enabled) {
      const metadata = arg?.metadata;
      if (!metadata) {
        log.error('No metadata attached to bear notes');
        return;
      }
      const token = JSON.parse(metadata)?.apiToken;
      if (!token) {
        log.error(`Failed to get API token for bear notes integration`);
      }
    }
  }
});

ipcMain.on('feature-metadata-updated', (event, arg) => {
  if (arg.name === 'bearNotesIntegration') {
    if (arg.enabled) {
      const metadata = arg?.metadata;
      if (!metadata) {
        log.error('No metadata attached to bear notes');
        return;
      }
      const token = metadata.apiToken;
      log.info('Updated API token for bear note');
      if (!token) {
        log.error(`Failed to get API token for bear notes integration`);
      }
    }
  }
});
