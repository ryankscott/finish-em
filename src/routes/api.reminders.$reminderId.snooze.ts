import { createFileRoute } from '@tanstack/react-router'

import { snoozeReminder } from '@/server/repos/reminders'
import {
  asNumber,
  badRequest,
  json,
  notFound,
  parseJsonBody,
} from '@/server/services/http'

export const Route = createFileRoute('/api/reminders/$reminderId/snooze')({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        try {
          const reminderId = asNumber(params.reminderId, 'reminderId')
          const payload = await parseJsonBody<{
            preset?:
              | 'this_morning'
              | 'this_evening'
              | 'tomorrow_morning'
              | 'next_week'
              | 'custom'
            customMinutes?: number
          }>(request)

          if (!payload.preset) {
            return badRequest('preset is required')
          }

          const result = snoozeReminder({
            reminderId,
            preset: payload.preset,
            customMinutes: payload.customMinutes,
          })

          return result ? json(result) : notFound('Reminder not found')
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
    },
  },
})
