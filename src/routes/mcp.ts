import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { createFileRoute } from '@tanstack/react-router'

import { handleMcpRequest } from '@/utils/mcp-handler'
import { ALL_TOOLS } from '@/utils/mcp-tools'
import { mcpResources } from '@/utils/mcp-resources'

function createMcpServer() {
  const server = new McpServer({
    name: 'finish-em-server',
    version: '1.0.0',
  })

  // Register all tools
  for (const tool of ALL_TOOLS) {
    server.registerTool(
      tool.name,
      tool.definition,
      async (input) => {
        try {
          return await tool.handler(input)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${errorMessage}`,
              },
            ],
            isError: true,
          }
        }
      },
    )
  }

  // Register resources
  server.registerResource(
    'finish-em://tasks',
    'All Tasks',
    {
      description: 'List and browse all tasks',
    },
    async (uri) => mcpResources.read(uri.href),
  )

  server.registerResource(
    'finish-em://projects',
    'All Projects',
    {
      description: 'List and browse all projects',
    },
    async (uri) => mcpResources.read(uri.href),
  )

  server.registerResource(
    'finish-em://goals',
    'All Goals',
    {
      description: 'List and browse all goals',
    },
    async (uri) => mcpResources.read(uri.href),
  )

  return server
}

export const Route = createFileRoute('/mcp')({
  server: {
    handlers: {
      POST: async ({ request }) => handleMcpRequest(request, createMcpServer()),
    },
  },
})
