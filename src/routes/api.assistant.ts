import { createFileRoute } from '@tanstack/react-router'

import { json } from '@/server/services/http'
import { getAssistantState } from '@/server/services/assistant'

export const Route = createFileRoute('/api/assistant')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url)
        const surface = url.searchParams.get('surface') ?? 'ui'
        return json(getAssistantState(surface))
      },
    },
  },
})
