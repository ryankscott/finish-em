import uuidv4 from "uuid/v4";
import { CREATE_ITEM, DELETE_ITEM, SET_VISIBILITY_FILTER } from "../actions";

const initialState = {
  projects: {
    0: {
      id: 0,
      name: "Inbox",
      description: "Where all items are first stored"
    }
  },
  items: [
    {
      id: "5eea6e08-a760-4732-83ca-2329cc718fce",
      type: "TODO",
      text: "Learn org-mode",
      project: 0,
      scheduledDate: "2020-01-02",
      dueDate: null
    },
    {
      id: "f2c91c07-e2bf-4a61-ad83-59261031775f",
      type: "NOTE",
      text: "Write better code",
      project: 0,
      scheduledDate: null,
      dueDate: null
    }
  ],
  visibilityFilter: "SHOW_SCHEDULED"
};

const itemApp = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_ITEM:
      const uuid = uuidv4();
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: uuid,
            type: action.itemType,
            text: action.text,
            scheduledDate: null,
            dueDate: null,
            project: 0
          }
        ]
      };

    case DELETE_ITEM:
      return {
        ...state,
        // Trying to remove a key from object without mutating
        items: state.items.filter(i => i.id != action.id)
      };

    case SET_VISIBILITY_FILTER:
      return {
        ...state,
        visibilityFilter: action.filter
      };

    default:
      return state;
  }
};

export default itemApp;
