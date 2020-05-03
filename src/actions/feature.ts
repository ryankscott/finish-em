export const ENABLE_DRAG_AND_DROP = 'ENABLE_DRAG_AND_DROP'
export const DISABLE_DRAG_AND_DROP = 'DISABLE_DRAG_AND_DROP'
export const TOGGLE_DRAG_AND_DROP = 'TOGGLE_DRAG_AND_DROP'

export interface EnableDragAndDropAction {
    type: typeof ENABLE_DRAG_AND_DROP
}
export function enableDragAndDrop(): EnableDragAndDropAction {
    return {
        type: ENABLE_DRAG_AND_DROP,
    }
}
export interface DisableDragAndDropAction {
    type: typeof DISABLE_DRAG_AND_DROP
}
export function disableDragAndDrop(): DisableDragAndDropAction {
    return {
        type: DISABLE_DRAG_AND_DROP,
    }
}
export interface ToggleDragAndDropAction {
    type: typeof TOGGLE_DRAG_AND_DROP
}
export function toggleDragAndDrop(): ToggleDragAndDropAction {
    return {
        type: TOGGLE_DRAG_AND_DROP,
    }
}

export type FeatureActions =
    | EnableDragAndDropAction
    | DisableDragAndDropAction
    | ToggleDragAndDropAction
