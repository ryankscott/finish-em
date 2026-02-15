import { createFileRoute } from '@tanstack/react-router'

import { badRequest, json, parseJsonBody } from '@/server/services/http'
import { parseQuickAdd } from '@/server/services/quick-add'

export const Route = createFileRoute('/api/quick-add/parse')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = await parseJsonBody<{ text?: string }>(request)
          if (!payload.text || payload.text.trim().length === 0) {
            return badRequest('text is required')
          }
          return json(await parseQuickAdd(payload.text))
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
    },
  },
})
