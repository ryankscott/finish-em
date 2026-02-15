import { createFileRoute } from '@tanstack/react-router'

import {
  deleteProject,
  updateProject,
  getProject,
} from '@/server/repos/projects'
import {
  asNumber,
  badRequest,
  json,
  notFound,
  parseJsonBody,
} from '@/server/services/http'

export const Route = createFileRoute('/api/projects/$projectId')({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        try {
          const projectId = asNumber(params.projectId, 'projectId')
          const payload = await parseJsonBody<{
            name?: string
            color?: string
            isInbox?: boolean
          }>(request)

          const updated = updateProject(projectId, payload)
          return updated ? json(updated) : notFound('Project not found')
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
      DELETE: ({ params }) => {
        try {
          const projectId = asNumber(params.projectId, 'projectId')
          const existing = getProject(projectId)
          if (!existing) {
            return notFound('Project not found')
          }

          const deleted = deleteProject(projectId)
          if (!deleted) {
            return badRequest('Cannot delete inbox project')
          }
          return json({ ok: true })
        } catch (error) {
          return badRequest('invalid projectId', String(error))
        }
      },
    },
  },
})
