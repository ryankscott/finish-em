# pi-live-preview — Design Spec

**Date**: 2026-06-10
**Status**: Draft
**Package**: `pi-live-preview` (npm publishable pi package)

## Overview

A pi package that provides Claude-style web app previews inside pi. Two capabilities:

1. **Preview Screenshot** — headless Playwright screenshots so the LLM can visually verify UI changes
2. **Live Preview** — Glimpse native webview window so the human can see their app in real-time with HMR

Plus smart auto-detection: when a dev server starts, the LLM is notified and can open the preview.

## Architecture

Single unified extension with supporting modules:

```
pi-live-preview/
├── package.json
├── README.md
├── src/
│   ├── index.ts          # Extension entry: registers tools, commands, event hooks
│   ├── screenshot.ts     # Playwright browser management + screenshot capture
│   ├── live-preview.ts   # Glimpse window open, URL redirect (single-window), close
│   └── detect.ts         # Dev server detection (pattern matching, port discovery)
├── skills/
│   └── SKILL.md           # LLM instructions for when/how to use preview tools
└── node_modules/
```

### Registered Resources

**Tools (callable by LLM)**:

| Tool | Description |
|------|-------------|
| `preview_screenshot` | Take a PNG screenshot via headless Playwright. Auto-detects dev server if no URL. Supports viewport, full_page, wait_for, click, theme params. |
| `preview_open` | Open a live Glimpse webview at a URL. Returns immediately after window opens. |
| `preview_close` | Close all open Glimpse preview windows. |

**Commands (user slash-commands)**:

| Command | Description |
|---------|-------------|
| `/preview` | Open live preview of detected dev server |
| `/preview-close` | Close all preview windows |

**Event Hooks**:

| Event | Purpose |
|-------|---------|
| `tool_call` (bash) | Detect dev server commands, parse --port/-p flags |
| `tool_result` (bash) | Scan tool output for localhost:PORT patterns |
| `session_shutdown` | Close Playwright browser + Glimpse windows |

**Skill**: `SKILL.md` gives the LLM guidelines for when to use each tool, how to handle missing dev servers, and best practices for visual verification.

## Tools — Detailed

### `preview_screenshot`

Screenshot of a web page using headless Playwright. Returns a PNG image the model can analyze.

**Parameters**:
- `url` (string, optional) — URL to screenshot. Auto-detects from common dev server ports if omitted.
- `viewport_width` (number, optional, default 1280)
- `viewport_height` (number, optional, default 720)
- `full_page` (boolean, optional, default false)
- `wait_for` (string, optional) — `networkidle`, `load`, `domcontentloaded`, CSS selector, or milliseconds
- `click` (string, optional) — CSS selector to click before capture
- `theme` (string, optional, `light` or `dark`, default `light`)

**Returns**: text summary + base64 PNG image content + details (url, viewport, fullPage, theme).

**Prompt guidelines** (injected into system prompt when tool is active):
- Use after frontend changes to confirm rendering
- Start dev server via bash if not running
- Use different viewport_width for responsive testing
- Use click to interact with elements before capture

**Auto-detection fallback**: probes common ports (3000, 5173, 8080, 4321, 4200, 8000, 1312, 5000, 9000, 3030, 4000, 5174, 4173) via fetch with 800ms timeout. First responding port used.

**Error cases**:
- No URL + no dev server → throws with guidance to start dev server
- Playwright chromium not installed → throws with install command

### `preview_open`

Open a live Glimpse native webview at the given URL. The window loads the dev server directly — HMR updates reflect in real-time.

**Parameters**:
- `url` (string, optional) — URL to open. Auto-detects from common ports if omitted.
- `width` (number, optional, default 480)
- `height` (number, optional, default 360)

