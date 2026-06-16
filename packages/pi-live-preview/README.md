# pi-live-preview

Claude-style web app previews for [pi](https://github.com/earendil-works/pi-mono). Two complementary capabilities:

- **Preview Screenshot** — headless Playwright screenshots so the LLM can visually verify UI changes
- **Live Preview** — Glimpse native webview windows so you can see your app in real-time with HMR

Plus smart auto-detection: when a dev server starts, the LLM knows about it and can open the preview.

## Install

```bash
pi install npm:pi-live-preview
```

### Prerequisites

**Playwright Chromium** (for screenshot tool):

```bash
npx playwright install chromium
```

The screenshot tool will guide you with the exact command if Chromium is missing.

**Glimpse** (for live preview) — included automatically. Requires a graphical environment (macOS, Linux with X11/Wayland, or Windows). In headless/SSH environments, the live preview tool returns a descriptive error suggesting screenshots instead.

## Usage

### For the LLM

The package registers three tools the LLM can call:

| Tool | What it does |
|------|-------------|
| `preview_screenshot` | Takes a PNG screenshot via headless Playwright. Auto-detects dev server if no URL. |
| `preview_open` | Opens a live Glimpse webview showing your app. HMR updates in real-time. |
| `preview_close` | Closes all preview windows and the screenshot browser. |

Just prompt naturally — "Check how the app looks" or "Let me preview my app" — and the LLM will use the right tool.

### Slash Commands

| Command | Description |
|---------|-------------|
| `/preview` | Open live preview of running dev server |
| `/preview-close` | Close all preview windows |

### Auto-Detection

When you run `npm run dev`, `bun dev`, `vite`, `next dev`, or any similar command via the bash tool, the extension detects it and notifies the LLM. The LLM can then open the preview automatically.

## How It Works

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  dev server  │────▶│  auto-detection  │────▶│  LLM notified   │
│  starts      │     │  (tool_call hook)│     │                 │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                      │
                                         ┌────────────▼────────────┐
                                         │                         │
                                    ┌────▼────┐            ┌──────▼──────┐
                                    │screenshot│           │ live preview │
                                    │(Playwright)│          │  (Glimpse)   │
                                    └─────────┘            └─────────────┘
```

## Configuration

No configuration needed. The package works out of the box. If you want to customize common ports for auto-detection, you can edit the `COMMON_PORTS` array in the source.

## License

MIT
