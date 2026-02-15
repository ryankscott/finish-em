import { defineConfig } from 'drizzle-kit'

const dbPath = process.env.TODO_DB_PATH ?? './data/todo.db'

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
