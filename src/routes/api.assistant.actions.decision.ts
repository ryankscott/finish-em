import { createFileRoute } from '@tanstack/react-router'

import { asNumber, badRequest, json, parseJsonBody } from '@/server/services/http'
import { decideAssistantAction } from '@/server/services/assistant'

export const Route = createFileRoute('/api/assistant/actions/decision')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = await parseJsonBody<{
            surface?: string
            messageId?: number
            actionId?: string
            decision?: 'confirm' | 'cancel'
          }>(request)

          if (!payload.messageId) {
            return badRequest('messageId is required')
          }
          if (!payload.actionId) {
            return badRequest('actionId is required')
          }
          if (payload.decision !== 'confirm' && payload.decision !== 'cancel') {
            return badRequest('decision must be confirm or cancel')
          }

          return json(
            decideAssistantAction({
              surfaceInput: payload.surface ?? 'ui',
              messageId: asNumber(String(payload.messageId), 'messageId'),
              actionId: payload.actionId,
              decision: payload.decision,
            }),
          )
        } catch (error) {
          return badRequest('invalid payload', String(error))
        }
      },
    },
  },
})
