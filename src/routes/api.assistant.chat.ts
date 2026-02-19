import { createFileRoute } from '@tanstack/react-router'

import { badRequest, json, parseJsonBody } from '@/server/services/http'
import { sendAssistantChat } from '@/server/services/assistant'

export const Route = createFileRoute('/api/assistant/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = await parseJsonBody<{ surface?: string; message?: string }>(request)
          return json(
            await sendAssistantChat({
              surfaceInput: payload.surface ?? 'ui',
              message: payload.message ?? '',
            }),
          )
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
    },
  },
})
