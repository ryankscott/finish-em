import { initialState, itemReducer } from '../reducers/item'
import uuidv4 from 'uuid/v4'
import Mockdate from 'mockdate'
import * as item from '../actions/item'
import RRule from 'rrule'
import { parseISO } from 'date-fns'

// Set the date to a random date

describe('item reducer', () => {
  it('should handle create an item with no projectID', () => {
    Mockdate.set('2020-02-20')
    const id = uuidv4()
    const parentId = uuidv4()
    expect(
      itemReducer([], {
        id: id,
        type: item.CREATE_ITEM,
        itemType: 'TODO',
        text: 'TODO Run the tests',
      }),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        children: [],
      },
    ])
    Mockdate.reset()
  })

  it('should handle create an item with projectID', () => {
    Mockdate.set('2020-02-20')
    const id = uuidv4()
    const projectId = uuidv4()
    expect(
      itemReducer([], {
        id: id,
        type: item.CREATE_ITEM,
        itemType: 'TODO',
        text: 'TODO Run the tests',
        projectId: projectId,
      }),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: null,
        dueDate: null,
        projectId: projectId,
        parentId: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        children: [],
      },
    ])
    Mockdate.reset()
  })

  it('should handle mark an item as deleted', () => {
    Mockdate.set('2020-02-20')
    const id = uuidv4()
    const createdAt = new Date(1990, 1, 1).toISOString()
    const lastUpdatedAt = new Date(1990, 1, 2).toISOString()

    expect(
      itemReducer(
        [
          {
            id: id,
            type: 'TODO',
            text: 'TODO Run the tests',
            scheduledDate: null,
            dueDate: null,
            completed: false,
            deleted: true,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: null,
            children: [],
          },
        ],
        {
          id: id,
          type: item.DELETE_ITEM,
        },
      ),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: true,
        deletedAt: new Date().toISOString(),
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        children: [],
      },
    ])
    Mockdate.reset()
  })

  it('should remove the parentId from all children and all children from the parent, when the parent is deleted', () => {
    Mockdate.set('2020-02-20')
    const id = uuidv4()
    const childId1 = uuidv4()
    const childId2 = uuidv4()
    const createdAt = new Date(1990, 1, 1).toISOString()
    const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
    expect(
      itemReducer(
        [
          {
            id: id,
            type: 'TODO',
            text: 'TODO Run the tests',
            scheduledDate: null,
            dueDate: null,
            completed: false,
            deleted: false,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: null,
            children: [childId1, childId2],
          },
          {
            id: childId1,
            type: 'TODO',
            text: 'TODO Eat dinner',
            scheduledDate: null,
            dueDate: null,
            completed: false,
            deleted: false,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: id,
            children: [],
          },
          {
            id: childId2,
            type: 'TODO',
            text: 'TODO Eat dessert',
            scheduledDate: null,
            dueDate: null,
            completed: false,
            deleted: false,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: id,
            children: [],
          },
        ],
        {
          id: id,
          type: item.DELETE_ITEM,
        },
      ),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: true,
        deletedAt: new Date().toISOString(),
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        children: [],
      },
      {
        id: childId1,
        type: 'TODO',
        text: 'TODO Eat dinner',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        children: [],
      },
      {
        id: childId2,
        type: 'TODO',
        text: 'TODO Eat dessert',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        children: [],
      },
    ])
    Mockdate.reset()
  })

  it('should remove the parentId from the child and the childId from the parent, when the child is deleted', () => {
    Mockdate.set('2020-02-20')
    const id = uuidv4()
    const childId1 = uuidv4()
    const childId2 = uuidv4()
    const createdAt = new Date(1990, 1, 1).toISOString()
    const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
    expect(
      itemReducer(
        [
          {
            id: id,
            type: 'TODO',
            text: 'TODO Run the tests',
            scheduledDate: null,
            dueDate: null,
            completed: false,
            deleted: false,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: null,
            children: [childId1, childId2],
          },
          {
            id: childId1,
            type: 'TODO',
            text: 'TODO Eat dinner',
            scheduledDate: null,
            dueDate: null,
            completed: false,
            deleted: false,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: id,
            children: [],
          },
          {
            id: childId2,
            type: 'TODO',
            text: 'TODO Eat dessert',
            scheduledDate: null,
            dueDate: null,
            completed: false,
            deleted: false,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: id,
            children: [],
          },
        ],
        {
          id: childId1,
          type: item.DELETE_ITEM,
        },
      ),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        children: [childId2],
      },
      {
        id: childId1,
        type: 'TODO',
        text: 'TODO Eat dinner',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: true,
        deletedAt: new Date().toISOString(),
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        children: [],
      },
      {
        id: childId2,
        type: 'TODO',
        text: 'TODO Eat dessert',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: lastUpdatedAt,
        repeat: null,
        parentId: id,
        children: [],
      },
    ])
    Mockdate.reset()
  })

  it('should handle undeleting an item', () => {
    Mockdate.set('2020-02-20')
    const id = uuidv4()
    const createdAt = new Date(1990, 1, 1).toISOString()
    const deletedAt = new Date(1990, 1, 1).toISOString()
    const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
    expect(
      itemReducer(
        [
          {
            id: id,
            type: 'TODO',
            text: 'TODO Run the tests',
            scheduledDate: null,
            dueDate: null,
            completed: false,
            deleted: true,
            deletedAt: deletedAt,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: null,
            children: [],
          },
        ],
        {
          id: id,
          type: item.UNDELETE_ITEM,
        },
      ),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        children: [],
      },
    ])
    Mockdate.reset()
  })

  it('should handle the completing of an item without a repeat', () => {
    Mockdate.set('2020-02-20')
    const id = uuidv4()
    const createdAt = new Date(1990, 1, 1).toISOString()
    const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
    const scheduledDate = new Date(1990, 1, 3).toISOString()
    expect(
      itemReducer(
        [
          {
            id: id,
            type: 'TODO',
            text: 'TODO Run the tests',
            scheduledDate: scheduledDate,
            dueDate: null,
            completed: false,
            deleted: false,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: null,
            children: [],
          },
        ],
        {
          id: id,
          type: item.COMPLETE_ITEM,
        },
      ),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: null,
        dueDate: null,
        completed: true,
        deleted: false,
        deletedAt: null,
        completedAt: new Date().toISOString(),
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        children: [],
      },
    ])
    Mockdate.reset()
  })

  // TODO: Remove hack of adding 1 hour to expected time (probably due to being in GMT +1)
  it('should set the due date of a repeating item to the next occurence of the repeat when completing', () => {
    Mockdate.set('1990-02-03')
    const id = uuidv4()
    const createdAt = new Date(1990, 1, 1).toISOString()
    const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
    const scheduledDate = new Date(1990, 1, 3).toISOString()
    const dueDate = new Date(1990, 1, 3).toISOString()
    const repeat = new RRule({
      freq: RRule.DAILY,
      interval: 1,
    }).toString()
    expect(
      itemReducer(
        [
          {
            id: id,
            type: 'TODO',
            text: 'TODO Run the tests',
            scheduledDate: scheduledDate,
            dueDate: dueDate,
            completed: false,
            deleted: false,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: repeat,
            parentId: null,
            children: [],
          },
        ],
        {
          id: id,
          type: item.COMPLETE_ITEM,
        },
      ),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: null,
        dueDate: new Date(1990, 1, 4, 1).toISOString(),
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: repeat,
        parentId: null,
        children: [],
      },
    ])
    Mockdate.reset()
  })

  it('should handle the uncompleting of an item without a repeat, and persist the scheduled date and due date', () => {
    Mockdate.set('1990-02-03')
    const id = uuidv4()
    const createdAt = new Date(1990, 1, 1).toISOString()
    const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
    const scheduledDate = new Date(1990, 1, 3).toISOString()
    const dueDate = new Date(1990, 1, 3).toISOString()
    const completedAt = new Date(1990, 1, 3).toISOString()
    expect(
      itemReducer(
        [
          {
            id: id,
            type: 'TODO',
            text: 'TODO Run the tests',
            scheduledDate: scheduledDate,
            dueDate: dueDate,
            completed: true,
            deleted: false,
            deletedAt: null,
            completedAt: completedAt,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: null,
            children: [],
          },
        ],
        {
          id: id,
          type: item.UNCOMPLETE_ITEM,
        },
      ),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: scheduledDate,
        dueDate: dueDate,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        children: [],
      },
    ])
    Mockdate.reset()
  })

  it('should handle the uncompleting of an item with a repeat', () => {
    Mockdate.set('1990-02-03')
    const id = uuidv4()
    const createdAt = new Date(1990, 1, 1).toISOString()
    const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
    const scheduledDate = new Date(1990, 1, 3).toISOString()
    const dueDate = new Date(1990, 1, 3).toISOString()
    const completedAt = new Date(1990, 1, 3).toISOString()
    const repeat = new RRule({
      freq: RRule.DAILY,
      interval: 1,
    }).toString()
    expect(
      itemReducer(
        [
          {
            id: id,
            type: 'TODO',
            text: 'TODO Run the tests',
            scheduledDate: scheduledDate,
            dueDate: dueDate,
            completed: true,
            deleted: false,
            deletedAt: null,
            completedAt: completedAt,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: repeat,
            parentId: null,
            children: [],
          },
        ],
        {
          id: id,
          type: item.UNCOMPLETE_ITEM,
        },
      ),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: scheduledDate,
        dueDate: dueDate,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: repeat,
        parentId: null,
        children: [],
      },
    ])
    Mockdate.reset()
  })

  it('should handle adding a child to an item', () => {
    Mockdate.set('2020-02-20')
    const id = uuidv4()
    const childId = uuidv4()
    const projectId = uuidv4()
    const createdAt = new Date(1990, 1, 1).toISOString()
    const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
    expect(
      itemReducer(
        [
          {
            id: id,
            type: 'TODO',
            text: 'TODO Run the tests',
            scheduledDate: null,
            dueDate: null,
            completed: false,
            deleted: false,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: null,
            projectId: projectId,
            children: [],
          },
          {
            id: childId,
            type: 'TODO',
            text: 'TODO Eat dinner',
            scheduledDate: null,
            dueDate: null,
            completed: false,
            deleted: false,
            deletedAt: null,
            completedAt: null,
            createdAt: createdAt,
            lastUpdatedAt: lastUpdatedAt,
            repeat: null,
            parentId: null,
            projectId: null,
            children: [],
          },
        ],
        {
          id: childId,
          type: item.ADD_CHILD_ITEM,
          parentId: id,
        },
      ),
    ).toEqual([
      {
        id: id,
        type: 'TODO',
        text: 'TODO Run the tests',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: null,
        projectId: projectId,
        children: [childId],
      },
      {
        id: childId,
        type: 'TODO',
        text: 'TODO Eat dinner',
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        completedAt: null,
        createdAt: createdAt,
        lastUpdatedAt: new Date().toISOString(),
        repeat: null,
        parentId: id,
        projectId: projectId,
        children: [],
      },
    ])
    Mockdate.reset()
  })
})

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
