import os from 'node:os'
import path from 'node:path'
import { defineConfig } from 'drizzle-kit'

// IMPORTANT: This project does NOT use drizzle-kit to manage the live database.
// Runtime schema is owned by SCHEMA_STATEMENTS + the ensure*Schema guards in
// src/server/db/client.ts and the SQL migrations applied via `bun run db:migrate`.
//
// `drizzle-kit push`/`studio`/`migrate` introspect a database and rewrite it to
// match drizzle-schema.ts, which is intentionally incomplete (it omits sync_meta,
// sync_changelog, assistant_messages, uuid columns, etc). Pointing those commands
// at real data will DROP those tables/columns and destroy tasks. To make that
// impossible, drizzle-kit is locked to a disposable scratch database and is hard
// -blocked from ever opening the live home database.
const homeDbPath = path.resolve(path.join(os.homedir(), '.finish-em', 'todo.db'))

// Opt in to a specific scratch path with DRIZZLE_DB_PATH; otherwise use a throwaway.
// TODO_DB_PATH is deliberately ignored so an exported env (used to run the app)
// can never redirect drizzle-kit onto live data.
const requested = process.env.DRIZZLE_DB_PATH?.trim()
const dbPath = path.resolve(requested && requested.length > 0 ? requested : './data/drizzle-scratch.db')

if (dbPath === homeDbPath) {
  throw new Error(
    'Refusing to run drizzle-kit against the live database (~/.finish-em/todo.db). ' +
      'Schema is managed by `bun run db:migrate` + the ensure*Schema guards, not drizzle-kit. ' +
      'Use DRIZZLE_DB_PATH to point at a scratch DB if you need drizzle-kit for diffing.',
  )
}

export default defineConfig({
  schema: './src/server/db/drizzle-schema.ts',
  out: './src/server/db/drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbPath,
  },
  strict: true,
  verbose: true,
})
