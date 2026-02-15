import { createFileRoute } from '@tanstack/react-router'

import { createReminder, listTaskReminders } from '@/server/repos/reminders'
import { getTask } from '@/server/repos/tasks'
import {
  asNumber,
  badRequest,
  json,
  notFound,
  parseJsonBody,
} from '@/server/services/http'

export const Route = createFileRoute('/api/tasks/$taskId/reminders')({
  server: {
    handlers: {
      GET: ({ params }) => {
        try {
          const taskId = asNumber(params.taskId, 'taskId')
          if (!getTask(taskId)) {
            return notFound('Task not found')
          }
          return json(listTaskReminders(taskId))
        } catch (error) {
          return badRequest('invalid taskId', String(error))
        }
      },
      POST: async ({ params, request }) => {
        try {
          const taskId = asNumber(params.taskId, 'taskId')
          if (!getTask(taskId)) {
            return notFound('Task not found')
          }

          const payload = await parseJsonBody<{
            remindAt?: string
            status?: 'pending' | 'fired' | 'snoozed' | 'dismissed'
          }>(request)

          if (!payload.remindAt) {
            return badRequest('remindAt is required')
          }

          return json(
            createReminder({
              taskId,
              remindAt: payload.remindAt,
              status: payload.status,
            }),
          )
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
    },
  },
})
