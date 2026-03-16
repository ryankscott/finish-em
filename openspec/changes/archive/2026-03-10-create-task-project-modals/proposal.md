## Why

Creating a task or project today requires either the tokenized quick-add input (which demands knowledge of token syntax) or creating with defaults and then using the field picker to fill in each attribute one at a time. There is no single flow where a user can enter all fields for a new task or project at once, clearly and interactively.

## What Changes

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

## Capabilities

### New Capabilities
- `tui-create-task-modal`: Full-form modal overlay for creating a new task with all fields in a single keyboard-driven flow, triggered by `A`
- `tui-create-project-modal`: Full-form modal overlay for creating a new project with all fields in a single keyboard-driven flow, triggered by `P`

### Modified Capabilities
<!-- No existing spec-level requirements change -->

## Impact

- `src/tui/hooks/useInputBar.ts` — new `InputMode` values, modal field index state, per-field value map
- `src/tui/hooks/useMainKeys.ts` — `A` and `P` triggers; modal-mode navigation and submit routing
- `src/tui/hooks/useTextInputKeys.ts` — route keypresses to modal field values when modal is active
- `src/tui/hooks/useSubmitInput.ts` — new submit handlers for both modal modes
- `src/tui/App.tsx` — render `<CreateTaskModal>` and `<CreateProjectModal>` overlays
- New: `src/tui/CreateTaskModal.tsx`, `src/tui/CreateProjectModal.tsx` (display components)
