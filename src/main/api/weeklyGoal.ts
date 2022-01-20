import WeeklyGoal from '../classes/weeklyGoal'
import SqlString from 'sqlstring-sqlite'

export const getWeeklyGoals = (obj, ctx) => {
  return ctx.db
    .all('SELECT key, week, goal FROM weeklyGoal')
    .then((result) => result.map((r) => new WeeklyGoal(r.key, r.week, r.goal)))
}

export const getWeeklyGoal = (input: { key: string }, ctx) => {
  return ctx.db
    .get(`SELECT key, week, goal FROM weeklyGoal WHERE key = '${input.key}'`)
    .then((result) => {
      return result ? new WeeklyGoal(result.key, result.week, result.goal) : null
    })
}
export const getWeeklyGoalByWeek = (input: { week: string }, ctx) => {
  return ctx.db
    .get(`SELECT key, week, goal FROM weeklyGoal WHERE week = '${input.week}'`)
    .then((result) => {
      return result ? new WeeklyGoal(result.key, result.week, result.goal) : null
    })
}

export const createWeeklyGoal = (input: { key: string; week: string; goal: string }, ctx) => {
  return ctx.db
    .run(
      `REPLACE INTO weeklyGoal (key, week, goal) VALUES ('${input.key}', '${
        input.week
      }', ${SqlString.escape(input.goal)})`,
    )
    .then((result) => {
      return result.changes
        ? getWeeklyGoal({ key: input.key }, ctx)
        : new Error('Unable to create weekly goal')
    })
}

export const weeklyGoalRootValues = {
  weeklyGoal: (key, ctx) => {
    return getWeeklyGoal(key, ctx)
  },
  weeklyGoalByWeek: (name, ctx) => {
    return getWeeklyGoalByWeek(name, ctx)
  },
  weeklyGoals: (obj, ctx) => {
    return getWeeklyGoals(obj, ctx)
  },
  createWeeklyGoal: ({ input }, ctx) => {
    return createWeeklyGoal(input, ctx)
  },
}
