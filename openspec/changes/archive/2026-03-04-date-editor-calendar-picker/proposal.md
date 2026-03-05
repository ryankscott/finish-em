## Why

When editing date fields (due date, scheduled date, project start/end), users must type dates in text form (`today`, `tomorrow`, `YYYY-MM-DD`, `clear`). Pressing `E` while in a date text-input mode should instead offer a terminal calendar picker — a grid-based month view where the user can navigate with arrow keys and select a date visually, reducing friction and eliminating format guesswork.

## What Changes

- A new `CalendarPicker` component renders a terminal-based month grid (Sun–Sat, 6 rows max) with keyboard navigation (arrow keys to move days, `[`/`]` to change months, `Enter` to select, `Esc` to cancel, `c` to clear).
- New `InputMode` entries: `calendarPickerDueDate`, `calendarPickerScheduledDate`, `calendarPickerProjectStartDate`, `calendarPickerProjectEndDate` — one per date field that currently has a text-input mode.
- When in a date text-input mode (`editDueDate`, `editScheduledDate`, `editProjectStartDate`, `editProjectEndDate`), pressing `E` switches from the text input to the corresponding calendar picker mode for that field.
- `useMainKeys` routes the new calendar picker modes (navigation, selection, cancel).
- `useInputBar` registers the new modes and classifies them as picker modes (not text input, not bottom bar).
- `useSubmitInput` handles the new modes by reading the selected date as a `YYYY-MM-DD` string and routing to the same underlying field-update logic as the existing text modes.
- Hint text in `TaskEditPicker` and `ProjectEditPicker` updated to reflect `E for calendar`.
- `InputBar` label map updated to add new calendar picker modes (not shown while calendar is displayed, but needed for fallback).

## Capabilities

### New Capabilities

- `tui-calendar-date-picker`: Interactive terminal calendar picker component and the integration layer connecting it to date-editing input modes.

### Modified Capabilities

- `tui-task-metadata-entry`: Date field editing UX changes (new `E` keybind to open calendar picker from text date input modes).

## Impact

- `src/tui/hooks/useInputBar.ts` — add 4 new `InputMode` values; add calendar picker modes to `PICKER_MODES`.
- `src/tui/hooks/useMainKeys.ts` — handle `E` key in date text-input modes; handle navigation/select/cancel in new calendar picker modes.
- `src/tui/hooks/useSubmitInput.ts` — handle new calendar picker modes using same date-update API calls.
- `src/tui/InputBar.tsx` — extend `INPUT_MODE_LABELS` for new modes.
- `src/tui/TaskEditPicker.tsx` — update hint text for due/scheduled fields.
- `src/tui/ProjectEditPicker.tsx` — update hint text for start/end date fields.
- `src/tui/CalendarPicker.tsx` — **new file**: pure render component for the month-grid calendar.
- `src/tui/hooks/useCalendarPicker.ts` — **new file**: state hook (selected date, cursor date, visible month).
- `src/tui/App.tsx` — wire `CalendarPicker` into the overlay rendering path alongside `EnumPicker`, `TaskEditPicker`, etc.
- No new npm dependencies required (uses `date-fns` already in project).
