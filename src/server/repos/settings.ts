import { getDb, nowIso } from '@/server/db/client'
import { mapSettingsRow } from '@/server/repos/mappers'

import type { AppSettings } from '@/server/types'

export function getSettings(): AppSettings {
  const db = getDb()
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get() as Record<
    string,
    unknown
  >

  return mapSettingsRow(row)
}

export function updateSettings(patch: Partial<{ timezone: string }>): AppSettings {
  const current = getSettings()
  const timezone = patch.timezone ?? current.timezone

  getDb()
    .prepare('UPDATE settings SET timezone = ?, updated_at = ? WHERE id = 1')
    .run(timezone, nowIso())

  return getSettings()
}
