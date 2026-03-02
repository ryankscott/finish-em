# finish-em

Todoist-style task manager built on TanStack Start.

## Runtime

- Bun runtime/tooling is required.

## Features

- Projects with inbox default
- Task priorities (`p1` to `p4`)
- Due dates and scheduled dates
- Recurring due dates (`daily`, `weekly`, `monthly`, `every weekday`, RRULE subset)
- Reminders and snoozing (`10m`, `1h`, `tomorrow 9am`, custom)
- Quick Add with keyboard shortcut (`c`) and NLP-style parsing
- Optional AI fallback for Quick Add via Vercel AI SDK (`ai` + `@ai-sdk/openai`)
- Daily and weekly text goals
- CLI-first interop with human-readable output by default and optional `--json`

## Local development

```bash
bun install
bun run dev
```

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

Optional Quick Add AI environment variables:

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL` (default: `https://api.openai.com/v1`)
- `OPENAI_MODEL` (default: `gpt-4o-mini`)

Optional for custom DB path:

- `TODO_DB_PATH`

Default DB paths when `TODO_DB_PATH` is not set:

- Bun source mode (`bun run ...`, `bun test`): `./data/todo.db`
- Compiled executable (`dist/finish-em`, `dist/finish-em-x64`): `~/.finish-em/todo.db`

## CLI usage

```bash
bun run tui -- --help
bun run tui -- task list
bun run tui -- task list --json
bun run tui -- project list
bun run tui -- settings get
```

## Build standalone executables

Build both macOS targets:

```bash
bun run build
```

Build one target at a time:

```bash
bun run tui:build      # bun-darwin-arm64 -> dist/finish-em
bun run tui:build:x64  # bun-darwin-x64   -> dist/finish-em-x64
```

## Breaking changes

- MCP server/runtime and MCP tool contracts were removed.
- HTTP/OpenAPI API surfaces were removed.
- In-app assistant panel, assistant settings, and assistant backend services were removed.

Migration:
- Replace MCP/HTTP integrations with CLI commands (add `--json` for machine-readable output).
- Use `bun run tui -- --help` and `bun run tui -- help <command>` to discover command mappings.
- Use external coding assistants (for example Claude Code or Cursor) instead of the in-app assistant panel.

## Testing

```bash
bun test
```

## Notes

Dependency installation is required before running checks (`bun install`).
