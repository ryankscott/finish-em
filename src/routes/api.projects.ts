import { createFileRoute } from '@tanstack/react-router'

import { createProject, listProjects } from '@/server/repos/projects'
import { badRequest, json, parseJsonBody } from '@/server/services/http'

export const Route = createFileRoute('/api/projects')({
  server: {
    handlers: {
      GET: () => json(listProjects()),
      POST: async ({ request }) => {
        try {
          const body = await parseJsonBody<{
            name?: string
            color?: string
            isInbox?: boolean
          }>(request)

          if (!body.name || body.name.trim().length === 0) {
            return badRequest('name is required')
          }

          const project = createProject({
            name: body.name.trim(),
            color: body.color,
            isInbox: body.isInbox,
          })

          return json(project)
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
    },
  },
})
