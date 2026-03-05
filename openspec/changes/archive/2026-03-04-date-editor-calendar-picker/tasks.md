## 1. New InputModes and Mode Classification

- [x] 1.1 Add `calendarPickerDueDate`, `calendarPickerScheduledDate`, `calendarPickerProjectStartDate`, `calendarPickerProjectEndDate` to the `InputMode` union in `useInputBar.ts`
- [x] 1.2 Add the 4 new calendar picker modes to `PICKER_MODES` array in `useInputBar.ts` (so `isPickerMode=true`, `isTextInputMode=false`, `isBottomBarMode=false`)
- [x] 1.3 Update the `InputMode` type mirror in `useInputBar-pickers.test.ts` and add test cases asserting new modes are picker modes, not text-input modes

## 2. `useCalendarPicker` State Hook

- [x] 2.1 Create `src/tui/hooks/useCalendarPicker.ts` with state: `cursorDate` (Date), `visibleMonth` (Date, first of month), and setters
- [x] 2.2 Export `initCalendarPicker(existingIsoDate?: string)` helper that returns initial `cursorDate` (existing date or today) and `visibleMonth` (first of cursor's month)
- [x] 2.3 Export navigation helpers: `moveCursor(delta: number)` (clamps visibleMonth if month changes), `stepMonth(delta: -1 | 1)` (advances month, clamps cursor)

## 3. `CalendarPicker` Component

- [x] 3.1 Create `src/tui/CalendarPicker.tsx` — renders month header (`Month YYYY`), 7-column weekday header (`Su Mo Tu We Th Fr Sa`), and day grid (6 rows max, padding for partial first/last weeks)
- [x] 3.2 Highlight the cursor date with inverse/bold styling; dim days from adjacent months that appear in padding
- [x] 3.3 Show keybind hint line: `arrows move  [/] month  Enter select  c clear  Esc cancel`
- [x] 3.4 Write a render unit test for `CalendarPicker` (month header correct, cursor highlighted, correct weekday alignment for a known month)

## 4. `E` Key Intercept in Date Text-Input Modes

- [x] 4.1 In `useTextInputKeys.ts`, before `applyTextEdit`, intercept `input === "E"` when `inputMode` is one of the 4 date text-input modes
- [x] 4.2 On `E` press, call a new `openCalendarPicker(sourceMode: InputMode)` callback (passed as param) that maps the source text-input mode to the corresponding calendar picker mode and initialises calendar state from `inputValue`
- [x] 4.3 Add `inputMode` and `openCalendarPicker` to `UseTextInputKeysParams` type and thread through `useKeybindings` → `useTextInputKeys`
- [x] 4.4 Write unit tests covering `E` press in each of the 4 date modes opens the correct calendar picker mode

## 5. Calendar Picker Key Handling in `useMainKeys`

- [x] 5.1 Add a calendar picker navigation block in `useMainKeys.ts` triggered when `inputMode` is one of the 4 calendar picker modes
- [x] 5.2 Handle arrow keys / `h`/`j`/`k`/`l`: left/right = ±1 day, up/down = ±7 days; auto-advance `visibleMonth` if cursor crosses month boundary
- [x] 5.3 Handle `[`/`]`: step `visibleMonth` ±1 month, clamp `cursorDate` to last day of new month if needed
- [x] 5.4 Handle Enter: set `inputValue` to cursor date as `YYYY-MM-DD`, then call `submitInput`
- [x] 5.5 Handle `c`: set `inputValue` to `"clear"`, call `submitInput`
- [x] 5.6 Handle Escape: call `closeInput`
- [x] 5.7 Thread `calendarCursorDate`, `setCalendarCursorDate`, `calendarVisibleMonth`, `setCalendarVisibleMonth` through `useKeybindings` params

## 6. `useSubmitInput` — Calendar Picker Mode Routing

- [x] 6.1 In `useSubmitInput.ts`, map each calendar picker mode to its existing field-update logic: `calendarPickerDueDate` → same as `editDueDate`, `calendarPickerScheduledDate` → same as `editScheduledDate`, `calendarPickerProjectStartDate` → same as `editProjectStartDate`, `calendarPickerProjectEndDate` → same as `editProjectEndDate`
- [x] 6.2 Write a unit test asserting that submitting `calendarPickerDueDate` with a `YYYY-MM-DD` value calls the task update API with the correct `dueAt`

## 7. App Wiring

- [x] 7.1 In `App.tsx`, add `useCalendarPicker` hook call and pass state/setters to `useKeybindings`
- [x] 7.2 Add render branch in `App.tsx`: when `inputBar.inputMode` is one of the 4 calendar picker modes, render `<CalendarPicker cursorDate={...} visibleMonth={...} />`
- [x] 7.3 Pass the new calendar state params through `useKeybindings` → `useMainKeys`

## 8. Hint Text Updates

- [x] 8.1 In `TaskEditPicker.tsx`, update the `hint` for `due` and `scheduled` fields to include `E for calendar`
- [x] 8.2 In `ProjectEditPicker.tsx`, update the `hint` for `startDate` and `endDate` fields to include `E for calendar`
- [x] 8.3 Update `HelpModal.tsx` to document the `E` calendar shortcut under date editing

## 9. Integration Tests

- [x] 9.1 Add an `App.text-edit.test.ts` (or equivalent) test: while in `editDueDate` mode, pressing `E` switches mode to `calendarPickerDueDate`
- [x] 9.2 Add integration test: in `calendarPickerDueDate`, pressing Enter sets the task due date via the API
- [x] 9.3 Add integration test: pressing `c` in the calendar picker clears the date field
