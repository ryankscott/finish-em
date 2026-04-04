# TUI Reminder Bell

## Summary

Define terminal-bell and optional toast behavior when reminders become due in the TUI.

## Current Rules

- Due reminders trigger terminal bell: When the TUI is running, the system SHALL periodically determine which reminders are due (using the same definition as the server: `status` in `pending` or `snoozed` and `COALESCE(snoozed_until, remind_at) <= now`). For each reminder that has become due and has not yet been notified this session, the system SHALL ring the terminal bell (ASCII BEL, `\x07`) so the user is notified even if the app is in the background or they are focused elsewhere.
- Optional toast when reminder fires: The system MAY show an in-app toast when a reminder becomes due, in addition to ringing the terminal bell, so the user has a visible record (e.g. "Reminder: <task title>").
- API for listing due reminders: The TUI SHALL have access to a function that returns all reminders currently due (same semantics as the server's `listDueReminders()`). This MAY be exposed as `listDueReminders()` on the existing ApiClient used by the TUI.

## Related History

- `2026-03-05-terminal-bell-reminders` -> `archive/2026-03-05-terminal-bell-reminders.md`
