import { createFileRoute } from '@tanstack/react-router'

import { deleteGoal, getGoal, updateGoal } from '@/server/repos/goals'
import {
  asNumber,
  badRequest,
  json,
  notFound,
  parseJsonBody,
} from '@/server/services/http'

export const Route = createFileRoute('/api/goals/$goalId')({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        try {
          const goalId = asNumber(params.goalId, 'goalId')
          const payload = await parseJsonBody<{
            periodType?: 'daily' | 'weekly'
            periodStart?: string
            title?: string
            done?: boolean
          }>(request)

          const updated = updateGoal(goalId, payload)
          return updated ? json(updated) : notFound('Goal not found')
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
      DELETE: ({ params }) => {
        try {
          const goalId = asNumber(params.goalId, 'goalId')
          if (!getGoal(goalId)) {
            return notFound('Goal not found')
          }
          return json({ ok: deleteGoal(goalId) })
        } catch (error) {
          return badRequest('invalid goalId', String(error))
        }
      },
    },
  },
})
