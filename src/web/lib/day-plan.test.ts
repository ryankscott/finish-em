import { describe, expect, it } from "bun:test";

import type { CalendarEvent, Task } from "@/server/types";

import {
	DEFAULT_ESTIMATE_MINUTES,
	dayCapacity,
	dayKey,
	dayWindow,
	formatElapsed,
	formatMinutes,
	layoutBlocks,
	MIN_BLOCK_PX,
	meetingMinutes,
	minutesFromGridTop,
	nextFreeSlot,
	partitionDay,
	planCandidates,
	plannedMinutes,
	pxFromMinutes,
	snapToSlot,
	taskEstimate,
} from "./day-plan";

const NOW = new Date("2026-08-20T10:00:00.000Z");

function task(overrides: Partial<Task> & { id: number }): Task {
	return {
		projectId: 1,
		parentTaskId: null,
		title: `task ${overrides.id}`,
		notes: "",
		priority: 4,
		scheduledAt: null,
		dueAt: null,
		dueTimezone: null,
		recurrencePreset: null,
		recurrenceRRule: null,
		status: "open",
		someday: false,
		planOrder: 0,
		estimateMinutes: null,
		plannedStartAt: null,
		startedAt: null,
		completedAt: null,
		deletedAt: null,
		calendarEventUid: null,
		createdAt: NOW.toISOString(),
		updatedAt: NOW.toISOString(),
		...overrides,
	};
}

describe("dayKey and dayWindow", () => {
	it("formats a local calendar day", () => {
		expect(dayKey(new Date(2026, 7, 20, 23, 30))).toBe("2026-08-20");
	});

	it("spans the whole local day", () => {
		const { from, to } = dayWindow(new Date(2026, 7, 20, 13, 0));
		expect(new Date(from).getHours()).toBe(0);
		expect(new Date(to).getHours()).toBe(23);
	});
});

describe("partitionDay", () => {
	it("keeps yesterday's commitments visible instead of dropping them", () => {
		const yesterday = task({
			id: 1,
			scheduledAt: new Date(2026, 7, 19, 9).toISOString(),
			planOrder: 1,
		});
		const todays = task({
			id: 2,
			scheduledAt: new Date(2026, 7, 20, 9).toISOString(),
			planOrder: 1,
		});

		const sections = partitionDay(
			[yesterday, todays],
			[],
			[],
			new Date(2026, 7, 20, 10),
		);

		expect(sections.leftover.map((t) => t.id)).toEqual([1]);
		expect(sections.today.map((t) => t.id)).toEqual([2]);
	});

	it("orders today's plan by plan_order, not by deadline", () => {
		const scheduledAt = new Date(2026, 7, 20, 9).toISOString();
		const third = task({ id: 3, scheduledAt, planOrder: 3 });
		const first = task({ id: 1, scheduledAt, planOrder: 1 });
		const second = task({ id: 2, scheduledAt, planOrder: 2 });

		const sections = partitionDay(
			[third, first, second],
			[],
			[],
			new Date(2026, 7, 20, 10),
		);

		expect(sections.today.map((t) => t.id)).toEqual([1, 2, 3]);
	});

	it("shows a missed deadline that was never committed to", () => {
		const overdue = task({ id: 9, dueAt: new Date(2026, 7, 18).toISOString() });

		const sections = partitionDay([], [], [overdue], new Date(2026, 7, 20, 10));

		expect(sections.unplannedOverdue.map((t) => t.id)).toEqual([9]);
	});

	it("shows a task due today that was never committed to a day", () => {
		const dueToday = task({
			id: 5,
			dueAt: new Date(2026, 7, 20, 17).toISOString(),
		});

		const sections = partitionDay(
			[],
			[dueToday],
			[],
			new Date(2026, 7, 20, 10),
		);

		expect(sections.unplannedDueToday.map((t) => t.id)).toEqual([5]);
	});

	it("does not list an overdue task twice when it is already in the plan", () => {
		const planned = task({
			id: 9,
			scheduledAt: new Date(2026, 7, 20, 9).toISOString(),
			dueAt: new Date(2026, 7, 18).toISOString(),
			planOrder: 1,
		});

		const sections = partitionDay(
			[planned],
			[],
			[planned],
			new Date(2026, 7, 20, 10),
		);

		expect(sections.today.map((t) => t.id)).toEqual([9]);
		expect(sections.unplannedOverdue).toEqual([]);
	});
});

