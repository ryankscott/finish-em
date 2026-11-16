import { describe, expect, test } from "bun:test";

import { projectIdFromPath } from "./AppShell";

describe("projectIdFromPath", () => {
	test("reads the id from a project route", () => {
		expect(projectIdFromPath("/projects/23")).toBe(23);
		expect(projectIdFromPath("/projects/23/")).toBe(23);
	});
	test("ignores other routes", () => {
		expect(projectIdFromPath("/today")).toBeUndefined();
		expect(projectIdFromPath("/projects/abc")).toBeUndefined();
	});
});
