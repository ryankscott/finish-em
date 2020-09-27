import { combineReducers } from 'redux'
import { uiReducer } from './ui'
import { itemReducer } from './item'
import { projectReducer } from './project'
import { featureReducer } from './feature'
import { areaReducer } from './area'
import { eventReducer } from './event'
import { reminderReducer } from './reminders'
import { SET_WEEKLY_GOAL, SET_DAILY_GOAL } from '../actions'

// TODO: Create a state interface

const initialState = {
  weeklyGoal: {},
  dailyGoal: {},
}

const weeklyGoalReducer = (state = initialState.weeklyGoal, action) => {
  switch (action.type) {
    case SET_WEEKLY_GOAL:
      const newState = { ...state }
      newState[action.week] = { week: action.week, text: action.text }
      return newState

    default:
      return state
  }
}

const dailyGoalReducer = (state = initialState.dailyGoal, action) => {
  switch (action.type) {
    case SET_DAILY_GOAL:
      const newState = { ...state }
      newState[action.day] = { day: action.day, text: action.text }
      return newState

    default:
      return state
  }
}

const rootReducer = combineReducers({
  items: itemReducer,
  projects: projectReducer,
  ui: uiReducer,
  weeklyGoal: weeklyGoalReducer,
  dailyGoal: dailyGoalReducer,
  features: featureReducer,
  areas: areaReducer,
  events: eventReducer,
  reminders: reminderReducer,
})

export default rootReducer
