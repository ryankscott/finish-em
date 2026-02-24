import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'

import { handleMcpRequest } from '@/utils/mcp-handler'
import { createMcpServer } from '@/utils/mcp-server'

type McpHttpServerOptions = {
  host: string
  port: number
}

type McpHttpServerHandle = {
  url: string
  stop: () => Promise<void>
}

const readIncomingBody = async (req: IncomingMessage): Promise<Buffer> =>
  await new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    req.on('error', reject)
  })

export const startMcpHttpServer = async (
  options: McpHttpServerOptions,
): Promise<McpHttpServerHandle> => {
  const mcpServer = createMcpServer()
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const method = req.method ?? 'GET'
      const hostHeader = req.headers.host ?? `${options.host}:${options.port}`
      const url = new URL(req.url ?? '/', `http://${hostHeader}`)

      if (url.pathname === '/health') {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
        return
      }

      if (url.pathname !== '/mcp' || method !== 'POST') {
        res.writeHead(404, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: 'Not found' }))
        return
      }

      const body = await readIncomingBody(req)
      const request = new Request(url.toString(), {
        method,
        headers: req.headers as Record<string, string>,
        body: body.length > 0 ? body.toString('utf8') : undefined,
      })

      const response = await handleMcpRequest(request, mcpServer)

      res.writeHead(response.status, {
        'content-type': response.headers.get('content-type') ?? 'application/json',
      })
      res.end(await response.text())
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      res.writeHead(500, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: message }))
    }
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(options.port, options.host, () => {
      server.off('error', reject)
      resolve()
    })
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Could not resolve MCP server address')
  }
  const resolvedPort = address.port

  return {
    url: `http://${options.host}:${resolvedPort}/mcp`,
    stop: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      }),
  }
}
