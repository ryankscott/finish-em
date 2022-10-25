import { IpcRendererEvent } from "electron"

export interface IElectronAPI {
  ipcRenderer: {
    createBearNote: (title: string, contents: string) => void
    toggleFeature: (name: string, enabled: boolean) => void
    closeQuickAdd: () => void
    createTask: (text: string) => void
    onReceiveMessage: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => void
  }
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
