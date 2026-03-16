## 1. Fix TaskPanel Rendering

- [x] 1.1 Apply `toDisplayString` before `truncate` in the collapsed notes preview (`TaskPanel.tsx` line ~118)
- [x] 1.2 Apply `toDisplayString` to project description in the expanded panel view (`TaskPanel.tsx` line ~181)

## 2. Tests

- [x] 2.1 Add test: collapsed notes preview renders `[label]` for a markdown link (not raw syntax)
- [x] 2.2 Add test: collapsed notes preview renders `[label]` for a bare URL (not raw URL)
- [x] 2.3 Add test: expanded project description renders `[label]` for a markdown link
- [x] 2.4 Add test: expanded project description renders `[label]` for a bare URL
