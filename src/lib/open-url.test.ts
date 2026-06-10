import { afterEach, describe, expect, it, mock } from "bun:test";
import { spawn } from "node:child_process";

import { withScheme } from "./open-url";

describe("withScheme", () => {
	it("returns empty string for empty input", () => {
		expect(withScheme("")).toBe("");
		expect(withScheme("  ")).toBe("");
	});

	it("preserves http:// URLs", () => {
		expect(withScheme("http://example.com")).toBe("http://example.com");
	});

	it("preserves https:// URLs", () => {
		expect(withScheme("https://example.com/path?q=1&r=2")).toBe(
			"https://example.com/path?q=1&r=2",
		);
	});

	it("is case-insensitive for scheme detection", () => {
		expect(withScheme("HTTPS://Example.COM")).toBe("HTTPS://Example.COM");
		expect(withScheme("HTTP://x.com")).toBe("HTTP://x.com");
	});

	it("prepends https:// when no scheme present", () => {
		expect(withScheme("example.com")).toBe("https://example.com");
		expect(withScheme("example.com/path")).toBe("https://example.com/path");
	});

	it("trims whitespace", () => {
		expect(withScheme("  https://example.com  ")).toBe("https://example.com");
	});
});

describe("openUrl spawn behavior", () => {
	const originalSpawn = spawn;
	let spawnCalls: {
		cmd: string;
		args: string[];
		opts: Record<string, unknown>;
	}[] = [];

	afterEach(() => {
		spawnCalls = [];
		mock.restore();
	});

	it("does not use shell: true (prevents URL mangling by shell metacharacters)", async () => {
		const mockChild = { unref: mock(() => {}) };
		const spawnMock = mock(
			(cmd: string, args: string[], opts: Record<string, unknown>) => {
				spawnCalls.push({ cmd, args, opts });
				return mockChild;
			},
		);

		mock.module("node:child_process", () => ({ spawn: spawnMock }));

		const { openUrl } = await import("./open-url");
		openUrl("https://example.com/search?q=test&page=2#section");

		expect(spawnCalls).toHaveLength(1);
		expect(spawnCalls[0].opts.shell).toBeFalsy();
		expect(spawnCalls[0].args).toContain(
			"https://example.com/search?q=test&page=2#section",
		);
	});
});
