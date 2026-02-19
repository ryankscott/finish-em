import { createFileRoute } from '@tanstack/react-router'

import { asNumber, badRequest, json, parseJsonBody } from '@/server/services/http'
import { createTaskFromQuickAdd } from '@/server/services/quick-add'

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

export const Route = createFileRoute('/api/quick-add/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = await parseJsonBody<{
            text?: string
            parentTaskId?: number | null
          }>(request)
          if (!payload.text || payload.text.trim().length === 0) {
            return badRequest('text is required')
          }
          return json(
            await createTaskFromQuickAdd(payload.text, {
              parentTaskId: parseParentTaskId(payload.parentTaskId),
            }),
          )
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
    },
  },
})
