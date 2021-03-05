const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  sendMessage: (a, b) => ipcRenderer.send(a, b),
  onReceiveMessage: (a, b) => ipcRenderer.on(a, b),
})
