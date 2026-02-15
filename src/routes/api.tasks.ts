import { createFileRoute } from '@tanstack/react-router'

import { createTask, listTasks } from '@/server/repos/tasks'
import { asNumber, badRequest, json, parseJsonBody } from '@/server/services/http'

export const Route = createFileRoute('/api/tasks')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url)
        const projectId = url.searchParams.get('projectId')
        const status = url.searchParams.get('status')
        const from = url.searchParams.get('from')
        const to = url.searchParams.get('to')
        const priority = url.searchParams.get('priority')
        const noDueDate = url.searchParams.get('noDueDate')

        const tasks = listTasks({
          projectId: projectId ? asNumber(projectId, 'projectId') : undefined,
          status: status === 'open' || status === 'completed' ? status : undefined,
          from: from ?? undefined,
          to: to ?? undefined,
          noDueDate:
            noDueDate === 'true' || noDueDate === '1' ? true : undefined,
          priority: priority ? (asNumber(priority, 'priority') as 1 | 2 | 3 | 4) : undefined,
        })

        return json(tasks)
      },
      POST: async ({ request }) => {
        try {
          const body = await parseJsonBody<{
            projectId?: number
            title?: string
            notes?: string
            priority?: 1 | 2 | 3 | 4
            scheduledAt?: string | null
            dueAt?: string | null
            dueTimezone?: string | null
            recurrencePreset?: 'daily' | 'weekly' | 'monthly' | 'every_weekday' | null
            recurrenceRRule?: string | null
          }>(request)

          if (!body.projectId) {
            return badRequest('projectId is required')
          }

          if (!body.title || body.title.trim().length === 0) {
            return badRequest('title is required')
          }

          const created = createTask({
            projectId: body.projectId,
            title: body.title.trim(),
            notes: body.notes,
            priority: body.priority,
            scheduledAt: body.scheduledAt,
            dueAt: body.dueAt,
            dueTimezone: body.dueTimezone,
            recurrencePreset: body.recurrencePreset,
            recurrenceRRule: body.recurrenceRRule,
          })

          return json(created)
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
    },
  },
})
