## Why

Users set reminders to be notified when a task is due, but the TUI today only shows reminder state on the selected task and has no audible or attention-grabbing signal when a reminder becomes due. In a terminal workflow, the standard way to get the user’s attention is the terminal bell (e.g. `\a` / ASCII BEL). Adding the bell when a reminder fires makes reminders effective even when the app is in the background or the user is focused elsewhere.

## What Changes

- When a reminder becomes due (while the TUI is running), the app will ring the terminal bell so the user is notified.
- The TUI will periodically check for due reminders (or evaluate at a sensible interval) and trigger the bell when newly due reminders are found.
- Optional: show a toast when a reminder fires, in addition to the bell (keeps a visible record).
- No change to reminder creation, editing, or data model; only the “fire” behavior is extended.

## Capabilities

### New Capabilities

- `tui-reminder-bell`: When the TUI is running, detect reminders that have become due and ring the terminal bell (and optionally show a toast). Covers polling/check interval, bell triggering, and optional in-app notification.

### Modified Capabilities

- (none)

## Impact

- **TUI (App / hooks)**: New or extended hook or effect to poll `listDueReminders()` (or equivalent API) on an interval, compare with “last notified” state to avoid re-ringing, trigger `process.stdout.write('\x07')` (or Ink/stdout equivalent) and optionally push a toast.
- **Server/API**: Possibly expose “list due reminders” from the existing repo to the TUI if not already exposed; no schema or API contract changes required.
- **Dependencies**: None; terminal bell is standard and already available in Node/Bun.
