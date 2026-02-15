import { createFileRoute } from '@tanstack/react-router'

import { createGoal, listGoals } from '@/server/repos/goals'
import { badRequest, json, parseJsonBody } from '@/server/services/http'

export const Route = createFileRoute('/api/goals')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url)
        const periodType = url.searchParams.get('periodType')
        const periodStart = url.searchParams.get('periodStart')

        return json(
          listGoals({
            periodType:
              periodType === 'daily' || periodType === 'weekly'
                ? periodType
                : undefined,
            periodStart: periodStart ?? undefined,
          }),
        )
      },
      POST: async ({ request }) => {
        try {
          const payload = await parseJsonBody<{
            periodType?: 'daily' | 'weekly'
            periodStart?: string
            title?: string
            done?: boolean
          }>(request)

          if (!payload.periodType || !payload.periodStart || !payload.title) {
            return badRequest('periodType, periodStart and title are required')
          }

          return json(
            createGoal({
              periodType: payload.periodType,
              periodStart: payload.periodStart,
              title: payload.title,
              done: payload.done,
            }),
          )
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
    },
  },
})
