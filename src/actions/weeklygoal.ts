export const SET_WEEKLY_GOAL = 'SET_WEEKLY_GOAL'

// TODO: Create a weekly goal action type
export function setWeeklyGoal(week: string, text: string): {} {
  return {
    type: SET_WEEKLY_GOAL,
    week: week,
    text: text,
  }
}
