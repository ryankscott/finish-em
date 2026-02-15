import { createFileRoute } from '@tanstack/react-router'

import { completeTask } from '@/server/repos/tasks'
import { asNumber, badRequest, json, notFound } from '@/server/services/http'

export const Route = createFileRoute('/api/tasks/$taskId/complete')({
  server: {
    handlers: {
      POST: ({ params }) => {
        try {
          const taskId = asNumber(params.taskId, 'taskId')
          const result = completeTask(taskId)

          if (!result.task) {
            return notFound('Task not found')
          }

          return json(result)
        } catch (error) {
          return badRequest('invalid taskId', String(error))
        }
      },
    },
  },
})
