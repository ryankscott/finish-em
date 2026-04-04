# Date Editor Calendar Picker

_Archived change: `2026-03-04-date-editor-calendar-picker`_

## Summary

When editing date fields (due date, scheduled date, project start/end), users must type dates in text form (`today`, `tomorrow`, `YYYY-MM-DD`, `clear`). Pressing `E` while in a date text-input mode should instead offer a terminal calendar picker — a grid-based month view where the user can navigate with arrow keys and select a date visually, reducing friction and eliminating format guesswork.

## Scope

- A new `CalendarPicker` component renders a terminal-based month grid (Sun–Sat, 6 rows max) with keyboard navigation (arrow keys to move days, `[`/`]` to change months, `Enter` to select, `Esc` to cancel, `c` to clear).
- New `InputMode` entries: `calendarPickerDueDate`, `calendarPickerScheduledDate`, `calendarPickerProjectStartDate`, `calendarPickerProjectEndDate` — one per date field that currently has a text-input mode.
- When in a date text-input mode (`editDueDate`, `editScheduledDate`, `editProjectStartDate`, `editProjectEndDate`), pressing `E` switches from the text input to the corresponding calendar picker mode for that field.
- `useMainKeys` routes the new calendar picker modes (navigation, selection, cancel).
- `useInputBar` registers the new modes and classifies them as picker modes (not text input, not bottom bar).
- `useSubmitInput` handles the new modes by reading the selected date as a `YYYY-MM-DD` string and routing to the same underlying field-update logic as the existing text modes.
- Hint text in `TaskEditPicker` and `ProjectEditPicker` updated to reflect `E for calendar`.
- `InputBar` label map updated to add new calendar picker modes (not shown while calendar is displayed, but needed for fallback).
- A `CalendarPicker` component renders a month grid (Sun–Sat) with arrow-key navigation, month-stepping, and Enter to select
- Pressing `E` from any of the 4 date text-input modes switches to the corresponding calendar picker mode
- Selecting a date in the calendar picker sets the date field to `YYYY-MM-DD` and immediately submits (same as typing a date in the text bar)
- A `c` key clears the date (equivalent to typing `clear`)
- Escape cancels without changing the field
- The calendar initialises with the field's current value pre-selected (or today if blank)
- Replacing text input entirely — users can still type dates directly; `E` is a shortcut to the calendar
- Time-of-day selection — dates only (9am default is handled by `parseDatePhrase` downstream)
- Multi-date selection or ranges
- Impact: `src/tui/hooks/useInputBar.ts` — add 4 new `InputMode` values; add calendar picker modes to `PICKER_MODES`.
- Impact: `src/tui/hooks/useMainKeys.ts` — handle `E` key in date text-input modes; handle navigation/select/cancel in new calendar picker modes.
- Impact: `src/tui/hooks/useSubmitInput.ts` — handle new calendar picker modes using same date-update API calls.
- Impact: `src/tui/InputBar.tsx` — extend `INPUT_MODE_LABELS` for new modes.
- Impact: `src/tui/TaskEditPicker.tsx` — update hint text for due/scheduled fields.
- Impact: `src/tui/ProjectEditPicker.tsx` — update hint text for start/end date fields.
- Impact: `src/tui/CalendarPicker.tsx` — **new file**: pure render component for the month-grid calendar.
- Impact: `src/tui/hooks/useCalendarPicker.ts` — **new file**: state hook (selected date, cursor date, visible month).
- Impact: `src/tui/App.tsx` — wire `CalendarPicker` into the overlay rendering path alongside `EnumPicker`, `TaskEditPicker`, etc.
- Impact: No new npm dependencies required (uses `date-fns` already in project).
- Related capabilities: `tui-calendar-date-picker`, `tui-task-metadata-entry`

## Notes

