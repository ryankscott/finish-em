import { describe, expect, test } from "bun:test";
import {
	buildUrl,
	detectUrl,
	getToolDefaultPort,
	isDevServerCommand,
	parsePortFlag,
	parsePortFromOutput,
} from "../detect";

// ── isDevServerCommand ─────────────────────────────────────────────────────

describe("isDevServerCommand", () => {
	test("matches npm run dev", () => {
		expect(isDevServerCommand("npm run dev")).toBe(true);
	});

	test("matches npm start", () => {
		expect(isDevServerCommand("npm start")).toBe(true);
	});

	test("matches bun dev", () => {
		expect(isDevServerCommand("bun dev")).toBe(true);
	});

	test("matches bun run dev", () => {
		expect(isDevServerCommand("bun run dev")).toBe(true);
	});

	test("matches yarn dev", () => {
		expect(isDevServerCommand("yarn dev")).toBe(true);
	});

	test("matches pnpm dev", () => {
		expect(isDevServerCommand("pnpm dev")).toBe(true);
	});

	test("matches vite", () => {
		expect(isDevServerCommand("vite")).toBe(true);
	});

	test("matches npx vite", () => {
		expect(isDevServerCommand("npx vite")).toBe(true);
	});

	test("matches next dev", () => {
		expect(isDevServerCommand("next dev")).toBe(true);
	});

	test("matches npx next dev", () => {
		expect(isDevServerCommand("npx next dev")).toBe(true);
	});

	test("matches astro dev", () => {
		expect(isDevServerCommand("astro dev")).toBe(true);
	});

	test("matches remix dev", () => {
		expect(isDevServerCommand("remix dev")).toBe(true);
	});

	test("matches turbo dev", () => {
		expect(isDevServerCommand("turbo dev")).toBe(true);
	});

	test("matches npx serve", () => {
		expect(isDevServerCommand("npx serve")).toBe(true);
	});

	test("matches python http.server", () => {
		expect(isDevServerCommand("python -m http.server")).toBe(true);
	});

	test("matches python3 http.server", () => {
		expect(isDevServerCommand("python3 -m http.server")).toBe(true);
	});

	test("matches php -S", () => {
		expect(isDevServerCommand("php -S localhost:8000")).toBe(true);
	});

	test("does not match unrelated commands", () => {
		expect(isDevServerCommand("npm install")).toBe(false);
		expect(isDevServerCommand("ls -la")).toBe(false);
		expect(isDevServerCommand("echo hello")).toBe(false);
		expect(isDevServerCommand("bun test")).toBe(false);
	});

	test("does not match 'dev' in other contexts", () => {
		expect(isDevServerCommand("cat dev.log")).toBe(false);
		expect(isDevServerCommand("echo developing")).toBe(false);
	});
});

// ── parsePortFlag ──────────────────────────────────────────────────────────

describe("parsePortFlag", () => {
	test("parses --port 3000", () => {
		expect(parsePortFlag("next dev --port 3000")).toBe(3000);
	});

	test("parses --port=5173", () => {
		expect(parsePortFlag("vite --port=5173")).toBe(5173);
	});

	test("parses -p 8080", () => {
		expect(parsePortFlag("python -m http.server -p 8080")).toBe(8080);
	});

	test("handles --port at end of command", () => {
		expect(parsePortFlag("npm run dev -- --port 4321")).toBe(4321);
	});

	test("returns null when no port flag", () => {
		expect(parsePortFlag("npm run dev")).toBeNull();
		expect(parsePortFlag("ls")).toBeNull();
	});
});

// ── getToolDefaultPort ─────────────────────────────────────────────────────

describe("getToolDefaultPort", () => {
	test("vite defaults to 5173", () => {
		expect(getToolDefaultPort("vite")).toBe(5173);
	});

	test("next dev defaults to 3000", () => {
		expect(getToolDefaultPort("next dev")).toBe(3000);
	});

	test("astro dev defaults to 4321", () => {
		expect(getToolDefaultPort("astro dev")).toBe(4321);
	});

	test("remix dev defaults to 3000", () => {
		expect(getToolDefaultPort("remix dev")).toBe(3000);
	});

	test("python http.server with explicit port", () => {
		expect(getToolDefaultPort("python -m http.server 9999")).toBe(9999);
	});

	test("python http.server without port returns null", () => {
		expect(getToolDefaultPort("python -m http.server")).toBeNull();
	});

	test("php -S with host:port parses port", () => {
		expect(getToolDefaultPort("php -S 0.0.0.0:8888")).toBe(8888);
		expect(getToolDefaultPort("php -S localhost:9999")).toBe(9999);
	});

	test("unknown command returns null", () => {
		expect(getToolDefaultPort("some-random-tool")).toBeNull();
	});
});

// ── parsePortFromOutput ────────────────────────────────────────────────────

describe("parsePortFromOutput", () => {
	test("finds localhost:PORT", () => {
		expect(
			parsePortFromOutput("Server running at http://localhost:5173/"),
		).toBe(5173);
	});

	test("finds 127.0.0.1:PORT", () => {
		expect(parsePortFromOutput("Listening on http://127.0.0.1:3000")).toBe(
			3000,
		);
	});

	test("finds Vite-style output", () => {
		const output =
			"  ➜  Local:   http://localhost:5173/\n  ➜  Network: http://192.168.1.5:5173/";
		expect(parsePortFromOutput(output)).toBe(5173);
	});

	test("finds python http.server output", () => {
		expect(
			parsePortFromOutput(
				"Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...",
			),
		).toBe(8000);
	});

	test("returns null when no port found", () => {
		expect(parsePortFromOutput("Compiled successfully")).toBeNull();
		expect(parsePortFromOutput("")).toBeNull();
	});
});

// ── buildUrl ───────────────────────────────────────────────────────────────

describe("buildUrl", () => {
	test("builds URL from port", () => {
		expect(buildUrl(5173)).toBe("http://localhost:5173");
		expect(buildUrl(3000)).toBe("http://localhost:3000");
	});
});

// ── detectUrl (full pipeline) ──────────────────────────────────────────────

describe("detectUrl", () => {
	test("tier 1: --port flag", () => {
		expect(detectUrl("next dev --port 4567")).toBe("http://localhost:4567");
	});

	test("tier 2: tool default", () => {
		expect(detectUrl("vite")).toBe("http://localhost:5173");
		expect(detectUrl("next dev")).toBe("http://localhost:3000");
		expect(detectUrl("astro dev")).toBe("http://localhost:4321");
	});

	test("tier 3: output parsing", () => {
		const output =
			"ready started server on 0.0.0.0:9876, url: http://localhost:9876";
		expect(detectUrl("some-unknown-tool run", output)).toBe(
			"http://localhost:9876",
		);
	});

	test("tier 1 beats tier 2", () => {
		// Even though vite defaults to 5173, explicit --port takes precedence
		expect(detectUrl("vite --port 9999")).toBe("http://localhost:9999");
	});

	test("returns null when nothing found", () => {
		expect(detectUrl("ls -la")).toBeNull();
		expect(detectUrl("npm run build")).toBeNull();
		// npm run dev without tool-specific default or output port → null
		expect(detectUrl("npm run dev", "Build succeeded. Done.")).toBeNull();
	});
});
