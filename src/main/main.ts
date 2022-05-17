import log from 'electron-log';
import path from 'path';
import applescript from 'applescript';
import { parseJSON, parseISO, isAfter } from 'date-fns';
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  net,
  shell,
} from 'electron';
import * as semver from 'semver';
import * as sqlite from 'sqlite';
import * as sqlite3 from 'sqlite3';
import 'sugar-date/locales';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';
import { ApolloServer } from 'apollo-server';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';
import { Release } from './github';
import { CAL_SYNC_INTERVAL } from '../consts';
import {
  AppleCalendarEvent,
  appleMailLinkScript,
  getAppleCalendars,
  getEventsForCalendar,
  getRecurringEventsForCalendar,
  setupAppleCalDatabase,
} from './appleCalendar';
import { createNote } from './bear';
import AppDatabase from './database';
import resolvers from './resolvers';
import { AttendeeInput } from './resolvers-types';
import { CalendarEntity, EventEntity } from './database/types';

const { zonedTimeToUtc } = require('date-fns-tz');

const executeAppleScript = util.promisify(applescript.execString);

log.transports.console.level = 'debug';

const isDev =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
log.info(`Running in ${isDev ? 'development' : 'production'}`);
let mainWindow: BrowserWindow | null = null;
let quickAddWindow: BrowserWindow | null = null;
let db: sqlite.Database<sqlite3.Database>;
let calendarSyncInterval: NodeJS.Timer;
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

// TODO: Refactor all of this

