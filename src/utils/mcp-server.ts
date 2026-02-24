import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { ZodRawShape } from 'zod'
import z from 'zod'

import { mcpResources } from '@/utils/mcp-resources'
import { ALL_TOOLS } from '@/utils/mcp-tools'

const TOOL_MAP = new Map(ALL_TOOLS.map((tool) => [tool.name, tool]))

export async function invokeMcpTool(
  name: string,
  input: Record<string, unknown> = {},
): Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }> {
  const tool = TOOL_MAP.get(name)
  if (!tool) {
    throw new Error(`Unknown MCP tool: ${name}`)
  }

  const schema = z.object(tool.definition.inputSchema as ZodRawShape)
  const validatedInput = schema.parse(input)
  return tool.handler(validatedInput)
}

export function createMcpServer() {
  const server = new McpServer({
    name: 'finish-em-server',
    version: '1.0.0',
  })

  for (const tool of ALL_TOOLS) {
    server.registerTool(tool.name, tool.definition, async (input) => {
      try {
        return await invokeMcpTool(tool.name, input)
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
    })
  }

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
