# Create Task Project Modals

_Archived change: `2026-03-10-create-task-project-modals`_

## Summary

Creating a task or project today requires either the tokenized quick-add input (which demands knowledge of token syntax) or creating with defaults and then using the field picker to fill in each attribute one at a time. There is no single flow where a user can enter all fields for a new task or project at once, clearly and interactively.

## Scope

- Add `A` (shift+A) keybinding to open a full Create Task modal from any view
- Add `P` (shift+P) keybinding to open a full Create Project modal from any view
- Modal renders as a full-screen overlay (`position="absolute"`) on top of all existing content
- All task fields are presented at once: title, project, priority, due date, scheduled date, recurrence, and notes
- All project fields are presented at once: name, emoji, description, start date, end date, Jira Discovery URL, Jira Delivery URL, Confluence URL
- Field navigation via `j`/`k` or `Tab`/`Shift+Tab`
- Enum fields (project, priority, recurrence) open the existing `EnumPicker` overlay for selection
- Date fields accept free text or `E` to open the existing `CalendarPicker`
- Title (task) and name (project) are required; all other fields are optional
- Submitting creates the entity and dismisses the modal; `Esc` cancels without saving
- Existing quick-add (`a`), project create (`p`), and edit flows (`E` → field picker) are unchanged
- Full-form modal for task creation (`A`) and project creation (`P`) accessible from any view
- All fields for each entity shown at once, navigable via `j`/`k`/`Tab`
- Enum fields delegate to the existing `EnumPicker`; date fields to the existing `CalendarPicker`
- Modal state is self-contained and isolated from normal navigation state
- Consistent with existing code patterns; minimal surface area change
- Replacing or modifying the existing quick-add (`a`), create-project (`p`), or field-picker edit (`E`) flows
- Using Ink's native focus system (`useFocus`/`useFocusManager`)
- Editing existing tasks or projects via these modals
- Impact: `src/tui/hooks/useInputBar.ts` — new `InputMode` values, modal field index state, per-field value map
- Impact: `src/tui/hooks/useMainKeys.ts` — `A` and `P` triggers; modal-mode navigation and submit routing
- Impact: `src/tui/hooks/useTextInputKeys.ts` — route keypresses to modal field values when modal is active
- Impact: `src/tui/hooks/useSubmitInput.ts` — new submit handlers for both modal modes
- Impact: `src/tui/App.tsx` — render `<CreateTaskModal>` and `<CreateProjectModal>` overlays
- Impact: New: `src/tui/CreateTaskModal.tsx`, `src/tui/CreateProjectModal.tsx` (display components)
- Related capabilities: `tui-create-project-modal`, `tui-create-task-modal`

## Notes

- Decision 1: Per-field value map in `useInputBar` (not a single `inputValue` swap): **Chosen**: Add `modalValues: Record<string, string>` to `useInputBar` alongside the existing `inputValue`. Text keystrokes route to `modalValues[activeFieldKey]` when a modal is active.
- Decision 2: Route text keypresses through `useTextInputKeys` with a modal guard: **Chosen**: When `inputMode` is `createTaskModal` or `createProjectModal` and the active field is a text type, `useTextInputKeys` updates `modalValues[activeFieldKey]` instead of `inputValue`. A `modalActiveFieldKey` ref is passed to `useTextInputKeys` to direct writes.
- Decision 3: Enum picker return distinguishes modal vs. normal context via `enumPickerTargetMode`: **Chosen**: Enum fields in the modal set `enumPickerTargetMode` to a modal-specific key (e.g. `"modal:priority"`). `useSubmitInput` checks this prefix; if it starts with `"modal:"`, it stores the result in `modalValues` and returns to the modal instead of patching the selected task.
- Decision 4: CalendarPicker integration uses existing calendar modes: **Chosen**: Date fields in the modal trigger existing `calendarPickerDueDate` / `calendarPickerScheduledDate` modes (task) and `calendarPickerProjectStartDate` / `calendarPickerProjectEndDate` (project). On confirm, the calendar result is written to `modalValues[fieldKey]` using the same `enumPickerTargetMode` discriminant pattern.
- Decision 5: Modal display components are pure render (no local state): **Chosen**: `CreateTaskModal` and `CreateProjectModal` are stateless display components — they receive `modalValues`, `activeFieldIndex`, `terminalWidth`, `terminalHeight` as props and render the form. All state lives in `useInputBar` and `useMainKeys`.
- **Risk**: `useTextInputKeys` receives a `modalActiveFieldKey` ref that may be stale if the active field changes while a key event is in flight.
- **Risk**: The `enumPickerTargetMode` prefix convention (`"modal:..."`) is an informal protocol that could silently break if a future non-modal enum picker mode accidentally uses the same prefix.
- **Trade-off**: `A`/`P` shadow any future use of those keys for other purposes in all views. Given the task/project creation mental model, this is appropriate and consistent with Vim-style shift-modifier conventions in the app.

