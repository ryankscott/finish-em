## 1. Add reminder phrase resolution service

- [ ] 1.1 Create server reminder phrase resolver with deterministic parsing for natural language phrases (`in ten minutes`, `at 6pm`)
- [ ] 1.2 Implement due-relative phrase parsing (`<n> mins/hours/days before due`) resolved from selected task due timestamp
- [ ] 1.3 Enforce `at <time>` rollover semantics (today if future, tomorrow if already passed)
- [ ] 1.4 Implement resolver result contract with resolved ISO timestamp plus warnings/errors
- [ ] 1.5 Add optional LLM fallback hook that is invoked only when deterministic parsing fails

## 2. Integrate smart reminders into TUI reminder creation

- [ ] 2.1 Update `addReminder` submit flow in `src/tui/App.tsx` to route raw input through reminder resolver
- [ ] 2.2 Pass selected task context (`dueAt`, timezone) into resolver for due-relative phrase handling
- [ ] 2.3 Return actionable validation status when due-relative input is used on task without due date
- [ ] 2.4 Keep reminder persistence behavior (single active reminder per task) unchanged

## 3. Add task reminder indicators in task list UI

- [ ] 3.1 Load reminder lookup by task id for currently displayed task rows
- [ ] 3.2 Render bell icon on collapsed task rows when reminder exists
- [ ] 3.3 Render bell icon plus formatted local-time reminder text on expanded task rows
- [ ] 3.4 Ensure no reminder text is shown when task has no active reminder

## 4. Verify behavior with tests

- [ ] 4.1 Add unit tests for deterministic reminder parsing and `at 6pm` rollover semantics
- [ ] 4.2 Add tests for due-relative phrase parsing and error path when due date is absent
- [ ] 4.3 Add tests for fallback invocation rules (deterministic success skips fallback, failure may invoke fallback)
- [ ] 4.4 Add/extend TUI rendering tests for collapsed bell-only and expanded bell+time states
- [ ] 4.5 Run targeted server + TUI reminder tests to confirm no regressions in existing reminder CRUD/snooze behavior
