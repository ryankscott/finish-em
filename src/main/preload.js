const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage: (a, b) => ipcRenderer.send(a, b),
    onReceiveMessage: (a, b) => ipcRenderer.on(a, b),
  },
});