describe("formatElapsed", () => {
	it("shows minutes under an hour", () => {
		expect(formatElapsed(23 * 60_000)).toBe("23m");
	});

	it("pads the minutes past an hour", () => {
		expect(formatElapsed(64 * 60_000)).toBe("1h 04m");
	});

	it("floors a fresh start to zero rather than going negative", () => {
		expect(formatElapsed(-5_000)).toBe("0m");
		expect(formatElapsed(500)).toBe("0m");
	});
});

describe("planCandidates", () => {
	it("keeps group order and drops duplicates", () => {
		const a = task({ id: 1 });
		const b = task({ id: 2 });
		const c = task({ id: 3 });

		expect(planCandidates([[a, b], [b, c], [a]]).map((t) => t.id)).toEqual([
			1, 2, 3,
		]);
	});
});

describe("ad-hoc commits", () => {
	it("puts a task committed without a rank at the end of the plan", () => {
		const scheduledAt = new Date(2026, 7, 20, 9).toISOString();
		const ranked = task({ id: 1, scheduledAt, planOrder: 1 });
		const alsoRanked = task({ id: 2, scheduledAt, planOrder: 2 });
		const adHoc = task({ id: 3, scheduledAt, planOrder: 0 });

		const sections = partitionDay(
			[adHoc, ranked, alsoRanked],
			[],
			[],
			new Date(2026, 7, 20, 10),
		);

		expect(sections.today.map((t) => t.id)).toEqual([1, 2, 3]);
	});
});

/** Local wall-clock, because the grid and the capacity bar are device-local. */
const at = (day: string, time: string) => new Date(`${day}T${time}`);

function event(
	overrides: Partial<CalendarEvent> & { id: number },
): CalendarEvent {
	return {
		uid: `uid-${overrides.id}`,
		recurrenceId: "",
		summary: `event ${overrides.id}`,
		startAt: at("2026-08-20", "09:00").toISOString(),
		endAt: at("2026-08-20", "10:00").toISOString(),
		allDay: false,
		location: null,
		organizer: null,
		...overrides,
	};
}

const DAY = at("2026-08-20", "12:00");

describe("formatMinutes", () => {
	it("reads as a duration rather than a clock", () => {
		expect(formatMinutes(0)).toBe("0m");
		expect(formatMinutes(45)).toBe("45m");
		expect(formatMinutes(60)).toBe("1h");
		expect(formatMinutes(90)).toBe("1h 30m");
		expect(formatMinutes(125)).toBe("2h 5m");
	});

	it("never renders negative time", () => {
		expect(formatMinutes(-30)).toBe("0m");
	});
});

describe("taskEstimate", () => {
	it("treats an unestimated task as the default, not as free", () => {
		expect(taskEstimate(task({ id: 1 }))).toBe(DEFAULT_ESTIMATE_MINUTES);
	});

	it("keeps an explicit zero", () => {
		expect(taskEstimate(task({ id: 1, estimateMinutes: 0 }))).toBe(0);
	});

	it("sums a plan including unestimated work", () => {
		expect(
			plannedMinutes([
				task({ id: 1, estimateMinutes: 60 }),
				task({ id: 2 }),
				task({ id: 3, estimateMinutes: 15 }),
			]),
		).toBe(60 + DEFAULT_ESTIMATE_MINUTES + 15);
	});
});

