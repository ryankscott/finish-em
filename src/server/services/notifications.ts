/**
 * Native macOS notification delivery. Best-effort: failures are swallowed by
 * callers (mirrors the calendar/inbox background jobs), since a missed
 * notification should never crash the server.
 */

function escapeForAppleScript(value: string): string {
	return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function notifyMacOS(title: string, body: string): Promise<void> {
	if (process.platform !== "darwin") return;

	const script = `display notification "${escapeForAppleScript(body)}" with title "${escapeForAppleScript(title)}"`;
	const proc = Bun.spawn(["osascript", "-e", script], {
		stdout: "ignore",
		stderr: "pipe",
	});
	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		const stderr = await new Response(proc.stderr).text();
		throw new Error(`osascript exited with ${exitCode}: ${stderr}`);
	}
}
