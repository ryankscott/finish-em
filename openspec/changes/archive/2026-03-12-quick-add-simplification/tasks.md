## 1. Core Implementation

- [x] 1.1 Modify `src/tui/hooks/useSubmitInput.ts` quickAdd branch
  - Remove call to `parseTaskCreateInput()`
  - Remove AI fallback path (`api.createQuickAdd()`)
  - Simplify to create task with `title` and `projectId` only
  - Use `activeProjectId` with fallback to inbox project
- [x] 1.2 Remove `createQuickAdd` from `src/tui/api-client.ts`
  - Delete `createQuickAdd` method if not used elsewhere
- [x] 1.3 Remove `createQuickAdd` from `src/tui/direct-api.ts`
  - Delete quick add handler and associated logic
  - Remove any AI-related types/interfaces if unused

## 2. Test Updates

- [x] 2.1 Update `src/tui/hooks/useSubmitInput.test.ts`
  - Remove tests for token parsing in quick add
  - Remove tests for AI quick add fallback
  - Add tests for simplified quick add behavior (title only, current project)
- [x] 2.2 Update any other affected test files
  - Check for tests referencing removed `createQuickAdd` method

## 3. Documentation

- [x] 3.1 Update `src/tui/HelpModal.tsx`
  - Update Quick Add (`a`) description to reflect simplified behavior
  - Ensure `A` (Create Task Modal) is documented as the path for detailed entry

## 4. Verification

- [x] 4.1 Run test suite and verify all tests pass
- [x] 4.2 Run `bun run check` for linting/formatting
- [x] 4.3 Manual verification of quick add behavior
  - Test `a` key creates task with raw title
  - Test `a` key assigns to current project
  - Test `A` key modal still works for detailed entry
