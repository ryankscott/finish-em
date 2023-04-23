import create from 'zustand'

interface State {
  activeItemIds: string[]
  focusbarVisible: boolean
  sidebarVisible: boolean
  visibleSubtasks: Record<string, Record<string, boolean>>
  shortcutDialogVisible: boolean
}

interface Actions {
  setActiveItemIds: (activeItemIds: string[]) => void
  setFocusbarVisible: (visible: boolean) => void
  setSidebarVisible: (visible: boolean) => void
  setVisibleSubtasks: (visibleSubtasks: Record<string, Record<string, boolean>>) => void
  setShortcutDialogVisible: (visible: boolean) => void
}
export type AppState = State & Actions

const initialState: State = {
  activeItemIds: [],
  focusbarVisible: false,
  sidebarVisible: true,
  visibleSubtasks: {},
  shortcutDialogVisible: false
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setActiveItemIds: (activeItemIds) => set(() => ({ activeItemIds: activeItemIds })),
  setFocusbarVisible: (visible) => set(() => ({ focusbarVisible: visible })),
  setSidebarVisible: (visible) => set(() => ({ sidebarVisible: visible })),
  setVisibleSubtasks: (visibleSubtasks) => set(() => ({ visibleSubtasks: visibleSubtasks })),
  setShortcutDialogVisible: (visible) => set(() => ({ shortcutDialogVisible: visible })),
}))
