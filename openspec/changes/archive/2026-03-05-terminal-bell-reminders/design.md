## Context

The TUI uses an in-process `ApiClient` (direct-api) that wraps `reminders.listDueReminders()`. That repo function already exists and returns reminders whose `COALESCE(snoozed_until, remind_at) <= now`. The TUI currently loads reminders only for the selected task (`listTaskReminders(taskId)`); there is no global “due now” check or notification. Terminal bell is `\x07` (BEL); writing it to stdout is the standard way to get attention in a terminal.

## Goals / Non-Goals

**Goals:**

- While the TUI is running, detect when any reminder has become due and ring the terminal bell.
- Optionally show a toast for each newly due reminder so the user has a visible record.
- Avoid re-ringing for the same reminder every poll (notify once per due reminder, or until dismissed/snoozed).

**Non-Goals:**

- Changing how reminders are created, edited, or stored.
- System-level or push notifications outside the terminal.
- Configurable bell sound or volume (use the terminal’s default).

## Decisions

1. **Polling from the TUI**  
   Use a `setInterval` (or equivalent) in the TUI to call `listDueReminders()` on a fixed interval (e.g. every 30–60 seconds). Alternatives: only check on focus/visibility (not reliably available in all terminals) or a separate background process (adds complexity). Polling keeps the implementation in-app and simple.

2. **Expose `listDueReminders` on ApiClient**  
   Add `listDueReminders: () => Promise<Reminder[]>` to the TUI’s `ApiClient` and implement it in `direct-api` via `reminderRepo.listDueReminders()`. This keeps reminder logic in the server layer and makes the TUI testable with a mock API.

3. **“Already notified” set**  
   Keep a set (or similar) of reminder IDs (or remind_at + task_id) that have already triggered the bell this session. On each poll, compute newly due reminders (in `listDueReminders()` but not in the set), ring the bell and optionally push toasts for those, then add them to the set. When a reminder is snoozed or deleted, remove it from the set so a future due time can ring again. This avoids repeated bells for the same reminder.

4. **Bell via stdout**  
   Use `process.stdout.write('\x07')` (or the Ink/stdout handle the app uses) so the bell goes to the user’s terminal. No new dependencies.

5. **Toast per due reminder**  
   For each newly due reminder, push one toast (e.g. “Reminder: <task title>”) in addition to the bell. Improves visibility without changing data model or API.

## Risks / Trade-offs

- **Poll interval vs responsiveness**: A 60s interval may delay notification by up to a minute. Mitigation: use a reasonable default (e.g. 60s) and document; we can shorten later if needed.
- **Multiple due at once**: Several reminders due in the same window will each trigger a bell and toast. Mitigation: acceptable for now; we could coalesce to a single “N reminders due” toast in a follow-up.
- **Bell in CI/headless**: If the TUI runs in a non-TTY or CI, the bell may do nothing or be ignored. Mitigation: no-op is acceptable; no need to detect TTY for v1.
