"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  createBearNote: (title, contents) => electron.ipcRenderer.send("create-bear-note", { title, contents }),
  setSetting: (name, contents) => electron.ipcRenderer.send("set-setting", { name, contents }),
  toggleFeature: (name, enabled) => electron.ipcRenderer.send("feature-toggled", { name, enabled }),
  backupToCloud: (userKey) => electron.ipcRenderer.invoke("backup-to-cloud", { userKey }),
  restartApp: () => electron.ipcRenderer.send("restart-app"),
  closeQuickAdd: () => electron.ipcRenderer.send("close-quickadd"),
  createTask: (text) => electron.ipcRenderer.send("create-task", { text }),
  onReceiveMessage: (channel, listener) => electron.ipcRenderer.on(channel, listener),
  getSettings: () => electron.ipcRenderer.invoke("get-settings"),
  getSignedInUser: () => electron.ipcRenderer.invoke("get-signedin-user"),
  openDialog: (options) => electron.ipcRenderer.invoke("open-dialog", options)
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
