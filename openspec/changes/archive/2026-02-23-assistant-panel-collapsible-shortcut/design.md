## Context

The TUI currently renders the assistant panel as a persistent part of the screen layout, which permanently reduces horizontal space available to core task and project panels. Existing keyboard-first interactions already centralize user flow in the TUI, so adding a shortcut-based visibility toggle aligns with current UX patterns and avoids mouse-dependent layout controls. The change must preserve predictable layout behavior across desktop sizes and maintain consistency between assistant state and rendered pane geometry.

Stakeholders:
- Power users relying on keyboard-driven navigation in the TUI.
- UI maintainers responsible for TUI layout/state correctness.
- Assistant feature maintainers who need reliable panel lifecycle behavior.

Constraints:
- Keep implementation in existing TUI architecture and shared state patterns.
- Avoid backend/API changes; this is a client-side layout/interaction behavior change.
- Preserve existing assistant functionality when expanded.

## Goals / Non-Goals

**Goals:**
- Add a dedicated keyboard shortcut to toggle assistant panel visibility in the TUI.
- Collapse assistant panel cleanly without unmount side effects that break assistant state.
- Automatically expand the main pane to use full available width when assistant is collapsed.
- Restore split layout sizing when assistant is re-expanded.
- Keep toggle behavior deterministic and consistent across rerenders.

**Non-Goals:**
- Redesigning overall TUI navigation or introducing additional layout modes.
- Adding new backend assistant APIs or persistence for panel visibility.
- Implementing animation-heavy transitions or complex resizing controls.

## Decisions

### 1) Add assistant visibility as explicit UI state in TUI context
- Decision: Introduce a boolean visibility flag in existing TUI/shared UI context, with a `toggleAssistantPanel` action.
- Rationale: A centralized state avoids prop-drilling and keeps shortcut handlers and layout renderers synchronized.
- Alternatives considered:
  - Local component state in panel container: rejected due to poor coordination with global hotkey handling.
  - Deriving visibility from pane width only: rejected because it creates implicit state and brittle behavior.

### 2) Bind a dedicated hotkey in existing TUI hotkey system
- Decision: Register a new shortcut in the current hotkey layer so users can toggle the panel from anywhere in the TUI.
- Rationale: Keeps interaction consistent with existing keyboard command patterns and avoids ad hoc listeners.
- Alternatives considered:
  - Global `window` key listener: rejected for maintainability and conflict risk.
  - Command palette-only trigger: rejected because direct shortcut is required and faster.

### 3) Drive layout from visibility state with two deterministic pane configurations
- Decision: Use two explicit layout configurations:
  - Expanded mode: normal split between main pane and assistant pane.
  - Collapsed mode: assistant pane hidden and main pane set to full width.
- Rationale: Explicit configurations are easier to reason about and test than incremental width mutation.
- Alternatives considered:
  - Remember arbitrary drag-resized ratios and recalculate dynamically: rejected as unnecessary complexity for this scope.

### 4) Preserve assistant session state while hidden
- Decision: Hide/collapse panel without resetting assistant conversation/session state.
- Rationale: Users expect collapsing to be a view change, not a data reset.
- Alternatives considered:
  - Unmount and recreate panel state each time: rejected due to poor UX and accidental context loss.

## Risks / Trade-offs

- [Shortcut conflicts with existing keybindings] → Mitigation: choose an unassigned shortcut and document it in help/shortcuts modal if applicable.
- [Layout regressions on narrow terminal widths] → Mitigation: enforce minimum pane constraints and test collapse/expand behavior on small and standard sizes.
- [State desynchronization between visibility flag and rendered layout] → Mitigation: derive render branches directly from a single source-of-truth visibility state.
- [Unexpected focus changes when toggling] → Mitigation: preserve active focus target when possible; otherwise route focus to main pane root predictably.

## Migration Plan

1. Add assistant visibility state and toggle action to shared TUI UI context/state.
2. Register the new hotkey to dispatch toggle action.
3. Update TUI layout container to render full-width main pane when assistant is hidden and split layout when shown.
4. Ensure assistant panel hide/show does not clear existing assistant session data.
5. Add/adjust tests for hotkey toggle and layout behavior.
6. Validate behavior manually in TUI dev run and existing assistant-related tests.

Rollback strategy:
- Revert the visibility flag/hotkey wiring and restore persistent split layout rendering. No data migrations are required because changes are UI-state only.

## Open Questions

- Which exact keybinding should be used to minimize collisions with current TUI shortcuts?
- Should shortcut help text be updated in all surfaces (TUI help modal and any in-app shortcut references) in this change or a follow-up?
- If users previously resized panes, should that ratio be restored after expand, or is a fixed default split sufficient for MVP?
