## Context

The TUI layout in `App.tsx` is a fixed row: `Sidebar` at a constant width (`SIDEBAR_WIDTH = 36`) and a content pane (TaskPanel, UpcomingPanel, or SettingsPanel) that receives `contentPaneTerminalWidth = terminalWidth - SIDEBAR_WIDTH`. The sidebar is always rendered and always visible. Focus is managed by `useNavigation` (`focusArea`: `"sidebar" | "tasks" | "goals"`). Key handling is centralized in `useKeybindings`, which delegates to `useMainKeys` for non-input key handling; when the user is in text input mode (input bar, pickers, etc.), those modes consume keys first. The help modal (`HelpModal.tsx`) lists shortcuts in a static `SHORTCUTS` array.

## Goals / Non-Goals

**Goals:**

- Add a single source of truth for “sidebar visible” (expanded) vs “sidebar collapsed.”
- Expose a keyboard shortcut (preferably `/`) that toggles that state from any normal TUI context (i.e. when not in a text-input or modal flow).
- When collapsed: hide or zero-width the sidebar and give the content pane full terminal width; ensure focus cannot remain on the sidebar (e.g. move focus to tasks).
- When expanded: restore current behavior (sidebar 36 cols, content pane remaining width).
- Document the shortcut in the help/shortcuts surface.

**Non-Goals:**

- Persisting sidebar collapsed state across sessions (no storage).
- Additional shortcuts or mouse-driven toggle.
- Animated transitions or configurable sidebar width.

## Decisions

1. **Where to hold sidebar visibility state**  
   Hold a boolean (e.g. `sidebarVisible` or `sidebarCollapsed`) in `App.tsx`. The layout (widths, conditional render) lives there, so keeping the state there avoids threading it through multiple hooks and keeps layout and state in one place.  
   *Alternative:* Put it in `useNavigation` so focus and “sidebar exists” stay aligned. Rejected because navigation already has many concerns; adding layout state there would blur responsibilities.

2. **Shortcut key: `/`**  
   Use `/` as the toggle key as requested. It is easy to reach and unlikely to conflict with task titles or project names in normal navigation.  
   *Alternative:* Another key (e.g. `b` for “sidebar”). Rejected in favor of the stated preference for `/`.

3. **When the shortcut is active**  
   Trigger the toggle only when the app is in “main” key handling (not in text input mode, not in a picker/modal that swallows keys). That matches existing patterns: e.g. `useKeybindings` only runs main keys when `!isTextInputMode` and no modal is capturing input. So `/` will not fire while typing in the input bar or in a picker.  
   *Alternative:* Allow `/` in input mode and treat it as “collapse sidebar then insert `/`”. Rejected to keep behavior simple and avoid special-case input handling.

4. **Focus when collapsing**  
   When the user collapses the sidebar, if `focusArea === "sidebar"`, set focus to `"tasks"` (or the only available pane, e.g. tasks when not on Upcoming). This avoids “focus on an invisible sidebar” and keeps keyboard navigation valid. When expanding, do not auto-focus the sidebar; leave focus where it is.  
   *Alternative:* When expanding, restore focus to sidebar. Rejected to reduce surprise and keep expansion non-intrusive.

5. **Rendering when collapsed**  
   Either (a) conditionally not render `Sidebar` when collapsed, or (b) render it with width 0 / `minWidth={0}` and hidden. Option (a) is simpler and makes it clear the sidebar is absent; content pane width becomes `terminalWidth` when collapsed. Recommended: conditional render (do not render `Sidebar` when collapsed) and pass full `terminalWidth` to the content pane in that case.

## Risks / Trade-offs

- **[Conflict with future “search” or “/” command]** If the app later uses `/` for search or a command palette, the binding could conflict. Mitigation: document the choice; if a conflict appears, we can introduce a different key or a modifier.
- **[No persistence]** Collapsed state resets on restart. Mitigation: accept for this change; persistence can be a follow-up if desired.
- **[Focus jump when collapsing]** If the user is in the sidebar and presses `/`, focus moves to tasks. Mitigation: keep the move predictable (always to tasks when coming from sidebar) and document in help.
