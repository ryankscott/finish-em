import uuidv4 from "uuid/v4";
import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  UPDATE_PROJECT_DESCRIPTION
} from "../actions";

const initialState = [
  {
    id: null,
    name: "Inbox",
    deleted: false,
    description: "Default landing space for all items",
    lastUpdatedAt: new Date(),
    deletedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: uuidv4(),
    name: "Finish Em",
    deleted: false,
    description: "All items relating to this project",
    lastUpdatedAt: new Date(),
    deletedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: uuidv4(),
    name: "Home",
    deleted: false,
    description: "All items for home",
    lastUpdatedAt: new Date(),
    deletedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: uuidv4(),
    name: "Work",
    deleted: false,
    description: "Non descript work items",
    lastUpdatedAt: new Date(),
    deletedAt: new Date(),
    createdAt: new Date()
  }
];

export const projectReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_PROJECT:
      return [
        ...state,
        {
          id: action.id,
          name: action.name,
          description: action.description,
          deleted: false,
          createdAt: new Date(),
          lastUpdatedAt: new Date()
        }
      ];

    case UPDATE_PROJECT_DESCRIPTION:
      return state.map(p => {
        if (p.id == action.id) {
          p.description = action.description;
          p.lastUpdatedAt = new Date();
        }
        return p;
      });

    case DELETE_PROJECT:
      return state.map(p => {
        if (p.id == action.id) {
          p.deleted = true;
          p.lastUpdatedAt = new Date();
          p.deletedAt = new Date();
        }
        return p;
      });

    default:
      return state;
  }
};
