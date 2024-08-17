import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  createBearNote: (title, contents) => ipcRenderer.send('create-bear-note', { title, contents }),

  setSetting: (name, contents) => ipcRenderer.send('set-setting', { name, contents }),

  toggleFeature: (name, enabled) => ipcRenderer.send('feature-toggled', { name, enabled }),

  backupToCloud: (userKey) => ipcRenderer.invoke('backup-to-cloud', { userKey }),

  restartApp: () => ipcRenderer.send('restart-app'),

  closeQuickAdd: () => ipcRenderer.send('close-quickadd'),

  createTask: (text) => ipcRenderer.send('create-task', { text }),

  onReceiveMessage: (channel, listener) => ipcRenderer.on(channel, listener),

  getSettings: () => ipcRenderer.invoke('get-settings'),

  getSignedInUser: () => ipcRenderer.invoke('get-signedin-user'),

  openDialog: (options) => ipcRenderer.invoke('open-dialog', options)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
