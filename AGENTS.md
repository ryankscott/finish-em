# AGENTS.md

Guidelines for AI agents working in this repository.

## Project Overview

`finish-em` is a Todoist-style task manager — a terminal UI (TUI) built with [Ink](https://github.com/vadimdemedes/ink) (React for the terminal). The stack is:

- **Runtime**: Bun
- **TUI**: Ink + React (TypeScript/TSX)
- **Database**: SQLite via `bun:sqlite`, schema managed with Drizzle ORM
- **Testing**: `bun test`
- **Linting/Formatting**: Biome (`bun run check`)

## Repository Structure

```
src/
  tui/         # Terminal UI components, hooks, and utilities
  server/      # DB client, repos, services, types
  cli.ts       # CLI entrypoint
data/          # Local SQLite database (todo.db) — not committed
plans/         # Planning docs, change notes, and capability specs
```

## Development Commands

```bash
bun install          # Install dependencies
bun run dev          # Run TUI in watch mode
bun test             # Run all tests
bun run check        # Lint + format check (Biome)
bun run db:migrate   # Apply SQL migrations from src/server/db/migrations/
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `TODO_DB_PATH` | `./data/todo.db` (dev) / `~/.finish-em/todo.db` (compiled) | Path to the SQLite database |
| `OPENAI_API_KEY` | — | Enables AI fallback in Quick Add |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Custom OpenAI-compatible base URL |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model used for AI Quick Add |

## Testing

### Unit and Integration Tests

```bash
bun test
```

Tests use `bun:test`. Integration tests set `TODO_DB_PATH` to a temp file and call `resetDbForTests()` from `src/server/db/client.ts` in `beforeEach`/`afterEach` to isolate each test's database.

### Verifying TUI Changes Manually

When making changes to TUI components or behavior, verify against a test database so you don't affect real data.

```bash
# Launch TUI against a dedicated test DB
TODO_DB_PATH=/tmp/finish-em-test.db bun run tui

# When done, clear the env var (or just close the shell)
unset TODO_DB_PATH
```

The test DB is auto-created and migrated on first run. You can delete it at any time to start fresh:

```bash
rm -f /tmp/finish-em-test.db
```

Always restore `TODO_DB_PATH` to its original value (or unset it) after manual TUI verification so you don't accidentally modify the production database.

## Code Conventions

- **Functional code and hooks** — prefer pure functions and custom React hooks; avoid class components.
- **Unit tests required** — every non-trivial function should have a corresponding test file.
- **No obvious comments** — comments should explain non-obvious intent, not narrate the code.
- **TypeScript strict** — do not use `any` without a clear justification.
- **Biome** for formatting and linting; run `bun run check` before committing.

## Web Development

When building or modifying the web interface (if applicable):

- **Prefer shadcn/ui components** — use shadcn/ui components where possible before building custom ones. Install via the CLI (`npx shadcn add <component>`) and follow the project's established component patterns.
- **Radix UI primitives** — shadcn components are built on Radix UI; extend or customize them rather than replacing accessibility or behavior from scratch.
- **Tailwind CSS for styling** — use Tailwind utility classes for layout and styling; avoid inline styles or CSS-in-JS unless there's a specific justification.
- **Consistent design tokens** — stick to the existing color palette, spacing scale, and typography defined in the project configuration (e.g., `tailwind.config.ts` or CSS variables).

## Database Safety

- **NEVER run `drizzle-kit` against the live database.** Schema is owned by `SCHEMA_STATEMENTS` + the `ensure*Schema` guards in `client.ts` and the SQL migrations in `src/server/db/migrations/`. `drizzle-schema.ts` is reference-only and intentionally incomplete; `drizzle-kit push`/`studio`/`migrate` would drop the tables/columns it omits (this is what once wiped the `tasks` table). `drizzle.config.ts` defaults to a disposable scratch DB and hard-throws if pointed at `~/.finish-em/todo.db`. Use `DRIZZLE_DB_PATH` for an explicit scratch path if you need drizzle-kit for diffing.
- **Automatic backups.** `getDb()` takes a consistent `VACUUM INTO` snapshot of an existing DB before any schema work, once per day, rotated to the last 14, in `<dbDir>/backups/` (e.g. `~/.finish-em/backups/`). Disable with `TODO_DB_NO_BACKUP=1`; tests and temp DBs are skipped.
- **Manual backup / restore.** `bun run db:backup` writes a timestamped `manual-*.db` snapshot. To restore: stop the app/server (release the DB), copy a backup over `~/.finish-em/todo.db`, delete the `-wal`/`-shm` sidecars, relaunch. `scripts/recover-from-sync.ts` can rebuild tasks/goals from the iCloud sync changeset history if a snapshot is unavailable.

## Database Migrations

SQL migrations live in `src/server/db/migrations/` and are applied with `bun run db:migrate`. The `getDb()` function in `src/server/db/client.ts` also runs schema guards on startup for column additions (soft deletes, subtasks, project enhancements).

When adding a new migration:
1. Create a new numbered file: `src/server/db/migrations/00N_description.sql`
2. Add the corresponding schema guard in `client.ts` if needed for backward compatibility
3. Update the Drizzle schema in `src/server/db/drizzle-schema.ts`

## Planning Docs

Planning notes live under `plans/`.

- Use `plans/<topic>.md` for active plans and capability notes.
- Use `plans/archive/<topic>.md` for completed or superseded plan history.
- Prefer a single concise document in the style of `plans/blocked-tasks.md`.
