## 1. Sidebar state and layout

- [x] 1.1 Add `sidebarVisible` state (boolean, default `true`) in `App.tsx`
- [x] 1.2 When `sidebarVisible` is false, do not render `Sidebar`; pass full `terminalWidth` to the content pane (TaskPanel, UpcomingPanel, or SettingsPanel)
- [x] 1.3 When `sidebarVisible` is true, keep current layout (render `Sidebar` with `SIDEBAR_WIDTH`, content pane uses `terminalWidth - SIDEBAR_WIDTH`)

## 2. Shortcut and focus

- [x] 2.1 Add keyboard handler for `/` that toggles `sidebarVisible`, only when main keys are active (not in text input or picker/modal)
- [x] 2.2 When toggling to collapsed and `focusArea === "sidebar"`, set focus to `"tasks"` (or the only available pane when not on Upcoming)

## 3. Help

- [x] 3.1 Add a shortcut row in `HelpModal.tsx` for `/` → "Toggle sidebar" (or equivalent wording)

## 4. Tests

- [x] 4.1 Add or update tests: shortcut toggles sidebar visibility and focus moves to tasks when collapsing from sidebar
- [x] 4.2 Add or update tests: help/shortcuts surface includes the sidebar toggle keybinding
