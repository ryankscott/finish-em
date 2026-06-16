/**
 * Dev server detection — pattern matching, port discovery, and URL construction.
 *
 * Two-phase detection:
 *   1. tool_call: scan the command string for dev server patterns, --port/-p flags, tool-default ports
 *   2. tool_result: scan command output for localhost:PORT patterns
 */

// ── Common dev server ports (auto-detection fallback) ──────────────────────

export const COMMON_PORTS = [
	3000, 5173, 8080, 4321, 4200, 8000, 1312, 5000, 9000, 3030, 4000, 5174, 4173,
];

// ── Tool → default port mapping ───────────────────────────────────────────

const TOOL_DEFAULT_PORT: Record<string, number> = {
	vite: 5173,
	astro: 4321,
	angular: 4200,
	hugo: 1313,
	serve: 3000,
};

// Default for next, remix, cra, react-scripts, etc.
const DEFAULT_DEV_PORT = 3000;

// ── Dev server command patterns ────────────────────────────────────────────

const DEV_SERVER_PATTERNS = [
	/\b(npm run dev|npm start|npm run start)\b/,
	/\b(bun dev|bun run dev|bun run start|bun start)\b/,
	/\b(yarn dev|yarn start)\b/,
	/\b(pnpm dev|pnpm start)\b/,
	/\b(npx vite|vite dev|vite\b)/,
	/\b(next dev|npx next dev)\b/,
	/\b(astro dev)\b/,
	/\b(remix dev|remix vite:dev)\b/,
	/\b(turbo dev)\b/,
	/\b(npx serve)\b/,
	/\b(python3? -m http\.server)\b/,
	/\b(php -S)\b/,
];

// ── Public API ─────────────────────────────────────────────────────────────

/** Check whether a command string looks like it starts a dev server. */
export function isDevServerCommand(command: string): boolean {
	for (const pattern of DEV_SERVER_PATTERNS) {
		if (pattern.test(command)) return true;
	}
	return false;
}

/** Extract --port <N> or -p <N> from a command string. Returns null if not found. */
export function parsePortFlag(command: string): number | null {
	// --port 3000 or --port=3000
	let m = command.match(/--port[= ](\d{1,5})\b/);
	if (m) return parseInt(m[1], 10);

	// -p 5173 (but not -p inside another flag like --port)
	m = command.match(/(?:^|\s)-p\s+(\d{1,5})\b/);
	if (m) return parseInt(m[1], 10);

	return null;
}

/** Return the well-known default port for a dev tool, or null if unknown. */
export function getToolDefaultPort(command: string): number | null {
	const lower = command.toLowerCase();

	// Python http.server: parse the port argument explicitly
	const pythonMatch = lower.match(/python3?\s+-m\s+http\.server\s+(\d{1,5})\b/);
	if (pythonMatch) return parseInt(pythonMatch[1], 10);

	// PHP -S: parse the host:port argument
	const phpMatch = lower.match(/php\s+-s\s+\S*?:(\d{1,5})\b/);
	if (phpMatch) return parseInt(phpMatch[1], 10);

	for (const [tool, port] of Object.entries(TOOL_DEFAULT_PORT)) {
		// Use word-boundary match to avoid substring false positives (e.g., "serve" in "server")
		if (new RegExp(`\\b${tool}\\b`, "i").test(lower)) return port;
	}

	// Any next/remix/cra/react-scripts variant defaults to 3000
	if (/\b(next|remix|react-scripts|create-react-app|cra)\b/i.test(lower)) {
		return DEFAULT_DEV_PORT;
	}

	// npx serve aligns with serve
	if (lower.includes("npx serve")) return 3000;

	return null;
}

/** Scan command output for localhost / 127.0.0.1 port patterns. */
export function parsePortFromOutput(output: string): number | null {
	const patterns = [
		/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d{1,5})/gi,
		/Local:\s+(?:https?:\/\/)?\S+?:(\d{1,5})/i,
		/http:\/\/(?:localhost|127\.0\.0\.1):(\d{1,5})/gi,
		/\(http:\/\/0\.0\.0\.0:(\d{1,5})\)/i,
	];

	for (const pattern of patterns) {
		const m = pattern.exec(output);
		if (m) {
			const port = parseInt(m[1], 10);
			if (port > 0 && port < 65536) return port;
		}
	}

	return null;
}

/** Build a localhost URL from a port. */
export function buildUrl(port: number): string {
	return `http://localhost:${port}`;
}

/**
 * Full three-tier port discovery for a single bash command.
 * Returns the detected URL, or null.
 */
export function detectUrl(command: string, output?: string): string | null {
	// Tier 1: explicit --port / -p flag
	const flagPort = parsePortFlag(command);
	if (flagPort !== null) return buildUrl(flagPort);

	// Tier 2: tool-default port
	const defaultPort = getToolDefaultPort(command);
	if (defaultPort !== null) return buildUrl(defaultPort);

	// Tier 3: scan command output
	if (output) {
		const outputPort = parsePortFromOutput(output);
		if (outputPort !== null) return buildUrl(outputPort);
	}

	return null;
}
