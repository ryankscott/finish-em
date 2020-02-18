// Actions
export const CREATE_ITEM = "CREATE_ITEM";
export const ARCHIVE_ITEM = "ARCHIVE_ITEM";
export const DELETE_ITEM = "DELETE_ITEM";
export const UNDELETE_ITEM = "UNDELETE_ITEM";
export const UPDATE_ITEM = "UPDATE_ITEM";
export const UPDATE_ITEM_DESCRIPTION = "UPDATE_ITEM_DESCRIPTION";
export const REFILE_ITEM = "REFILE_ITEM";
export const COMPLETE_ITEM = "COMPLETE_ITEM";
export const UNCOMPLETE_ITEM = "UNCOMPLETE_ITEM";
export const SET_SCHEDULED_DATE = "SET_SCHEDULED_DATE";
export const SET_DUE_DATE = "SET_DUE_DATE";
export const CREATE_PROJECT = "CREATE_PROJECT";
export const DELETE_PROJECT = "DELETE_PROJECT";
export const UPDATE_PROJECT_DESCRIPTION = "UPDATE_PROJECT_DESCRIPTION";
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
import {
  getItemTypeFromString,
  capitaliseItemTypeFromString,
  extractDateFromString,
  removeDateFromString
} from "../utils";

// Action creators
export function createItem(text, projectId) {
  // TODO: Turn this into a proper parsing
  const itemType = getItemTypeFromString(text);
  // TODO: This is kinda weird I pull the date out as a date and then change it to text
  const dueDate = extractDateFromString(text);
  let newText = removeDateFromString(text);
  newText = capitaliseItemTypeFromString(newText);
  console.log("creating item");
  console.log(newText);

  return {
    type: CREATE_ITEM,
    text: newText,
    itemType: itemType,
    dueDate: dueDate,
    projectId: projectId
  };
}

export function deleteItem(id) {
  return {
    type: DELETE_ITEM,
    id: id
  };
}
export function undeleteItem(id) {
  return {
    type: UNDELETE_ITEM,
    id: id
  };
}
export function archiveItem(id) {
  return {
    type: ARCHIVE_ITEM,
    id: id
  };
}

export function completeItem(id) {
  return {
    type: COMPLETE_ITEM,
    id: id
  };
}
export function uncompleteItem(id) {
  return {
    type: UNCOMPLETE_ITEM,
    id: id
  };
}

export function refileItem(id, projectId) {
  return {
    type: REFILE_ITEM,
    id: id,
    projectId: projectId
  };
}

export function setScheduledDate(id, date) {
  return {
    type: SET_SCHEDULED_DATE,
    id: id,
    date: date
  };
}
export function setDueDate(id, date) {
  return {
    type: SET_DUE_DATE,
    id: id,
    date: date
  };
}

export function updateItemDescription(id, text) {
  return {
    type: UPDATE_ITEM_DESCRIPTION,
    id: id,
    text: text
  };
}

export function updateItem(id, text) {
  const itemType = getItemTypeFromString(text);
  const dueDate = extractDateFromString(text);
  let newText = removeDateFromString(text);
  newText = capitaliseItemTypeFromString(newText);

  return {
    type: UPDATE_ITEM,
    id: id,
    text: newText,
    itemType: itemType,
    dueDate: dueDate
  };
}

export function createProject(id, name, description) {
  return {
    type: CREATE_PROJECT,
    id: id,
    name: name,
    description: description
  };
}
export function deleteProject(id) {
  return {
    type: DELETE_PROJECT,
    id: id
  };
}

export function updateProjectDescription(id, description) {
  return {
    type: UPDATE_PROJECT_DESCRIPTION,
    id: id,
    description: description
  };
}

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
