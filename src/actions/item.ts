import { Uuid } from '@typed/uuid'

export const CREATE_ITEM = 'CREATE_ITEM'
export const DELETE_ITEM = 'DELETE_ITEM'
export const UNDELETE_ITEM = 'UNDELETE_ITEM'
export const UPDATE_ITEM_DESCRIPTION = 'UPDATE_ITEM_DESCRIPTION'
export const MOVE_ITEM = 'MOVE_ITEM'
export const COMPLETE_ITEM = 'COMPLETE_ITEM'
export const UNCOMPLETE_ITEM = 'UNCOMPLETE_ITEM'
export const SET_SCHEDULED_DATE = 'SET_SCHEDULED_DATE'
export const SET_DUE_DATE = 'SET_DUE_DATE'
export const SET_REPEAT_RULE = 'SET_REPEAT_RULE'
export const ADD_CHILD_ITEM = 'ADD_CHILD_ITEM'
export const HIDE_CHILDREN = 'HIDE_CHILDREN'
export const SHOW_CHILDREN = 'SHOW_CHILDREN'
export const REORDER_ITEM = 'REORDER_ITEM'
export const CONVERT_SUBTASK = 'CONVERT_SUBTASK'
export const CHANGE_PARENT_ITEM = 'CHANGE_PARENT_ITEM'
export const TOGGLE_FLAG = 'TOGGLE_FLAG'

import { getItemTypeFromString, capitaliseItemTypeFromString } from '../utils'
import RRule from 'rrule'

export interface CreateItemAction {
    type: typeof CREATE_ITEM
    id: Uuid
    itemType: 'TODO' | 'NOTE'
    text: string
    projectId?: Uuid | '0'
    parentId?: Uuid
}

export function createItem(
    id: Uuid,
    text: string,
    projectId?: Uuid | '0',
    parentId?: Uuid,
): CreateItemAction {
    const itemType = getItemTypeFromString(text)

    // const dueDate = extractDateFromString(text);
    const newText = capitaliseItemTypeFromString(text)

    return {
        type: CREATE_ITEM,
        id: id,
        text: newText,
        itemType: itemType,
        projectId: projectId,
        parentId: parentId,
    }
}
export interface DeleteItemAction {
    type: typeof DELETE_ITEM
    id: Uuid
}
export function deleteItem(id: Uuid): DeleteItemAction {
    return {
        type: DELETE_ITEM,
        id: id,
    }
}

export interface UndeleteItemAction {
    type: typeof UNDELETE_ITEM
    id: Uuid
}
export function undeleteItem(id: Uuid): UndeleteItemAction {
    return {
        type: UNDELETE_ITEM,
        id: id,
    }
}
export interface CompleteItemAction {
    type: typeof COMPLETE_ITEM
    id: Uuid
}
export function completeItem(id: Uuid): CompleteItemAction {
    return {
        type: COMPLETE_ITEM,
        id: id,
    }
}

export interface UncompleteItemAction {
    type: typeof UNCOMPLETE_ITEM
    id: Uuid
}
export function uncompleteItem(id: Uuid): UncompleteItemAction {
    return {
        type: UNCOMPLETE_ITEM,
        id: id,
    }
}

export interface MoveItemAction {
    type: typeof MOVE_ITEM
    id: Uuid
    projectId: Uuid | '0'
}
export function moveItem(id: Uuid, projectId: Uuid | '0'): MoveItemAction {
    return {
        type: MOVE_ITEM,
        id: id,
        projectId: projectId,
    }
}

export interface SetScheduledDateAction {
    type: typeof SET_SCHEDULED_DATE
    id: Uuid
    date: string
}
export function setScheduledDate(
    id: Uuid,
    date: string,
): SetScheduledDateAction {
    return {
        type: SET_SCHEDULED_DATE,
        id: id,
        date: date,
    }
}

export interface SetDueDateAction {
    type: typeof SET_DUE_DATE
    id: Uuid
    date: string
}
export function setDueDate(id: Uuid, date: string): SetDueDateAction {
    return {
        type: SET_DUE_DATE,
        id: id,
        date: date,
    }
}

export interface SetRepeatRuleAction {
    type: typeof SET_REPEAT_RULE
    id: Uuid
    rule: RRule
}
export function setRepeatRule(id: Uuid, rule: RRule): SetRepeatRuleAction {
    return {
        type: SET_REPEAT_RULE,
        id: id,
        rule: rule,
    }
}
export interface UpdateItemDescriptionAction {
    type: typeof UPDATE_ITEM_DESCRIPTION
    id: Uuid
    text: string
}
export function updateItemDescription(
    id: Uuid,
    text: string,
): UpdateItemDescriptionAction {
    return {
        type: UPDATE_ITEM_DESCRIPTION,
        id: id,
        text: text,
    }
}

export interface AddChildItemAction {
    type: typeof ADD_CHILD_ITEM
    id: Uuid
    parentId: Uuid
}
export function addChildItem(id: Uuid, parentId: Uuid): AddChildItemAction {
    return {
        type: ADD_CHILD_ITEM,
        id: id,
        parentId: parentId,
    }
}
export interface ReorderItemAction {
    type: typeof REORDER_ITEM
    id: Uuid
    destinationId: Uuid
}
export function reorderItem(id: Uuid, destinationId: Uuid): ReorderItemAction {
    return {
        type: REORDER_ITEM,
        id: id,
        destinationId: destinationId,
    }
}

export interface ConvertSubtaskAction {
    type: typeof CONVERT_SUBTASK
    id: Uuid
}

export function convertSubtask(id: Uuid): ConvertSubtaskAction {
    return {
        type: CONVERT_SUBTASK,
        id: id,
    }
}

export interface ChangeParentItemAction {
    type: typeof CHANGE_PARENT_ITEM
    id: Uuid
    parentId: Uuid
}

export function changeParentItem(
    id: Uuid,
    parentId: Uuid,
): ChangeParentItemAction {
    return {
        type: CHANGE_PARENT_ITEM,
        id: id,
        parentId: parentId,
    }
}

export interface ToggleFlagAction {
    type: typeof TOGGLE_FLAG
    id: Uuid
}

export function toggleFlag(id: Uuid): ToggleFlagAction {
    return {
        type: TOGGLE_FLAG,
        id: id,
    }
}

export type ItemActions =
    | AddChildItemAction
    | UpdateItemDescriptionAction
    | SetRepeatRuleAction
    | SetDueDateAction
    | SetScheduledDateAction
    | MoveItemAction
    | UncompleteItemAction
    | CompleteItemAction
    | UndeleteItemAction
    | DeleteItemAction
    | CreateItemAction
    | ReorderItemAction
    | ConvertSubtaskAction
    | ChangeParentItemAction
    | ToggleFlagAction
