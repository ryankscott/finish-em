import {
  ADD_CHILD_ITEM,
  CREATE_ITEM,
  DELETE_ITEM,
  UNDELETE_ITEM,
  UPDATE_ITEM,
  UPDATE_ITEM_DESCRIPTION,
  MOVE_ITEM,
  COMPLETE_ITEM,
  UNCOMPLETE_ITEM,
  SET_SCHEDULED_DATE,
  SET_DUE_DATE,
  SET_REPEAT_RULE,
  DELETE_PROJECT,
  SHOW_CHILDREN,
  HIDE_CHILDREN
} from "../actions";
import { RRule } from "rrule";
import { getItemById } from "../utils";
import { ItemType } from "../interfaces";

const initialState: ItemType[] = [
  {
    id: "5eea6e08-a760-4732-83ca-2329cc718fce",
    type: "TODO",
    text: "TODO Learn org-mode",
    projectId: null,
    scheduledDate: null,
    dueDate: null,
    completed: false,
    deleted: false,
    createdAt: new Date(2020, 1, 1),
    completedAt: null,
    lastUpdatedAt: new Date(2020, 1, 1),
    repeat: null,
    parentId: null,
    hidden: false,
    childrenHidden: false,
    children: []
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
    createdAt: new Date(2020, 1, 1),
    completedAt: null,
    lastUpdatedAt: new Date(2020, 1, 1),
    repeat: null,
    parentId: null,
    hidden: false,
    childrenHidden: false,
    children: []
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
    createdAt: new Date(2020, 1, 1),
    completedAt: null,
    lastUpdatedAt: new Date(2020, 1, 1),
    repeat: null,
    parentId: null,
    hidden: false,
    childrenHidden: false,
    children: []
  }
];

export const itemReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_ITEM:
      return [
        ...state,
        {
          id: action.id,
          type: action.itemType,
          text: action.text,
          scheduledDate: null,
          dueDate: action.dueDate,
          projectId: action.projectId,
          completed: false,
          deleted: false,
          completedAt: null,
          createdAt: new Date(),
          lastUpdatedAt: new Date(),
          repeat: null,
          parentId: action.parentId,
          hidden: false,
          childrenHidden: false,
          children: []
        }
      ];

    case DELETE_PROJECT:
      return state.map(i => {
        if (i.projectId == action.id) {
          i.deleted = true;
          i.lastUpdatedAt = new Date();
        }
        return i;
      });

    case DELETE_ITEM:
      return state.map(i => {
        if (i.id == action.id) {
          i.deleted = true;
          i.lastUpdatedAt = new Date();

          // Remove the child from parents
          if (i.parentId != null) {
            const parent = getItemById(i.parentId, state);
            parent.children = parent.children.filter(c => c != action.id);
          }

          // Delete children from parent?
        }
        return i;
      });
    case UNDELETE_ITEM:
      return state.map(i => {
        if (i.id == action.id) {
          i.deleted = false;
          i.lastUpdatedAt = new Date();
        }
        return i;
      });

    case SHOW_CHILDREN:
      return state.map(i => {
        if (i.id == action.id) {
          i.lastUpdatedAt = new Date();
          i.hiddenChildren = false;
          i.children.map(c => {
            const child = getItemById(c, state);
            child.hidden = false;
            child.lastUpdatedAt = new Date();
          });
        }
        return i;
      });

    case HIDE_CHILDREN:
      return state.map(i => {
        if (i.id == action.id) {
          i.lastUpdatedAt = new Date();
          i.hiddenChildren = true;
          i.children.map(c => {
            const child = getItemById(c, state);
            child.hidden = true;
            child.lastUpdatedAt = new Date();
          });
        }
        return i;
      });

    case COMPLETE_ITEM:
      return state.map(i => {
        if (i.id == action.id) {
          if (i.repeat == null) {
            i.completed = true;
            i.completedAt = new Date();
            // We should set the due date if there's a repeat to the next occurrence
          } else {
            const r = RRule.fromString(i.repeat);
            i.dueDate = r.after(new Date());
            i.scheduledDate = null;
          }
          i.lastUpdatedAt = new Date();
        }
        return i;
      });

    // TODO: A Child needs to inheirit properties from the parent
    case ADD_CHILD_ITEM:
      const parent = getItemById(action.parentId, state);
      return state.map(i => {
        if (i.id == action.parentId) {
          i.children =
            i.children == undefined ? [action.id] : [...i.children, action.id];
          i.lastUpdatedAt = new Date();
        } else if (i.id == action.id) {
          i.projectId = parent.projectId;
        }
        return i;
      });

    // TODO: Uncompleting recurring items
    case UNCOMPLETE_ITEM:
      return state.map(i => {
        if (i.id == action.id) {
          i.completed = false;
          i.lastUpdatedAt = new Date();
          i.completedAt = null;
          // If there's a repeating due date, set it to the next occurence (including today)
          if (i.repeat != null) {
            const r = RRule.fromString(i.repeat);
            i.dueDate = r.after(new Date(), true);
          }
        }
        return i;
      });

    case MOVE_ITEM:
      return state.map(i => {
        if (i.id == action.id) {
          i.projectId = action.projectId;
          i.lastUpdatedAt = new Date();
          i.children &&
            i.children.map(c => {
              const child = getItemById(c, state);
              return (child.projectId = action.projectId);
            });
        }
        return i;
      });

    case SET_SCHEDULED_DATE:
      return state.map(i => {
        if (i.id == action.id) {
          i.scheduledDate = action.date;
          i.lastUpdatedAt = new Date();
        }
        return i;
      });

    case SET_DUE_DATE:
      return state.map(i => {
        if (i.id == action.id) {
          i.dueDate = action.date;
          i.lastUpdatedAt = new Date();
        }
        return i;
      });

    case SET_REPEAT_RULE:
      return state.map(i => {
        if (i.id == action.id) {
          i.repeat = action.rule ? action.rule.toString() : action.rule;
          i.lastUpdatedAt = new Date();
          // If we don't have the due date we should set this to the next instance of the repeat after today
          if (i.dueDate == null) {
            i.dueDate = action.rule.after(new Date(), true);
          }
        }
        return i;
      });

    case UPDATE_ITEM:
      return state.map(i => {
        if (i.id == action.id) {
          i.text = action.text;
          i.itemType = action.itemType;
          i.lastUpdatedAt = new Date();
        }
        return i;
      });

    case UPDATE_ITEM_DESCRIPTION:
      return state.map(i => {
        if (i.id == action.id) {
          i.text = action.text;
          i.lastUpdatedAt = new Date();
        }
        return i;
      });

    default:
      return state;
  }
};
