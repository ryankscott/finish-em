import { createFileRoute } from '@tanstack/react-router'

import { getSettings, updateSettings } from '@/server/repos/settings'
import { badRequest, json, parseJsonBody } from '@/server/services/http'

export const Route = createFileRoute('/api/settings')({
  server: {
    handlers: {
      GET: () => json(getSettings()),
      PATCH: async ({ request }) => {
        try {
          const payload = await parseJsonBody<{
            timezone?: string
            aiProvider?: 'openai' | 'lmstudio'
            aiBaseUrl?: string | null
            aiModel?: string | null
            aiApiKey?: string | null
            clearAiApiKey?: boolean
          }>(request)
          return json(updateSettings(payload))
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
    },
  },
})
