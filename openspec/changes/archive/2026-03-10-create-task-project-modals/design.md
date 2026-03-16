## Context

The TUI manages all input state through a single `useInputBar` hook that owns `inputMode`, `inputValue`, and related picker state. All keypresses flow through `useMainKeys` (via Ink's `useInput`) which dispatches to mode-specific handlers. The app does **not** use Ink's built-in `useFocus`/`useFocusManager` system — focus is managed entirely through state.

Existing modals (e.g. `HelpModal`) use Ink's `position="absolute"` to overlay on top of all content, with the keybinding system handling their dismissal. The new modals follow this exact pattern.

## Goals / Non-Goals

**Goals:**
- Full-form modal for task creation (`A`) and project creation (`P`) accessible from any view
- All fields for each entity shown at once, navigable via `j`/`k`/`Tab`
- Enum fields delegate to the existing `EnumPicker`; date fields to the existing `CalendarPicker`
- Modal state is self-contained and isolated from normal navigation state
- Consistent with existing code patterns; minimal surface area change

**Non-Goals:**
- Replacing or modifying the existing quick-add (`a`), create-project (`p`), or field-picker edit (`E`) flows
- Using Ink's native focus system (`useFocus`/`useFocusManager`)
- Editing existing tasks or projects via these modals

## Decisions

### Decision 1: Per-field value map in `useInputBar` (not a single `inputValue` swap)

**Chosen**: Add `modalValues: Record<string, string>` to `useInputBar` alongside the existing `inputValue`. Text keystrokes route to `modalValues[activeFieldKey]` when a modal is active.

**Alternative considered**: Swap strategy — save `inputValue` to a map on field switch, restore on switch back. Rejected because field switching would require a synchronous flush of `inputCursorOffset` and cursor position, creating off-by-one edge cases and making the data harder to collect on submit.

**Rationale**: All field values are always available in `modalValues`; collecting them at submit time is a simple key lookup with no flushing needed.

### Decision 2: Route text keypresses through `useTextInputKeys` with a modal guard

**Chosen**: When `inputMode` is `createTaskModal` or `createProjectModal` and the active field is a text type, `useTextInputKeys` updates `modalValues[activeFieldKey]` instead of `inputValue`. A `modalActiveFieldKey` ref is passed to `useTextInputKeys` to direct writes.

**Alternative considered**: Duplicate the text-editing logic inside the modal hook. Rejected — duplicating logic diverges behavior over time.

**Rationale**: `useTextInputKeys` already handles all cursor movement, word deletion, and line editing correctly. Directing its output to a different target is the smallest correct change.

### Decision 3: Enum picker return distinguishes modal vs. normal context via `enumPickerTargetMode`

**Chosen**: Enum fields in the modal set `enumPickerTargetMode` to a modal-specific key (e.g. `"modal:priority"`). `useSubmitInput` checks this prefix; if it starts with `"modal:"`, it stores the result in `modalValues` and returns to the modal instead of patching the selected task.

**Alternative considered**: A separate `isModalEnumPicker` boolean flag. Rejected — the target mode already carries all needed context and avoids adding yet another boolean to the shared state.

### Decision 4: CalendarPicker integration uses existing calendar modes

**Chosen**: Date fields in the modal trigger existing `calendarPickerDueDate` / `calendarPickerScheduledDate` modes (task) and `calendarPickerProjectStartDate` / `calendarPickerProjectEndDate` (project). On confirm, the calendar result is written to `modalValues[fieldKey]` using the same `enumPickerTargetMode` discriminant pattern.

**Rationale**: Reuses all existing calendar rendering and navigation with zero changes to `CalendarPicker` or `useCalendarPicker`.

### Decision 5: Modal display components are pure render (no local state)

**Chosen**: `CreateTaskModal` and `CreateProjectModal` are stateless display components — they receive `modalValues`, `activeFieldIndex`, `terminalWidth`, `terminalHeight` as props and render the form. All state lives in `useInputBar` and `useMainKeys`.

**Rationale**: Consistent with `HelpModal`, `TaskEditPicker`, `EnumPicker` — display components in this codebase own no logic.

## Risks / Trade-offs

- **Risk**: `useTextInputKeys` receives a `modalActiveFieldKey` ref that may be stale if the active field changes while a key event is in flight.
  → Mitigation: Use a React `ref` (not state) for `modalActiveFieldKey` so it is always current at read time, matching the pattern used for `inputValueRef` and `inputCursorRef` today.

- **Risk**: The `enumPickerTargetMode` prefix convention (`"modal:..."`) is an informal protocol that could silently break if a future non-modal enum picker mode accidentally uses the same prefix.
  → Mitigation: Add a `isModalEnumTarget` helper that checks the prefix explicitly; document the convention in `useInputBar.ts`.

- **Trade-off**: `A`/`P` shadow any future use of those keys for other purposes in all views. Given the task/project creation mental model, this is appropriate and consistent with Vim-style shift-modifier conventions in the app.

## Migration Plan

No data model changes. No migration required. The feature is purely additive — new input modes, new display components, new keybindings. Existing flows are unaffected.