describe("meetingMinutes", () => {
	it("sums disjoint meetings", () => {
		const minutes = meetingMinutes(
			[
				event({ id: 1 }),
				event({
					id: 2,
					startAt: at("2026-08-20", "13:00").toISOString(),
					endAt: at("2026-08-20", "13:30").toISOString(),
				}),
			],
			DAY,
		);
		expect(minutes).toBe(90);
	});

	it("charges a double-booked hour once", () => {
		const minutes = meetingMinutes(
			[
				event({ id: 1 }),
				event({
					id: 2,
					startAt: at("2026-08-20", "09:30").toISOString(),
					endAt: at("2026-08-20", "10:30").toISOString(),
				}),
			],
			DAY,
		);
		expect(minutes).toBe(90);
	});

	it("ignores all-day events, which label a day rather than consume it", () => {
		expect(meetingMinutes([event({ id: 1, allDay: true })], DAY)).toBe(0);
	});

	it("clips an event that spans midnight to the part landing on this day", () => {
		const minutes = meetingMinutes(
			[
				event({
					id: 1,
					startAt: at("2026-08-19", "23:00").toISOString(),
					endAt: at("2026-08-20", "01:00").toISOString(),
				}),
			],
			DAY,
		);
		expect(minutes).toBe(60);
	});

	it("ignores an event with no end", () => {
		expect(meetingMinutes([event({ id: 1, endAt: null })], DAY)).toBe(0);
	});
});

describe("dayCapacity", () => {
	const base = { workdayMinutes: 360, day: DAY };

	it("subtracts meetings before tasks get any of the day", () => {
		const capacity = dayCapacity({
			...base,
			events: [event({ id: 1 })],
			tasks: [task({ id: 1, estimateMinutes: 120 })],
		});
		expect(capacity.meetingMinutes).toBe(60);
		expect(capacity.capacityMinutes).toBe(300);
		expect(capacity.plannedMinutes).toBe(120);
		expect(capacity.remainingMinutes).toBe(180);
		expect(capacity.isOver).toBe(false);
	});

	it("is not over when the plan exactly fills the day", () => {
		const capacity = dayCapacity({
			...base,
			events: [],
			tasks: [task({ id: 1, estimateMinutes: 360 })],
		});
		expect(capacity.remainingMinutes).toBe(0);
		expect(capacity.isOver).toBe(false);
		expect(capacity.overBy).toBe(0);
	});

	it("reports how far over the plan runs", () => {
		const capacity = dayCapacity({
			...base,
			events: [event({ id: 1 })],
			tasks: [task({ id: 1, estimateMinutes: 400 })],
		});
		expect(capacity.isOver).toBe(true);
		expect(capacity.overBy).toBe(100);
		expect(capacity.remainingMinutes).toBe(-100);
	});

	it("clamps capacity at zero when meetings eat more than the workday", () => {
		const capacity = dayCapacity({
			...base,
			events: [
				event({
					id: 1,
					startAt: at("2026-08-20", "08:00").toISOString(),
					endAt: at("2026-08-20", "17:00").toISOString(),
				}),
			],
			tasks: [task({ id: 1, estimateMinutes: 30 })],
		});
		expect(capacity.capacityMinutes).toBe(0);
		expect(capacity.isOver).toBe(true);
		expect(capacity.ratio).toBe(1);
	});
});

describe("grid geometry", () => {
	it("measures from the top of the grid, not midnight", () => {
		expect(minutesFromGridTop(at("2026-08-20", "07:00"), 7)).toBe(0);
		expect(minutesFromGridTop(at("2026-08-20", "09:30"), 7)).toBe(150);
	});

	it("snaps a drop to the nearest slot", () => {
		const dropped = snapToSlot(pxFromMinutes(100, 56), {
			day: DAY,
			startHour: 7,
			endHour: 20,
			pxPerHour: 56,
		});
		expect(dropped.getHours()).toBe(8);
		expect(dropped.getMinutes()).toBe(45);
	});

	it("round-trips a snapped time back to its offset", () => {
		const dropped = snapToSlot(pxFromMinutes(120, 56), {
			day: DAY,
			startHour: 7,
			endHour: 20,
			pxPerHour: 56,
		});
		expect(pxFromMinutes(minutesFromGridTop(dropped, 7), 56)).toBeCloseTo(
			pxFromMinutes(120, 56),
		);
	});

	it("clamps a drop above the grid to the first slot", () => {
		const dropped = snapToSlot(-500, {
			day: DAY,
			startHour: 7,
			endHour: 20,
			pxPerHour: 56,
		});
		expect(dropped.getHours()).toBe(7);
		expect(dropped.getMinutes()).toBe(0);
	});

	it("clamps a drop past the grid to the last usable slot", () => {
		const dropped = snapToSlot(99_999, {
			day: DAY,
			startHour: 7,
			endHour: 20,
			pxPerHour: 56,
		});
		expect(dropped.getHours()).toBe(19);
		expect(dropped.getMinutes()).toBe(45);
	});
});

