/**
 * pi-live-preview — Claude-style web app previews for pi.
 *
 * Provides:
 *   - preview_screenshot  — headless Playwright screenshots for LLM analysis
 *   - preview_open        — Glimpse native webview for live, interactive preview
 *   - preview_close       — close all preview resources
 *
 * Plus smart auto-detection that notices when a dev server starts.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { Text } from "@earendil-works/pi-tui";

import { COMMON_PORTS, isDevServerCommand, detectUrl } from "./detect";
import { ScreenshotEngine, type ScreenshotParams } from "./screenshot";
import { LivePreviewEngine } from "./live-preview";

// ── Extension ──────────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  const screenshot = new ScreenshotEngine();
  const livePreview = new LivePreviewEngine();
  const notifiedPorts = new Set<number>();

  // ── Tools ────────────────────────────────────────────────────────────────

  // --- preview_screenshot ---

  pi.registerTool({
    name: "preview_screenshot",
    label: "Preview Screenshot",
    description:
      "Take a screenshot of a web page using a headless browser (Playwright). " +
      "Use this tool to visually verify UI changes in a running web app. " +
      "If no URL is provided, automatically detects common dev server ports. " +
      "Returns a PNG image the model can see and analyze.",
    promptSnippet:
      "Take a screenshot of a running web app to visually verify UI changes",
    promptGuidelines: [
      "Use preview_screenshot when the user asks to see how the app looks, verify visual changes, or debug UI issues.",
      "Use preview_screenshot after making frontend changes to confirm they render correctly.",
      "If the dev server is not running, use the bash tool to start it first (e.g., npm run dev).",
      "For responsive testing, call preview_screenshot multiple times with different viewport_width values.",
      "Use the click parameter to interact with elements (menus, modals, buttons) before capturing.",
    ],
    parameters: Type.Object({
      url: Type.Optional(
        Type.String({
          description:
            "URL to screenshot. If omitted, tries to auto-detect from common dev servers " +
            "(localhost:3000, 5173, 8080, etc.)",
        }),
      ),
      viewport_width: Type.Optional(
        Type.Number({ description: "Viewport width in pixels (default: 1280)" }),
      ),
      viewport_height: Type.Optional(
        Type.Number({ description: "Viewport height in pixels (default: 720)" }),
      ),
      full_page: Type.Optional(
        Type.Boolean({
          description:
            "Capture the full scrollable page instead of just the viewport (default: false)",
        }),
      ),
      wait_for: Type.Optional(
        Type.String({
          description:
            "Wait condition before screenshot. Can be: 'networkidle', 'load', " +
            "'domcontentloaded', a CSS selector (e.g., '#app'), or a number of milliseconds.",
        }),
      ),
      click: Type.Optional(
        Type.String({
          description:
            "CSS selector of an element to click before taking the screenshot",
        }),
      ),
      theme: Type.Optional(
        Type.String({
          description:
            "Browser color scheme: 'light' or 'dark' (default: 'light')",
        }),
      ),
    }),

    async execute(toolCallId, params, signal, onUpdate, _ctx) {
      let url = params.url;

      // Auto-detect dev server if no URL given
      if (!url) {
        onUpdate?.({
          content: [{ type: "text", text: "Auto-detecting dev server..." }],
          details: {},
        });

        for (const port of COMMON_PORTS) {
          if (signal?.aborted) throw new Error("Cancelled");
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 800);
            const resp = await fetch(`http://localhost:${port}`, {
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (resp.ok || resp.status === 404) {
              url = `http://localhost:${port}`;
              break;
            }
          } catch {
            // port not open, try next
          }
        }
      }

      if (!url) {
        throw new Error(
          "No URL provided and could not auto-detect a running dev server. " +
            "Start your dev server first (e.g., npm run dev) or provide a URL.",
        );
      }

      onUpdate?.({
        content: [{ type: "text", text: `Navigating to ${url}...` }],
        details: {},
      });

      const result = await screenshot.capture({
        url,
        viewportWidth: params.viewport_width,
        viewportHeight: params.viewport_height,
        fullPage: params.full_page,
        waitFor: params.wait_for,
        click: params.click,
        theme: (params.theme as "light" | "dark") ?? "light",
      });

      return {
        content: result.content,
        details: result.details,
      };
    },

    renderCall(args, theme, context) {
      const text =
        (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
      const url = args.url ?? "auto-detect";
      const vp = `${args.viewport_width ?? 1280}x${args.viewport_height ?? 720}`;
      text.setText(
        theme.fg("toolTitle", theme.bold("preview_screenshot ")) +
          theme.fg("muted", `${url} `) +
          theme.fg("dim", `(${vp})`),
      );
      return text;
    },

    renderResult(result, { expanded, isPartial }, theme, context) {
      if (isPartial) {
        const text =
          (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
        text.setText(theme.fg("warning", "Taking screenshot..."));
        return text;
      }

      const text =
        (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
      const details = result.details as
        | { url: string; viewport: { width: number; height: number } }
        | undefined;

      if (details?.url) {
        let txt = theme.fg("success", "Screenshot captured");
        if (expanded) {
          txt += `\n  ${theme.fg("dim", `URL: ${details.url}`)}`;
          txt += `\n  ${theme.fg("dim", `Viewport: ${details.viewport.width}x${details.viewport.height}`)}`;
        }
        text.setText(txt);
      } else {
        text.setText(theme.fg("error", "Screenshot failed"));
      }
      return text;
    },
  });

  // --- preview_open ---

  pi.registerTool({
    name: "preview_open",
    label: "Preview Open",
    description:
      "Open a live preview window showing the web app at the given URL. " +
      "The window loads the dev server directly — HMR updates reflect in real-time. " +
      "Use this so the user can interact with their running app. " +
      "If no URL is provided, automatically detects common dev server ports.",
    promptSnippet:
      "Open a live browser preview of a running web app",
    promptGuidelines: [
      "Use preview_open after starting or confirming a dev server so the user can see their app live.",
      "The preview window shows the live app — the user can click, scroll, and see HMR updates.",
      "If the dev server is not running, start it with bash first.",
    ],
    parameters: Type.Object({
      url: Type.Optional(
        Type.String({
          description:
            "URL to open. If omitted, auto-detects from common dev server ports.",
        }),
      ),
      width: Type.Optional(
        Type.Number({ description: "Window width in pixels (default: 480)" }),
      ),
      height: Type.Optional(
        Type.Number({ description: "Window height in pixels (default: 360)" }),
      ),
    }),

    async execute(_toolCallId, params, signal, onUpdate, _ctx) {
      let url = params.url;

      if (!url) {
        onUpdate?.({
          content: [{ type: "text", text: "Detecting dev server..." }],
          details: {},
        });

        for (const port of COMMON_PORTS) {
          if (signal?.aborted) throw new Error("Cancelled");
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 800);
            const resp = await fetch(`http://localhost:${port}`, {
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (resp.ok || resp.status === 404) {
              url = `http://localhost:${port}`;
              break;
            }
          } catch {
            // port not open
          }
        }
      }

      if (!url) {
        throw new Error(
          "No URL provided and could not auto-detect a running dev server. " +
            "Start your dev server first (e.g., npm run dev) or provide a URL.",
        );
      }

      onUpdate?.({
        content: [{ type: "text", text: `Opening live preview: ${url}...` }],
        details: {},
      });

      const result = livePreview.open(url, {
        width: params.width,
        height: params.height,
      });

      const msg = result.reused
        ? `Live preview updated to ${url} (existing window reused)`
        : `Live preview opened at ${url}`;

      return {
        content: [{ type: "text", text: msg }],
        details: { url, reused: result.reused },
      };
    },

    renderCall(args, theme, context) {
      const text =
        (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
      const url = args.url ?? "auto-detect";
      text.setText(
        theme.fg("toolTitle", theme.bold("preview_open ")) +
          theme.fg("muted", url),
      );
      return text;
    },

    renderResult(result, { expanded, isPartial }, theme, context) {
      if (isPartial) {
        const text =
          (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
        text.setText(theme.fg("warning", "Opening preview..."));
        return text;
      }

      const text =
        (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
      const details = result.details as
        | { url: string; reused: boolean }
        | undefined;

      if (details?.url) {
        let txt = theme.fg("success", details.reused ? "Preview updated" : "Preview opened");
        if (expanded) {
          txt += `\n  ${theme.fg("dim", `URL: ${details.url}`)}`;
        }
        text.setText(txt);
      } else {
        text.setText(theme.fg("error", "Preview open failed"));
      }
      return text;
    },
  });

  // --- preview_close ---

  pi.registerTool({
    name: "preview_close",
    label: "Preview Close",
    description:
      "Close all open live preview windows and the screenshot browser. " +
      "Use this to clean up preview resources.",
    parameters: Type.Object({}),

    async execute() {
      const previewClosed = livePreview.close();
      await screenshot.close();

      const parts: string[] = [];
      if (previewClosed) parts.push("live preview window closed");
      parts.push("screenshot browser closed");

      return {
        content: [{ type: "text", text: `Preview closed: ${parts.join(", ")}.` }],
        details: { previewClosed },
      };
    },

    renderCall(_args, theme, context) {
      const text =
        (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
      text.setText(theme.fg("toolTitle", theme.bold("preview_close")));
      return text;
    },

    renderResult(result, { isPartial }, theme, context) {
      if (isPartial) {
        const text =
          (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
        text.setText(theme.fg("warning", "Closing preview..."));
        return text;
      }

      const text =
        (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
      text.setText(theme.fg("success", "Preview closed"));
      return text;
    },
  });

  // ── Commands ──────────────────────────────────────────────────────────────

  pi.registerCommand("preview", {
    description:
      "Open live preview of running dev server (uses preview_open tool)",
    handler: async (args, _ctx) => {
      const url = args.trim() || undefined;
      const msg = url
        ? `Open a live preview of ${url} so I can see and interact with my app.`
        : "Open a live preview of the app so I can see and interact with it.";
      pi.sendUserMessage(msg, { deliverAs: "followUp" });
    },
  });

  pi.registerCommand("preview-close", {
    description: "Close all preview windows and screenshot browser",
    handler: async (_args, _ctx) => {
      livePreview.close();
      await screenshot.close();
    },
  });

  // ── Auto-detection hooks ──────────────────────────────────────────────────

  // Phase 1: tool_call — detect dev server commands and extract ports
  pi.on("tool_call", async (event) => {
    if (event.toolName !== "bash") return;

    const input = event.input as { command?: string; excludeFromContext?: boolean } | undefined;
    if (!input?.command) return;
    if (input.excludeFromContext) return; // skip !! commands

    const command = input.command;
    if (!isDevServerCommand(command)) return;

    const url = detectUrl(command);
    if (!url) return; // will try again in tool_result

    const portMatch = url.match(/:(\d+)$/);
    const port = portMatch ? parseInt(portMatch[1], 10) : null;
    if (port !== null) {
      if (notifiedPorts.has(port)) return;
      notifiedPorts.add(port);
    }

    pi.sendMessage({
      customType: "pi-live-preview",
      content: `Dev server detected on ${url}. Call preview_open to open a live preview, or preview_screenshot to take a screenshot for visual verification.`,
      display: true,
      details: { url, phase: "tool_call" },
    });
  });

  // Phase 2: tool_result — scan command output for localhost:PORT
  pi.on("tool_result", async (event) => {
    if (event.toolName !== "bash") return;
    if (event.isError) return; // command failed, skip

    const command = (event.input as { command?: string } | undefined)?.command;
    if (!command) return;

    // Only scan if it's a dev server command we didn't already notify for
    if (!isDevServerCommand(command)) return;

    // Try to parse a fresh URL from the output
    const output = event.content?.[0] && "text" in event.content[0]
      ? (event.content[0] as { text: string }).text
      : "";

    const url = detectUrl(command, output);
    if (!url) return;

    const portMatch = url.match(/:(\d+)$/);
    const port = portMatch ? parseInt(portMatch[1], 10) : null;
    if (port !== null && notifiedPorts.has(port)) return;
    if (port !== null) notifiedPorts.add(port);

    pi.sendMessage({
      customType: "pi-live-preview",
      content: `Dev server detected on ${url}. Call preview_open to open a live preview for the user, or preview_screenshot to verify visually.`,
      display: true,
      details: { url, phase: "tool_result" },
    });
  });

  // ── Cleanup ───────────────────────────────────────────────────────────────

  pi.on("session_shutdown", async () => {
    livePreview.close();
    await screenshot.close();
  });
}
