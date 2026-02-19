import { createFileRoute } from '@tanstack/react-router'

import { deleteTask, getTask, updateTask } from '@/server/repos/tasks'
import {
  asNumber,
  badRequest,
  json,
  notFound,
  parseJsonBody,
} from '@/server/services/http'

function parseParentTaskId(value: unknown) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  if (typeof value === 'number' && Number.isInteger(value)) {
    return value
  }

  if (typeof value === 'string') {
    return asNumber(value, 'parentTaskId')
  }

  throw new Error('parentTaskId must be an integer or null')
}

export const Route = createFileRoute('/api/tasks/$taskId')({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        try {
          const taskId = asNumber(params.taskId, 'taskId')
          const payload = await parseJsonBody<{
            projectId?: number
            title?: string
            notes?: string
            priority?: 1 | 2 | 3 | 4
            scheduledAt?: string | null
            dueAt?: string | null
            dueTimezone?: string | null
            recurrencePreset?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'every_weekday' | null
            recurrenceRRule?: string | null
            status?: 'open' | 'completed'
            parentTaskId?: number | null
          }>(request)

          const updated = updateTask(taskId, {
            ...payload,
            parentTaskId: parseParentTaskId(payload.parentTaskId),
          })
          return updated ? json(updated) : notFound('Task not found')
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
      DELETE: ({ params }) => {
        try {
          const taskId = asNumber(params.taskId, 'taskId')
          const existing = getTask(taskId)
          if (!existing) {
            return notFound('Task not found')
          }

          const deleted = deleteTask(taskId)
          return json({ ok: deleted })
        } catch (error) {
          return badRequest('invalid taskId', String(error))
        }
      },
    },
  },
})
