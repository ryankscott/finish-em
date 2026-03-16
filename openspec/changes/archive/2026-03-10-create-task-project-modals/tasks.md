## 1. Modal State in useInputBar

- [x] 1.1 Add `createTaskModal` and `createProjectModal` to the `InputMode` union type
- [x] 1.2 Add `modalFieldIndex: number` state to `useInputBar` (which field row is active)
- [x] 1.3 Add `modalValues: Record<string, string>` state to `useInputBar` (per-field value map)
- [x] 1.4 Add `modalActiveFieldKeyRef: React.MutableRefObject<string>` ref to `useInputBar` (so `useTextInputKeys` can write to the correct field)
- [x] 1.5 Add `setModalFieldIndex` and `setModalValues` to the `UseInputBarResult` return type
- [x] 1.6 Reset `modalFieldIndex`, `modalValues`, and `modalActiveFieldKeyRef` in `openInput` and `closeInput`
- [x] 1.7 Add `isModalMode` derived boolean (`inputMode === "createTaskModal" || inputMode === "createProjectModal"`) to return type

## 2. Text Input Routing to Modal Fields

- [x] 2.1 Update `useTextInputKeys` signature to accept `modalActiveFieldKeyRef` and `setModalValues` params
- [x] 2.2 When `isModalMode` is true and the active field is a text field, route character/backspace/cursor keystrokes to update `modalValues[modalActiveFieldKeyRef.current]` instead of `inputValue`
- [x] 2.3 Pass `modalActiveFieldKeyRef`, `setModalValues`, and `isModalMode` from `App.tsx` / `useKeybindings` into `useTextInputKeys`
- [x] 2.4 Write unit tests for `useTextInputKeys` modal routing: typing, backspace, word-delete, cursor movement all update the correct modal field value

## 3. Modal Navigation and Keybindings in useMainKeys

- [x] 3.1 Add `A` keybinding in `useMainKeys` to call `openInput("createTaskModal")` from any view/focus area (guard: not already in input mode)
- [x] 3.2 Add `P` keybinding in `useMainKeys` to call `openInput("createProjectModal")` from any view/focus area (guard: not already in input mode)
- [x] 3.3 When `isModalMode`, handle `j` / `Tab` → `setModalFieldIndex(i + 1)` with wrap
- [x] 3.4 When `isModalMode`, handle `k` / `Shift+Tab` → `setModalFieldIndex(i - 1)` with wrap
- [x] 3.5 When `isModalMode` and active field is an enum, handle `Enter` → open `EnumPicker` with correct items and set `enumPickerTargetMode` to `"modal:<fieldKey>"`
- [x] 3.6 When `isModalMode` and active field is a date field, handle `E` → open the corresponding `CalendarPicker` mode; set `enumPickerTargetMode` to `"modal:<fieldKey>"` for calendar return
- [x] 3.7 When `isModalMode` and active field is text, handle `Enter` → advance to next field (or trigger submit if on submit row)
- [x] 3.8 When `isModalMode`, handle `Esc` → `closeInput()`
- [x] 3.9 Write unit tests for `useMainKeys`: `A` opens task modal, `P` opens project modal, `j`/`k`/`Tab` change `modalFieldIndex`, `Esc` closes

## 4. EnumPicker and CalendarPicker Return to Modal

- [x] 4.1 Add `isModalEnumTarget(mode: string): boolean` helper that returns `true` if `mode` starts with `"modal:"`
- [x] 4.2 In `useSubmitInput` (enum picker confirm path), check `isModalEnumTarget(enumPickerTargetMode)` — if true, write the selected value to `modalValues[fieldKey]` and return to modal (set `inputMode` back to the modal mode) instead of patching the task/project
- [x] 4.3 In `useSubmitInput` (calendar picker confirm path), apply the same modal-return logic for calendar results written to date fields
- [x] 4.4 Write unit tests for enum-picker-to-modal and calendar-picker-to-modal return paths

## 5. CreateTaskModal Display Component

- [x] 5.1 Create `src/tui/CreateTaskModal.tsx` as a pure display component
- [x] 5.2 Define `TASK_CREATE_FIELDS` constant (title, project, priority, dueAt, scheduledAt, recurrence, notes, submit) with field key, label, type (`text` | `enum` | `date` | `submit`)
- [x] 5.3 Render modal as `position="absolute"` full-screen overlay with `backgroundColor="black"` (matching `HelpModal` pattern)
- [x] 5.4 Render each field row: active field shows `❯` cursor and highlight color; enum/date fields show hint text; submit row shows "Create Task"
- [x] 5.5 Show inline validation error message when `validationError` prop is set
- [x] 5.6 Display current value from `modalValues` for each field
- [x] 5.7 For the active text field, render the value with cursor indicator (using `inputCursorOffset` from `useInputBar`)
- [x] 5.8 Write unit/render tests for `CreateTaskModal`: field list rendering, active field highlight, value display, validation error display

## 6. CreateProjectModal Display Component

- [x] 6.1 Create `src/tui/CreateProjectModal.tsx` as a pure display component
- [x] 6.2 Define `PROJECT_CREATE_FIELDS` constant (name, emoji, description, startAt, endAt, jiraDiscovery, jiraDelivery, confluenceUrl, submit) with field key, label, type
- [x] 6.3 Render modal as `position="absolute"` full-screen overlay with `backgroundColor="black"`
- [x] 6.4 Render each field row with active/inactive styling, value from `modalValues`, and cursor on active text field
- [x] 6.5 Show inline validation error message when `validationError` prop is set
- [x] 6.6 Render hint for date fields (`YYYY-MM-DD · E calendar`)
- [x] 6.7 Write unit/render tests for `CreateProjectModal`: field list rendering, active field highlight, value display, validation error display

## 7. Submit Logic in useSubmitInput

- [x] 7.1 Add `createTaskModal` case to `useSubmitInput`: validate `modalValues.title` non-empty; if invalid, set `validationError` and move `modalFieldIndex` to title; if valid, call `api.createTask(...)` with all collected modal field values
- [x] 7.2 Add `createProjectModal` case to `useSubmitInput`: validate `modalValues.name` non-empty; if invalid, set `validationError` and move `modalFieldIndex` to name; if valid, call `api.createProject(...)` with all collected modal field values
- [x] 7.3 On successful create: call `closeInput()`, `loadData()`, `pushToast("Task created")` / `pushToast("Project created")`
- [x] 7.4 Add `validationError: string | null` state to `useInputBar` and expose via return; clear it on `closeInput` and on any field value change
- [x] 7.5 Write unit tests for submit: valid form creates entity, empty title/name shows validation error and does not call API, success triggers toast and reload

## 8. App Integration

- [x] 8.1 Pass `modalFieldIndex`, `modalValues`, `inputCursorOffset`, and `validationError` from `useInputBar` through `useKeybindings` to `useMainKeys`
- [x] 8.2 Render `<CreateTaskModal>` in `App.tsx` when `inputBar.inputMode === "createTaskModal"`, passing all required props
- [x] 8.3 Render `<CreateProjectModal>` in `App.tsx` when `inputBar.inputMode === "createProjectModal"`, passing all required props
- [x] 8.4 Verify `A` and `P` do not conflict with any existing keybindings in `useMainKeys`

## 9. Help Modal Update

- [x] 9.1 Add `A` → "Create new task (full form)" and `P` → "Create new project (full form)" entries to `SHORTCUTS` in `HelpModal.tsx` under the appropriate sections
