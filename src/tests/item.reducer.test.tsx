import { initialState, itemReducer } from "../reducers/item";
import uuidv4 from "uuid/v4";
import Mockdate from "mockdate";
import * as item from "../actions/item";

// Set the date to a random date

describe("item reducer", () => {
  it("should handle CREATE_ITEM with no projectID but a parentID", () => {
    Mockdate.set("2020-02-20");
    const id = uuidv4();
    const parentId = uuidv4();
    expect(
      itemReducer([], {
        id: id,
        type: item.CREATE_ITEM,
        itemType: "TODO",
        text: "TODO Run the tests",
        parentId: parentId
      })
    ).toEqual([
      {
        id: id,
        type: "TODO",
        text: "TODO Run the tests",
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: parentId,
        hidden: false,
        hiddenChildren: false,
        children: []
      }
    ]);
    Mockdate.reset();
  }),
    it("should handle CREATE_ITEM with projectID and but no parentID", () => {
      Mockdate.set("2020-02-20");
      const id = uuidv4();
      const projectId = uuidv4();
      expect(
        itemReducer([], {
          id: id,
          type: item.CREATE_ITEM,
          itemType: "TODO",
          text: "TODO Run the tests",
          projectId: projectId
        })
      ).toEqual([
        {
          id: id,
          type: "TODO",
          text: "TODO Run the tests",
          scheduledDate: null,
          dueDate: null,
          projectId: projectId,
          completed: false,
          deleted: false,
          deletedAt: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          repeat: null,
          hidden: false,
          hiddenChildren: false,
          children: []
        }
      ]);
      Mockdate.reset();
    }),
    it("should handle CREATE_ITEM with projectID and parentID", () => {
      Mockdate.set("2020-02-20");
      const id = uuidv4();
      const projectId = uuidv4();
      const parentId = uuidv4();
      expect(
        itemReducer([], {
          id: id,
          type: item.CREATE_ITEM,
          itemType: "TODO",
          text: "TODO Run the tests",
          projectId: projectId,
          parentId: parentId
        })
      ).toEqual([
        {
          id: id,
          type: "TODO",
          text: "TODO Run the tests",
          scheduledDate: null,
          dueDate: null,
          projectId: projectId,
          completed: false,
          deleted: false,
          deletedAt: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          repeat: null,
          parentId: parentId,
          hidden: false,
          hiddenChildren: false,
          children: []
        }
      ]);
      Mockdate.reset();
    });
});

/*
    expect(
      reducer(
        [
          {
            text: "Use Redux",
            completed: false,
            id: 0
          }
        ],
        {
          type: types.ADD_TODO,
          text: "Run the tests"
        }
      )
    ).toEqual([
      {
        text: "Run the tests",
        completed: false,
        id: 1
      },
      {
        text: "Use Redux",
        completed: false,
        id: 0
      }
    ]);
  });
});
*/
