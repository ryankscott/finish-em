// Actions
export const CREATE_ITEM = "CREATE_ITEM";
export const DELETE_ITEM = "DELETE_ITEM";
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
