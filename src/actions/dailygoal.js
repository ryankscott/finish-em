export const SET_DAILY_GOAL = "SET_DAILY_GOAL";

export function setDailyGoal(day, text) {
  return {
    type: SET_DAILY_GOAL,
    day: day,
    text: text
  };
}
