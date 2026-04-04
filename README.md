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
bun run cli:build
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
