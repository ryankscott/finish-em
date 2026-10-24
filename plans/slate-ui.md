# Slate UI refresh

Implements the approved Today, create-task, and edit-task prototype with Sora, warm neutral surfaces, and a dark slate-blue accent (#435c76 in light mode).

- Today has a clear date/title hierarchy, a soft focus card, and metadata beneath task titles. Completion controls are directly tappable and offer Undo.
- Desktop editing sits beside the list. Creation uses a centered dialog. Mobile uses full-screen forms with pinned save controls and keyboard-safe sizing.
- Both forms share the same fields. Recurrence, reminders, linked meetings, subtasks, delegation, task syntax, and keyboard shortcuts remain available.
- The date picker uses a responsive seven-column calendar, 44px-tall days, presets, typed dates/times, and explicit Save/Cancel. Loaded datetime values display correctly and unchanged timestamps retain their seconds and offsets.
- Secondary navigation lives under More views. Stored sidebar widths, theme preferences, and existing task ordering are retained.

Validation: unit/integration tests, TypeScript, Biome, production web build, Worker dry run, and browser checks against an isolated local database. Browser coverage includes desktop/mobile create/edit/save, calendar selection and nested cancellation, completion/undo, unsaved drafts across layout changes, dark mode, and widths from 320px to 1440px. Native iPhone keyboard behavior and the macOS wrapper still need device checks.

No database or API changes are required.
