import { describe, expect, it } from "bun:test";

import { getDaysInMonth, getDay, startOfMonth } from "date-fns";

// Pure logic tests for calendar grid construction — no Ink rendering needed.

function buildCalendarCells(visibleMonth: Date): (number | null)[] {
	const firstDayOfWeek = getDay(startOfMonth(visibleMonth));
	const daysInMonth = getDaysInMonth(visibleMonth);
	const cells: (number | null)[] = [
		...Array.from({ length: firstDayOfWeek }, () => null),
		...Array.from({ length: daysInMonth }, (_, i) => i + 1),
	];
	while (cells.length % 7 !== 0) cells.push(null);
	return cells;
}

function buildRows(visibleMonth: Date): (number | null)[][] {
	const cells = buildCalendarCells(visibleMonth);
	const rows: (number | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
	return rows;
}

describe("CalendarPicker grid logic", () => {
	it("March 2026 starts on Sunday (col 0)", () => {
		// March 1 2026 is a Sunday
		const march2026 = new Date(2026, 2, 1);
		const firstDayOfWeek = getDay(startOfMonth(march2026));
		expect(firstDayOfWeek).toBe(0); // Sunday
	});

	it("March 2026 has 31 days", () => {
		const march2026 = new Date(2026, 2, 1);
		expect(getDaysInMonth(march2026)).toBe(31);
	});

	it("March 2026 row 0 starts with day 1 in column 0", () => {
		const march2026 = new Date(2026, 2, 1);
		const rows = buildRows(march2026);
		expect(rows[0]?.[0]).toBe(1);
	});

	it("April 2026 starts on Wednesday (col 3)", () => {
		// April 1 2026 is a Wednesday
		const april2026 = new Date(2026, 3, 1);
		const firstDayOfWeek = getDay(startOfMonth(april2026));
		expect(firstDayOfWeek).toBe(3); // Wednesday
	});

	it("April 2026 row 0 has 3 leading nulls before day 1", () => {
		const april2026 = new Date(2026, 3, 1);
		const rows = buildRows(april2026);
		expect(rows[0]?.[0]).toBeNull();
		expect(rows[0]?.[1]).toBeNull();
		expect(rows[0]?.[2]).toBeNull();
		expect(rows[0]?.[3]).toBe(1);
	});

	it("grid is always a multiple of 7 cells", () => {
		for (let month = 0; month < 12; month++) {
			const d = new Date(2026, month, 1);
			const cells = buildCalendarCells(d);
			expect(cells.length % 7).toBe(0);
		}
	});

	it("last real cell in grid matches days in month", () => {
		const feb2026 = new Date(2026, 1, 1);
		const cells = buildCalendarCells(feb2026);
		const lastReal = [...cells].reverse().find((c) => c !== null);
		expect(lastReal).toBe(getDaysInMonth(feb2026));
	});
});
