import { createFileRoute } from '@tanstack/react-router'

import { handleMcpRequest } from '@/utils/mcp-handler'
import { createMcpServer } from '@/utils/mcp-server'

export const Route = createFileRoute('/mcp')({
  server: {
    handlers: {
      POST: async ({ request }) => handleMcpRequest(request, createMcpServer()),
    },
  },
})
