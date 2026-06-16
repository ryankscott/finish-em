---
name: live-preview
description: Preview web apps during development — screenshots for visual verification and live Glimpse windows for interactive testing
---

# Live Preview

When building web applications, use the preview tools to verify your work visually and let the user see their app.

## Tools

### `preview_screenshot` — Take a screenshot

Use this to verify UI changes after making frontend edits:
- After modifying CSS, HTML, or component code, take a screenshot to confirm it looks right
- Use different `viewport_width` values (e.g., 375 and 1280) for responsive checks
- Use `click` to interact with elements (open modals, navigate menus) before capture
- Use `wait_for` to wait for specific elements or network idle before capturing

The image is sent directly to you — you can see and analyze it.

### `preview_open` — Open live preview for the user

Use this after confirming the dev server is running. Opens a native Glimpse window showing the user's app live with HMR updates:
- Use after starting a dev server so the user can interact with their app
- The window is a real browser — the user can click, scroll, and test functionality
- Only one preview window at a time

### `preview_close` — Close all previews

Clean up preview windows and the screenshot browser. Use when:
- The user asks to close the preview
- You're done with the current preview session
- Cleaning up before switching to a different task

## Workflow

1. **Start the dev server** via bash (e.g., `npm run dev`, `bun run dev`)
2. **Verify it works** — call `preview_screenshot` to confirm the app renders
3. **Let the user see it** — call `preview_open` to open the live preview window
4. **Iterate** — make changes, screenshot again, user sees updates via HMR
5. **Clean up** — call `preview_close` when done

## Auto-detection

The extension automatically detects when a dev server starts. When it does, you'll receive a message suggesting you open the preview. Act on it — the user started a dev server for a reason.
