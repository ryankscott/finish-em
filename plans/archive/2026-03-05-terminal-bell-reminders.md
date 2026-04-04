# Terminal Bell Reminders

_Archived change: `2026-03-05-terminal-bell-reminders`_

## Summary

Users set reminders to be notified when a task is due, but the TUI today only shows reminder state on the selected task and has no audible or attention-grabbing signal when a reminder becomes due. In a terminal workflow, the standard way to get the user’s attention is the terminal bell (e.g. `\a` / ASCII BEL). Adding the bell when a reminder fires makes reminders effective even when the app is in the background or the user is focused elsewhere.

## Scope

- When a reminder becomes due (while the TUI is running), the app will ring the terminal bell so the user is notified.
- The TUI will periodically check for due reminders (or evaluate at a sensible interval) and trigger the bell when newly due reminders are found.
- Optional: show a toast when a reminder fires, in addition to the bell (keeps a visible record).
- No change to reminder creation, editing, or data model; only the “fire” behavior is extended.
- While the TUI is running, detect when any reminder has become due and ring the terminal bell.
- Optionally show a toast for each newly due reminder so the user has a visible record.
- Avoid re-ringing for the same reminder every poll (notify once per due reminder, or until dismissed/snoozed).
- Changing how reminders are created, edited, or stored.
- System-level or push notifications outside the terminal.
- Configurable bell sound or volume (use the terminal’s default).
- Impact: **TUI (App / hooks)**: New or extended hook or effect to poll `listDueReminders()` (or equivalent API) on an interval, compare with “last notified” state to avoid re-ringing, trigger `process.stdout.write('\x07')` (or Ink/stdout equivalent) and optionally push a toast.
- Impact: **Server/API**: Possibly expose “list due reminders” from the existing repo to the TUI if not already exposed; no schema or API contract changes required.
- Impact: **Dependencies**: None; terminal bell is standard and already available in Node/Bun.
- Related capabilities: `tui-reminder-bell`

## Notes

- 1. **Polling from the TUI** Use a `setInterval` (or equivalent) in the TUI to call `listDueReminders()` on a fixed interval (e.g. every 30–60 seconds). Alternatives: only check on focus/visibility (not reliably available in all terminals) or a separate background process (adds complexity). Polling keeps the implementation in-app and simple.
- **Poll interval vs responsiveness**: A 60s interval may delay notification by up to a minute. Mitigation: use a reasonable default (e.g. 60s) and document; we can shorten later if needed.
- **Multiple due at once**: Several reminders due in the same window will each trigger a bell and toast. Mitigation: acceptable for now; we could coalesce to a single “N reminders due” toast in a follow-up.
- **Bell in CI/headless**: If the TUI runs in a non-TTY or CI, the bell may do nothing or be ignored. Mitigation: no-op is acceptable; no need to detect TTY for v1.

## Implementation Phases

1. API for due reminders
   - [done] Add `listDueReminders: () => Promise<Reminder[]>` to `ApiClient` in `src/tui/api-client.ts`
   - [done] Implement `listDueReminders` in `src/tui/direct-api.ts` by calling `reminderRepo.listDueReminders()`
2. Polling and “already notified” state
   - [done] Add a hook (e.g. `useReminderBell`) that polls `api.listDueReminders()` on a fixed interval (e.g. 60s)
   - [done] In the hook, maintain a set of reminder IDs (or a stable key per reminder) that have already triggered the bell this session
   - [done] On each poll, compute newly due reminders (in API result but not in the set), then add them to the set after notifying
3. Bell and optional toast
   - [done] For each newly due reminder, write the terminal bell (`\x07`) to stdout (or the app’s stdout handle)
   - [done] Optionally push a toast per newly due reminder (e.g. “Reminder: <task title>”) using the existing toast API
   - [done] Wire the hook into `App.tsx` (or the root component that has access to `api` and `pushToast`)
4. Tests
   - [done] Unit test the hook (or core logic): given a list of due reminders and an “already notified” set, only newly due ones trigger bell and get added to the set
   - [done] Integration or unit test that `listDueReminders` is called on the API when the TUI runs (or that the hook invokes the provided API)
