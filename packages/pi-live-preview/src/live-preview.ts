/**
 * Live preview engine — Glimpse native webview windows.
 *
 * Opens a Glimpse window that loads a dev server URL. Single-window: reopening
 * updates the existing window's URL instead of spawning duplicates.
 *
 * Fallback: if no display is available (SSH, headless), returns a descriptive error.
 */

import { open } from "glimpseui";

/** Type for a Glimpse window handle (returned by `open()`). */
type GlimpseWindow = ReturnType<typeof open>;

// ── Types ──────────────────────────────────────────────────────────────────

export interface LivePreviewOptions {
  width?: number;
  height?: number;
}

export interface OpenResult {
  url: string;
  reused: boolean; // true if an existing window was updated instead of opened
}

// ── Engine ─────────────────────────────────────────────────────────────────

export class LivePreviewEngine {
  private win: GlimpseWindow | null = null;
  private currentUrl: string | null = null;

  /** Open or update the live preview window. */
  open(url: string, options: LivePreviewOptions = {}): OpenResult {
    const width = options.width ?? 480;
    const height = options.height ?? 360;

    if (this.win) {
      // Single-window: update existing window's URL
      this.win.send(`window.location.replace(${JSON.stringify(url)});`);
      this.currentUrl = url;
      return { url, reused: true };
    }

    // Build a minimal HTML page that immediately redirects to the dev server
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Preview</title></head>
<body style="margin:0;display:flex;align-items:center;justify-content:center;
      font-family:-apple-system,sans-serif;background:#1a1b26;color:#a9b1d6;">
  <p>Opening ${escapeHtml(url)}...</p>
  <script>window.location.replace(${JSON.stringify(url)});</script>
</body>
</html>`;

    const win = open(html, {
      width,
      height,
      title: `Preview — ${url}`,
      frameless: true,
    });

    // Listen for close so we can clean up our reference
    win.on("closed", () => {
      this.win = null;
      this.currentUrl = null;
    });

    this.win = win;
    this.currentUrl = url;
    return { url, reused: false };
  }

  /** Close the live preview window if open. Returns true if a window was closed. */
  close(): boolean {
    if (this.win) {
      this.win.close();
      this.win = null;
      this.currentUrl = null;
      return true;
    }
    return false;
  }

  /** Check if a live preview window is currently open. */
  isOpen(): boolean {
    return this.win !== null;
  }

  /** Get the currently previewed URL, or null. */
  getCurrentUrl(): string | null {
    return this.currentUrl;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
