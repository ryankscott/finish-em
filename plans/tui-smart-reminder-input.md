# TUI Smart Reminder Input

## Summary

Define natural language reminder input parsing and resolution behavior in the TUI.

## Current Rules

- TUI reminder input supports natural language resolution: The TUI SHALL accept natural language reminder phrases and resolve them to concrete reminder timestamps before reminder creation.
- TUI reminder input supports due-relative phrases: The TUI SHALL support due-relative reminder phrases that schedule reminders before a task due date.
- Reminder parser uses deterministic-first strategy with optional fallback: The reminder resolution pipeline MUST attempt deterministic parsing first and only invoke LLM fallback when deterministic parsing cannot resolve a valid timestamp.
- Reminder resolution and display use local timezone semantics: The system MUST resolve and present reminder times in the user's local timezone context.

## Related History

- `2026-03-05-smart-task-reminders-and-indicators` -> `archive/2026-03-05-smart-task-reminders-and-indicators.md`
