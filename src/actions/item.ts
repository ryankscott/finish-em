import { toast } from 'react-toastify'

export const CREATE_ITEM = 'CREATE_ITEM'
export const DELETE_ITEM = 'DELETE_ITEM'
export const CLONE_ITEM = 'CLONE_ITEM'
export const UNDELETE_ITEM = 'UNDELETE_ITEM'
export const UPDATE_ITEM_DESCRIPTION = 'UPDATE_ITEM_DESCRIPTION'
export const ADD_PROJECT = 'ADD_PROJECT'
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
export const DELETE_PERMANENT_ITEM = 'DELETE_PERMANENT_ITEM'
export const ADD_LABEL = 'ADD_LABEL'
export const REMOVE_LABEL = 'REMOVE_LABEL'
export const ADD_AREA = 'ADD_AREA'
export const REMOVE_AREA = 'REMOVE_AREA'

import RRule from 'rrule'

export interface CreateItemAction {
    type: typeof CREATE_ITEM
    id: string
    text: string
    projectId?: string | '0'
    parentId?: string
}

export function createItem(
    id: string,
    text: string,
    projectId?: string | '0',
    parentId?: string,
): CreateItemAction {
    return {
        type: CREATE_ITEM,
        id: id,
        text: text,
        projectId: projectId,
        parentId: parentId,
    }
}
export interface DeleteItemAction {
    type: typeof DELETE_ITEM
    id: string
}
export function deleteItem(id: string): DeleteItemAction {
    toast.dark('Item deleted')
    return {
        type: DELETE_ITEM,
        id: id,
    }
}

export interface UndeleteItemAction {
    type: typeof UNDELETE_ITEM
    id: string
}
export function undeleteItem(id: string): UndeleteItemAction {
    return {
        type: UNDELETE_ITEM,
        id: id,
    }
}
export interface CompleteItemAction {
    type: typeof COMPLETE_ITEM
    id: string
}
export function completeItem(id: string): CompleteItemAction {
    return {
        type: COMPLETE_ITEM,
        id: id,
    }
}
export interface CloneItemAction {
    type: typeof CLONE_ITEM
    id: string
}
export function cloneItem(id: string): CloneItemAction {
    return {
        type: CLONE_ITEM,
        id: id,
    }
}

export interface UncompleteItemAction {
    type: typeof UNCOMPLETE_ITEM
    id: string
}
export function uncompleteItem(id: string): UncompleteItemAction {
    return {
        type: UNCOMPLETE_ITEM,
        id: id,
    }
}

export interface AddProjectAction {
    type: typeof ADD_PROJECT
    id: string
    projectId: string | '0'
}
export function addProject(id: string, projectId: string | '0'): AddProjectAction {
    return {
        type: ADD_PROJECT,
        id: id,
        projectId: projectId,
    }
}

export interface SetScheduledDateAction {
    type: typeof SET_SCHEDULED_DATE
    id: string
    date: string
}
export function setScheduledDate(id: string, date: string): SetScheduledDateAction {
    return {
        type: SET_SCHEDULED_DATE,
        id: id,
        date: date,
    }
}

export interface SetDueDateAction {
    type: typeof SET_DUE_DATE
    id: string
    date: string
}
export function setDueDate(id: string, date: string): SetDueDateAction {
    return {
        type: SET_DUE_DATE,
        id: id,
        date: date,
    }
}

export interface SetRepeatRuleAction {
    type: typeof SET_REPEAT_RULE
    id: string
    rule: RRule
}
export function setRepeatRule(id: string, rule: RRule): SetRepeatRuleAction {
    return {
        type: SET_REPEAT_RULE,
        id: id,
        rule: rule,
    }
}
export interface UpdateItemDescriptionAction {
    type: typeof UPDATE_ITEM_DESCRIPTION
    id: string
    text: string
}
export function updateItemDescription(id: string, text: string): UpdateItemDescriptionAction {
    return {
        type: UPDATE_ITEM_DESCRIPTION,
        id: id,
        text: text,
    }
}

export interface AddChildItemAction {
    type: typeof ADD_CHILD_ITEM
    id: string
    parentId: string
}
export function addChildItem(id: string, parentId: string): AddChildItemAction {
    return {
        type: ADD_CHILD_ITEM,
        id: id,
        parentId: parentId,
    }
}
export interface ReorderItemAction {
    type: typeof REORDER_ITEM
    id: string
    destinationId: string
}
export function reorderItem(id: string, destinationId: string): ReorderItemAction {
    return {
        type: REORDER_ITEM,
        id: id,
        destinationId: destinationId,
    }
}

export interface ConvertSubtaskAction {
    type: typeof CONVERT_SUBTASK
    id: string
}

export function convertSubtask(id: string): ConvertSubtaskAction {
    return {
        type: CONVERT_SUBTASK,
        id: id,
    }
}

export interface ChangeParentItemAction {
    type: typeof CHANGE_PARENT_ITEM
    id: string
    parentId: string
}

export function changeParentItem(id: string, parentId: string): ChangeParentItemAction {
    return {
        type: CHANGE_PARENT_ITEM,
        id: id,
        parentId: parentId,
    }
}

export interface DeletePermanentlyAction {
    type: typeof DELETE_PERMANENT_ITEM
    id: string
}

export function deletePermanently(id: string): DeletePermanentlyAction {
    return {
        type: DELETE_PERMANENT_ITEM,
        id: id,
    }
}

export interface AddLabelAction {
    type: typeof ADD_LABEL
    id: string
    labelId: string
}

export function addLabel(id: string, labelId: string): AddLabelAction {
    return { type: ADD_LABEL, id: id, labelId: labelId }
}

export interface RemoveLabelAction {
    type: typeof REMOVE_LABEL
    id: string
}

export function removeLabel(id: string): RemoveLabelAction {
    return {
        type: REMOVE_LABEL,
        id: id,
    }
}

export interface AddAreaAction {
    type: typeof ADD_AREA
    id: string
    areaId: string
}

export function addArea(id: string, areaId: string): AddAreaAction {
    return { type: ADD_AREA, id: id, areaId: areaId }
}

export interface RemoveAreaAction {
    type: typeof REMOVE_AREA
    id: string
}

export function removeArea(id: string): RemoveAreaAction {
    return {
        type: REMOVE_AREA,
        id: id,
    }
}

export type ItemActions =
    | AddChildItemAction
    | UpdateItemDescriptionAction
    | SetRepeatRuleAction
    | SetDueDateAction
    | SetScheduledDateAction
    | AddProjectAction
    | UncompleteItemAction
    | CompleteItemAction
    | UndeleteItemAction
    | DeleteItemAction
    | CloneItemAction
    | CreateItemAction
    | ReorderItemAction
    | ConvertSubtaskAction
    | ChangeParentItemAction
    | DeletePermanentlyAction
    | AddLabelAction
    | RemoveLabelAction
    | AddAreaAction
    | RemoveAreaAction