/* Use Apollo Server */
const startApolloServer = async () => {
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
      log.info(`🚀 Server ready at ${url}`);
    })
    .catch((err) => {
      log.error(`😢 Server startup failed: ${err}`);
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

const createCalendar = async (
  key: number,
  name: string,
  active: boolean
): Promise<CalendarEntity> => {
  return apolloDb.createCalendar(key.toString(), name, active);
};

const createItemFromAppleMail = async () => {
  const mailLink = await executeAppleScript(appleMailLinkScript);
  if (mailLink) {
    mainWindow?.webContents.send('create-item', {
      key: uuidv4(),
      type: 'TODO',
      text: mailLink,
    });
    mainWindow?.webContents.send('send-notification', {
      text: `Task added from Apple Mail`,
      type: 'info',
    });
  } else {
    log.error(`Failed to get mail link`);
  }
};

const saveCalendars = async (
  cals: { id: number; title: string }[],
  activeCalKey: string
) => {
  log.info(`Getting calendars from Apple Calendar`);
  log.info(`Saving ${cals.length} calendars from Apple Calendar`);
  try {
    await Promise.all(
      cals.map(async (c) => {
        return createCalendar(c.id, c.title, c.id.toString() === activeCalKey);
      })
    );
  } catch (e) {
    log.error(`Failed to save calendars - ${e}`);
    return;
  }

  log.info(`All calendars saved`);
};

const saveEventToDB = async (ev: EventEntity, calendarKey: string) => {
  if (!ev.startAt) {
    log.warn(`Not saving event as ${ev.title} has no startAt`);
    return;
  }

  if (!ev.endAt) {
    log.warn(`Not saving event as ${ev.title} has no endAt`);
    return;
  }

  await apolloDb.createEvent(
    ev.key.toString(),
    ev.title ?? '',
    ev.description ?? '',
    parseJSON(ev.startAt),
    parseJSON(ev.endAt),
    ev.allDay ?? false,
    calendarKey,
    ev.location ?? '',
    (ev.attendees as { name: string; email: string }[]) ?? null,
    ev.recurrence ?? ''
  );
  log.debug(`Saved event with uid - ${ev.key}`);
};

const saveEventsToDB = (events: EventEntity[], calendarKey: string) => {
  log.info(`Saving ${events.length} events to DB`);
  events.forEach(async (e) => {
    try {
      saveEventToDB(e, calendarKey);
    } catch (err) {
      log.error(`Failed to save event to db - ${err}`);
    }
  });
  log.info(`Saved ${events.length} events to DB`);
};

const translateAppleEventToEvent = (
  events: AppleCalendarEvent[]
): EventEntity[] => {
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
        const resp: Release[] = JSON.parse(rawData);
        // Get rid of draft versions and prereleases and get the last published
        const sortedReleases = resp
          .filter((r) => r.draft === false)
          .filter((r) => r.prerelease === false)
          .sort((a, b) => {
            if (a.published_at && b.published_at) {
              return isAfter(parseISO(a.published_at), parseISO(b.published_at))
                ? -1
                : 1;
            }
            return 0;
          });

        // Get the semver of the release
        const latestRelease = sortedReleases[0];
        if (!latestRelease) {
          log.info('Not updating - no new releases');
          return;
        }
        // If there's a new version
        if (semver.gt(latestRelease.name ?? '', app.getVersion())) {
          const macRelease = latestRelease.assets.find((a) =>
            a.name.endsWith('.dmg')
          );
          // Send an event to the front-end to push a notification
          mainWindow?.webContents.send('new-version', {
            version: latestRelease.name,
            publishedAt: latestRelease.published_at,
            downloadUrl: macRelease?.browser_download_url,
            releaseURL: latestRelease.html_url,
            releaseNotes: latestRelease.body,
          });
        }
      } catch (e) {
        log.error(`Failed to check for new version - ${e}`);
      }
    });
  });
  request.on('error', () => {
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

  const handleRedirect = (e: Event, url: string) => {
    if (url !== mainWindow?.webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  };

  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);
}

const saveAppleCalendarEvents = async (getRecurringEvents: boolean) => {
  const appleCalDb = await setupAppleCalDatabase();
  if (!appleCalDb) {
    log.error('Failed to set up Apple calendar db');
    return;
  }
  const activeCal = await apolloDb.getActiveCalendar();
  if (!activeCal) {
    log.error('Failed to get active calendar when saving events');
    return;
  }

  const cals = await getAppleCalendars(appleCalDb);
  if (!cals) {
    log.error('Failed to get calendars from Apple calendar cache');
    return;
  }

  await saveCalendars(cals, activeCal?.key);
  if (!activeCal) {
    log.info('Not getting events as active calendar is not set');
    return;
  }

  const appleEvents = await getEventsForCalendar(appleCalDb, activeCal?.key);
  if (!appleEvents) {
    log.error('Failed to get events from Apple calendar');
    return;
  }
  const events = translateAppleEventToEvent(appleEvents);
  saveEventsToDB(events, activeCal?.key);

  if (getRecurringEvents) {
    const recurringAppleEvents = await getRecurringEventsForCalendar(
      appleCalDb,
      activeCal?.key
    );
    if (!recurringAppleEvents) {
      log.error('Failed to get recurring events from Apple calendar');
      return;
    }
    const recurringEvents = translateAppleEventToEvent(recurringAppleEvents);
    saveEventsToDB(recurringEvents, activeCal?.key);
  }
};

const startApp = async () => {
  db = await setUpDatabase();

  await startApolloServer();

  const features = await apolloDb.getFeatures();
  const calendarIntegration = features?.find(
    (f) => f.name === 'calendarIntegration'
  );

  if (calendarIntegration?.enabled) {
    log.info('Calendar integration enabled - turning on sync');
    // Get events every 5 mins
    calendarSyncInterval = setInterval(async () => {
      await saveAppleCalendarEvents(false);
    }, CAL_SYNC_INTERVAL);
  }

  const bearNotesIntegration = features?.find(
    (f) => f.name === 'bearNotesIntegration'
  );
  if (bearNotesIntegration?.enabled) {
    log.info('Bear notes integration enabled - turning on sync');
    const metadata = bearNotesIntegration?.metadata;
    if (!metadata) {
      log.error('No metadata attached to bear notes');
      return;
    }
    // @ts-ignore
    const token = metadata?.apiToken;
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

// Quit when all windows are closed.
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

ipcMain.on('close-quickadd', () => {
  if (quickAddWindow) {
    quickAddWindow.close();
  }
});

// This is to send events between quick add and main window
// Don't try to do this in the backend because invalidating the cache won't work
ipcMain.on('create-task', (_, arg) => {
  mainWindow?.webContents.send('create-item', {
    key: uuidv4(),
    type: 'TODO',
    text: arg.text,
    projectKey: arg?.projectId,
  });
  mainWindow?.webContents.send('send-notification', {
    text: `Task added from Quick Add`,
    type: 'info',
  });
});

ipcMain.on('create-bear-note', (_, arg) => {
  createNote(arg.title, arg.content);
});

ipcMain.on('active-calendar-set', () => {
  log.info('Active calendar set');
  saveAppleCalendarEvents(false);
});

ipcMain.on('feature-toggled', (_, arg) => {
  if (arg.name === 'calendarIntegration') {
    if (arg.enabled) {
      log.info('Enabling calendar sync');
      saveAppleCalendarEvents(false);
      calendarSyncInterval = setInterval(async () => {
        await saveAppleCalendarEvents(false);
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

ipcMain.on('feature-metadata-updated', (_, arg: any) => {
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