describe("layoutBlocks", () => {
	const opts = { startHour: 7, pxPerHour: 56 };
	const item = (key: string, time: string, minutes: number) => ({
		key,
		startAt: at("2026-08-20", time).toISOString(),
		minutes,
	});

	it("gives sequential blocks a single lane", () => {
		const placed = layoutBlocks(
			[item("a", "09:00", 60), item("b", "10:00", 60)],
			opts,
		);
		expect(placed.map((p) => p.lane)).toEqual([0, 0]);
		expect(placed.map((p) => p.lanes)).toEqual([1, 1]);
	});

	it("puts overlapping blocks side by side", () => {
		const placed = layoutBlocks(
			[item("a", "09:00", 60), item("b", "09:30", 60)],
			opts,
		);
		expect(placed.map((p) => p.lane)).toEqual([0, 1]);
		expect(placed.every((p) => p.lanes === 2)).toBe(true);
	});

	it("does not leak a cluster's lane count into the next cluster", () => {
		const placed = layoutBlocks(
			[item("a", "09:00", 60), item("b", "09:30", 60), item("c", "14:00", 30)],
			opts,
		);
		expect(placed.find((p) => p.key === "c")?.lanes).toBe(1);
	});

	it("keeps a very short block legible", () => {
		const placed = layoutBlocks([item("a", "09:00", 5)], opts);
		expect(placed[0]?.height).toBe(MIN_BLOCK_PX);
	});

	it("positions a block where the geometry helpers say it belongs", () => {
		const placed = layoutBlocks([item("a", "09:30", 60)], opts);
		expect(placed[0]?.top).toBeCloseTo(
			pxFromMinutes(minutesFromGridTop(at("2026-08-20", "09:30"), 7), 56),
		);
	});
});

describe("nextFreeSlot", () => {
	const opts = { day: DAY, startHour: 7, endHour: 20, minutes: 30 };
	const busy = (time: string, minutes: number) => ({
		key: time,
		startAt: at("2026-08-20", time).toISOString(),
		minutes,
	});

	it("takes the requested time when nothing is in the way", () => {
		const slot = nextFreeSlot([], {
			...opts,
			after: at("2026-08-20", "09:00"),
		});
		expect(slot?.getHours()).toBe(9);
		expect(slot?.getMinutes()).toBe(0);
	});

	it("skips past a meeting", () => {
		const slot = nextFreeSlot([busy("09:00", 60)], {
			...opts,
			after: at("2026-08-20", "09:00"),
		});
		expect(slot?.getHours()).toBe(10);
	});

	it("skips a slot that is only partly free", () => {
		const slot = nextFreeSlot([busy("09:15", 60)], {
			...opts,
			after: at("2026-08-20", "09:00"),
		});
		expect(slot?.getHours()).toBe(10);
		expect(slot?.getMinutes()).toBe(15);
	});

	it("never places anything before the grid opens", () => {
		const slot = nextFreeSlot([], {
			...opts,
			after: at("2026-08-20", "03:00"),
		});
		expect(slot?.getHours()).toBe(7);
	});

	it("returns null when the day cannot hold the task", () => {
		const slot = nextFreeSlot([busy("07:00", 13 * 60)], {
			...opts,
			after: at("2026-08-20", "07:00"),
		});
		expect(slot).toBeNull();
	});

	it("refuses a task longer than the grid", () => {
		const slot = nextFreeSlot([], {
			...opts,
			minutes: 14 * 60,
			after: at("2026-08-20", "07:00"),
		});
		expect(slot).toBeNull();
	});
});
