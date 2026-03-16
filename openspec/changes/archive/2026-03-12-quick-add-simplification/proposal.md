## Why

The current Quick Add feature is overloaded with complexity. Users must learn token syntax (`project:`, `due:`, `p1`, etc.) to be productive, and the AI fallback path adds unpredictability. This creates a steep learning curve and inconsistent behavior. We need a simpler mental model: `a` for fast task creation with minimal input, `A` for full control via modal.

## What Changes

- **BREAKING**: Remove token parsing from Quick Add (`a` key). Input is treated as raw task title only.
- **BREAKING**: Remove AI processing fallback (`api.createQuickAdd()`). No AI interpretation of task input.
- Quick Add (`a`) always creates task in the current project (or Inbox if none).
- Quick Add (`a`) creates task with title only - no priority, dates, notes, or recurrence.
- `A` key (capital) opens full Create Task Modal for detailed task entry.
- Update existing spec `tui-quick-add-default-project` to reflect simplified behavior.

## Capabilities

### New Capabilities
- *None*

### Modified Capabilities
- `tui-quick-add-default-project`: Requirements change - remove token support, remove AI fallback, simplify to title-only input with automatic project assignment.

## Impact

- `src/tui/hooks/useSubmitInput.ts` - Remove token parsing branch, remove AI quick add path.
- `src/tui/parse-task-create-input.ts` - May be partially or fully deprecated for quick add (still used by `A` modal).
- `src/tui/api-client.ts` - `createQuickAdd()` method may be removed if unused elsewhere.
- `src/tui/direct-api.ts` - Quick add logic may need updates.
- `src/tui/HelpModal.tsx` - Update help text to reflect new `a` vs `A` behavior.
- Tests will need updates to remove token-based and AI-based test cases.
