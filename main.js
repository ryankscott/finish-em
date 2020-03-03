const { ipcMain, app, BrowserWindow, globalShortcut } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");

// TODO: Change to an array for multi-window support
let mainWindow, quickAddWindow;

function createQuickAddWindow() {
  quickAddWindow = new BrowserWindow({
    width: 550,
    height: 280,
    transparent: true,
    frame: false,
    focused: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname + "/preload.js")
    }
  });

  quickAddWindow.loadURL(
    isDev
      ? "http://localhost:1234?quickAdd"
      : `file://${__dirname}/build/index.html?quickAdd`
  );
  // Open dev tools
  //  quickAddWindow.webContents.openDevTools();

  // On closing derefernce
  quickAddWindow.on("closed", () => {
    quickAddWindow = null;
  });
}

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname + "/preload.js")
    }
  });

  // Load the index.html of the app.
  mainWindow.loadURL(
    isDev
      ? "http://localhost:1234?main"
      : `file://${__dirname}/build/index.html?main`
  );

  // Open dev tools
  // mainWindow.webContents.openDevTools();

  // On closing derefernce
  // TODO: Change to an array for multi-window support
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  createMainWindow();
  globalShortcut.register("Command+Shift+N", createQuickAddWindow);
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
  globalShortcut.unregisterAll();
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

ipcMain.on("close-quickadd", (event, arg) => {
  quickAddWindow.close();
});
