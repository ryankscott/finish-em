import {
  SHOW_SHORTCUT_DIALOG,
  HIDE_SHORTCUT_DIALOG,
  TOGGLE_SHORTCUT_DIALOG,
  SHOW_CREATE_PROJECT_DIALOG,
  HIDE_CREATE_PROJECT_DIALOG,
  TOGGLE_CREATE_PROJECT_DIALOG,
  SHOW_DELETE_PROJECT_DIALOG,
  HIDE_DELETE_PROJECT_DIALOG,
  TOGGLE_DELETE_PROJECT_DIALOG,
  SHOW_SIDEBAR,
  HIDE_SIDEBAR
} from "../actions";

const initialState = {
  sidebarVisible: true,
  shortcutDialogVisible: false,
  createProjectDialogVisible: false,
  deleteProjectDialogVisible: false
};

export const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_SHORTCUT_DIALOG:
      return {
        ...state,
        shortcutDialogVisible: true
      };
    case HIDE_SHORTCUT_DIALOG:
      return {
        ...state,
        shortcutDialogVisible: false
      };

    case TOGGLE_SHORTCUT_DIALOG:
      return {
        ...state,
        shortcutDialogVisible: !state.shortcutDialogVisible
      };

    case TOGGLE_CREATE_PROJECT_DIALOG:
      return {
        ...state,
        createProjectDialogVisible: !state.createProjectDialogVisible
      };
    case SHOW_CREATE_PROJECT_DIALOG:
      return {
        ...state,
        createProjectDialogVisible: true
      };
    case HIDE_CREATE_PROJECT_DIALOG:
      return {
        ...state,
        createProjectDialogVisible: false
      };
    case TOGGLE_DELETE_PROJECT_DIALOG:
      return {
        ...state,
        deleteProjectDialogVisible: !state.deleteProjectDialogVisible
      };
    case SHOW_DELETE_PROJECT_DIALOG:
      return {
        ...state,
        deleteProjectDialogVisible: true
      };
    case HIDE_DELETE_PROJECT_DIALOG:
      return {
        ...state,
        deleteProjectDialogVisible: false
      };
    case SHOW_SIDEBAR:
      return {
        ...state,
        sidebarVisible: true
      };
    case HIDE_SIDEBAR:
      return {
        ...state,
        sidebarVisible: false
      };

    default:
      return state;
  }
};
