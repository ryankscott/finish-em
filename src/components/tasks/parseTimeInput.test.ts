import { describe, expect, it } from "vitest";

/**
 * Parse natural language time input like "9am", "Mon 18:00", "ev Tue 7pm"
 * Returns an ISO string for the next occurrence of that time
 */
function parseTimeInput(input: string): string | null {
	const now = new Date();
	const trimmed = input.trim().toLowerCase();

	// Match patterns like "9am", "18:00", "3pm", "9:30am"
	const timeOnlyMatch = trimmed.match(
		/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i,
	);
	if (timeOnlyMatch) {
		let hours = Number.parseInt(timeOnlyMatch[1]);
		const minutes = timeOnlyMatch[2] ? Number.parseInt(timeOnlyMatch[2]) : 0;
		const meridiem = timeOnlyMatch[3];

		// Validate hours and minutes
		if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
			return null;
		}
		if (meridiem && (hours < 1 || hours > 12)) {
			return null;
		}

		if (meridiem === "pm" && hours < 12) {
			hours += 12;
		}
		if (meridiem === "am" && hours === 12) {
			hours = 0;
		}

		const next = new Date(now);
		next.setHours(hours, minutes, 0, 0);

		// If time has passed today, schedule for tomorrow
		if (next.getTime() <= now.getTime()) {
			next.setDate(next.getDate() + 1);
		}

		return next.toISOString();
	}

	// Match patterns like "Mon 18:00", "ev Tue 7pm", "tomorrow 9am"
	const dayTimeMatch = trimmed.match(
		/^(?:(ev|every|tomorrow|today)\s+)?(?:(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i,
	);
	if (dayTimeMatch) {
		const repeat = dayTimeMatch[1];
		const dayName = dayTimeMatch[2];
		let hours = Number.parseInt(dayTimeMatch[3]);
		const minutes = dayTimeMatch[4] ? Number.parseInt(dayTimeMatch[4]) : 0;
		const meridiem = dayTimeMatch[5];

		// Validate hours and minutes
		if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
			return null;
		}
		if (meridiem && (hours < 1 || hours > 12)) {
			return null;
		}

		if (meridiem === "pm" && hours < 12) {
			hours += 12;
		}
		if (meridiem === "am" && hours === 12) {
			hours = 0;
		}

		const next = new Date(now);
		next.setHours(hours, minutes, 0, 0);

		if (dayName) {
			const dayMap: Record<string, number> = {
				sun: 0,
				sunday: 0,
				mon: 1,
				monday: 1,
				tue: 2,
				tuesday: 2,
				wed: 3,
				wednesday: 3,
				thu: 4,
				thursday: 4,
				fri: 5,
				friday: 5,
				sat: 6,
				saturday: 6,
			};
			const targetDay = dayMap[dayName];
			const currentDay = next.getDay();
			let daysToAdd = targetDay - currentDay;

			if (daysToAdd < 0 || (daysToAdd === 0 && next.getTime() <= now.getTime())) {
				daysToAdd += 7;
			}

			next.setDate(next.getDate() + daysToAdd);
		}

		// If time has passed, schedule for tomorrow (or next occurrence)
		if (next.getTime() <= now.getTime()) {
			next.setDate(next.getDate() + 1);
		}

		return next.toISOString();
	}

	// Match "today" or "tomorrow"
	if (trimmed === "today") {
		const next = new Date(now);
		next.setHours(9, 0, 0, 0); // Default to 9am
		if (next.getTime() <= now.getTime()) {
			next.setDate(next.getDate() + 1);
		}
		return next.toISOString();
	}

	if (trimmed === "tomorrow") {
		const next = new Date(now);
		next.setDate(next.getDate() + 1);
		next.setHours(9, 0, 0, 0);
		return next.toISOString();
	}

	return null;
}

describe("parseTimeInput", () => {
	it("returns null for invalid input", () => {
		expect(parseTimeInput("invalid")).toBeNull();
		expect(parseTimeInput("abcd")).toBeNull();
		expect(parseTimeInput("25:00")).toBeNull();
		expect(parseTimeInput("")).toBeNull();
	});

	it("parses 12-hour format with am/pm", () => {
		const result = parseTimeInput("9am");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(9);
		expect(date.getMinutes()).toBe(0);
	});

	it("parses 12-hour format with pm", () => {
		const result = parseTimeInput("3pm");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(15);
		expect(date.getMinutes()).toBe(0);
	});

	it("parses 24-hour format", () => {
		const result = parseTimeInput("18:00");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(18);
		expect(date.getMinutes()).toBe(0);
	});

	it("parses time with minutes", () => {
		const result = parseTimeInput("9:30am");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(9);
		expect(date.getMinutes()).toBe(30);
	});

	it("handles 12am correctly (midnight)", () => {
		const result = parseTimeInput("12am");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(0);
	});

	it("handles 12pm correctly (noon)", () => {
		const result = parseTimeInput("12pm");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(12);
	});

	it("schedules for tomorrow if time has passed today", () => {
		const now = new Date();
		const pastHour = now.getHours() - 1;
		if (pastHour >= 0) {
			const result = parseTimeInput(`${pastHour}:00`);
			expect(result).toBeTruthy();
			const date = new Date(result!);
			expect(date.getDate()).toBeGreaterThan(now.getDate());
		}
	});

	it("parses 'today' as 9am today or tomorrow", () => {
		const result = parseTimeInput("today");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(9);
	});

	it("parses 'tomorrow' as 9am tomorrow", () => {
		const result = parseTimeInput("tomorrow");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(9);
		const now = new Date();
		expect(date.getDate()).toBeGreaterThanOrEqual(now.getDate());
	});

	it("parses day names like 'Mon 18:00'", () => {
		const result = parseTimeInput("Mon 18:00");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(18);
		expect(date.getDay()).toBe(1); // Monday
	});

	it("parses day names with am/pm like 'Tue 7pm'", () => {
		const result = parseTimeInput("Tue 7pm");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(19);
		expect(date.getDay()).toBe(2); // Tuesday
	});

	it("parses full day names like 'Monday 9am'", () => {
		const result = parseTimeInput("Monday 9am");
		expect(result).toBeTruthy();
		const date = new Date(result!);
		expect(date.getHours()).toBe(9);
		expect(date.getDay()).toBe(1); // Monday
	});

	it("handles case insensitive input", () => {
		expect(parseTimeInput("9AM")).toBeTruthy();
		expect(parseTimeInput("MON 18:00")).toBeTruthy();
		expect(parseTimeInput("TOMORROW")).toBeTruthy();
	});

	it("handles whitespace in input", () => {
		expect(parseTimeInput("  9am  ")).toBeTruthy();
		expect(parseTimeInput("  Mon  18:00  ")).toBeTruthy();
	});
});
