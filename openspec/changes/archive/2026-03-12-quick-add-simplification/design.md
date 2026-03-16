## Context

The Quick Add feature currently has two code paths:
1. **Token parsing path**: When users include tokens like `project:`, `due:`, `p1`, the input is parsed by `parseTaskCreateInput()` to extract structured data.
2. **AI fallback path**: When no tokens are detected, the raw text is sent to `api.createQuickAdd()` which uses AI to extract dates, priority, etc. from natural language.

This creates inconsistent behavior and a steep learning curve. Users must learn token syntax to get predictable results.

## Goals / Non-Goals

**Goals:**
- Simplify Quick Add (`a` key) to a single, predictable behavior
- Remove token parsing and AI processing entirely from quick add
- Make Quick Add always assign tasks to the current project (or Inbox)
- Preserve full-featured task creation via `A` key modal

**Non-Goals:**
- Removing the `parseTaskCreateInput` utility (still needed by `A` modal)
- Changing the Create Task Modal (`A` key) behavior
- Adding new features to either path

## Decisions

### Decision: Remove token parsing from Quick Add
**Rationale**: Token parsing adds complexity and requires users to learn syntax. The simpler model (`a` = title only, `A` = full form) is more intuitive.

**Implementation**: In `useSubmitInput.ts`, the `quickAdd` branch currently calls `parseTaskCreateInput()`. Change this to treat input as raw title, passing only `title` and `projectId` (from `activeProjectId`) to `api.createTask()`.

### Decision: Remove AI quick add fallback
**Rationale**: AI processing is unpredictable and duplicates what the `A` modal provides with full user control.

**Implementation**: Remove the `else` branch that calls `api.createQuickAdd()` and remove the `createQuickAdd` method from `api-client.ts` and `direct-api.ts` if unused elsewhere.

### Decision: Keep `parseTaskCreateInput` utility
**Rationale**: The `A` modal still needs to parse date phrases and handle structured input. The utility is still valuable, just not for quick add.

**Implementation**: No changes to `parse-task-create-input.ts`.

## Risks / Trade-offs

- **[Risk]** Power users who memorized tokens may find `A` modal slower → **Mitigation**: The modal has keyboard navigation (Tab, j/k) for fast field entry.
- **[Risk]** Users may not discover the `A` modal → **Mitigation**: Update Help modal to clearly document `a` vs `A` distinction.
- **[Risk]** Some workflows relied on quick natural language processing → **Mitigation**: The `A` modal provides equivalent control with explicit fields.

## Migration Plan

No data migration needed. This is a behavioral change only.

1. Update code to remove token/AI paths from quick add
2. Update tests to reflect new behavior
3. Update Help modal documentation

## Open Questions

None.
