import { combineReducers } from "redux";
import uuidv4 from "uuid/v4";
import {
  CREATE_ITEM,
  ARCHIVE_ITEM,
  DELETE_ITEM,
  REFILE_ITEM,
  UNCOMPLETE_ITEM,
  COMPLETE_ITEM,
  UPDATE_ITEM,
  SET_SCHEDULED_DATE,
  SET_DUE_DATE,
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
    },
    {
      id: uuidv4(),
      name: "Home",
      description: "All items for home"
    },
    {
      id: uuidv4(),
      name: "Work",
      description: "Non descript work items"
    }
  ],
  items: [
    {
      id: "5eea6e08-a760-4732-83ca-2329cc718fce",
      type: "TODO",
      text: "TODO Learn org-mode",
      projectId: null,
      scheduledDate: null,
      dueDate: null,
      completed: false,
      deleted: false,
      archived: false,
      createdAt: new Date(2020, 1, 1),
      completedAt: null,
      lastUpdatedAt: new Date(2020, 1, 1)
    },
    {
      id: "f2c91c07-e2bf-4a61-ad83-59261031775f",
      type: "TODO",
      text: "TODO Write better code",
      projectId: null,
      scheduledDate: new Date(2020, 3, 2),
      dueDate: null,
      completed: false,
      deleted: false,
      archived: false,
      createdAt: new Date(2020, 1, 1),
      completedAt: null,
      lastUpdatedAt: new Date(2020, 1, 1)
    },
    {
      id: "f2b91c07-e2bf-4a61-ad83-59261031775f",
      type: "NOTE",
      text: "NOTE Carrot in German is mohren",
      projectId: null,
      scheduledDate: null,
      dueDate: null,
      completed: false,
      deleted: false,
      archived: false,
      createdAt: new Date(2020, 1, 1),
      completedAt: null,
      lastUpdatedAt: new Date(2020, 1, 1)
    }
  ]
};

const rootReducer = (state = initialState, action) => {
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
            dueDate: action.dueDate,
            projectId: null,
            completed: false,
            deleted: false,
            archived: false,
            completedAt: null,
            createdAt: new Date(),
            lastUpdatedAt: new Date()
          }
        ]
      };

    case DELETE_ITEM:
      return {
        ...state,
        items: state.items.map(i => {
          if (i.id == action.id) {
            i.deleted = true;
            i.lastUpdatedAt = new Date();
          }
          return i;
        })
      };

    case ARCHIVE_ITEM:
      return {
        ...state,
        items: state.items.map(i => {
          if (i.id == action.id) {
            i.archived = true;
            i.lastUpdatedAt = new Date();
          }
          return i;
        })
      };

    case COMPLETE_ITEM:
      return {
        ...state,
        items: state.items.map(i => {
          if (i.id == action.id) {
            i.completed = true;
            i.lastUpdatedAt = new Date();
            i.completedAt = new Date();
          }
          return i;
        })
      };
    case UNCOMPLETE_ITEM:
      return {
        ...state,
        items: state.items.map(i => {
          if (i.id == action.id) {
            i.completed = false;
            i.lastUpdatedAt = new Date();
            i.completedAt = null;
          }
          return i;
        })
      };

    case REFILE_ITEM:
      return {
        ...state,
        items: state.items.map(i => {
          if (i.id == action.id) {
            i.projectId = action.projectId;
            i.lastUpdatedAt = new Date();
          }
          return i;
        })
      };
    case SET_SCHEDULED_DATE:
      return {
        ...state,
        items: state.items.map(i => {
          if (i.id == action.id) {
            i.scheduledDate = action.date;
            i.lastUpdatedAt = new Date();
          }
          return i;
        })
      };
    case SET_DUE_DATE:
      return {
        ...state,
        items: state.items.map(i => {
          if (i.id == action.id) {
            i.dueDate = action.date;
            i.lastUpdatedAt = new Date();
          }
          return i;
        })
      };
    case UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map(i => {
          if (i.id == action.id) {
            i.text = action.text;
            i.itemType = action.itemType;
            i.lastUpdatedAt = new Date();
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

export default rootReducer;
