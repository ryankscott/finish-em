import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadFiles } from '@graphql-tools/load-files';
import { isAfter, parseISO } from 'date-fns';
import { app, BrowserWindow, globalShortcut, shell } from 'electron';
import log from 'electron-log';
import path from 'path';
import * as semver from 'semver';
import * as sqlite from 'sqlite';
import * as sqlite3 from 'sqlite3';
import { CAL_SYNC_INTERVAL, GRAPHQL_PORT } from '../consts';
import { saveAppleCalendarEvents } from './calendar';
import AppDatabase from './database';
import { Release } from './github';
import registerIPCHandlers from './ipcMainHandlers';
import resolvers from './resolvers';
import { store } from './settings';

log.transports.console.level = 'debug';

const isDev =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
log.info(`Running in ${isDev ? 'development' : 'production'}`);
let mainWindow: BrowserWindow | null = null;
const quickAddWindow: BrowserWindow | null = null;
let server: ApolloServer;

const determineDatabasePath = (isInDev: boolean): string => {
  const overrideDatabaseDirectory = store.get(
    'overrideDatabaseDirectory'
  ) as string;
  if (overrideDatabaseDirectory) {
    return `${overrideDatabaseDirectory}/finish_em.db`;
  }
  return isInDev
    ? './finish_em.db'
    : path.join(app.getPath('userData'), './finish_em.db');
};

const appDbConfig = {
  client: 'sqlite3',
  connection: {
    filename: determineDatabasePath(isDev),
  },
  useNullAsDefault: true,
};

const appDb = new AppDatabase(appDbConfig);

// TODO: Refactor all of this

/* Use Apollo Server */
const startApolloServer = async () => {
  const schemasPath = isDev
    ? path.join(__dirname, './schemas/')
    : path.join(process.resourcesPath, '/schemas/');

  log.info(`Loading schemas from: ${schemasPath}`);
  try {
    const typeDefs = await loadFiles(`${schemasPath}*.graphql`);
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    try {
      const { url } = await startStandaloneServer(server, {
        context: async () => {
          return { dataSources: { apolloDb: appDb } };
        },
        listen: { port: GRAPHQL_PORT },
      });
      if (url) {
        log.info(`🚀 Server ready at ${url}`);
      }
    } catch (err) {
      log.error(`😢 Server startup failed listening: ${err}`);
      app.exit();
    }
  } catch (err) {
    log.error(`😢 Server startup failed: ${err}`);
  }
};

const runMigrations = async () => {
  const databasePath = determineDatabasePath(isDev);
  log.info(`Loading database at: ${databasePath}`);

  const db = await sqlite.open({
    filename: databasePath,
    driver: sqlite3.Database,
  });

  await db.run('PRAGMA foreign_keys=on');
  const migrationsPath = isDev
    ? path.join(__dirname, '../../src/main/migrations')
    : path.join(process.resourcesPath, '/migrations/');

  log.info(`Loading migrations at: ${migrationsPath}`);
  try {
    await db.migrate({
      migrationsPath,
    });
  } catch (e) {
    log.error({ error: e }, 'Failed to migrate');
  }

  log.info('Migrations complete');
};

const checkForNewVersion = async () => {
  const releasesURL =
    'https://api.github.com/repos/ryankscott/finish-em/releases';

  try {
    // eslint-disable-next-line compat/compat
    const response = await fetch(releasesURL);
    const resp: Release[] = await response.json();
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
    const latestVersion = latestRelease.name ?? '';
    const currentVersion = app.getVersion();
    if (semver.gt(latestVersion, currentVersion)) {
      const macRelease = latestRelease.assets.find((a) =>
        a.name.endsWith('.dmg')
      );
      // Send an event to the front-end to push a notification
      mainWindow?.webContents.send('new-version', {
        version: latestVersion,
        publishedAt: latestRelease.published_at,
        downloadUrl: macRelease?.browser_download_url,
        releaseURL: latestRelease.html_url,
        releaseNotes: latestRelease.body,
      });
    }
  } catch (e) {
    log.error(`Failed to check for new version - ${e}`);
  }

  setTimeout(checkForNewVersion, 60 * 60 * 1000);
};

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
      ? 'http://localhost:1212/'
      : `file://${path.join(__dirname, '../renderer/index.html')}`
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
}

const startApp = async () => {
  await runMigrations();

  await startApolloServer();

  registerIPCHandlers({ apolloDb: appDb, quickAddWindow, mainWindow });

  const features = await appDb.getFeatures();

  const calendarIntegration = features?.find(
    (f) => f.name === 'calendarIntegration'
  );

  if (calendarIntegration?.enabled) {
    log.info('Calendar integration enabled - turning on sync');
    // Get events every 5 mins
    setInterval(async () => {
      await saveAppleCalendarEvents({
        apolloDb: appDb,
        getRecurringEvents: false,
      });
    }, CAL_SYNC_INTERVAL);
  }
};

startApp();

app.on('ready', () => {
  createMainWindow();
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