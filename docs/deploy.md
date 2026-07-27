# Deploying finish-em to Cloudflare

Everything below needs your Cloudflare account, so it is not something the
migration could do for itself. Run these once, in order.

Deploying puts your task data on the public internet behind a single password.
Do step 4 (the secret) before step 6 (the data), not after.

## 1. Authenticate

```bash
bunx wrangler login
```

## 2. Create the D1 database

```bash
bunx wrangler d1 create finish-em
```

Copy the `database_id` it prints into `wrangler.toml`, replacing
`PLACEHOLDER_RUN_WRANGLER_D1_CREATE`. Nothing will deploy until you do.

## 3. Apply the schema

```bash
bun run d1:migrate       # --remote
```

Both migrations should report ✅. `0002` seeds the settings row and an Inbox
project; step 6 replaces them with your real data.

## 4. Set the password

```bash
bunx wrangler secret put FINISH_EM_AUTH_SECRET
```

Paste a long random string, for example from `openssl rand -hex 32`. This is
the password you type into the app, so a passphrase you can type on a phone
keyboard is a reasonable trade against a random hex string.

**Leaving this unset leaves the API open to anyone with the URL.** The gate is
inert without it, deliberately, so local dev and tests stay unauthenticated.

## 5. Deploy

```bash
bun run worker:deploy    # builds dist/web, then wrangler deploy
```

Note the `*.workers.dev` URL it prints.

Sanity check before you send any data:

```bash
curl -i https://<your-url>/api/tasks     # expect 401
curl -s  https://<your-url>/api/health   # expect {"ok":true}
```

## 6. Migrate your data

```bash
# Quit the local server and desktop app first so nothing is mid-write.
bun run db:backup                        # VACUUM INTO snapshot, just in case
bun run db:export > /tmp/finish-em-data.sql
bunx wrangler d1 execute finish-em --remote --file=/tmp/finish-em-data.sql
```

`db:export` writes explicit column names on every INSERT. That is not
cosmetic: `migrations/0001_init.sql` reorders columns relative to the old
ALTER-TABLE-appended layout, so the positional inserts that
`sqlite3 .mode insert` produces would write values into the wrong columns.

The export begins with `DELETE FROM` for each table, so it replaces the seeded
rows rather than colliding with them. It is safe to re-run.

Verify the counts match your local database:

```bash
TOKEN=$(printf '%s' '<your secret>' | shasum -a 256 | cut -d' ' -f1)
curl -s -H "Authorization: Bearer $TOKEN" https://<your-url>/api/tasks | jq length
sqlite3 ~/.finish-em/todo.db "SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL AND someday = 0;"
```

Then rename the local database so nothing can silently keep writing to it:

```bash
mv ~/.finish-em/todo.db ~/.finish-em/todo.db.pre-cloud
```

## 7. Install on the iPhone

Safari → your URL → Share → **Add to Home Screen**. Log in once; the session
cookie lasts 400 days.

Worth checking on the real device, because none of it can be verified from a
desktop browser:

- the icon is the finish-em check, not a screenshot of the page (if it is a
  screenshot, the manifest or apple-touch-icon failed to load)
- launching from the home screen shows no Safari chrome
- no white bar under the notch
- tapping the Quick Add field does not zoom the page
- the header back arrow escapes every detail route

To read the console of the installed app: iPhone Settings → Safari → Advanced →
Web Inspector, then Mac Safari → Develop → your iPhone.

## 8. Point the other clients at it

**macOS app** — set `FINISH_EM_REMOTE_URL` and it stops spawning a local
server:

```bash
FINISH_EM_REMOTE_URL=https://<your-url> open -a finish-em
```

Unset, it still runs fully locally against `~/.finish-em/todo.db`. That mode
reads a *different database* now, which is why step 6 renames the local file.

**Raycast** — open the extension's preferences and set:

- **API URL** — `https://<your-url>`
- **Auth Token** — `printf '%s' '<your secret>' | shasum -a 256 | cut -d' ' -f1`

The token is the sha256 of the secret, not the secret itself. Raycast does not
read your shell profile, which is why these are preferences rather than
environment variables.

## Operational notes

**Backups** are D1 Time Travel: 30-day point-in-time restore, managed by
Cloudflare, no configuration. This replaced the daily `VACUUM INTO` snapshot,
which cannot work on D1.

```bash
bunx wrangler d1 time-travel info finish-em
bunx wrangler d1 time-travel restore finish-em --timestamp=<unix-seconds>
```

**Rotating the password** invalidates every existing session cookie. The app
handles that gracefully: the next request 401s and the login screen reappears.

```bash
bunx wrangler secret put FINISH_EM_AUTH_SECRET
```

**The calendar cron** runs every 15 minutes. Check it with `bunx wrangler tail`
and look for `calendar sync: cached N event instances`.

**Cost** should be zero. D1's free tier is 5M reads and 100k writes per day
against single-user traffic. The limit that could realistically bite is D1's
per-request subrequest budget, not the quota, which is why the N+1 query loops
were batched.
