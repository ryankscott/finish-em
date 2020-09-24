export const ENABLE_DRAG_AND_DROP = 'ENABLE_DRAG_AND_DROP'
export const DISABLE_DRAG_AND_DROP = 'DISABLE_DRAG_AND_DROP'
export const TOGGLE_DRAG_AND_DROP = 'TOGGLE_DRAG_AND_DROP'
export const ENABLE_PROJECT_DATES = 'ENABLE_PROJECT_DATES'
export const DISABLE_PROJECT_DATES = 'DISABLE_PROJECT_DATES'
export const TOGGLE_PROJECT_DATES = 'TOGGLE_PROJECT_DATES'
export const TOGGLE_CALENDAR_INTEGRATION = 'TOGGLE_CALENDAR_INTEGRATION'
export const ENABLE_DAILY_GOALS = 'ENABLE_DAILY_GOALS'
export const DISABLE_DAILY_GOALS = 'DISABLE_DAILY_GOALS'
export const TOGGLE_DAILY_GOALS = 'TOGGLE_DAILY_GOALS'

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

export interface ToggleCalendarIntegrationAction {
  type: typeof TOGGLE_CALENDAR_INTEGRATION
}
export function toggleCalendarIntegration(): ToggleCalendarIntegrationAction {
  return {
    type: TOGGLE_CALENDAR_INTEGRATION,
  }
}

export interface EnableDailyGoalsAction {
  type: typeof ENABLE_DAILY_GOALS
}
export function enableDailyGoals(): EnableDailyGoalsAction {
  return {
    type: ENABLE_DAILY_GOALS,
  }
}
export interface DisableDailyGoalsAction {
  type: typeof DISABLE_DAILY_GOALS
}
export function disableDailyGoals(): DisableDailyGoalsAction {
  return {
    type: DISABLE_DAILY_GOALS,
  }
}
export interface ToggleDailyGoalsAction {
  type: typeof TOGGLE_DAILY_GOALS
}
export function toggleDailyGoals(): ToggleDailyGoalsAction {
  return {
    type: TOGGLE_DAILY_GOALS,
  }
}

export type FeatureActions =
  | EnableDragAndDropAction
  | DisableDragAndDropAction
  | ToggleDragAndDropAction
  | EnableProjectDatesAction
  | DisableProjectDatesAction
  | ToggleProjectDatesAction
  | ToggleCalendarIntegrationAction
  | EnableDailyGoalsAction
  | DisableDailyGoalsAction
  | ToggleDailyGoalsAction
