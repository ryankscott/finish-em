import * as feature from '../actions/feature'
import { FeatureType } from '../interfaces'

const initialState: FeatureType = {
  dragAndDrop: false,
  projectDates: false,
  calendarIntegration: false,
  dailyGoals: false,
}

export const featureReducer = (
  state = initialState,
  action: feature.FeatureActions,
): FeatureType => {
  switch (action.type) {
    case feature.ENABLE_DRAG_AND_DROP:
      return {
        ...state,
        dragAndDrop: true,
      }
    case feature.DISABLE_DRAG_AND_DROP:
      return {
        ...state,
        dragAndDrop: false,
      }
    case feature.TOGGLE_DRAG_AND_DROP:
      return {
        ...state,
        dragAndDrop: !state.dragAndDrop,
      }
    case feature.ENABLE_PROJECT_DATES:
      return {
        ...state,
        projectDates: true,
      }
    case feature.DISABLE_PROJECT_DATES:
      return {
        ...state,
        projectDates: false,
      }
    case feature.TOGGLE_PROJECT_DATES:
      return {
        ...state,
        projectDates: !state.projectDates,
      }
    case feature.TOGGLE_CALENDAR_INTEGRATION:
      return {
        ...state,
        calendarIntegration: !state.calendarIntegration,
      }
    case feature.ENABLE_DAILY_GOALS:
      return {
        ...state,
        dailyGoals: true,
      }
    case feature.DISABLE_DAILY_GOALS:
      return {
        ...state,
        dailyGoals: false,
      }
    case feature.TOGGLE_DAILY_GOALS:
      return {
        ...state,
        dailyGoals: !state.dailyGoals,
      }

    default:
      return state
  }
}
