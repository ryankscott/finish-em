const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer: {
    createBearNote: (title, contents) =>
      ipcRenderer.send('create-bear-note', { title, contents }),

    setSetting: (name, contents) =>
      ipcRenderer.send('set-setting', { name, contents }),

    toggleFeature: (name, enabled) =>
      ipcRenderer.send('feature-toggled', { name, enabled }),

    closeQuickAdd: () => ipcRenderer.send('close-quickadd'),

    createTask: (text) => ipcRenderer.send('create-task', { text }),

    onReceiveMessage: (channel, listener) => ipcRenderer.on(channel, listener),

    getSettings: () => ipcRenderer.invoke('get-settings'),

    openDialog: (options) => ipcRenderer.invoke('open-dialog', options),
  },
});
