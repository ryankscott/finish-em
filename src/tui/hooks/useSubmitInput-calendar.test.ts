import { describe, expect, it } from "bun:test";

import { parseDatePhrase } from "../../lib/parsing/parse-task-input";

// Test that the calendar picker modes produce the same parsed date as their text counterparts.
// This validates the routing logic without needing to spin up the full hook.

describe("calendarPickerDueDate submit routing", () => {
	it("YYYY-MM-DD value parses to a valid ISO date (same as editDueDate path)", () => {
		const value = "2026-06-15";
		const parsed = parseDatePhrase(value);
		expect(parsed).not.toBeNull();
		expect(parsed).toBeString();
		const d = new Date(parsed!);
		expect(d.getFullYear()).toBe(2026);
		expect(d.getMonth()).toBe(5); // June
		expect(d.getDate()).toBe(15);
		expect(d.getHours()).toBe(9);
	});

	it("'clear' value parses to null (clears the date)", () => {
		const parsed = parseDatePhrase("clear");
		expect(parsed).toBeNull();
	});

	it("calendar picker value of today parses correctly", () => {
		const today = new Date();
		const value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
		const parsed = parseDatePhrase(value);
		expect(parsed).not.toBeNull();
		const d = new Date(parsed!);
		expect(d.getFullYear()).toBe(today.getFullYear());
		expect(d.getMonth()).toBe(today.getMonth());
		expect(d.getDate()).toBe(today.getDate());
	});
});
