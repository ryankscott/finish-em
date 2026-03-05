## Why

Task reminders currently require ISO timestamps and provide minimal in-list visibility, which makes reminder setup and verification slower than task management should be. Supporting natural language and due-relative reminders with clear task-level indicators improves capture speed and confidence.

## What Changes

- Add smart reminder input parsing for TUI reminder creation (`m`) to accept natural language phrases like `in ten minutes` and `at 6pm`.
- Add due-relative reminder phrases like `1 day before due` and `30 mins before due` that resolve against the selected task’s due date.
- Define deterministic reminder parsing as primary strategy, with optional LLM fallback only when deterministic parsing cannot resolve a valid timestamp.
- Standardize local-time behavior for reminder resolution and display:
  - `at 6pm` resolves to today if still in the future, otherwise tomorrow at 6pm.
  - Reminder display in task UI uses the user’s local timezone.
- Add reminder indicators in task rows:
  - Collapsed row: bell icon only.
  - Expanded row: bell icon + resolved reminder timestamp text.

## Capabilities

### New Capabilities
- `tui-smart-reminder-input`: Parse and resolve natural language and due-relative reminder phrases into reminder timestamps.
- `tui-task-reminder-indicators`: Show reminder presence and timing directly on task rows in collapsed and expanded states.

### Modified Capabilities
- None.

## Impact

- Affected code:
  - TUI reminder submit flow in `src/tui/App.tsx`.
  - Reminder parsing/resolution services in `src/server/services/` and potentially `src/server/repos/reminders.ts` call sites.
  - Task row rendering in `src/tui/TaskPanel.tsx` (and parity surfaces if needed).
  - Reminder and task tests in TUI/server layers.
- Affected behavior:
  - Users can create reminders with human-friendly phrases, including due-relative offsets.
  - Reminder intent and schedule are visible in task rows without opening separate reminder flows.
- Dependencies/systems:
  - Uses existing `chrono-node` deterministic parsing first.
  - Optional LLM fallback path only when deterministic parsing fails.
