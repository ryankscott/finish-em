import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { resetDbForTests } from '@/server/db/client'

import { startMcpHttpServer } from './mcp-http-server'

let dbPath = ''

beforeEach(() => {
  dbPath = path.join(os.tmpdir(), `finish-em-mcp-http-test-${randomUUID()}.db`)
  process.env.TODO_DB_PATH = dbPath
  resetDbForTests()
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
  }
})

afterEach(() => {
  resetDbForTests()
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
  }
})

describe('startMcpHttpServer', () => {
  it('starts server and exposes health endpoint', async () => {
    const handle = await startMcpHttpServer({ host: '127.0.0.1', port: 0 })

    try {
      const healthUrl = handle.url.replace('/mcp', '/health')
      const response = await fetch(healthUrl)
      expect(response.status).toBe(200)
      await expect(response.json()).resolves.toEqual({ ok: true })
    } finally {
      await handle.stop()
    }
  })

  it('fails startup when target port is already in use', async () => {
    const first = await startMcpHttpServer({ host: '127.0.0.1', port: 54673 })

    try {
      await expect(
        startMcpHttpServer({ host: '127.0.0.1', port: 54673 }),
      ).rejects.toBeTruthy()
    } finally {
      await first.stop()
    }
  })
})
