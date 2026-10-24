# Slate UI refresh

Implements the approved Today, create-task, and edit-task prototype with Sora, warm neutral surfaces, and a dark slate-blue accent (#435c76 in light mode).

- Today has a clear date/title hierarchy, a soft focus card, and metadata beneath task titles. Completion controls are directly tappable and offer Undo.
- Desktop editing sits beside the list. Creation uses a centered dialog. Mobile uses full-screen forms with pinned save controls and keyboard-safe sizing.
- Both forms share the same fields. Recurrence, reminders, linked meetings, subtasks, delegation, task syntax, and keyboard shortcuts remain available.
- The date picker uses a responsive seven-column calendar, 44px-tall days, presets, typed dates/times, and explicit Save/Cancel. Loaded datetime values display correctly and unchanged timestamps retain their seconds and offsets.
- Secondary navigation lives under More views. Stored sidebar widths, theme preferences, and existing task ordering are retained.

Validation: unit/integration tests, TypeScript, Biome, production web build, Worker dry run, and browser checks against an isolated local database. Browser coverage includes desktop/mobile create/edit/save, calendar selection and nested cancellation, completion/undo, unsaved drafts across layout changes, dark mode, and widths from 320px to 1440px. Native iPhone keyboard behavior and the macOS wrapper still need device checks.

No database or API changes are required.

## Compact goals and project navigation

Goals now use a compact summary with the first unfinished goal and completion count. The checklist opens in a desktop popover or mobile sheet, including editing, completion, deletion, and explicit goal creation. Planning uses the same summary for its selected period, and secondary pages retain access to weekly goals.

The app wordmark is removed from screen headers and the sidebar. Project names keep their space: one menu contains edit/delete, drag grips support mouse and touch (hold briefly on touch), and arrow keys reorder a focused grip. Changes persist through the existing reorder endpoint; failed requests roll back.

The real project editor retains name, emoji, description, start/end dates, and labelled resource links, and adds colour editing. Incomplete links produce an error rather than disappearing. Internal identity, Inbox status, and ordering metadata are preserved. Project repository updates now distinguish omitted nullable fields from explicit clears, fixing date/emoji removal. Date popovers are constrained to the available viewport height.

Validation: 499 tests, TypeScript, Biome, production build, isolated browser checks for goals, project editing, date/emoji clearing, mouse/keyboard/touch reorder persistence, and mobile layouts. Native iPhone and macOS wrapper checks remain manual.
