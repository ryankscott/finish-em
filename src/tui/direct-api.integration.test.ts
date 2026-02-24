import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { resetDbForTests } from '@/server/db/client'
import { createDirectApi } from '@/tui/direct-api'

let dbPath = ''

beforeEach(() => {
  dbPath = path.join(os.tmpdir(), `finish-em-direct-api-test-${randomUUID()}.db`)
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

describe('createDirectApi integration', () => {
  it('supports updateProject metadata edits', async () => {
    const api = createDirectApi()

    const project = await api.createProject({
      name: 'Direct Project',
      color: '#22c55e',
    })

    const updated = await api.updateProject(project.id, {
      name: 'Direct Project Updated',
      emoji: '🧪',
      description: 'updated through direct api',
      startAt: '2026-03-01',
      endAt: '2026-05-01',
    })

    expect(updated.name).toBe('Direct Project Updated')
    expect(updated.emoji).toBe('🧪')
    expect(updated.description).toContain('direct api')
    expect(updated.startAt).toBe('2026-03-01')
    expect(updated.endAt).toBe('2026-05-01')
  })
})