- Decision: 4 new `InputMode` values, one per date field: **Rationale:** Using a single generic `calendarPicker` mode with a separate "target field" state (similar to `enumPickerTargetMode`) would work but adds indirection. Since there are exactly 4 date fields and each maps cleanly to an existing text-input mode, 4 explicit modes (`calendarPickerDueDate`, `calendarPickerScheduledDate`, `calendarPickerProjectStartDate`, `calendarPickerProjectEndDate`) keeps the pattern consistent with the rest of the codebase and makes `useSubmitInput` routing straightforward.
- Decision: Calendar picker is a `PICKER_MODE` (not text input, not bottom bar): **Rationale:** Like `taskEditPicker` and `enumPicker`, the calendar occupies the overlay area above the status bar. Adding the 4 new modes to `PICKER_MODES` in `useInputBar` means `isPickerMode` is true → `isTextInputMode` is false → `isBottomBarMode` is false. The `App` renders the calendar instead of the `InputBar`. This is consistent with all other overlay pickers.
- Decision: `E` is intercepted in `useTextInputKeys` for date modes, not `useMainKeys`: **Rationale:** `useTextInputKeys` runs when `isTextInputMode` is true (i.e., while in one of the date text-input modes). Rather than adding a special-case to `useMainKeys` (which only runs when text input is inactive), we intercept `E` in `useTextInputKeys` before it reaches `applyTextEdit`. This avoids the letter `E` being typed into the input field and is the most targeted change.
- Decision: `useCalendarPicker` hook manages cursor date and visible month: **Rationale:** Separating calendar navigation state from `useInputBar` keeps `useInputBar` focused on input text and mode. The calendar hook owns: `cursorDate` (highlighted day), `visibleMonth` (Date pinned to first of month). Navigation keys (arrow keys, `[`/`]`, `Enter`, `Esc`, `c`) are handled in a new `useCalendarPickerKeys` handler called from `useMainKeys` when `inputMode` is one of the 4 calendar picker modes.
- Decision: On Enter, set `inputValue` to `YYYY-MM-DD` and call `submitInput`: **Rationale:** `useSubmitInput` already handles `editDueDate` etc. by calling `parseDatePhrase(inputValue)`. We simply map the calendar picker modes to the same downstream API calls by routing through the same code path — the calendar modes act like text-date modes with a pre-filled value. This avoids duplicating any API call logic.
- **Terminal width**: On very narrow terminals (<50 cols) a 7-column calendar may clip. Mitigation: CalendarPicker renders at fixed width (~28 chars); App already clamps content pane width to 40 cols minimum.
- **`useTextInputKeys` change**: Adding an `E` intercept changes the existing text-input hook. Mitigation: The intercept only fires when `inputMode` is one of the 4 date modes — other text input modes are unaffected. Unit tests cover the new branch.
- **`useSubmitInput` routing**: The 4 calendar picker modes must be mapped to the same field-update logic as their text counterparts. Mitigation: Extract a shared helper or reuse the existing `editDueDate` branch by mapping `calendarPickerDueDate` → `editDueDate` logic inside `useSubmitInput`.
- Open questions: - None. Scope is clear and all patterns exist in the codebase.

## Implementation Phases

1. New InputModes and Mode Classification
   - [done] Add `calendarPickerDueDate`, `calendarPickerScheduledDate`, `calendarPickerProjectStartDate`, `calendarPickerProjectEndDate` to the `InputMode` union in `useInputBar.ts`
   - [done] Add the 4 new calendar picker modes to `PICKER_MODES` array in `useInputBar.ts` (so `isPickerMode=true`, `isTextInputMode=false`, `isBottomBarMode=false`)
   - [done] Update the `InputMode` type mirror in `useInputBar-pickers.test.ts` and add test cases asserting new modes are picker modes, not text-input modes
