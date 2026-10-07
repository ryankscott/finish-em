import { describe, expect, it } from "bun:test";

import { atZonedHour } from "@/lib/zoned";
import { resolveSnoozeTime } from "@/server/services/reminders";

describe("reminder snooze resolver", () => {
	it("supports due-style presets in UTC", () => {
		const now = new Date("2026-02-15T20:00:00.000Z");
		expect(resolveSnoozeTime({ now, preset: "this_morning" })).toBe(
			"2026-02-16T09:00:00.000Z",
		);
		expect(resolveSnoozeTime({ now, preset: "this_evening" })).toBe(
			"2026-02-16T18:00:00.000Z",
		);
		expect(resolveSnoozeTime({ now, preset: "tomorrow_morning" })).toBe(
			"2026-02-16T09:00:00.000Z",
		);
		expect(resolveSnoozeTime({ now, preset: "next_week" })).toBe(
			"2026-02-22T09:00:00.000Z",
		);
	});

	it("resolves presets in the user's timezone", () => {
		// 16:00 in New York (EST, UTC-5).
		const now = new Date("2026-02-15T21:00:00.000Z");
		const timeZone = "America/New_York";
		expect(resolveSnoozeTime({ now, preset: "this_evening", timeZone })).toBe(
			"2026-02-15T23:00:00.000Z",
		);
		expect(resolveSnoozeTime({ now, preset: "this_morning", timeZone })).toBe(
			"2026-02-16T14:00:00.000Z",
		);
		expect(
			resolveSnoozeTime({ now, preset: "tomorrow_morning", timeZone }),
		).toBe("2026-02-16T14:00:00.000Z");
	});

	it("uses the local date, not the UTC date, near midnight", () => {
		// 23:30 on the 15th in New York is already the 16th in UTC.
		const now = new Date("2026-02-16T04:30:00.000Z");
		expect(
			resolveSnoozeTime({
				now,
				preset: "tomorrow_morning",
				timeZone: "America/New_York",
			}),
		).toBe("2026-02-16T14:00:00.000Z");
	});

	it("rejects invalid custom durations", () => {
		expect(() =>
			resolveSnoozeTime({
				preset: "custom",
				customMinutes: 0,
			}),
		).toThrowError();
	});
});

describe("atZonedHour", () => {
	it("handles a DST change between base and target", () => {
		// US DST starts 2026-03-08. 9am EDT on the 9th is 13:00 UTC.
		const base = new Date("2026-03-07T17:00:00.000Z");
		expect(atZonedHour(base, "America/New_York", 2, 9).toISOString()).toBe(
			"2026-03-09T13:00:00.000Z",
		);
	});
});
