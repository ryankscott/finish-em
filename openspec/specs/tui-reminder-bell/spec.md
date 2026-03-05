## Purpose

Define terminal-bell and optional toast behavior when reminders become due in the TUI.

## Requirements

### Requirement: Due reminders trigger terminal bell

When the TUI is running, the system SHALL periodically determine which reminders are due (using the same definition as the server: `status` in `pending` or `snoozed` and `COALESCE(snoozed_until, remind_at) <= now`). For each reminder that has become due and has not yet been notified this session, the system SHALL ring the terminal bell (ASCII BEL, `\x07`) so the user is notified even if the app is in the background or they are focused elsewhere.

#### Scenario: First time a reminder becomes due

- **WHEN** the polling check runs and finds one or more due reminders that have not been notified this session
- **THEN** the system SHALL write the terminal bell character to stdout (or the active terminal stream) once per newly due reminder (or once per batch, per implementation)
- **AND** each such reminder SHALL be recorded as "notified" so the bell is not repeated for the same due time on subsequent polls

#### Scenario: Same due reminder on next poll

- **WHEN** a reminder has already triggered the bell in this session and is still due on the next poll
- **THEN** the system SHALL NOT ring the bell again for that reminder until it is snoozed (and becomes due again) or deleted

#### Scenario: Reminder snoozed then due again

- **WHEN** a user snoozes a reminder and later the snoozed-until time is reached
- **THEN** the system SHALL treat it as newly due and SHALL ring the bell (and optionally show a toast) again for that reminder

### Requirement: Optional toast when reminder fires

The system MAY show an in-app toast when a reminder becomes due, in addition to ringing the terminal bell, so the user has a visible record (e.g. "Reminder: <task title>").

#### Scenario: Toast shown for newly due reminder

- **WHEN** the system rings the bell for a newly due reminder and the implementation supports toasts
- **THEN** the system MAY push a toast with a short message identifying the reminder or task so the user can see what fired

### Requirement: API for listing due reminders

The TUI SHALL have access to a function that returns all reminders currently due (same semantics as the server's `listDueReminders()`). This MAY be exposed as `listDueReminders()` on the existing ApiClient used by the TUI.

#### Scenario: TUI can fetch due reminders

- **WHEN** the TUI (or a hook used by it) calls the API to list due reminders
- **THEN** the API SHALL return all reminders that are pending or snoozed and whose effective due time (`COALESCE(snoozed_until, remind_at)`) is less than or equal to the current time
- **AND** the result SHALL be ordered by that effective time (e.g. earliest first)
