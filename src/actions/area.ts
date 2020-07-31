export const CREATE_AREA = 'CREATE_area'
export const DELETE_AREA = 'DELETE_area'
export const UPDATE_AREA_DESCRIPTION = 'UPDATE_AREA_DESCRIPTION'
export const UPDATE_AREA_NAME = 'UPDATE_AREA_NAME'
export const REORDER_AREA = 'REORDER_AREA'

export interface CreateAreaAction {
    type: typeof CREATE_AREA
    id: string
    name: string
    description: string
}
export function createArea(id: string, name: string, description: string): CreateAreaAction {
    return {
        type: CREATE_AREA,
        id: id,
        name: name,
        description: description,
    }
}

export interface DeleteAreaAction {
    type: typeof DELETE_AREA
    id: string
}
export function deleteArea(id: string): DeleteAreaAction {
    return {
        type: DELETE_AREA,
        id: id,
    }
}
export interface UpdateAreaDescriptionAction {
    type: typeof UPDATE_AREA_DESCRIPTION
    id: string
    description: string
}
export function updateAreaDescription(
    id: string,
    description: string,
): UpdateAreaDescriptionAction {
    return {
        type: UPDATE_AREA_DESCRIPTION,
        id: id,
        description: description,
    }
}
export interface UpdateAreaNameAction {
    type: typeof UPDATE_AREA_NAME
    id: string
    name: string
}
export function updateAreaName(id: string, name: string): UpdateAreaNameAction {
    return {
        type: UPDATE_AREA_NAME,
        id: id,
        name: name,
    }
}

export interface ReorderAreaAction {
    type: typeof REORDER_AREA
    id: string
    destinationId: string
}
export function reorderArea(id: string, destinationId: string): ReorderAreaAction {
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
