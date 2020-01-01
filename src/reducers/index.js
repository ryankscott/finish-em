import uuidv4 from "uuid/v4";
import { CREATE_ITEM } from "../actions";
import { merge } from "lodash";

const initialState = {
  projects: {
    0: {
      id: 0,
      name: "Inbox",
      description: "Where all items are first stored"
    }
  },
  items: {
    "5eea6e08-a760-4732-83ca-2329cc718fce": {
      id: "5eea6e08-a760-4732-83ca-2329cc718fce",
      type: "TODO",
      text: "Learn org-mode",
      project: 0,
      scheduledDate: null,
      dueDate: null
    },
    "f2c91c07-e2bf-4a61-ad83-59261031775f": {
      id: "f2c91c07-e2bf-4a61-ad83-59261031775f",
      type: "NOTE",
      text: "Write better code",
      project: 0,
      scheduledDate: null,
      dueDate: null
    }
  }
};

const itemApp = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_ITEM:
      const uuid = uuidv4();
      return {
        ...state,
        items: merge({}, state.items, {
          [uuid]: {
            id: uuid,
            type: action.itemType,
            text: action.text,
            scheuledDate: null,
            dueDate: null,
            project: 0
          }
        })
      };

    default:
      return state;
  }
};

export default itemApp;
