import { getDb, nowIso } from '@/server/db/client'
import { mapAssistantMessageRow } from '@/server/repos/mappers'

import type {
  AssistantAction,
  AssistantMessage,
  AssistantRole,
  AssistantSurface,
} from '@/server/types'

const MAX_MESSAGES_PER_SURFACE = 200

function pruneMessages(surface: AssistantSurface) {
  getDb()
    .prepare(
      `
      DELETE FROM assistant_messages
      WHERE id IN (
        SELECT id
        FROM assistant_messages
        WHERE surface = ?
        ORDER BY created_at DESC, id DESC
        LIMIT -1 OFFSET ?
      )
    `,
    )
    .run(surface, MAX_MESSAGES_PER_SURFACE)
}

export function listAssistantMessages(input: {
  surface: AssistantSurface
  limit?: number
}): AssistantMessage[] {
  const limit = Math.max(1, Math.min(input.limit ?? MAX_MESSAGES_PER_SURFACE, MAX_MESSAGES_PER_SURFACE))
  const rows = getDb()
    .prepare(
      `
      SELECT * FROM (
        SELECT * FROM assistant_messages
        WHERE surface = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      )
      ORDER BY created_at ASC, id ASC
    `,
    )
    .all(input.surface, limit) as Record<string, unknown>[]

  return rows.map(mapAssistantMessageRow)
}

export function getAssistantMessage(messageId: number): AssistantMessage | null {
  const row = getDb()
    .prepare('SELECT * FROM assistant_messages WHERE id = ?')
    .get(messageId) as Record<string, unknown> | undefined

  return row ? mapAssistantMessageRow(row) : null
}

export function createAssistantMessage(input: {
  surface: AssistantSurface
  role: AssistantRole
  content: string
  actions?: AssistantAction[]
}): AssistantMessage {
  const now = nowIso()
  const result = getDb()
    .prepare(
      `
      INSERT INTO assistant_messages (
        surface, role, content, actions_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    )
    .run(
      input.surface,
      input.role,
      input.content,
      JSON.stringify(input.actions ?? []),
      now,
      now,
    )

  pruneMessages(input.surface)

  const id = Number(result.lastInsertRowid)
  const created = getAssistantMessage(id)
  if (!created) {
    throw new Error('Failed to create assistant message')
  }
  return created
}

export function updateAssistantMessageActions(input: {
  messageId: number
  actions: AssistantAction[]
}): AssistantMessage | null {
  const now = nowIso()
  const result = getDb()
    .prepare(
      `
      UPDATE assistant_messages
      SET actions_json = ?, updated_at = ?
      WHERE id = ?
    `,
    )
    .run(JSON.stringify(input.actions), now, input.messageId)

  if (result.changes === 0) {
    return null
  }

  return getAssistantMessage(input.messageId)
}

export function clearAssistantMessages(surface: AssistantSurface): number {
  const result = getDb()
    .prepare('DELETE FROM assistant_messages WHERE surface = ?')
    .run(surface)
  return result.changes
}
