# Blocked Tasks MVP

## Recommendation

Treat blocked as an overlay on an open task, not as a third task status. For v1, use a required free-text block reason with manual unblock, keep blocked tasks visible in normal lists, and add a dedicated Blocked view. Defer task-to-task dependency references and automatic unblocking to a later change because they introduce graph semantics, deletion rules, and broader UX complexity.

## Scope

Included:
- Native blocked concept in the data model, CLI, and TUI
- Required free-text reason while blocked
- Manual unblock flow
- Completion guard that rejects blocked tasks
- Dedicated Blocked view while keeping blocked tasks visible in normal lists

Excluded from v1:
- Task-to-task blocker references
- Automatic unblocking
- Dependency graph validation or cycle detection
- Subtask cascade rules for blocking

## Implementation Phases

1. Add `blocked_reason` and `blocked_at` to the task schema, startup schema guards, and task types.
2. Update repository create, update, list, and complete flows so blocked tasks round-trip correctly, can be filtered, and cannot complete until unblocked.
3. Extend the CLI surface to create, update, list, and unblock blocked tasks and to return a clear error when `task done` is attempted on a blocked task.
4. Extend TUI create and edit flows to capture blocked reasons, surface blocked state in task rendering, and add a dedicated Blocked view.
5. Add repository, CLI, and TUI tests, then verify with `bun test`, `bun run check`, and a manual TUI pass against a temporary database.
