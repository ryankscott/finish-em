export const CREATE_ITEM = "CREATE_ITEM";
export const DELETE_ITEM = "DELETE_ITEM";
export const UNDELETE_ITEM = "UNDELETE_ITEM";
export const UPDATE_ITEM = "UPDATE_ITEM";
export const UPDATE_ITEM_DESCRIPTION = "UPDATE_ITEM_DESCRIPTION";
export const MOVE_ITEM = "MOVE_ITEM";
export const COMPLETE_ITEM = "COMPLETE_ITEM";
export const UNCOMPLETE_ITEM = "UNCOMPLETE_ITEM";
export const SET_SCHEDULED_DATE = "SET_SCHEDULED_DATE";
export const SET_DUE_DATE = "SET_DUE_DATE";
export const SET_REPEAT_RULE = "SET_REPEAT_RULE";
export const SET_PARENT = "SET_PARENT";
export const REMOVE_PARENT = "REMOVE_PARENT";

import {
  getItemTypeFromString,
  capitaliseItemTypeFromString,
  extractDateFromString,
  removeDateFromString
} from "../utils";

export function createItem(text, projectId) {
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

export function moveItem(id, projectId) {
  return {
    type: MOVE_ITEM,
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
export function setRepeatRule(id, rule) {
  return {
    type: SET_REPEAT_RULE,
    id: id,
    rule: rule
  };
}

export function setParent(id, parentId) {
  return {
    type: SET_PARENT,
    id: id,
    parentId: parentId
  };
}
export function removeParent(id, parentId) {
  return {
    type: REMOVE_PARENT,
    id: id,
    parentId: parentId
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
