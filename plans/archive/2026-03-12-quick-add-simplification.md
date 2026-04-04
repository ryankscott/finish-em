# Quick Add Simplification

_Archived change: `2026-03-12-quick-add-simplification`_

## Summary

The current Quick Add feature is overloaded with complexity. Users must learn token syntax (`project:`, `due:`, `p1`, etc.) to be productive, and the AI fallback path adds unpredictability. This creates a steep learning curve and inconsistent behavior. We need a simpler mental model: `a` for fast task creation with minimal input, `A` for full control via modal.

## Scope

- **BREAKING**: Remove token parsing from Quick Add (`a` key). Input is treated as raw task title only.
- **BREAKING**: Remove AI processing fallback (`api.createQuickAdd()`). No AI interpretation of task input.
- Quick Add (`a`) always creates task in the current project (or Inbox if none).
- Quick Add (`a`) creates task with title only - no priority, dates, notes, or recurrence.
- `A` key (capital) opens full Create Task Modal for detailed task entry.
- Update existing spec `tui-quick-add-default-project` to reflect simplified behavior.
- Simplify Quick Add (`a` key) to a single, predictable behavior
- Remove token parsing and AI processing entirely from quick add
- Make Quick Add always assign tasks to the current project (or Inbox)
- Preserve full-featured task creation via `A` key modal
- Removing the `parseTaskCreateInput` utility (still needed by `A` modal)
- Changing the Create Task Modal (`A` key) behavior
- Adding new features to either path
- Impact: `src/tui/hooks/useSubmitInput.ts` - Remove token parsing branch, remove AI quick add path.
- Impact: `src/tui/parse-task-create-input.ts` - May be partially or fully deprecated for quick add (still used by `A` modal).
- Impact: `src/tui/api-client.ts` - `createQuickAdd()` method may be removed if unused elsewhere.
- Impact: `src/tui/direct-api.ts` - Quick add logic may need updates.
- Impact: `src/tui/HelpModal.tsx` - Update help text to reflect new `a` vs `A` behavior.
- Impact: Tests will need updates to remove token-based and AI-based test cases.
- Related capabilities: `tui-quick-add-default-project`

## Notes

- Decision: Remove token parsing from Quick Add: **Rationale**: Token parsing adds complexity and requires users to learn syntax. The simpler model (`a` = title only, `A` = full form) is more intuitive.
- Decision: Remove AI quick add fallback: **Rationale**: AI processing is unpredictable and duplicates what the `A` modal provides with full user control.
- Decision: Keep `parseTaskCreateInput` utility: **Rationale**: The `A` modal still needs to parse date phrases and handle structured input. The utility is still valuable, just not for quick add.
- **[Risk]** Power users who memorized tokens may find `A` modal slower → **Mitigation**: The modal has keyboard navigation (Tab, j/k) for fast field entry.
- **[Risk]** Users may not discover the `A` modal → **Mitigation**: Update Help modal to clearly document `a` vs `A` distinction.
- **[Risk]** Some workflows relied on quick natural language processing → **Mitigation**: The `A` modal provides equivalent control with explicit fields.
- Open questions: None.

## Implementation Phases

1. Core Implementation
   - [done] Modify `src/tui/hooks/useSubmitInput.ts` quickAdd branch
   - [done] Remove `createQuickAdd` from `src/tui/api-client.ts`
   - [done] Remove `createQuickAdd` from `src/tui/direct-api.ts`
2. Test Updates
   - [done] Update `src/tui/hooks/useSubmitInput.test.ts`
   - [done] Update any other affected test files
3. Documentation
   - [done] Update `src/tui/HelpModal.tsx`
4. Verification
   - [done] Run test suite and verify all tests pass
   - [done] Run `bun run check` for linting/formatting
   - [done] Manual verification of quick add behavior
