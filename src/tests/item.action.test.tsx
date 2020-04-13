import * as item from '../actions/item'
import uuidv4 from 'uuid'
import RRule from 'rrule'

describe('ItemActions', () => {
  it('should create an action to delete an item', () => {
    const id = uuidv4()
    const expectedAction: item.DeleteItemAction = {
      type: item.DELETE_ITEM,
      id: id,
    }
    expect(item.deleteItem(id)).toEqual(expectedAction)
  })

  it('should create an action to undelete an item', () => {
    const id = uuidv4()
    const expectedAction: item.UndeleteItemAction = {
      type: item.UNDELETE_ITEM,
      id: id,
    }
    expect(item.undeleteItem(id)).toEqual(expectedAction)
  })

  it("should create an action update an item's decription", () => {
    const id = uuidv4()
    const text = 'add tests'
    const expectedAction: item.UpdateItemDescriptionAction = {
      type: item.UPDATE_ITEM_DESCRIPTION,
      id: id,
      text: text,
    }
    expect(item.updateItemDescription(id, text)).toEqual(expectedAction)
  })

  it('should create an action to create a TODO item when prefixed with TODO', () => {
    const id = uuidv4()
    const text = 'TODO add tests'
    const projectId = uuidv4()
    const expectedAction: item.CreateItemAction = {
      type: item.CREATE_ITEM,
      id: id,
      text: text,
      itemType: 'TODO',
      projectId: projectId,
    }
    expect(item.createItem(id, text, projectId)).toEqual(expectedAction)
  })

  it('should create an action to create a NOTE item when prefixed with NOTE', () => {
    const id = uuidv4()
    const text = 'NOTE add tests'
    const projectId = uuidv4()
    const parentId = uuidv4()
    const expectedAction: item.CreateItemAction = {
      type: item.CREATE_ITEM,
      id: id,
      text: text,
      itemType: 'NOTE',
      projectId: projectId,
    }
    expect(item.createItem(id, text, projectId)).toEqual(expectedAction)
  })

  it("should create an action to create a TODO item if the prefix isn't NOTE or TODO", () => {
    const id = uuidv4()
    const text = 'CAT add tests'
    const projectId = uuidv4()
    const parentId = uuidv4()
    const expectedAction: item.CreateItemAction = {
      type: item.CREATE_ITEM,
      id: id,
      text: text,
      itemType: 'TODO',
      projectId: projectId,
    }
    expect(item.createItem(id, text, projectId)).toEqual(expectedAction)
  })

  it('should create an action to complete an item', () => {
    const id = uuidv4()
    const expectedAction: item.CompleteItemAction = {
      type: item.COMPLETE_ITEM,
      id: id,
    }
    expect(item.completeItem(id)).toEqual(expectedAction)
  })
  it('should create an action to uncomplete an item', () => {
    const id = uuidv4()
    const expectedAction: item.UncompleteItemAction = {
      type: item.UNCOMPLETE_ITEM,
      id: id,
    }
    expect(item.uncompleteItem(id)).toEqual(expectedAction)
  })

  it('should create an action to move an item with a project', () => {
    const id = uuidv4()
    const projectId = uuidv4()
    const expectedAction: item.MoveItemAction = {
      type: item.MOVE_ITEM,
      id: id,
      projectId: projectId,
    }
    expect(item.moveItem(id, projectId)).toEqual(expectedAction)
  })

  it('should create an action to set the due date of an item', () => {
    const id = uuidv4()
    const date = new Date()
    const expectedAction: item.SetDueDateAction = {
      type: item.SET_DUE_DATE,
      id: id,
      date: date,
    }
    expect(item.setDueDate(id, date)).toEqual(expectedAction)
  })

  it('should create an action to set the scheduled date of an item', () => {
    const id = uuidv4()
    const date = new Date()
    const expectedAction: item.SetScheduledDateAction = {
      type: item.SET_SCHEDULED_DATE,
      id: id,
      date: date,
    }
    expect(item.setScheduledDate(id, date)).toEqual(expectedAction)
  })

  it('should create an action to set the repeat rule of an item', () => {
    const id = uuidv4()
    const rule = new RRule()
    const expectedAction: item.SetRepeatRuleAction = {
      type: item.SET_REPEAT_RULE,
      id: id,
      rule: rule,
    }
    expect(item.setRepeatRule(id, rule)).toEqual(expectedAction)
  })

  it('should create an action to set the add a child item to an item', () => {
    const id = uuidv4()
    const parentId = uuidv4()
    const expectedAction: item.AddChildItemAction = {
      type: item.ADD_CHILD_ITEM,
      id: id,
      parentId: parentId,
    }
    expect(item.addChildItem(id, parentId)).toEqual(expectedAction)
  })
})
