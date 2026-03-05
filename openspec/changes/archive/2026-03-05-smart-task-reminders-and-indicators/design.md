## Context

The TUI reminder flow currently accepts only direct timestamp input and forwards it unchanged to reminder creation APIs. This creates friction for common intent phrasing (for example “in ten minutes”) and makes due-relative reminders impossible without manual timestamp math. In parallel, task rows do not expose reminder state, so users cannot quickly verify reminders while scanning tasks.

The codebase already includes deterministic date parsing support (`chrono-node`) and reminder persistence APIs. This enables a parser-first implementation without introducing mandatory LLM dependence.

## Goals / Non-Goals

**Goals:**
- Support natural-language reminder phrases in TUI reminder input (`m`) with deterministic parsing first.
- Support due-relative reminder phrases (for example `1 day before due`, `30 mins before due`) resolved against task due date.
- Define fallback strategy: use LLM only when deterministic parsing cannot resolve a valid reminder time.
- Enforce local-time behavior for both parse and display:
  - `at 6pm` means today 6pm if future, otherwise tomorrow 6pm.
  - Reminder timestamps are displayed in local timezone in task rows.
- Add reminder indicators in task list:
  - Collapsed row: bell only.
  - Expanded row: bell + reminder time text.

**Non-Goals:**
- Multi-reminder-per-task UX changes (current single-primary-reminder behavior remains).
- New reminder transport channels (email/push); scope is in-app reminder scheduling/display.
- Replacing deterministic parser with LLM-only parsing.

## Decisions

### 1) Introduce a dedicated reminder phrase resolver service
- Decision: Add server-side reminder phrase resolution that takes raw input plus task context (`dueAt`, timezone) and returns resolved ISO timestamp plus warnings/errors.
- Rationale: Keeps parsing rules centralized and testable, and avoids duplicating parsing logic in TUI and server layers.
- Alternatives considered:
  - Parse in TUI only: rejected due to duplicated logic and weaker API consistency.

### 2) Use deterministic-first parsing (Option A)
- Decision: Attempt deterministic parse first using regex + `chrono-node`; only invoke LLM parse fallback when deterministic parse fails.
- Rationale: Deterministic path is fast, low-cost, and predictable for majority patterns while preserving recovery for ambiguous phrasing.
- Alternatives considered:
  - LLM-only parsing: rejected due to higher latency/cost and non-deterministic behavior.

### 3) Define explicit due-relative grammar
- Decision: Support normalized patterns for offsets before due date, including unit aliases (minutes/mins, hours/hrs, days).
- Rationale: Makes due-relative behavior predictable and testable while covering key user intents.
- Alternatives considered:
  - Free-form relative-to-due via LLM only: rejected for reliability and explainability concerns.

### 4) Add task-row reminder indicators from already-loaded reminder state
- Decision: Extend task row rendering to consume reminder metadata associated with task IDs and render bell states in collapsed/expanded modes.
- Rationale: Satisfies visibility requirement without forcing users into reminder modal/actions.
- Alternatives considered:
  - Show reminders only in expanded details: rejected because collapsed scanning remains blind.

### 5) Preserve existing reminder persistence model
- Decision: Keep one active reminder per task behavior in repository layer for this change.
- Rationale: Avoids schema and behavior expansion beyond requested UX.
- Alternatives considered:
  - Multi-reminder support: rejected as out of scope and materially larger change.

## Risks / Trade-offs

- [Ambiguous natural-language phrase resolves unexpectedly] → Mitigation: emit clear warning/status text showing resolved reminder time before/after create.
- [LLM fallback unavailable or slow] → Mitigation: deterministic-first succeeds for common phrases; fallback failures return actionable parse error guidance.
- [Due-relative phrase on task without due date] → Mitigation: fail-fast with explicit message to use absolute reminder phrase.
- [UI clutter from reminder text] → Mitigation: collapsed mode shows icon only; full time appears only in expanded row.

## Migration Plan

1. Add reminder phrase resolution service (deterministic parser + optional fallback interface).
2. Integrate resolver into TUI reminder submit path (`addReminder`) with task-context-aware parsing.
3. Add reminder indicator rendering in task rows (collapsed bell, expanded bell+time).
4. Add tests for parsing, due-relative behavior, fallback invocation conditions, and UI rendering states.

Rollback strategy:
- Disable reminder phrase resolver integration and revert to direct ISO-only `remindAt` input path.
- Remove task-row indicator rendering additions.
- No schema migration rollback required.

## Open Questions

- Should we support “after due” phrasing now (for example `10 mins after due`) or keep due-relative scope to “before due” only?
- Should reminder display include relative text (for example “in 30m”) in addition to absolute local time, or absolute only?
