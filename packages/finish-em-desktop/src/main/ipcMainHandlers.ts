import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import log from 'electron-log';
import { createNote } from './bear';
import { CAL_SYNC_INTERVAL } from '../consts';
import AppDatabase from './database';
import { store } from './settings';
import { saveAppleCalendarEvents, saveCalendars } from './calendar';
let calendarSyncInterval: NodeJS.Timer;

interface RegisterIPCHandlersProps {
  apolloDb: AppDatabase;
  quickAddWindow: BrowserWindow | null;
  mainWindow: BrowserWindow | null;
}

const registerIPCHandlers = ({
  apolloDb,
  quickAddWindow,
  mainWindow,
}: RegisterIPCHandlersProps) => {
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
    saveAppleCalendarEvents({ apolloDb, getRecurringEvents: false });
  });

  ipcMain.on('set-setting', async (_, arg) => {
    log.info('Setting setting');
    const settingName = arg.name;
    store.set(settingName, arg.contents);

    if (settingName === 'overrideDatabaseDirectory') {
      app.relaunch();
      app.exit(0);
    }
  });

  ipcMain.on('feature-toggled', async (_, arg) => {
    if (arg.name === 'calendarIntegration') {
      if (arg.enabled) {
        log.info('Fetching calendars from Apple and saving in db');
        await saveCalendars({ apolloDb });

        log.info('Enabling calendar sync');
        saveAppleCalendarEvents({ apolloDb, getRecurringEvents: false });
        calendarSyncInterval = setInterval(async () => {
          await saveAppleCalendarEvents({
            apolloDb,
            getRecurringEvents: false,
          });
        }, CAL_SYNC_INTERVAL);
      } else {
        log.info('Disabling calendar sync');
        clearInterval(calendarSyncInterval);
      }
    }
  });

  const handleGetSettings = () => {
    log.info('Getting settings');
    return store.store;
  };

  ipcMain.handle('get-settings', handleGetSettings);

  ipcMain.handle('open-dialog', (_, options) => {
    log.info('Opening dialog');
    return dialog.showOpenDialogSync(options);
  });
};

export default registerIPCHandlers;
