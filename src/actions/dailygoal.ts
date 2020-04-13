export const SET_DAILY_GOAL = 'SET_DAILY_GOAL'

// TODO: Create a DailyGoal action type
export function setDailyGoal(day: string, text: string): {} {
  return {
    type: SET_DAILY_GOAL,
    day: day,
    text: text,
  }
}
