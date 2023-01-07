import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import log from 'electron-log';
import { createNote } from './bear';
import {
  AppleCalendarEvent,
  getAppleCalendars,
  getEventsForCalendar,
  getRecurringEventsForCalendar,
  setupAppleCalDatabase,
} from './appleCalendar';
import { CAL_SYNC_INTERVAL } from '../consts';
import AppDatabase from './database';
import { store } from './settings';
import { saveAppleCalendarEvents, saveCalendars } from './calendar';
import { backup, sendBackupToCloud } from './main';
let calendarSyncInterval: NodeJS.Timer;

interface RegisterIPCHandlersProps {
  apolloDb: AppDatabase;
  mainWindow: BrowserWindow | null;
}

const registerIPCHandlers = ({
  apolloDb,
  mainWindow,
}: RegisterIPCHandlersProps) => {
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

  ipcMain.on('active-calendar-set', async () => {
    log.info('Active calendar set');

    mainWindow?.webContents.send('syncing-calendar-start', {});
    await saveAppleCalendarEvents({ apolloDb, getRecurringEvents: false });
    mainWindow?.webContents.send('syncing-calendar-finished', {});
  });

  ipcMain.on('set-setting', async (_, arg) => {
    log.info(`Setting setting - ${arg.name}`);
    const settingName = arg.name;
    store.set(settingName, arg.contents);

    if (settingName === 'overrideDatabaseDirectory') {
      app.relaunch();
      app.exit(0);
    }
  });

  ipcMain.on('restart-app', async (_, __) => {
    log.info(`Restarting app`);
    app.relaunch();
    app.exit(0);
  });

  ipcMain.on('feature-toggled', async (_, arg) => {
    if (arg.name === 'calendarIntegration') {
      if (arg.enabled) {
        log.info('Fetching calendars from Apple and saving in db');
        await saveCalendars({ apolloDb });

        log.info('Enabling calendar sync');

        mainWindow?.webContents.send('syncing-calendar-start', {});
        await saveAppleCalendarEvents({ apolloDb, getRecurringEvents: false });
        mainWindow?.webContents.send('syncing-calendar-finished', {});
        calendarSyncInterval = setInterval(async () => {
          mainWindow?.webContents.send('syncing-calendar-start', {});
          await saveAppleCalendarEvents({
            apolloDb,
            getRecurringEvents: false,
          });

          mainWindow?.webContents.send('syncing-calendar-finished', {});
        }, CAL_SYNC_INTERVAL);
      } else {
        log.info('Disabling calendar sync');
        clearInterval(calendarSyncInterval);
      }
    }
  });

  ipcMain.handle('backup-to-cloud', async (_, { userKey }) => {
    try {
      await backup();
      await sendBackupToCloud(userKey);
      return true;
    } catch (e) {
      log.error(`Failed to backup to cloud - ${e.message}`);
      return false;
    }
  });

  ipcMain.handle('get-settings', () => {
    log.info('Getting settings');
    return store.store;
  });

  ipcMain.handle('open-dialog', (_, options) => {
    log.info('Opening dialog');
    return dialog.showOpenDialogSync(options);
  });
};

export default registerIPCHandlers;
