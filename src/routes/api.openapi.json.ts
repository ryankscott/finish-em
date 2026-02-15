import { createFileRoute } from '@tanstack/react-router'

import { buildOpenApiSpec } from '@/server/services/openapi'

export const Route = createFileRoute('/api/openapi/json')({
  server: {
    handlers: {
      GET: () =>
        Response.json(buildOpenApiSpec(), {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
    },
  },
})
