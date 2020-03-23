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
import RRule from "rrule";

interface CreateItemAction {
  type: typeof CREATE_ITEM;
  id: Uuid;
  itemType: "TODO" | "NOTE";
  text: string;
  projectId: Uuid;
  parentId: Uuid;
  dueDate: Date;
}

export function createItem(
  id: Uuid,
  text: string,
  projectId: Uuid,
  parentId: Uuid
): CreateItemAction {
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
interface DeleteItemAction {
  type: typeof DELETE_ITEM;
  id: Uuid;
}
export function deleteItem(id: Uuid): DeleteItemAction {
  return {
    type: DELETE_ITEM,
    id: id
  };
}

interface UndeleteItemAction {
  type: typeof UNDELETE_ITEM;
  id: Uuid;
}
export function undeleteItem(id: Uuid): UndeleteItemAction {
  return {
    type: UNDELETE_ITEM,
    id: id
  };
}
interface CompleteItemAction {
  type: typeof COMPLETE_ITEM;
  id: Uuid;
}
export function completeItem(id: Uuid): CompleteItemAction {
  return {
    type: COMPLETE_ITEM,
    id: id
  };
}

interface UncompleteItemAction {
  type: typeof UNCOMPLETE_ITEM;
  id: Uuid;
}
export function uncompleteItem(id: Uuid): UncompleteItemAction {
  return {
    type: UNCOMPLETE_ITEM,
    id: id
  };
}

interface MoveItemAction {
  type: typeof MOVE_ITEM;
  id: Uuid;
  projectId: Uuid;
}
export function moveItem(id: Uuid, projectId: Uuid): MoveItemAction {
  return {
    type: MOVE_ITEM,
    id: id,
    projectId: projectId
  };
}

interface SetScheduledDateAction {
  type: typeof SET_SCHEDULED_DATE;
  id: Uuid;
  date: Date;
}
export function setScheduledDate(id: Uuid, date: Date): SetScheduledDateAction {
  return {
    type: SET_SCHEDULED_DATE,
    id: id,
    date: date
  };
}

interface SetDueDateAction {
  type: typeof SET_DUE_DATE;
  id: Uuid;
  date: Date;
}
export function setDueDate(id: Uuid, date: Date): SetDueDateAction {
  return {
    type: SET_DUE_DATE,
    id: id,
    date: date
  };
}

interface SetRepeatRuleAction {
  type: typeof SET_REPEAT_RULE;
  id: Uuid;
  rule: RRule;
}
export function setRepeatRule(id: Uuid, rule: RRule): SetRepeatRuleAction {
  return {
    type: SET_REPEAT_RULE,
    id: id,
    rule: rule
  };
}
interface UpdateItemDescriptionAction {
  type: typeof UPDATE_ITEM_DESCRIPTION;
  id: Uuid;
  text: string;
}
export function updateItemDescription(
  id: Uuid,
  text: string
): UpdateItemDescriptionAction {
  return {
    type: UPDATE_ITEM_DESCRIPTION,
    id: id,
    text: text
  };
}

interface AddChildItemAction {
  type: typeof ADD_CHILD_ITEM;
  id: Uuid;
  parentId: Uuid;
}
export function addChildItem(id: Uuid, parentId: Uuid): AddChildItemAction {
  return {
    type: ADD_CHILD_ITEM,
    id: id,
    parentId: parentId
  };
}

interface ShowChildrenAction {
  type: typeof SHOW_CHILDREN;
  id: Uuid;
}
export function showChildren(id: Uuid): ShowChildrenAction {
  return {
    type: SHOW_CHILDREN,
    id: id
  };
}

interface HideChildrenAction {
  type: typeof HIDE_CHILDREN;
  id: Uuid;
}
export function hideChildren(id: Uuid): HideChildrenAction {
  return {
    type: HIDE_CHILDREN,
    id: id
  };
}
