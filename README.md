# finish-em

Todoist-style task manager built on TanStack Start.

## Features

- Projects with inbox default
- Task priorities (`p1` to `p4`)
- Due dates and scheduled dates
- Recurring due dates (`daily`, `weekly`, `monthly`, `every weekday`, RRULE subset)
- Reminders and snoozing (`10m`, `1h`, `tomorrow 9am`, custom)
- Quick Add with keyboard shortcut and NLP-style parsing
- Optional AI fallback for Quick Add via Vercel AI SDK (`ai` + `@ai-sdk/openai`)
- Daily and weekly text goals
- OpenAPI 3.1 spec at `/api/openapi.json`

## Local development

```bash
pnpm install
pnpm dev
```

## Migration tooling

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:drizzle-migrate
pnpm db:studio
```

`drizzle.config.ts` points to `src/server/db/drizzle-schema.ts`.
Generated Drizzle migrations are written to `src/server/db/drizzle`.
`db:migrate` applies idempotent SQL migrations from `src/server/db/migrations`.

## Environment variables

Optional for AI fallback:

- `OPENAI_BASE_URL` (default: `https://api.openai.com/v1`)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default: `gpt-4o-mini`)

Optional for custom DB path:

- `TODO_DB_PATH` (default: `./data/todo.db`)

## API endpoints

- `GET/POST /api/projects`
- `PATCH/DELETE /api/projects/:projectId`
- `GET/POST /api/tasks`
- `PATCH/DELETE /api/tasks/:taskId`
- `POST /api/tasks/:taskId/complete`
- `POST /api/tasks/:taskId/uncomplete`
- `GET/POST /api/tasks/:taskId/reminders`
- `PATCH/DELETE /api/reminders/:reminderId`
- `POST /api/reminders/:reminderId/snooze`
- `GET/POST /api/goals`
- `PATCH/DELETE /api/goals/:goalId`
- `POST /api/quick-add/parse`
- `POST /api/quick-add/create`
- `GET /api/settings`
- `PATCH /api/settings`
- `GET /api/openapi.json`

## Testing

```bash
pnpm test
```

## Notes

Dependency installation is required before running checks (`pnpm install`).
