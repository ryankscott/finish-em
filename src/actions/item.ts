import { Uuid } from "@typed/uuid";

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
export const ADD_CHILD_ITEM = "ADD_CHILD_ITEM";
export const HIDE_CHILDREN = "HIDE_CHILDREN";
export const SHOW_CHILDREN = "SHOW_CHILDREN";

import {
  getItemTypeFromString,
  capitaliseItemTypeFromString,
  extractDateFromString,
  removeDateFromString
} from "../utils";

export function createItem(
  id: Uuid,
  text: string,
  projectId: Uuid,
  parentId: Uuid
) {
  // TODO: Turn this into a proper parsing
  const itemType = getItemTypeFromString(text);
  // TODO: This is kinda weird I pull the date out as a date and then change it to text
  const dueDate = extractDateFromString(text);
  let newText = removeDateFromString(text);
  newText = capitaliseItemTypeFromString(newText);

  return {
    type: CREATE_ITEM,
    id: id,
    text: newText,
    itemType: itemType,
    dueDate: dueDate,
    projectId: projectId,
    parentId: parentId
  };
}

export function deleteItem(id: Uuid) {
  return {
    type: DELETE_ITEM,
    id: id
  };
}
export function undeleteItem(id: Uuid) {
  return {
    type: UNDELETE_ITEM,
    id: id
  };
}

export function completeItem(id: Uuid) {
  return {
    type: COMPLETE_ITEM,
    id: id
  };
}
export function uncompleteItem(id: Uuid) {
  return {
    type: UNCOMPLETE_ITEM,
    id: id
  };
}

export function moveItem(id: Uuid, projectId: Uuid) {
  return {
    type: MOVE_ITEM,
    id: id,
    projectId: projectId
  };
}

export function setScheduledDate(id: Uuid, date: Date) {
  return {
    type: SET_SCHEDULED_DATE,
    id: id,
    date: date
  };
}
export function setDueDate(id: Uuid, date: Date) {
  return {
    type: SET_DUE_DATE,
    id: id,
    date: date
  };
}
export function setRepeatRule(id: Uuid, rule: Date) {
  return {
    type: SET_REPEAT_RULE,
    id: id,
    rule: rule
  };
}

export function updateItemDescription(id: Uuid, text: string) {
  return {
    type: UPDATE_ITEM_DESCRIPTION,
    id: id,
    text: text
  };
}
export function addChildItem(id: Uuid, parentId: Uuid) {
  return {
    type: ADD_CHILD_ITEM,
    id: id,
    parentId: parentId
  };
}
export function showChildren(id: Uuid) {
  return {
    type: SHOW_CHILDREN,
    id: id
  };
}

export function hideChildren(id: Uuid) {
  return {
    type: HIDE_CHILDREN,
    id: id
  };
}

export function updateItem(id: Uuid, text: string) {
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
