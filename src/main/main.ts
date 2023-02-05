import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadFiles } from '@graphql-tools/load-files';
import { exec } from 'child_process';
import fs from 'fs';
import { isAfter, parseISO } from 'date-fns';
import { app, BrowserWindow, globalShortcut, net, shell } from 'electron';
import log from 'electron-log';
import path from 'path';
import * as semver from 'semver';
import * as sqlite from 'sqlite';
import * as sqlite3 from 'sqlite3';
import { CAL_SYNC_INTERVAL, CLOUD_SERVER_URL, GRAPHQL_PORT } from '../consts';
import { saveAppleCalendarEvents } from './calendar';
import AppDatabase from './database';
import { Release } from './github';
import registerIPCHandlers from './ipcMainHandlers';
import resolvers from './resolvers';
import { store } from './settings';
import fetch from 'node-fetch';
import FormData from 'form-data';

log.transports.console.level = 'debug';

const isDev =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
log.info(`Running in ${isDev ? 'development' : 'production'}`);
let mainWindow: BrowserWindow | null = null;
let quickAddWindow: BrowserWindow | null = null;
let server: ApolloServer;
let apolloDb: AppDatabase;

const determineDatabasePath = (): string => {
  const overrideDatabaseDirectory = store.get(
    'overrideDatabaseDirectory'
  ) as string;
  if (overrideDatabaseDirectory) {
    return `${overrideDatabaseDirectory}/finish_em.db`;
  }
  return isDev
    ? './finish_em.db'
    : path.join(app.getPath('userData'), './finish_em.db');
};

const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: determineDatabasePath(),
  },
  useNullAsDefault: true,
};

apolloDb = new AppDatabase(knexConfig);

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
        listen: { port: GRAPHQL_PORT },
        context: async ({ req }) => {
          const dataSources = {
            apolloDb,
          };
          return { dataSources };
        },
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
  const databasePath = determineDatabasePath();
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
  return;
};

const checkForNewVersion = () => {
  const releasesURL =
    'https://api.github.com/repos/ryankscott/finish-em/releases';
  // TODO: Refactor this using fetch
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

  registerIPCHandlers({ apolloDb, mainWindow });

  // Load the index.html of the app.
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:1212/'
      : `file://${path.join(__dirname, '../renderer/index.html')}`
  );

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

const determineBackupPath = () => {
  return app.getPath('temp') + 'backup.db';
};

export const sendBackupToCloud = async (userKey: string) => {
  try {
    const formData = new FormData();
    const filePath = `${determineBackupPath()}`;
    formData.append('file', fs.createReadStream(filePath));
    formData.append('key', userKey);

    const res = await fetch(`${CLOUD_SERVER_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      log.error(`Failed to upload backup to cloud - ${res.statusText}`);
      return;
    }
    log.info('Successfully backed up to cloud');
    return;
  } catch (e) {
    console.log(e);
    log.error(`Failed to upload backup to cloud - ${e.message}`);
    return;
  }
};

export const backup = async () => {
  exec(
    `sqlite3 ${determineDatabasePath()} ".backup ${determineBackupPath()}"`,
    (error, _, stderr) => {
      if (error || stderr) {
        log.error(`Failed to dump database - ${stderr}`);
        throw new Error('Failed to dump database');
      } else {
        log.info('Database backup complete');
        return;
      }
    }
  );
};

const startApp = async () => {
  const cloudSync = store.get('cloudSync', {
    enabled: false,
    email: '',
    token: '',
  });
  const { enabled } = cloudSync;
  if (!enabled) {
    await runMigrations();

    await startApolloServer();

    const features = await apolloDb.getFeatures();

    const calendarIntegration = features?.find(
      (f) => f.name === 'calendarIntegration'
    );

    if (calendarIntegration?.enabled) {
      log.info('Calendar integration enabled - turning on sync');
      // Get events every 5 mins
      setInterval(async () => {
        mainWindow?.webContents.send('syncing-calendar-start', {});
        await saveAppleCalendarEvents({ apolloDb, getRecurringEvents: false });
        mainWindow?.webContents.send('syncing-calendar-finished', {});
      }, CAL_SYNC_INTERVAL);
    }
  }
  log.info('Cloud sync enabled - GQL server not starting');
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