**Behavior**:
- Single window: if already open, updates URL via `win.setHTML()` redirect rather than spawning a second window
- Uses Glimpse with `frameless: true` for a clean overlay feel
- Returns immediately after opening (doesn't wait for page load)
- **No GUI fallback**: if `DISPLAY`/`WAYLAND_DISPLAY` is unset on Linux, returns error suggesting `preview_screenshot` instead

**Error cases**:
- No URL + no dev server → throws
- No display available → throws with fallback suggestion
- Glimpse package missing → throws with install guidance

### `preview_close`

Close all open Glimpse preview windows and the Playwright browser.

**No parameters**. Returns confirmation text.

**Behavior**:
- Calls `close()` on all tracked Glimpse window handles
- Also closes the Playwright browser (same as `--preview-close` flag)
- Idempotent: safe to call when nothing is open

## Auto-Detection

### Trigger

Two hooks work together:
- `pi.on("tool_call")` for `bash` — detects dev server commands, extracts `--port`/`-p` flags, looks up tool-default ports. If a port is found, notifies immediately.
- `pi.on("tool_result")` for `bash` — scans command output for `localhost:PORT` patterns (catches ports that aren't in flags, like Vite's auto-port assignment). Complements the tool_call tier.

Skips commands with `excludeFromContext: true` (i.e., `!!` repeats).

### Pattern Matching

Regex scan of the command string. Triggers on any of:

```
npm run dev, npm start, npm run start
bun dev, bun run dev, bun run start
yarn dev, yarn start
pnpm dev, pnpm start
vite, npx vite, vite dev
next dev, npx next dev
astro dev
remix dev, remix vite:dev
turbo dev
npx serve
python -m http.server
php -S
```

### Port Discovery (three-tier)

1. **Explicit flag**: parse `--port <N>` or `-p <N>` from command string
2. **Tool-default fallback**:
   - Vite → 5173
   - Next.js → 3000
   - Astro → 4321
   - Remix → 3000
   - http.server → 8000
   - create-react-app → 3000
   - Angular → 4200
   - Hugo → 1313
   - serve → 3000
3. **Output parsing**: after bash completes, scan `tool_result` output for patterns like `localhost:5173`, `http://127.0.0.1:3000`, `http://localhost:4321/`

### Notification

On detection, calls `pi.sendMessage()`:

> "Dev server detected on http://localhost:<PORT>. Call preview_open to open a live preview, or preview_screenshot to take a screenshot for visual verification."

**Deduplication**: tracks notified ports per session, skips duplicates.

**No-op cases**:
- Command failed (tool_result isError) → skip
- No port discovered → skip
- Port already notified this session → skip
- excludeFromContext command → skip

## Live Preview UX

### Window Appearance

- **Default**: Glimpse frameless floating window, compact (480×360), positioned top-right
- **Title bar**: shows `🔒 localhost:PORT` with close button
- **Content**: the dev server URL loaded in a native webview (WKWebView/WebKitGTK/WebView2)
- **Always on top**: enabled by default so the preview stays visible while working in the terminal

### Interaction

- **Drag**: frameless window is draggable by background
- **Resize**: native window resizing from edges
- **Scroll/click/type**: full web interaction inside the webview
- **HMR**: updates automatically if dev server supports hot module replacement
- **Close**: via window close button, `/preview-close`, or session_shutdown

### Lifecycle

| Event | Action |
|-------|--------|
| `preview_open` called | Open Glimpse window (or update existing) |
| `preview_close` called | Close all Glimpse windows |
| User closes window manually | Tracked; next `preview_open` creates fresh window |
| `session_shutdown` | Close all windows + Playwright browser |
| Extension crashes | Windows persist as native OS windows — user closes manually |

## Playwright Browser Management

- Lazy initialization: browser launches on first `preview_screenshot` call
- Single browser instance reused across calls (new context per screenshot for isolation)
- Closed on `session_shutdown` or `preview_close`
- Install guidance on missing Chromium: `npx playwright install chromium`

## Error Handling

| Error | Behavior |
|-------|----------|
| Playwright Chromium not installed | Throws clear message with install command |
| No dev server running (auto-detect) | Throws with guidance to start dev server |
| No GUI / headless environment | `preview_open` returns error suggesting screenshot tool |
| Window already open | Updates existing window URL instead of opening duplicate |
| Port already notified | Skip deduplicated notification |
| Command failed | Skip auto-detection |

## Dependencies

```json
{
  "dependencies": {
    "playwright": "^1.52.0",
    "glimpseui": "*"
  },
  "peerDependencies": {
    "@earendil-works/pi-coding-agent": "*",
    "@earendil-works/pi-tui": "*",
    "typebox": "*"
  }
}
```

## Testing

### Unit Tests (`bun test`, no pi runtime)
- Port detection: parsing `--port`/`-p` from command strings
- Pattern matching: regex against dev server commands
- URL construction: building localhost URLs from port numbers
- Deduplication: same port doesn't trigger twice
- Tool-default port lookup

### Integration Tests (requires pi runtime)
- `preview_screenshot`: spin up `python -m http.server`, capture PNG, verify output shape
- Auto-detection hook: simulate bash tool_call, verify `sendMessage` called with correct URL
- Glimpse tests: skipped in CI (`process.env.CI` guard)

### Manual Verification
Documented in README:
1. `pi install npm:pi-live-preview`
2. Verify tools appear in `Available tools`
3. `npm run dev` in a Vite project → LLM notified → call `preview_open`
4. `/preview` command opens Glimpse, `/preview-close` closes it
5. `preview_screenshot` returns viewable PNG
6. Confirm HMR: edit source, Glimpse window updates

## Distribution

- **npm package**: `pi-live-preview` with `pi-package` keyword
- **Install**: `pi install npm:pi-live-preview`
- **pi manifest** in `package.json`:
  ```json
  {
    "pi": {
      "extensions": ["./src/index.ts"],
      "skills": ["./skills"]
    }
  }
  ```

## Open Questions

None — all design decisions settled during brainstorming.
