import { createFileRoute } from '@tanstack/react-router'

import { uncompleteTask } from '@/server/repos/tasks'
import { asNumber, badRequest, json, notFound } from '@/server/services/http'

export const Route = createFileRoute('/api/tasks/$taskId/uncomplete')({
  server: {
    handlers: {
      POST: ({ params }) => {
        try {
          const taskId = asNumber(params.taskId, 'taskId')
          const task = uncompleteTask(taskId)
          return task ? json(task) : notFound('Task not found')
        } catch (error) {
          return badRequest('invalid taskId', String(error))
        }
      },
    },
  },
})
