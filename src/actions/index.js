// Actions
export const CREATE_ITEM = "CREATE_ITEM";
export const DELETE_ITEM = "DELETE_ITEM";
export const REFILE_ITEM = "REFILE_ITEM";
export const CREATE_PROJECT = "CREATE_PROJECT";
import { getItemTypeFromString, getItemTextFromString } from "../utils";

// Action creators
export function createItem(text) {
  // TODO: Turn this into a proper parsing
  const itemType = getItemTypeFromString(text);
  const itemText = getItemTextFromString(text);

  return {
    type: CREATE_ITEM,
    text: itemText,
    itemType: itemType
  };
}

export function deleteItem(id) {
  return {
    type: DELETE_ITEM,
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

export function createProject(name, description) {
  return {
    type: CREATE_PROJECT,
    name: name,
    description: description
  };
}
