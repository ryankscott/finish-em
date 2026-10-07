# Reliable reminders

Goal: a reminder is never missed. It is delivered by the OS even when the app is
closed, and it stays visible as "missed" until the user acts on it.

## Current gaps (2026-10-08)

1. Delivery depends on `ReminderWatcher` polling while a window is open. Closing
   the macOS window quits the app.
2. WKWebView has no web `Notification` API and the Swift shell has no
   `UNUserNotificationCenter` bridge, so macOS gets only an in-app toast.
3. No code sets `status = 'fired'`. The "already notified" set is in memory, so
   every reload toasts every past reminder again.
4. `listDueRemindersWithTitles` does not exclude deleted or completed tasks.
5. Snooze presets use UTC hours ("this morning" = 05:00 US Eastern).
6. No service worker, so the iPhone PWA gets nothing.

## What comparable apps do

| Behaviour | Apple Reminders | Things 3 | Todoist | TickTick | finish-em target |
|---|---|---|---|---|---|
| Delivered when app is closed | Yes (OS) | Yes (OS) | Yes (push) | Yes (push) | Yes: local notifications on macOS, Web Push on iPhone |
| Actions on the notification | Complete, snooze | Snooze | Yes | Complete, snooze | Complete, Snooze 15m / 1h / tomorrow |
| Missed reminder stays visible | App icon badge, overdue list | Item shows in Today | Overdue section | Badge, overdue | Badge + "Missed" banner until acted on |
| Repeat until acknowledged | No | No | No | Yes ("annoying alert", paid) | Optional, per reminder |
| More than one reminder per task | Yes | No | Yes (paid) | Yes | Later phase |
| Relative to due time | Yes (early reminder) | No | Yes | Yes | Later phase |

## Reminder lifecycle

`pending` -> (time passes, delivered) -> `fired` -> user acts:
- **Done**: completes the task, reminder becomes `dismissed`
- **Snooze**: `snoozed`, `snoozed_until` set, back to `pending` behaviour
- **Dismiss**: `dismissed`, task untouched

A `fired` reminder is "missed" until acted on. Completing or deleting the task
dismisses its reminder.

## Phases

1. **Server correctness** (about 2 hours). Migration `0005_reminder_fired_at.sql`
   adds `fired_at`. Endpoints: `POST /api/reminders/:id/fire` (idempotent),
   `/dismiss`, `/snooze` already exists. `due` and new `missed` queries exclude
   deleted and completed tasks. Task complete/delete dismisses the reminder.
   Snooze presets resolve in `settings.timezone`. Tests for each.
2. **Missed-reminder UI** (about 2 hours). Sidebar count badge on Reminders,
   bell on task rows, a persistent banner listing missed reminders with Done /
   Snooze / Dismiss, a toast that stays until closed, and `navigator.setAppBadge`
   plus a title count.
3. **macOS native delivery** (about 3 hours). Page posts the upcoming reminder
   list to Swift. Swift schedules `UNUserNotificationCenter` calendar triggers
   for the next 7 days with Complete / Snooze actions that call the API. These
   fire even when the app is quit. Dock badge for missed count. Closing the
   window hides it instead of quitting.
4. **iPhone Web Push** (about 4 hours). Service worker, VAPID keys as Worker
   secrets, `push_subscriptions` table, an "Enable notifications" button
   (iOS requires a user gesture). Cron changes from every 15 minutes to every
   minute: send push for due reminders, mark them `fired`.
5. **Later**: repeat-until-acknowledged, multiple reminders per task, reminders
   relative to the due time.
