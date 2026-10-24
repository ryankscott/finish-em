import { describe, expect, test } from "bun:test";
import {
	formatDateField,
	parseDateInput,
	resolveDateField,
} from "./date-field";

describe("date field datetime handling", () => {
	test("loaded date and time can be displayed in the picker", () => {
		const iso = "2026-10-24T03:15:32.456Z";
		expect(parseDateInput(formatDateField(iso))).toBeTruthy();
		expect(resolveDateField(formatDateField(iso), iso)).toBe(iso);
	});
	test("changed local times are parsed instead of discarded", () => {
		expect(parseDateInput("2026-10-26 14:30")).toBe(
			new Date(2026, 9, 26, 14, 30).toISOString(),
		);
	});
	test("invalid dates stay invalid, while clear phrases emit null", () => {
		expect(parseDateInput("2026-02-31 14:30")).toBeUndefined();
		expect(resolveDateField("garbage", null)).toBe("invalid");
		expect(resolveDateField("none", null)).toBeNull();
		expect(resolveDateField("", null)).toBeNull();
	});
});
