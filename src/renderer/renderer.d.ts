import { IpcRendererEvent } from 'electron'
import { StoreSchema } from '../main/settings'

interface FileFilter {
  name: string
  extensions: string[]
}

type DialogProperties = 'openFile' | 'openDirectory'

interface OpenDialogProps {
  title: string
  properties: DialogProperties[]
  defaultPath?: string
  filters?: FileFilter[]
}

export interface IElectronAPI {
  createBearNote: (title: string, contents: string) => void
  toggleFeature: (name: string, enabled: boolean) => void
  getSettings: () => Promise<StoreSchema>
  getSignedInUser: () => Promise<Record<string, string>>
  setSetting: (name: string, contents: string) => Promise<void>
  closeQuickAdd: () => void
  backupToCloud: (key: string) => Promise<boolean>
  createTask: (text: string) => void
  restartApp: () => void
  onReceiveMessage: (
    channel: string,
    listener: (event: IpcRendererEvent, ...args: any[]) => void
  ) => void
  openDialog: ({ title, properties, defaultPath, filters }: OpenDialogProps) => Promise<string[]>
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
