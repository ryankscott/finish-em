# finish-em

Personal task manager. React web app on Cloudflare Workers + D1, installable as
an iPhone PWA, with a thin macOS wrapper and a Raycast extension.

## Features

- Projects with inbox default
- Task priorities (`p1` to `p4`)
- Due dates and scheduled dates
- Recurring due dates (`daily`, `weekly`, `monthly`, `every weekday`, RRULE subset)
- Reminders and snoozing (`10m`, `1h`, `tomorrow 9am`, custom)
- Quick Add with NLP-style token parsing
- Daily and weekly text goals
- Read-only ICS calendar sync, with tasks pinnable to a meeting's start time

## Architecture

The deployed target is a Cloudflare Worker (`src/server/worker.ts`) backed by
D1. A Bun server (`src/server/http/main.ts`) backed by `bun:sqlite` is kept for
local development, and because the test suite runs under `bun test` rather than
in workerd.

Both share everything above the database through the `Db` seam in
`src/server/db/types.ts`:

```
app.ts + repos/ + services/   runtime-agnostic; no bun:sqlite, no node builtins
  |-- db/client.ts            bun:sqlite  (local dev, tests)
  \-- db/d1.ts                D1          (deployed Worker)
```

Adding a feature: add the behavior to `src/server/repos/` (every repo function
takes a `Db` first), add the method to the `ApiClient` type in
`src/shared/api-client.ts`, add a route in `src/server/http/app.ts`, then wire
the web UI. `src/server/http/contract.integration.test.ts` drives the whole API
end to end and is the fastest way to catch a break. Quick-entry token parsing is
shared from `src/lib/parsing/`.

## Local development

```bash
bun install
bun run dev               # Bun API server + Vite web dev server
bun run worker:dev        # the real Worker on local D1 (workerd via wrangler)
bun run d1:migrate:local  # apply migrations to the local D1
bun test
bun run check             # Biome lint + format
bun run openapi:write     # regenerate openapi.json from the route schemas
```

API docs are served at `/api/docs` (behind the auth gate when a secret is set).

## Deploying

See [docs/deploy.md](docs/deploy.md). It needs your Cloudflare account.

```bash
bun run worker:deploy     # build the web UI, then wrangler deploy
```

## Auth

A single shared password, off by default. `FINISH_EM_AUTH_SECRET` unset leaves
the API open, which is what keeps local dev and tests unauthenticated; set it in
production with `wrangler secret put`. The session token is `sha256(secret)`,
sent as an `fe_session` cookie by browsers or an `Authorization: Bearer` header
by scripts.

## macOS app

```bash
bun run desktop:app       # builds dist/finish-em.app (Swift + WKWebView)
```

Set `FINISH_EM_REMOTE_URL` to point it at the deployed Worker; unset, it spawns
a local server and uses `~/.finish-em/todo.db`. Note those are two different
databases -- there is no sync between them.

## Migration tooling

Schema lives in `migrations/` as Cloudflare D1 migration files, applied with
wrangler:

```bash
wrangler d1 migrations apply finish-em --local   # local dev database
wrangler d1 migrations apply finish-em --remote  # production
```

`migrations/0001_init.sql` is the flattened current-state schema. It replaces
both the old `src/server/db/migrations/` files and the `ensure*Schema` guards
that used to run on every `getDb()`, since those relied on `PRAGMA table_info`
and `sqlite_master` introspection that D1 does not support.

To export the local SQLite database as D1-compatible INSERT statements:

```bash
bun run db:export > data.sql
```

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `FINISH_EM_AUTH_SECRET` | Worker secret / Bun server env | Shared password. Unset leaves the API open. |
| `TODO_DB_PATH` | Bun server only | Local SQLite path (default `~/.finish-em/todo.db`). The Worker uses the D1 binding. |
| `PORT`, `HOST` | Bun server only | Defaults `5717` / `127.0.0.1`. |
| `FINISH_EM_REMOTE_URL` | macOS app | Load the deployed Worker instead of spawning a local server. |

## Testing

```bash
bun test
```

## Notes

Dependency installation is required before running checks (`bun install`).