## Implementation Phases

1. Modal State in useInputBar
   - [done] Add `createTaskModal` and `createProjectModal` to the `InputMode` union type
   - [done] Add `modalFieldIndex: number` state to `useInputBar` (which field row is active)
   - [done] Add `modalValues: Record<string, string>` state to `useInputBar` (per-field value map)
   - [done] Add `modalActiveFieldKeyRef: React.MutableRefObject<string>` ref to `useInputBar` (so `useTextInputKeys` can write to the correct field)
   - [done] Add `setModalFieldIndex` and `setModalValues` to the `UseInputBarResult` return type
   - [done] Reset `modalFieldIndex`, `modalValues`, and `modalActiveFieldKeyRef` in `openInput` and `closeInput`
   - [done] Add `isModalMode` derived boolean (`inputMode === "createTaskModal" || inputMode === "createProjectModal"`) to return type
2. Text Input Routing to Modal Fields
   - [done] Update `useTextInputKeys` signature to accept `modalActiveFieldKeyRef` and `setModalValues` params
   - [done] When `isModalMode` is true and the active field is a text field, route character/backspace/cursor keystrokes to update `modalValues[modalActiveFieldKeyRef.current]` instead of `inputValue`
   - [done] Pass `modalActiveFieldKeyRef`, `setModalValues`, and `isModalMode` from `App.tsx` / `useKeybindings` into `useTextInputKeys`
   - [done] Write unit tests for `useTextInputKeys` modal routing: typing, backspace, word-delete, cursor movement all update the correct modal field value
3. Modal Navigation and Keybindings in useMainKeys
   - [done] Add `A` keybinding in `useMainKeys` to call `openInput("createTaskModal")` from any view/focus area (guard: not already in input mode)
   - [done] Add `P` keybinding in `useMainKeys` to call `openInput("createProjectModal")` from any view/focus area (guard: not already in input mode)
   - [done] When `isModalMode`, handle `j` / `Tab` → `setModalFieldIndex(i + 1)` with wrap
   - [done] When `isModalMode`, handle `k` / `Shift+Tab` → `setModalFieldIndex(i - 1)` with wrap
   - [done] When `isModalMode` and active field is an enum, handle `Enter` → open `EnumPicker` with correct items and set `enumPickerTargetMode` to `"modal:<fieldKey>"`
   - [done] When `isModalMode` and active field is a date field, handle `E` → open the corresponding `CalendarPicker` mode; set `enumPickerTargetMode` to `"modal:<fieldKey>"` for calendar return
   - [done] When `isModalMode` and active field is text, handle `Enter` → advance to next field (or trigger submit if on submit row)
   - [done] When `isModalMode`, handle `Esc` → `closeInput()`
   - [done] Write unit tests for `useMainKeys`: `A` opens task modal, `P` opens project modal, `j`/`k`/`Tab` change `modalFieldIndex`, `Esc` closes
