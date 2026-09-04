import { describe, expect, it } from "bun:test";

import { parseDurationMinutes } from "./parse-duration";

describe("parseDurationMinutes", () => {
	it("reads a bare number as minutes", () => {
		expect(parseDurationMinutes("45")).toBe(45);
	});

	it("reads explicit minutes", () => {
		expect(parseDurationMinutes("45m")).toBe(45);
		expect(parseDurationMinutes("45min")).toBe(45);
		expect(parseDurationMinutes("45 minutes")).toBe(45);
	});

	it("reads whole hours", () => {
		expect(parseDurationMinutes("1h")).toBe(60);
		expect(parseDurationMinutes("2hr")).toBe(120);
		expect(parseDurationMinutes("2 hours")).toBe(120);
	});

	it("reads hours and minutes together", () => {
		expect(parseDurationMinutes("1h30")).toBe(90);
		expect(parseDurationMinutes("1h30m")).toBe(90);
		expect(parseDurationMinutes("1h 30m")).toBe(90);
	});

	it("reads a fractional hour", () => {
		expect(parseDurationMinutes("1.5h")).toBe(90);
		expect(parseDurationMinutes("0.25h")).toBe(15);
	});

	it("ignores case and surrounding space", () => {
		expect(parseDurationMinutes("  1H 30M ")).toBe(90);
	});

	it("treats an explicit clear as null", () => {
		expect(parseDurationMinutes("none")).toBeNull();
		expect(parseDurationMinutes("clear")).toBeNull();
	});

	it("keeps zero distinct from a clear", () => {
		expect(parseDurationMinutes("0")).toBe(0);
	});

	it("returns undefined for anything it cannot read", () => {
		expect(parseDurationMinutes("")).toBeUndefined();
		expect(parseDurationMinutes("soon")).toBeUndefined();
		expect(parseDurationMinutes("half an hour")).toBeUndefined();
		expect(parseDurationMinutes("1h30x")).toBeUndefined();
	});

	it("refuses an ambiguous fractional hour with explicit minutes", () => {
		expect(parseDurationMinutes("1.5h30")).toBeUndefined();
	});

	it("refuses a duration longer than a day", () => {
		expect(parseDurationMinutes("2000m")).toBeUndefined();
		expect(parseDurationMinutes("30h")).toBeUndefined();
	});
});
