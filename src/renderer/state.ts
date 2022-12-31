import create from 'zustand';

interface State {
  activeItemIds: string[];
  focusbarVisible: boolean;
  sidebarVisible: boolean;
  visibleSubtasks: Record<string, Record<string, boolean>>;
  shortcutDialogVisible: boolean;
  serverUrl: string;
}

interface Actions {
  setActiveItemIds: (activeItemIds: string[]) => void;
  setFocusbarVisible: (visible: boolean) => void;
  setSidebarVisible: (visible: boolean) => void;
  setShortcutDialogVisible: (visible: boolean) => void;
  setSubtaskVisibility: (
    itemKey: string,
    componentKey: string,
    visibile: boolean
  ) => void;
  setVisibleSubtasks: (
    visibleSubtasks: Record<string, Record<string, boolean>>
  ) => void;
  createSubtaskVisibilityIfDoesntExist: (
    itemKey: string,
    componentKey: string
  ) => void;
  setSubtaskVisibilityForComponent: (
    componentKey: string,
    visible: boolean
  ) => void;
  setServerUrl: (url: string) => void;
}
export type AppState = State & Actions;

const initialState: State = {
  activeItemIds: [],
  focusbarVisible: false,
  sidebarVisible: true,
  visibleSubtasks: {},
  shortcutDialogVisible: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setActiveItemIds: (activeItemIds) =>
    set(() => ({ activeItemIds: activeItemIds })),
  setFocusbarVisible: (visible) => set(() => ({ focusbarVisible: visible })),
  setSidebarVisible: (visible) => set(() => ({ sidebarVisible: visible })),
  setShortcutDialogVisible: (visible) =>
    set(() => ({ shortcutDialogVisible: visible })),

  setSubtaskVisibility: (itemKey, componentKey, visible) =>
    set((state) => {
      const { visibleSubtasks } = state;
      const itemVisibility = visibleSubtasks?.[itemKey];
      if (itemVisibility === undefined) {
        return {
          ...state,
          visibleSubtasks: {
            ...visibleSubtasks,
            [itemKey]: { [componentKey]: visible },
          },
        };
      } else {
        return {
          ...state,
          visibleSubtasks: {
            ...visibleSubtasks,
            [itemKey]: {
              ...itemVisibility,
              [componentKey]: visible,
            },
          },
        };
      }
    }),

  createSubtaskVisibilityIfDoesntExist: (itemKey, componentKey) =>
    set((state) => {
      const { visibleSubtasks } = state;
      const itemVisibility = visibleSubtasks?.[itemKey];
      if (itemVisibility === undefined) {
        return {
          ...state,
          visibleSubtasks: {
            ...visibleSubtasks,
            [itemKey]: { [componentKey]: true },
          },
        };
      }
      if (itemVisibility?.[componentKey] === undefined) {
        return {
          ...state,
          visibleSubtasks: {
            ...visibleSubtasks,
            [itemKey]: {
              ...itemVisibility,
              [componentKey]: true,
            },
          },
        };
      }
      return state;
    }),

  setVisibleSubtasks: (visibleSubtasks) =>
    set(() => ({ visibleSubtasks: visibleSubtasks })),

  setSubtaskVisibilityForComponent: (componentKey, visible) =>
    set((state) => {
      const newVisibility = Object.entries(state.visibleSubtasks).map(
        ([key, value]) => {
          if (componentKey in value) {
            return [key, { ...value, [componentKey]: visible }];
          }
          return [key, value];
        }
      );
      return {
        ...state,
        visibleSubtasks: Object.fromEntries(newVisibility),
      };
    }),

  setServerUrl: (url) => set(() => ({ serverUrl: url })),
}));