4. EnumPicker and CalendarPicker Return to Modal
   - [done] Add `isModalEnumTarget(mode: string): boolean` helper that returns `true` if `mode` starts with `"modal:"`
   - [done] In `useSubmitInput` (enum picker confirm path), check `isModalEnumTarget(enumPickerTargetMode)` — if true, write the selected value to `modalValues[fieldKey]` and return to modal (set `inputMode` back to the modal mode) instead of patching the task/project
   - [done] In `useSubmitInput` (calendar picker confirm path), apply the same modal-return logic for calendar results written to date fields
   - [done] Write unit tests for enum-picker-to-modal and calendar-picker-to-modal return paths
5. CreateTaskModal Display Component
   - [done] Create `src/tui/CreateTaskModal.tsx` as a pure display component
   - [done] Define `TASK_CREATE_FIELDS` constant (title, project, priority, dueAt, scheduledAt, recurrence, notes, submit) with field key, label, type (`text` | `enum` | `date` | `submit`)
   - [done] Render modal as `position="absolute"` full-screen overlay with `backgroundColor="black"` (matching `HelpModal` pattern)
   - [done] Render each field row: active field shows `❯` cursor and highlight color; enum/date fields show hint text; submit row shows "Create Task"
   - [done] Show inline validation error message when `validationError` prop is set
   - [done] Display current value from `modalValues` for each field
   - [done] For the active text field, render the value with cursor indicator (using `inputCursorOffset` from `useInputBar`)
   - [done] Write unit/render tests for `CreateTaskModal`: field list rendering, active field highlight, value display, validation error display
6. CreateProjectModal Display Component
   - [done] Create `src/tui/CreateProjectModal.tsx` as a pure display component
   - [done] Define `PROJECT_CREATE_FIELDS` constant (name, emoji, description, startAt, endAt, jiraDiscovery, jiraDelivery, confluenceUrl, submit) with field key, label, type
   - [done] Render modal as `position="absolute"` full-screen overlay with `backgroundColor="black"`
   - [done] Render each field row with active/inactive styling, value from `modalValues`, and cursor on active text field
   - [done] Show inline validation error message when `validationError` prop is set
   - [done] Render hint for date fields (`YYYY-MM-DD · E calendar`)
   - [done] Write unit/render tests for `CreateProjectModal`: field list rendering, active field highlight, value display, validation error display
7. Submit Logic in useSubmitInput
   - [done] Add `createTaskModal` case to `useSubmitInput`: validate `modalValues.title` non-empty; if invalid, set `validationError` and move `modalFieldIndex` to title; if valid, call `api.createTask(...)` with all collected modal field values
   - [done] Add `createProjectModal` case to `useSubmitInput`: validate `modalValues.name` non-empty; if invalid, set `validationError` and move `modalFieldIndex` to name; if valid, call `api.createProject(...)` with all collected modal field values
   - [done] On successful create: call `closeInput()`, `loadData()`, `pushToast("Task created")` / `pushToast("Project created")`
   - [done] Add `validationError: string | null` state to `useInputBar` and expose via return; clear it on `closeInput` and on any field value change
   - [done] Write unit tests for submit: valid form creates entity, empty title/name shows validation error and does not call API, success triggers toast and reload
8. App Integration
   - [done] Pass `modalFieldIndex`, `modalValues`, `inputCursorOffset`, and `validationError` from `useInputBar` through `useKeybindings` to `useMainKeys`
   - [done] Render `<CreateTaskModal>` in `App.tsx` when `inputBar.inputMode === "createTaskModal"`, passing all required props
   - [done] Render `<CreateProjectModal>` in `App.tsx` when `inputBar.inputMode === "createProjectModal"`, passing all required props
   - [done] Verify `A` and `P` do not conflict with any existing keybindings in `useMainKeys`
9. Help Modal Update
   - [done] Add `A` → "Create new task (full form)" and `P` → "Create new project (full form)" entries to `SHORTCUTS` in `HelpModal.tsx` under the appropriate sections
