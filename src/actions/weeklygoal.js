export const SET_WEEKLY_GOAL = "SET_WEEKLY_GOAL";

export function setWeeklyGoal(week, text) {
  return {
    type: SET_WEEKLY_GOAL,
    week: week,
    text: text
  };
}
