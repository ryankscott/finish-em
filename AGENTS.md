# AGENTS.md

Guidelines for AI agents working in this repository.

## Project Overview

`finish-em` is a personal task manager: a React web app deployed as a
Cloudflare Worker with D1, installable as an iPhone PWA. The stack is:

- **Deployed runtime**: Cloudflare Workers + D1
- **Local runtime**: Bun + `bun:sqlite`
- **Web**: React 19, Vite, Tailwind v4, shadcn/Radix, TanStack Router + Query
- **API**: Hono (`@hono/zod-openapi`)
- **Testing**: `bun test`
- **Linting/Formatting**: Biome (`bun run check`)

The TUI was removed; do not add one back without reading the git history first.

## Repository Structure

```
migrations/    # D1 schema (the single source of truth)
src/
  server/      # db seam + adapters, repos, services, HTTP app, worker entry
  web/         # React app (Vite root)
  shared/      # ApiClient contract + HTTP implementation
  lib/         # pure helpers (parsing, datetime)
  components/  # shadcn primitives
desktop/       # Swift + WKWebView macOS wrapper
raycast/       # Raycast extension (separate npm project)
plans/         # Planning docs, change notes, and capability specs
```

## Development Commands

```bash
bun install               # Install dependencies
bun run dev               # Bun API server + Vite web dev server (bun:sqlite)
bun run worker:dev        # The real Worker on local D1 (workerd via wrangler)
bun test                  # Run all tests
bun run check             # Lint + format check (Biome)
bun run d1:migrate:local  # Apply migrations to the local D1
bun run db:export         # Export local SQLite as D1 INSERT statements
bun run worker:deploy     # Build the web UI and deploy the Worker
```

## Two Runtimes

The deployed target is a Cloudflare Worker (`src/server/worker.ts`, D1). The Bun
server (`src/server/http/main.ts`, bun:sqlite) is kept for fast local dev and
because the test suite runs on `bun test` rather than in workerd.

Both share everything above the database via the `Db` seam in
`src/server/db/types.ts`:

```
app.ts + repos/ + services/   runtime-agnostic, no bun:sqlite / node builtins
  ├── db/client.ts            bun:sqlite  (local dev, tests)
  └── db/d1.ts                D1          (deployed Worker)
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `TODO_DB_PATH` | `~/.finish-em/todo.db` | Local SQLite path (Bun server only; the Worker uses the D1 binding) |
| `FINISH_EM_AUTH_SECRET` | — | Shared password. **Unset leaves the API open** — that is what keeps local dev and tests unauthenticated. Set in production with `wrangler secret put`. |
| `PORT` / `HOST` | `5717` / `127.0.0.1` | Bun server only |
| `FINISH_EM_REMOTE_URL` | — | macOS app: load the deployed Worker instead of spawning a local server |

## Testing

### Unit and Integration Tests

```bash
bun test
```

Tests use `bun:test`. Integration tests set `TODO_DB_PATH` to a temp file and call `resetDbForTests()` from `src/server/db/client.ts` in `beforeEach`/`afterEach` to isolate each test's database.

### Verifying Changes Manually

Never point a manual run at `~/.finish-em/todo.db`. Use an isolated database:

```bash
TODO_DB_PATH=/tmp/finish-em-test.db PORT=5799 bun src/server/http/main.ts
```

To exercise the real deployed stack (workerd + D1) rather than the Bun server:

```bash
bun run d1:migrate:local
bun run worker:dev        # serves dist/web, so run `bun run web:build` first
```

`wrangler dev --local` keeps its D1 state in `.wrangler/`, entirely separate
from `~/.finish-em/todo.db`.

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

- **Schema is owned by `migrations/`.** Drizzle has been removed; there is no `drizzle-kit` in this project any more. Do not reintroduce a schema-diffing tool that points at real data.
- **Production backups are D1 Time Travel** — 30-day point-in-time restore, managed by Cloudflare, no code. This replaced the daily `VACUUM INTO` snapshot that `getDb()` used to take, which cannot work on D1.
- **Manual local backup.** `bun run db:backup` writes a timestamped `manual-*.db` snapshot of the local SQLite file. To restore: stop the server (release the DB), copy a backup over `~/.finish-em/todo.db`, delete the `-wal`/`-shm` sidecars, relaunch.

## Database Migrations

Schema lives in `migrations/` as Cloudflare D1 migration files, applied with
`wrangler d1 migrations apply finish-em --local|--remote`.

`migrations/0001_init.sql` is the flattened current-state schema. It replaced the
old `src/server/db/migrations/` files *and* the 14 `ensure*Schema` guards that
used to run on every `getDb()`. Those guards decided what to add by inspecting
`PRAGMA table_info` and `sqlite_master`, neither of which D1 supports, so
schema changes are now ordered run-once files with no introspection.

When adding a new migration:
1. Create `migrations/000N_description.sql`
2. Apply it locally, then remotely. Do not edit an already-applied file.

Deliberately dropped when flattening (see the header comment in `0001_init.sql`
for the reasoning): `sync_meta`, `sync_changelog`, `assistant_messages`,
`schema_migrations`, `settings.ai_*`, and `tasks.blocked_at`/`blocked_reason`.

## Planning Docs

Planning notes live under `plans/`.

- Use `plans/<topic>.md` for active plans and capability notes.
- Use `plans/archive/<topic>.md` for completed or superseded plan history.
- Prefer a single concise document in the style of `plans/blocked-tasks.md`.
