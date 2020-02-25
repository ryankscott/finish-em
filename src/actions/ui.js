export const SHOW_SIDEBAR = "SHOW_SIDEBAR";
export const HIDE_SIDEBAR = "HIDE_SIDEBAR";
export const SHOW_SHORTCUT_DIALOG = "SHOW_SHORTCUT_DIALOG";
export const HIDE_SHORTCUT_DIALOG = "HIDE_SHORTCUT_DIALOG";
export const TOGGLE_SHORTCUT_DIALOG = "TOGGLE_SHORTCUT_DIALOG";
export const SHOW_CREATE_PROJECT_DIALOG = "SHOW_CREATE_PROJECT_DIALOG";
export const HIDE_CREATE_PROJECT_DIALOG = "HIDE_CREATE_PROJECT_DIALOG";
export const TOGGLE_CREATE_PROJECT_DIALOG = "TOGGLE_CREATE_PROJECT_DIALOG";
export const SHOW_DELETE_PROJECT_DIALOG = "SHOW_DELETE_PROJECT_DIALOG";
export const HIDE_DELETE_PROJECT_DIALOG = "HIDE_DELETE_PROJECT_DIALOG";
export const TOGGLE_DELETE_PROJECT_DIALOG = "TOGGLE_DELETE_PROJECT_DIALOG";

export function hideShortcutDialog() {
  return {
    type: HIDE_SHORTCUT_DIALOG
  };
}

export function toggleShortcutDialog() {
  return {
    type: TOGGLE_SHORTCUT_DIALOG
  };
}

export function showCreateProjectDialog() {
  return {
    type: SHOW_CREATE_PROJECT_DIALOG
  };
}

export function toggleCreateProjectDialog() {
  return {
    type: TOGGLE_CREATE_PROJECT_DIALOG
  };
}

export function hideCreateProjectDialog() {
  return {
    type: HIDE_CREATE_PROJECT_DIALOG
  };
}

export function showDeleteProjectDialog() {
  return {
    type: SHOW_DELETE_PROJECT_DIALOG
  };
}

export function toggleDeleteProjectDialog() {
  return {
    type: TOGGLE_DELETE_PROJECT_DIALOG
  };
}

export function hideDeleteProjectDialog() {
  return {
    type: HIDE_DELETE_PROJECT_DIALOG
  };
}

export function showSidebar() {
  return {
    type: SHOW_SIDEBAR
  };
}

export function hideSidebar() {
  return {
    type: HIDE_SIDEBAR
  };
}
