## 1. TUI Visibility State

- [x] 1.1 Add assistant panel visibility state and toggle action to shared TUI/UI context.
- [x] 1.2 Ensure assistant visibility state persists through rerenders during the active session.

## 2. Shortcut Wiring

- [x] 2.1 Add a dedicated keyboard shortcut binding that triggers assistant panel toggle from normal TUI contexts.
- [x] 2.2 Update TUI shortcut/help surface to document the new assistant toggle keybinding.

## 3. Layout Behavior

- [x] 3.1 Update TUI layout rendering to hide assistant pane and expand main window to full width when assistant is collapsed.
- [x] 3.2 Restore split layout rendering (main pane + assistant pane) when assistant is expanded again.
- [x] 3.3 Ensure toggling panel visibility does not clear assistant conversation/session state.

## 4. Verification

- [x] 4.1 Add or update tests covering shortcut-driven collapse and expand behavior.
- [x] 4.2 Add or update tests covering main window auto-expand and split-layout restoration.
- [x] 4.3 Run targeted TUI/assistant tests and fix any regressions introduced by this change.
