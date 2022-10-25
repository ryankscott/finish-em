const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer: {
    createBearNote: (title, contents) => ipcRenderer.send('create-bear-note', { title, contents }),
    toggleFeature: (name, enabled) => ipcRenderer.send(
      'feature-toggled',
      { name, enabled }
    ),

    closeQuickAdd: () => ipcRenderer.send(
      'close-quickadd',
    ),

    createTask: (text) => ipcRenderer.send(
      'create-task', { text }
    ),
    onReceiveMessage: (channel, listener) =>
      ipcRenderer.on(channel, listener),
  },
});
