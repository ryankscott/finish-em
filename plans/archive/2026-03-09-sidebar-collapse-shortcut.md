# Sidebar Collapse Shortcut

_Archived change: `2026-03-09-sidebar-collapse-shortcut`_

## Summary

The TUI sidebar (project list and nav) always occupies horizontal space. Users who want more room for the task list or who prefer a minimal layout have no way to hide it without leaving the app. Adding a keyboard shortcut to collapse and expand the sidebar gives users control over layout and aligns with the existing keyboard-first UX.

## Scope

- A dedicated keyboard shortcut (preferably `/`) that toggles the sidebar between visible and collapsed from normal TUI interaction contexts.
- Layout behavior so the main content area uses the freed space when the sidebar is collapsed and restores when expanded.
- Help/shortcuts surface updated to document the new keybinding.
- Add a single source of truth for “sidebar visible” (expanded) vs “sidebar collapsed.”
- Expose a keyboard shortcut (preferably `/`) that toggles that state from any normal TUI context (i.e. when not in a text-input or modal flow).
- When collapsed: hide or zero-width the sidebar and give the content pane full terminal width; ensure focus cannot remain on the sidebar (e.g. move focus to tasks).
- When expanded: restore current behavior (sidebar 36 cols, content pane remaining width).
- Document the shortcut in the help/shortcuts surface.
- Persisting sidebar collapsed state across sessions (no storage).
- Additional shortcuts or mouse-driven toggle.
- Animated transitions or configurable sidebar width.
- Impact: **TUI layout**: Sidebar and main content width/visibility; single source of truth for sidebar collapsed state.
- Impact: **Key handling**: New binding (e.g. `/`) in the main TUI hotkey layer; ensure no conflict with input bar or other modes.
- Impact: **Help/shortcuts**: Document the sidebar toggle in the shortcuts modal or equivalent.
- Related capabilities: `tui-sidebar-toggle`

## Notes

- 1. **Where to hold sidebar visibility state** Hold a boolean (e.g. `sidebarVisible` or `sidebarCollapsed`) in `App.tsx`. The layout (widths, conditional render) lives there, so keeping the state there avoids threading it through multiple hooks and keeps layout and state in one place. *Alternative:* Put it in `useNavigation` so focus and “sidebar exists” stay aligned. Rejected because navigation already has many concerns; adding layout state there would blur responsibilities.
- **[Conflict with future “search” or “/” command]** If the app later uses `/` for search or a command palette, the binding could conflict. Mitigation: document the choice; if a conflict appears, we can introduce a different key or a modifier.
- **[No persistence]** Collapsed state resets on restart. Mitigation: accept for this change; persistence can be a follow-up if desired.
- **[Focus jump when collapsing]** If the user is in the sidebar and presses `/`, focus moves to tasks. Mitigation: keep the move predictable (always to tasks when coming from sidebar) and document in help.

## Implementation Phases

1. Sidebar state and layout
   - [done] Add `sidebarVisible` state (boolean, default `true`) in `App.tsx`
   - [done] When `sidebarVisible` is false, do not render `Sidebar`; pass full `terminalWidth` to the content pane (TaskPanel, UpcomingPanel, or SettingsPanel)
   - [done] When `sidebarVisible` is true, keep current layout (render `Sidebar` with `SIDEBAR_WIDTH`, content pane uses `terminalWidth - SIDEBAR_WIDTH`)
2. Shortcut and focus
   - [done] Add keyboard handler for `/` that toggles `sidebarVisible`, only when main keys are active (not in text input or picker/modal)
   - [done] When toggling to collapsed and `focusArea === "sidebar"`, set focus to `"tasks"` (or the only available pane when not on Upcoming)
3. Help
   - [done] Add a shortcut row in `HelpModal.tsx` for `/` → "Toggle sidebar" (or equivalent wording)
4. Tests
   - [done] Add or update tests: shortcut toggles sidebar visibility and focus moves to tasks when collapsing from sidebar
   - [done] Add or update tests: help/shortcuts surface includes the sidebar toggle keybinding
