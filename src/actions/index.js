// Actions
export const CREATE_ITEM = "CREATE_ITEM";
export const ARCHIVE_ITEM = "ARCHIVE_ITEM";
export const DELETE_ITEM = "DELETE_ITEM";
export const UPDATE_ITEM = "UPDATE_ITEM";
export const REFILE_ITEM = "REFILE_ITEM";
export const COMPLETE_ITEM = "COMPLETE_ITEM";
export const UNCOMPLETE_ITEM = "UNCOMPLETE_ITEM";
export const SET_SCHEDULED_DATE = "SET_SCHEDULED_DATE";
export const SET_DUE_DATE = "SET_DUE_DATE";
export const CREATE_PROJECT = "CREATE_PROJECT";
import {
  getItemTypeFromString,
  capitaliseItemTypeFromString,
  extractDateFromString,
  removeDateFromString
} from "../utils";

// Action creators
export function createItem(text) {
  // TODO: Turn this into a proper parsing
  const itemType = getItemTypeFromString(text);
  // TODO: This is kinda weird I pull the date out as a date and then change it to text
  const dueDate = extractDateFromString(text);
  let newText = removeDateFromString(text);
  newText = capitaliseItemTypeFromString(newText);

  return {
    type: CREATE_ITEM,
    text: newText,
    itemType: itemType,
    dueDate: dueDate
  };
}

export function deleteItem(id) {
  return {
    type: DELETE_ITEM,
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

export function createProject(name, description) {
  return {
    type: CREATE_PROJECT,
    name: name,
    description: description
  };
}
