import { spawn } from "node:child_process";

/**
 * Ensures the URL has a scheme so the OS opens it in a browser.
 */
function withScheme(url: string): string {
	const u = url.trim();
	if (!u) return u;
	if (/^https?:\/\//i.test(u)) return u;
	return `https://${u}`;
}

/**
 * Opens a URL in the system default browser or handler.
 * Uses full paths where possible so it works in bundled/sandboxed environments.
 */
export function openUrl(url: string): void {
	const normalized = withScheme(url.trim());
	if (!normalized) return;

	const platform = process.platform;
	let cmd: string;
	let args: string[];
	let useShell = false;

	if (platform === "darwin") {
		cmd = "open";
		args = [normalized];
		useShell = true;
	} else if (platform === "win32") {
		cmd = "cmd";
		args = ["/c", "start", "", normalized];
	} else {
		cmd = "xdg-open";
		args = [normalized];
	}

	const child = spawn(cmd, args, {
		stdio: "ignore",
		detached: true,
		shell: useShell,
	});
	child.unref();
}