2. `useCalendarPicker` State Hook
   - [done] Create `src/tui/hooks/useCalendarPicker.ts` with state: `cursorDate` (Date), `visibleMonth` (Date, first of month), and setters
   - [done] Export `initCalendarPicker(existingIsoDate?: string)` helper that returns initial `cursorDate` (existing date or today) and `visibleMonth` (first of cursor's month)
   - [done] Export navigation helpers: `moveCursor(delta: number)` (clamps visibleMonth if month changes), `stepMonth(delta: -1 | 1)` (advances month, clamps cursor)
3. `CalendarPicker` Component
   - [done] Create `src/tui/CalendarPicker.tsx` — renders month header (`Month YYYY`), 7-column weekday header (`Su Mo Tu We Th Fr Sa`), and day grid (6 rows max, padding for partial first/last weeks)
   - [done] Highlight the cursor date with inverse/bold styling; dim days from adjacent months that appear in padding
   - [done] Show keybind hint line: `arrows move [/] month Enter select c clear Esc cancel`
   - [done] Write a render unit test for `CalendarPicker` (month header correct, cursor highlighted, correct weekday alignment for a known month)
4. `E` Key Intercept in Date Text-Input Modes
   - [done] In `useTextInputKeys.ts`, before `applyTextEdit`, intercept `input === "E"` when `inputMode` is one of the 4 date text-input modes
   - [done] On `E` press, call a new `openCalendarPicker(sourceMode: InputMode)` callback (passed as param) that maps the source text-input mode to the corresponding calendar picker mode and initialises calendar state from `inputValue`
   - [done] Add `inputMode` and `openCalendarPicker` to `UseTextInputKeysParams` type and thread through `useKeybindings` → `useTextInputKeys`
   - [done] Write unit tests covering `E` press in each of the 4 date modes opens the correct calendar picker mode
5. Calendar Picker Key Handling in `useMainKeys`
   - [done] Add a calendar picker navigation block in `useMainKeys.ts` triggered when `inputMode` is one of the 4 calendar picker modes
   - [done] Handle arrow keys / `h`/`j`/`k`/`l`: left/right = ±1 day, up/down = ±7 days; auto-advance `visibleMonth` if cursor crosses month boundary
   - [done] Handle `[`/`]`: step `visibleMonth` ±1 month, clamp `cursorDate` to last day of new month if needed
   - [done] Handle Enter: set `inputValue` to cursor date as `YYYY-MM-DD`, then call `submitInput`
   - [done] Handle `c`: set `inputValue` to `"clear"`, call `submitInput`
   - [done] Handle Escape: call `closeInput`
   - [done] Thread `calendarCursorDate`, `setCalendarCursorDate`, `calendarVisibleMonth`, `setCalendarVisibleMonth` through `useKeybindings` params
6. `useSubmitInput` — Calendar Picker Mode Routing
   - [done] In `useSubmitInput.ts`, map each calendar picker mode to its existing field-update logic: `calendarPickerDueDate` → same as `editDueDate`, `calendarPickerScheduledDate` → same as `editScheduledDate`, `calendarPickerProjectStartDate` → same as `editProjectStartDate`, `calendarPickerProjectEndDate` → same as `editProjectEndDate`
   - [done] Write a unit test asserting that submitting `calendarPickerDueDate` with a `YYYY-MM-DD` value calls the task update API with the correct `dueAt`
7. App Wiring
   - [done] In `App.tsx`, add `useCalendarPicker` hook call and pass state/setters to `useKeybindings`
   - [done] Add render branch in `App.tsx`: when `inputBar.inputMode` is one of the 4 calendar picker modes, render `<CalendarPicker cursorDate={...} visibleMonth={...} />`
   - [done] Pass the new calendar state params through `useKeybindings` → `useMainKeys`
8. Hint Text Updates
   - [done] In `TaskEditPicker.tsx`, update the `hint` for `due` and `scheduled` fields to include `E for calendar`
   - [done] In `ProjectEditPicker.tsx`, update the `hint` for `startDate` and `endDate` fields to include `E for calendar`
   - [done] Update `HelpModal.tsx` to document the `E` calendar shortcut under date editing
9. Integration Tests
   - [done] Add an `App.text-edit.test.ts` (or equivalent) test: while in `editDueDate` mode, pressing `E` switches mode to `calendarPickerDueDate`
   - [done] Add integration test: in `calendarPickerDueDate`, pressing Enter sets the task due date via the API
   - [done] Add integration test: pressing `c` in the calendar picker clears the date field
