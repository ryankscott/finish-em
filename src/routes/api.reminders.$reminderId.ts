import { createFileRoute } from '@tanstack/react-router'

import {
  deleteReminder,
  getReminder,
  updateReminder,
} from '@/server/repos/reminders'
import {
  asNumber,
  badRequest,
  json,
  notFound,
  parseJsonBody,
} from '@/server/services/http'

export const Route = createFileRoute('/api/reminders/$reminderId')({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        try {
          const reminderId = asNumber(params.reminderId, 'reminderId')
          const payload = await parseJsonBody<{
            remindAt?: string
            status?: 'pending' | 'fired' | 'snoozed' | 'dismissed'
            snoozedUntil?: string | null
          }>(request)

          const updated = updateReminder(reminderId, payload)
          return updated ? json(updated) : notFound('Reminder not found')
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
      DELETE: ({ params }) => {
        try {
          const reminderId = asNumber(params.reminderId, 'reminderId')
          if (!getReminder(reminderId)) {
            return notFound('Reminder not found')
          }

          return json({ ok: deleteReminder(reminderId) })
        } catch (error) {
          return badRequest('invalid reminderId', String(error))
        }
      },
    },
  },
})
