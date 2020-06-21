export const ENABLE_DRAG_AND_DROP = 'ENABLE_DRAG_AND_DROP'
export const DISABLE_DRAG_AND_DROP = 'DISABLE_DRAG_AND_DROP'
export const TOGGLE_DRAG_AND_DROP = 'TOGGLE_DRAG_AND_DROP'
export const ENABLE_PROJECT_DATES = 'ENABLE_PROJECT_DATES'
export const DISABLE_PROJECT_DATES = 'DISABLE_PROJECT_DATES'
export const TOGGLE_PROJECT_DATES = 'TOGGLE_PROJECT_DATES'

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
export interface EnableProjectDatesAction {
    type: typeof ENABLE_PROJECT_DATES
}
export function enableProjectDates(): EnableProjectDatesAction {
    return {
        type: ENABLE_PROJECT_DATES,
    }
}
export interface DisableProjectDatesAction {
    type: typeof DISABLE_PROJECT_DATES
}
export function disableProjectDates(): DisableProjectDatesAction {
    return {
        type: DISABLE_PROJECT_DATES,
    }
}
export interface ToggleProjectDatesAction {
    type: typeof TOGGLE_PROJECT_DATES
}
export function toggleProjectDates(): ToggleProjectDatesAction {
    return {
        type: TOGGLE_PROJECT_DATES,
    }
}

export type FeatureActions =
    | EnableDragAndDropAction
    | DisableDragAndDropAction
    | ToggleDragAndDropAction
    | EnableProjectDatesAction
    | DisableProjectDatesAction
    | ToggleProjectDatesAction
