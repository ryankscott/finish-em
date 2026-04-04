# Smart Task Reminders And Indicators

_Archived change: `2026-03-05-smart-task-reminders-and-indicators`_

## Summary

Task reminders currently require ISO timestamps and provide minimal in-list visibility, which makes reminder setup and verification slower than task management should be. Supporting natural language and due-relative reminders with clear task-level indicators improves capture speed and confidence.

## Scope

- Add smart reminder input parsing for TUI reminder creation (`m`) to accept natural language phrases like `in ten minutes` and `at 6pm`.
- Add due-relative reminder phrases like `1 day before due` and `30 mins before due` that resolve against the selected task’s due date.
- Define deterministic reminder parsing as primary strategy, with optional LLM fallback only when deterministic parsing cannot resolve a valid timestamp.
- Standardize local-time behavior for reminder resolution and display:
- `at 6pm` resolves to today if still in the future, otherwise tomorrow at 6pm.
- Reminder display in task UI uses the user’s local timezone.
- Add reminder indicators in task rows:
- Collapsed row: bell icon only.
- Expanded row: bell icon + resolved reminder timestamp text.
- Support natural-language reminder phrases in TUI reminder input (`m`) with deterministic parsing first.
- Support due-relative reminder phrases (for example `1 day before due`, `30 mins before due`) resolved against task due date.
- Define fallback strategy: use LLM only when deterministic parsing cannot resolve a valid reminder time.
- Enforce local-time behavior for both parse and display:
- `at 6pm` means today 6pm if future, otherwise tomorrow 6pm.
- Reminder timestamps are displayed in local timezone in task rows.
- Add reminder indicators in task list:
- Collapsed row: bell only.
- Expanded row: bell + reminder time text.
- Multi-reminder-per-task UX changes (current single-primary-reminder behavior remains).
- New reminder transport channels (email/push); scope is in-app reminder scheduling/display.
- Replacing deterministic parser with LLM-only parsing.
- Impact: Affected code:
- Impact: TUI reminder submit flow in `src/tui/App.tsx`.
- Impact: Reminder parsing/resolution services in `src/server/services/` and potentially `src/server/repos/reminders.ts` call sites.
- Impact: Task row rendering in `src/tui/TaskPanel.tsx` (and parity surfaces if needed).
- Impact: Reminder and task tests in TUI/server layers.
- Impact: Affected behavior:
- Impact: Users can create reminders with human-friendly phrases, including due-relative offsets.
- Impact: Reminder intent and schedule are visible in task rows without opening separate reminder flows.
- Impact: Dependencies/systems:
- Impact: Uses existing `chrono-node` deterministic parsing first.
- Impact: Optional LLM fallback path only when deterministic parsing fails.
- Related capabilities: `tui-smart-reminder-input`, `tui-task-reminder-indicators`

## Notes

- 1) Introduce a dedicated reminder phrase resolver service: - Decision: Add server-side reminder phrase resolution that takes raw input plus task context (`dueAt`, timezone) and returns resolved ISO timestamp plus warnings/errors. - Rationale: Keeps parsing rules centralized and testable, and avoids duplicating parsing logic in TUI and server layers. - Alternatives considered: - Parse in TUI only: rejected due to duplicated logic and weaker API consistency.
- 2) Use deterministic-first parsing (Option A): - Decision: Attempt deterministic parse first using regex + `chrono-node`; only invoke LLM parse fallback when deterministic parse fails. - Rationale: Deterministic path is fast, low-cost, and predictable for majority patterns while preserving recovery for ambiguous phrasing. - Alternatives considered: - LLM-only parsing: rejected due to higher latency/cost and non-deterministic behavior.
- 3) Define explicit due-relative grammar: - Decision: Support normalized patterns for offsets before due date, including unit aliases (minutes/mins, hours/hrs, days). - Rationale: Makes due-relative behavior predictable and testable while covering key user intents. - Alternatives considered: - Free-form relative-to-due via LLM only: rejected for reliability and explainability concerns.
- 4) Add task-row reminder indicators from already-loaded reminder state: - Decision: Extend task row rendering to consume reminder metadata associated with task IDs and render bell states in collapsed/expanded modes. - Rationale: Satisfies visibility requirement without forcing users into reminder modal/actions. - Alternatives considered: - Show reminders only in expanded details: rejected because collapsed scanning remains blind.
- 5) Preserve existing reminder persistence model: - Decision: Keep one active reminder per task behavior in repository layer for this change. - Rationale: Avoids schema and behavior expansion beyond requested UX. - Alternatives considered: - Multi-reminder support: rejected as out of scope and materially larger change.
- [Ambiguous natural-language phrase resolves unexpectedly] → Mitigation: emit clear warning/status text showing resolved reminder time before/after create.
- [LLM fallback unavailable or slow] → Mitigation: deterministic-first succeeds for common phrases; fallback failures return actionable parse error guidance.
- [Due-relative phrase on task without due date] → Mitigation: fail-fast with explicit message to use absolute reminder phrase.
- [UI clutter from reminder text] → Mitigation: collapsed mode shows icon only; full time appears only in expanded row.
- Open questions: - Should we support “after due” phrasing now (for example `10 mins after due`) or keep due-relative scope to “before due” only? - Should reminder display include relative text (for example “in 30m”) in addition to absolute local time, or absolute only?

## Implementation Phases

1. Add reminder phrase resolution service
   - Create server reminder phrase resolver with deterministic parsing for natural language phrases (`in ten minutes`, `at 6pm`)
   - Implement due-relative phrase parsing (`<n> mins/hours/days before due`) resolved from selected task due timestamp
   - Enforce `at <time>` rollover semantics (today if future, tomorrow if already passed)
   - Implement resolver result contract with resolved ISO timestamp plus warnings/errors
   - Add optional LLM fallback hook that is invoked only when deterministic parsing fails
2. Integrate smart reminders into TUI reminder creation
   - Update `addReminder` submit flow in `src/tui/App.tsx` to route raw input through reminder resolver
   - Pass selected task context (`dueAt`, timezone) into resolver for due-relative phrase handling
   - Return actionable validation status when due-relative input is used on task without due date
   - Keep reminder persistence behavior (single active reminder per task) unchanged
3. Add task reminder indicators in task list UI
   - Load reminder lookup by task id for currently displayed task rows
   - Render bell icon on collapsed task rows when reminder exists
   - Render bell icon plus formatted local-time reminder text on expanded task rows
   - Ensure no reminder text is shown when task has no active reminder
4. Verify behavior with tests
   - Add unit tests for deterministic reminder parsing and `at 6pm` rollover semantics
   - Add tests for due-relative phrase parsing and error path when due date is absent
   - Add tests for fallback invocation rules (deterministic success skips fallback, failure may invoke fallback)
   - Add/extend TUI rendering tests for collapsed bell-only and expanded bell+time states
   - Run targeted server + TUI reminder tests to confirm no regressions in existing reminder CRUD/snooze behavior
