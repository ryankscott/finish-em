import { Uuid } from '@typed/uuid'
export const CREATE_AREA = 'CREATE_area'
export const DELETE_AREA = 'DELETE_area'
export const UPDATE_AREA_DESCRIPTION = 'UPDATE_AREA_DESCRIPTION'
export const UPDATE_AREA_NAME = 'UPDATE_AREA_NAME'
export const REORDER_AREA = 'REORDER_AREA'

export interface CreateAreaAction {
    type: typeof CREATE_AREA
    id: Uuid
    name: string
    description: string
}
export function createArea(id: Uuid, name: string, description: string): CreateAreaAction {
    return {
        type: CREATE_AREA,
        id: id,
        name: name,
        description: description,
    }
}

export interface DeleteAreaAction {
    type: typeof DELETE_AREA
    id: Uuid
}
export function deleteArea(id: Uuid): DeleteAreaAction {
    return {
        type: DELETE_AREA,
        id: id,
    }
}
export interface UpdateAreaDescriptionAction {
    type: typeof UPDATE_AREA_DESCRIPTION
    id: Uuid
    description: string
}
export function updateAreaDescription(id: Uuid, description: string): UpdateAreaDescriptionAction {
    return {
        type: UPDATE_AREA_DESCRIPTION,
        id: id,
        description: description,
    }
}
export interface UpdateAreaNameAction {
    type: typeof UPDATE_AREA_NAME
    id: Uuid
    name: string
}
export function updateAreaName(id: Uuid, name: string): UpdateAreaNameAction {
    return {
        type: UPDATE_AREA_NAME,
        id: id,
        name: name,
    }
}

export interface ReorderAreaAction {
    type: typeof REORDER_AREA
    id: Uuid
    destinationId: Uuid
}
export function reorderArea(id: Uuid, destinationId: Uuid): ReorderAreaAction {
    return {
        type: REORDER_AREA,
        id: id,
        destinationId: destinationId,
    }
}

export type AreaActions =
    | CreateAreaAction
    | DeleteAreaAction
    | UpdateAreaDescriptionAction
    | UpdateAreaNameAction
    | ReorderAreaAction
