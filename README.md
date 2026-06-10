# finish-em

Todoist-style task manager — a terminal UI (TUI) built with Ink.

## Features

- Projects with inbox default
- Task priorities (`p1` to `p4`)
- Due dates and scheduled dates
- Recurring due dates (`daily`, `weekly`, `monthly`, `every weekday`, RRULE subset)
- Reminders and snoozing (`10m`, `1h`, `tomorrow 9am`, custom)
- Quick Add with keyboard shortcut (`c`) and NLP-style parsing
- Daily and weekly text goals

## Local development

```bash
bun install
bun run dev
```

## Desktop app

A keyboard-centric web UI (Vite + React + Tailwind + TanStack Router/Query) served by a local Bun HTTP server that wraps the same repository layer as the TUI/CLI. Both share the SQLite database at `~/.finish-em/todo.db` (WAL mode, safe to run together).

```bash
bun run server:dev    # HTTP API on http://127.0.0.1:5717 (docs at /api/docs)
bun run web:dev       # Vite dev server with /api proxy
bun run desktop:app   # build "dist/finish-em Desktop.app" (server binary + web UI)
bun run openapi:write # regenerate openapi.json from the route schemas
```

The `.app` launcher starts the bundled server (if not already running) and opens the UI in a Chrome/Edge/Brave `--app` window, falling back to the default browser. Press `?` in the app for keyboard shortcuts.

Adding a feature so all three surfaces stay in sync: add the behavior to `src/server/repos/`, add the method to the `ApiClient` type in `src/shared/api-client.ts`, implement it in both `src/tui/direct-api.ts` and `src/shared/http-api.ts` plus a route in `src/server/http/app.ts` (the contract test in `src/server/http/contract.integration.test.ts` enforces parity), then wire the TUI keybinding/CLI subcommand and web UI. Quick-entry token parsing is shared from `src/lib/parsing/`.

## Global command setup

Use one of the following flows to run `finish-em` from anywhere.

### Developer flow (Bun link)

```bash
bun run cli:link
```

Verify:

```bash
which finish-em
finish-em
```

Uninstall linked command:

```bash
bun unlink
```

### Standalone binary flow

Build and install a symlink into `~/.local/bin`:

```bash
bun run build
bun run cli:install
```

Verify:

```bash
which finish-em
finish-em
```

Uninstall standalone command:

```bash
bun run cli:uninstall
```

### macOS app flow

Build a launcher app that opens Terminal.app and runs the compiled TUI binary:

```bash
bun run app:build
bun run app:install
```

This installs `finish-em.app` into `~/Applications` by default. To install somewhere else:

```bash
bun run app:install -- /Applications
```

The app bundle is built at `dist/finish-em.app` and uses `public/icon.svg` to generate its launcher icon.

## Migration tooling

```bash
bun run db:generate
bun run db:migrate
bun run db:drizzle-migrate
bun run db:studio
```

`drizzle.config.ts` points to `src/server/db/drizzle-schema.ts`.
Generated Drizzle migrations are written to `src/server/db/drizzle`.
`db:migrate` applies idempotent SQL migrations from `src/server/db/migrations`.

## Environment variables

Optional for AI fallback in Quick Add:

- `OPENAI_API_KEY` (required to enable AI fallback)
- `OPENAI_BASE_URL` (default: `https://api.openai.com/v1`)
- `OPENAI_MODEL` (default: `gpt-4o-mini`)

Optional for custom DB path:

- `TODO_DB_PATH` (default: `./data/todo.db`)

## Testing

```bash
bun test
```

## Notes

Dependency installation is required before running checks (`bun install`).
