/**
 * Playwright screenshot engine — headless Chromium browser management and capture.
 *
 * Lazy single-browser instance, new context per screenshot for isolation.
 */

import { type Browser, chromium } from "playwright";

// ── Public interface ───────────────────────────────────────────────────────

export interface ScreenshotParams {
	url: string;
	viewportWidth?: number;
	viewportHeight?: number;
	fullPage?: boolean;
	waitFor?: string;
	click?: string;
	theme?: "light" | "dark";
}

export interface ScreenshotResult {
	content: Array<
		| { type: "text"; text: string }
		| { type: "image"; data: string; mimeType: string }
	>;
	details: {
		url: string;
		viewport: { width: number; height: number };
		fullPage: boolean;
		theme: string;
	};
}

// ── Engine ─────────────────────────────────────────────────────────────────

export class ScreenshotEngine {
	private browser: Browser | null = null;

	/** Launch Playwright Chromium (lazy, called on first capture). */
	async getBrowser(): Promise<Browser> {
		if (!this.browser) {
			try {
				this.browser = await chromium.launch({ headless: true });
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				if (
					msg.includes("Executable doesn't exist") ||
					msg.includes("browserType.launch")
				) {
					throw new Error(
						"Playwright Chromium browser not found. Install it with:\n" +
							"  npx playwright install chromium",
					);
				}
				throw err;
			}
		}
		return this.browser;
	}

	/** Take a screenshot and return result. */
	async capture(params: ScreenshotParams): Promise<ScreenshotResult> {
		const viewport = {
			width: params.viewportWidth ?? 1280,
			height: params.viewportHeight ?? 720,
		};

		const colorScheme: "light" | "dark" =
			params.theme === "dark" ? "dark" : "light";

		const browser = await this.getBrowser();
		const context = await browser.newContext({
			viewport,
			colorScheme,
		});
		const page = await context.newPage();

		try {
			await page.goto(params.url, { waitUntil: "networkidle" });

			// Handle wait_for
			if (params.waitFor) {
				const waitNum = Number(params.waitFor);
				const loadStates = ["load", "domcontentloaded", "networkidle"];

				if (!isNaN(waitNum) && params.waitFor.trim() !== "") {
					await page.waitForTimeout(waitNum);
				} else if (loadStates.includes(params.waitFor)) {
					await page.waitForLoadState(params.waitFor as "networkidle");
				} else {
					try {
						await page.waitForSelector(params.waitFor, { timeout: 5000 });
					} catch {
						throw new Error(
							`Wait condition failed: could not find element matching '${params.waitFor}' within 5s`,
						);
					}
				}
			}

			// Handle click
			if (params.click) {
				try {
					await page.click(params.click);
					await page.waitForTimeout(500);
				} catch {
					throw new Error(
						`Click failed: could not find element matching '${params.click}'`,
					);
				}
			}

			const screenshot = await page.screenshot({
				type: "png",
				fullPage: params.fullPage ?? false,
			});

			const base64 = screenshot.toString("base64");

			return {
				content: [
					{
						type: "text",
						text: `Screenshot of ${params.url} (${viewport.width}x${viewport.height})`,
					},
					{
						type: "image",
						data: base64,
						mimeType: "image/png",
					},
				],
				details: {
					url: params.url,
					viewport,
					fullPage: params.fullPage ?? false,
					theme: colorScheme,
				},
			};
		} finally {
			await page.close();
			await context.close();
		}
	}

	/** Close the browser instance. */
	async close(): Promise<void> {
		if (this.browser) {
			await this.browser.close();
			this.browser = null;
		}
	}
}
