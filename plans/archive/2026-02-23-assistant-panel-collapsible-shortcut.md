# Assistant Panel Collapsible Shortcut

_Archived change: `2026-02-23-assistant-panel-collapsible-shortcut`_

## Summary

The TUI assistant currently stays visible at all times, which reduces available space for primary task/project workflows and slows keyboard-driven usage. Adding a shortcut-based collapse/expand flow now improves focus and matches expected power-user behavior while keeping assistant access instant.

## Scope

- Add a keyboard shortcut to toggle assistant panel visibility (collapse when open, expand when hidden) in the TUI.
- When the assistant panel is collapsed, automatically expand the main content window to consume the freed layout space.
- When the assistant panel is expanded again, restore the split layout so assistant and main content are both visible.
- Ensure the toggle behavior is reflected consistently in shared TUI/UI state so rendering and hotkeys remain predictable.
- Add a dedicated keyboard shortcut to toggle assistant panel visibility in the TUI.
- Collapse assistant panel cleanly without unmount side effects that break assistant state.
- Automatically expand the main pane to use full available width when assistant is collapsed.
- Restore split layout sizing when assistant is re-expanded.
- Keep toggle behavior deterministic and consistent across rerenders.
- Redesigning overall TUI navigation or introducing additional layout modes.
- Adding new backend assistant APIs or persistence for panel visibility.
- Implementing animation-heavy transitions or complex resizing controls.
- Impact: Affected code: TUI layout components, assistant panel container, hotkey handling, and shared UI state/context.
- Impact: Affected UX: Keyboard-only users gain faster context switching and more usable screen space.
- Impact: APIs/dependencies: No backend API contract changes expected; scope is TUI/frontend interaction behavior.
- Related capabilities: `assistant-panel-visibility-toggle`, `tui-main-window-auto-expand`

## Notes

- 1) Add assistant visibility as explicit UI state in TUI context: - Decision: Introduce a boolean visibility flag in existing TUI/shared UI context, with a `toggleAssistantPanel` action. - Rationale: A centralized state avoids prop-drilling and keeps shortcut handlers and layout renderers synchronized. - Alternatives considered: - Local component state in panel container: rejected due to poor coordination with global hotkey handling. - Deriving visibility from pane width only: rejected because it creates implicit state and brittle behavior.
- 2) Bind a dedicated hotkey in existing TUI hotkey system: - Decision: Register a new shortcut in the current hotkey layer so users can toggle the panel from anywhere in the TUI. - Rationale: Keeps interaction consistent with existing keyboard command patterns and avoids ad hoc listeners. - Alternatives considered: - Global `window` key listener: rejected for maintainability and conflict risk. - Command palette-only trigger: rejected because direct shortcut is required and faster.
- 3) Drive layout from visibility state with two deterministic pane configurations: - Decision: Use two explicit layout configurations: - Expanded mode: normal split between main pane and assistant pane. - Collapsed mode: assistant pane hidden and main pane set to full width. - Rationale: Explicit configurations are easier to reason about and test than incremental width mutation. - Alternatives considered: - Remember arbitrary drag-resized ratios and recalculate dynamically: rejected as unnecessary complexity for this scope.
- 4) Preserve assistant session state while hidden: - Decision: Hide/collapse panel without resetting assistant conversation/session state. - Rationale: Users expect collapsing to be a view change, not a data reset. - Alternatives considered: - Unmount and recreate panel state each time: rejected due to poor UX and accidental context loss.
- [Shortcut conflicts with existing keybindings] → Mitigation: choose an unassigned shortcut and document it in help/shortcuts modal if applicable.
- [Layout regressions on narrow terminal widths] → Mitigation: enforce minimum pane constraints and test collapse/expand behavior on small and standard sizes.
- [State desynchronization between visibility flag and rendered layout] → Mitigation: derive render branches directly from a single source-of-truth visibility state.
- [Unexpected focus changes when toggling] → Mitigation: preserve active focus target when possible; otherwise route focus to main pane root predictably.
- Open questions: - Which exact keybinding should be used to minimize collisions with current TUI shortcuts? - Should shortcut help text be updated in all surfaces (TUI help modal and any in-app shortcut references) in this change or a follow-up? - If users previously resized panes, should that ratio be restored after expand, or is a fixed default split sufficient for MVP?

## Implementation Phases

1. TUI Visibility State
   - [done] Add assistant panel visibility state and toggle action to shared TUI/UI context.
   - [done] Ensure assistant visibility state persists through rerenders during the active session.
2. Shortcut Wiring
   - [done] Add a dedicated keyboard shortcut binding that triggers assistant panel toggle from normal TUI contexts.
   - [done] Update TUI shortcut/help surface to document the new assistant toggle keybinding.
3. Layout Behavior
   - [done] Update TUI layout rendering to hide assistant pane and expand main window to full width when assistant is collapsed.
   - [done] Restore split layout rendering (main pane + assistant pane) when assistant is expanded again.
   - [done] Ensure toggling panel visibility does not clear assistant conversation/session state.
4. Verification
   - [done] Add or update tests covering shortcut-driven collapse and expand behavior.
   - [done] Add or update tests covering main window auto-expand and split-layout restoration.
   - [done] Run targeted TUI/assistant tests and fix any regressions introduced by this change.
