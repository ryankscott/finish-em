import uuidv4 from "uuid/v4";
import {
  CREATE_ITEM,
  DELETE_ITEM,
  REFILE_ITEM,
  CREATE_PROJECT
} from "../actions";

const initialState = {
  projects: [
    {
      id: null,
      name: "Inbox",
      description: "Default landing space for all items"
    },
    {
      id: uuidv4(),
      name: "Finish Em",
      description: "All items relating to this project"
    }
  ],
  items: [
    {
      id: "5eea6e08-a760-4732-83ca-2329cc718fce",
      type: "TODO",
      text: "Learn org-mode",
      projectId: null,
      scheduledDate: "2020-01-02",
      dueDate: null
    },
    {
      id: "f2c91c07-e2bf-4a61-ad83-59261031775f",
      type: "NOTE",
      text: "Write better code",
      projectId: null,
      scheduledDate: null,
      dueDate: null
    }
  ]
};

const itemApp = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_ITEM:
      const itemUUID = uuidv4();
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: itemUUID,
            type: action.itemType,
            text: action.text,
            scheduledDate: null,
            dueDate: null,
            projectId: null
          }
        ]
      };

    case DELETE_ITEM:
      return {
        ...state,
        // Trying to remove a key from object without mutating
        items: state.items.filter(i => i.id != action.id)
      };

    case REFILE_ITEM:
      return {
        ...state,
        items: state.items.map(i => {
          if (i.id == action.id) {
            i.projectId = action.projectId;
          }
          return i;
        })
      };
    case CREATE_PROJECT:
      const projectUUID = uuidv4();
      return {
        ...state,
        projects: [
          ...state.projects,
          {
            id: projectUUID,
            name: action.name,
            description: action.description
          }
        ]
      };

    default:
      return state;
  }
};

export default itemApp;
