## Context

The TUI currently edits date fields (`editDueDate`, `editScheduledDate`, `editProjectStartDate`, `editProjectEndDate`) via free-text input in the bottom bar. Users type phrases like `today`, `tomorrow`, `2026-06-15`, or `clear`. This works but requires memorizing the format and provides no visual feedback about which day of the week a date falls on.

The request is to add a calendar picker activated by pressing `E` while in any date text-input mode. The existing modal picker pattern (`EnumPicker`, `TaskEditPicker`, `LinkPicker`) is the established approach for overlay selection in this TUI — the calendar picker should follow that same pattern.

The app uses Ink (React for terminals) and `date-fns` (already a dependency). No new npm packages are needed.

## Goals / Non-Goals

**Goals:**
- A `CalendarPicker` component renders a month grid (Sun–Sat) with arrow-key navigation, month-stepping, and Enter to select
- Pressing `E` from any of the 4 date text-input modes switches to the corresponding calendar picker mode
- Selecting a date in the calendar picker sets the date field to `YYYY-MM-DD` and immediately submits (same as typing a date in the text bar)
- A `c` key clears the date (equivalent to typing `clear`)
- Escape cancels without changing the field
- The calendar initialises with the field's current value pre-selected (or today if blank)

**Non-Goals:**
- Replacing text input entirely — users can still type dates directly; `E` is a shortcut to the calendar
- Time-of-day selection — dates only (9am default is handled by `parseDatePhrase` downstream)
- Multi-date selection or ranges

## Decisions

### Decision: 4 new `InputMode` values, one per date field

**Rationale:** Using a single generic `calendarPicker` mode with a separate "target field" state (similar to `enumPickerTargetMode`) would work but adds indirection. Since there are exactly 4 date fields and each maps cleanly to an existing text-input mode, 4 explicit modes (`calendarPickerDueDate`, `calendarPickerScheduledDate`, `calendarPickerProjectStartDate`, `calendarPickerProjectEndDate`) keeps the pattern consistent with the rest of the codebase and makes `useSubmitInput` routing straightforward.

**Alternative considered:** A single `calendarPicker` mode + `calendarPickerTargetMode` ref. Rejected because it adds a new stateful indirection when the 4-enum approach is simpler and already proven by the existing modes.

### Decision: Calendar picker is a `PICKER_MODE` (not text input, not bottom bar)

**Rationale:** Like `taskEditPicker` and `enumPicker`, the calendar occupies the overlay area above the status bar. Adding the 4 new modes to `PICKER_MODES` in `useInputBar` means `isPickerMode` is true → `isTextInputMode` is false → `isBottomBarMode` is false. The `App` renders the calendar instead of the `InputBar`. This is consistent with all other overlay pickers.

### Decision: `E` is intercepted in `useTextInputKeys` for date modes, not `useMainKeys`

**Rationale:** `useTextInputKeys` runs when `isTextInputMode` is true (i.e., while in one of the date text-input modes). Rather than adding a special-case to `useMainKeys` (which only runs when text input is inactive), we intercept `E` in `useTextInputKeys` before it reaches `applyTextEdit`. This avoids the letter `E` being typed into the input field and is the most targeted change.

**Alternative considered:** Handling `E` in `useMainKeys` by briefly closing text input then reopening as calendar. Rejected — creates a render flicker and is more complex.

### Decision: `useCalendarPicker` hook manages cursor date and visible month

**Rationale:** Separating calendar navigation state from `useInputBar` keeps `useInputBar` focused on input text and mode. The calendar hook owns: `cursorDate` (highlighted day), `visibleMonth` (Date pinned to first of month). Navigation keys (arrow keys, `[`/`]`, `Enter`, `Esc`, `c`) are handled in a new `useCalendarPickerKeys` handler called from `useMainKeys` when `inputMode` is one of the 4 calendar picker modes.

### Decision: On Enter, set `inputValue` to `YYYY-MM-DD` and call `submitInput`

**Rationale:** `useSubmitInput` already handles `editDueDate` etc. by calling `parseDatePhrase(inputValue)`. We simply map the calendar picker modes to the same downstream API calls by routing through the same code path — the calendar modes act like text-date modes with a pre-filled value. This avoids duplicating any API call logic.

## Risks / Trade-offs

- **Terminal width**: On very narrow terminals (<50 cols) a 7-column calendar may clip. Mitigation: CalendarPicker renders at fixed width (~28 chars); App already clamps content pane width to 40 cols minimum.
- **`useTextInputKeys` change**: Adding an `E` intercept changes the existing text-input hook. Mitigation: The intercept only fires when `inputMode` is one of the 4 date modes — other text input modes are unaffected. Unit tests cover the new branch.
- **`useSubmitInput` routing**: The 4 calendar picker modes must be mapped to the same field-update logic as their text counterparts. Mitigation: Extract a shared helper or reuse the existing `editDueDate` branch by mapping `calendarPickerDueDate` → `editDueDate` logic inside `useSubmitInput`.

## Open Questions

- None. Scope is clear and all patterns exist in the codebase.
