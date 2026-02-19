import { createFileRoute } from '@tanstack/react-router'

import { badRequest, json } from '@/server/services/http'
import { clearAssistantHistory } from '@/server/services/assistant'

export const Route = createFileRoute('/api/assistant/messages')({
  server: {
    handlers: {
      DELETE: ({ request }) => {
        try {
          const url = new URL(request.url)
          const surface = url.searchParams.get('surface') ?? 'ui'
          return json(clearAssistantHistory(surface))
        } catch (error) {
          return badRequest('invalid request', String(error))
        }
      },
    },
  },
})
