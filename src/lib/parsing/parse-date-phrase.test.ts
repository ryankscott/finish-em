import { describe, expect, it } from "bun:test";

import { parseDatePhrase } from "./parse-task-input";

describe("parseDatePhrase", () => {
	it("returns null for 'clear'", () => {
		expect(parseDatePhrase("clear")).toBeNull();
	});

	it("returns null for 'none'", () => {
		expect(parseDatePhrase("none")).toBeNull();
	});

	it("returns null for 'never'", () => {
		expect(parseDatePhrase("never")).toBeNull();
	});

	it("returns an ISO string for 'today'", () => {
		const result = parseDatePhrase("today");
		expect(result).not.toBeNull();
		expect(result).toBeString();
		// Should be 9am today
		const date = new Date(result!);
		expect(date.getHours()).toBe(9);
		expect(date.getMinutes()).toBe(0);
	});

	it("returns an ISO string for 'tomorrow'", () => {
		const result = parseDatePhrase("tomorrow");
		expect(result).not.toBeNull();
		const today = new Date();
		const tomorrow = new Date(result!);
		expect(tomorrow.getDate()).toBe(
			today.getDate() + 1 <= 31 ? today.getDate() + 1 : 1,
		);
		expect(tomorrow.getHours()).toBe(9);
	});

	it("parses YYYY-MM-DD format", () => {
		const result = parseDatePhrase("2026-06-15");
		expect(result).not.toBeNull();
		const date = new Date(result!);
		expect(date.getFullYear()).toBe(2026);
		expect(date.getMonth()).toBe(5); // June = 5
		expect(date.getDate()).toBe(15);
		expect(date.getHours()).toBe(9);
	});

	it("returns a falsy value for invalid input", () => {
		const result = parseDatePhrase("not-a-date");
		// The function returns undefined (cast to null) for unrecognized input
		expect(result).toBeFalsy();
	});

	it("is case-insensitive", () => {
		expect(parseDatePhrase("TODAY")).not.toBeNull();
		expect(parseDatePhrase("TOMORROW")).not.toBeNull();
		expect(parseDatePhrase("CLEAR")).toBeNull();
	});
});
