import { describe, expect, test } from "bun:test";
import { addDays, format } from "date-fns";

import { resolveDateOnly } from "./DateField";

describe("resolveDateOnly", () => {
	test("keeps an ISO date", () => {
		expect(resolveDateOnly("2026-07-01")).toBe("2026-07-01");
	});

	test("resolves phrases to a calendar date", () => {
		expect(resolveDateOnly("tomorrow")).toBe(
			format(addDays(new Date(), 1), "yyyy-MM-dd"),
		);
	});

	test("returns empty for blank or none", () => {
		expect(resolveDateOnly("  ")).toBe("");
		expect(resolveDateOnly("none")).toBe("");
	});

	test("returns undefined for unparseable text", () => {
		expect(resolveDateOnly("blah")).toBeUndefined();
	});
});
