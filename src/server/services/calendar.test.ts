import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getDb, resetDbForTests } from "@/server/db/client";
import {
	type CalendarEventInput,
	getEventByUid,
	listEvents,
	syncEvents,
} from "@/server/repos/calendar";
import { createProject } from "@/server/repos/projects";
import {
	createTask,
	getTask,
	linkTaskToEvent,
	repinLinkedTaskDueDates,
} from "@/server/repos/tasks";
import { expandEvent, listCalendarEvents } from "@/server/services/calendar";

const dbPath = path.join(
	os.tmpdir(),
	`finish-em-calendar-test-${Date.now()}.db`,
);

beforeEach(() => {
	process.env.TODO_DB_PATH = dbPath;
	resetDbForTests();
	if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

afterEach(() => {
	resetDbForTests();
	if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

const start = new Date("2026-06-01T00:00:00Z");
const end = new Date("2026-06-30T00:00:00Z");

describe("expandEvent", () => {
	it("keeps a single event inside the window and drops one outside", async () => {
		const inside = expandEvent(
			{
				type: "VEVENT",
				uid: "a",
				summary: "Standup",
				start: new Date("2026-06-10T09:00:00Z"),
				end: new Date("2026-06-10T09:30:00Z"),
			},
			start,
			end,
		);
		expect(inside).toHaveLength(1);
		expect(inside[0]?.summary).toBe("Standup");
		expect(inside[0]?.endAt).toBe(
			new Date("2026-06-10T09:30:00Z").toISOString(),
		);

		const outside = expandEvent(
			{
				type: "VEVENT",
				uid: "b",
				summary: "Old",
				start: new Date("2026-01-01T09:00:00Z"),
				end: new Date("2026-01-01T09:30:00Z"),
			},
			start,
			end,
		);
		expect(outside).toHaveLength(0);
	});

	it("expands a recurring event into multiple instances", async () => {
		const occurrences = [
			new Date("2026-06-02T09:00:00Z"),
			new Date("2026-06-09T09:00:00Z"),
			new Date("2026-06-16T09:00:00Z"),
		];
		const result = expandEvent(
			{
				type: "VEVENT",
				uid: "weekly",
				summary: "Weekly sync",
				start: new Date("2026-06-02T09:00:00Z"),
				end: new Date("2026-06-02T10:00:00Z"),
				rrule: { between: () => occurrences },
			},
			start,
			end,
		);
		expect(result).toHaveLength(3);
		expect(new Set(result.map((r) => r.recurrenceId)).size).toBe(3);
		// Duration preserved across instances.
		for (const inst of result) {
			expect(
				new Date(inst.endAt as string).getTime() -
					new Date(inst.startAt).getTime(),
			).toBe(60 * 60 * 1000);
		}
	});

	it("skips excluded dates", async () => {
		const occurrences = [
			new Date("2026-06-02T09:00:00Z"),
			new Date("2026-06-09T09:00:00Z"),
		];
		const result = expandEvent(
			{
				type: "VEVENT",
				uid: "weekly",
				summary: "Weekly sync",
				start: new Date("2026-06-02T09:00:00Z"),
				end: new Date("2026-06-02T10:00:00Z"),
				rrule: { between: () => occurrences },
				exdate: { x: new Date("2026-06-09T09:00:00Z") },
			},
			start,
			end,
		);
		expect(result).toHaveLength(1);
	});
});

describe("calendar repo", () => {
	const event = (
		overrides: Partial<CalendarEventInput> & { uid: string },
	): CalendarEventInput => ({
		summary: "Standup",
		startAt: "2026-06-05T09:00:00.000Z",
		endAt: null,
		allDay: false,
		location: null,
		organizer: null,
		...overrides,
	});

	it("inserts, lists by range, and deletes events that left the feed", async () => {
		const db = getDb();
		expect(
			await syncEvents(
				db,
				[
					event({ uid: "a", summary: "Early" }),
					event({
						uid: "b",
						summary: "Late",
						startAt: "2026-06-20T09:00:00.000Z",
					}),
				],
				"2026-06-01T00:00:00.000Z",
			),
		).toEqual({ inserted: 2, updated: 0, deleted: 0 });

		expect(await listEvents(db)).toHaveLength(2);
		const ranged = await listEvents(db, {
			from: "2026-06-10T00:00:00.000Z",
			to: "2026-06-30T00:00:00.000Z",
		});
		expect(ranged.map((e) => e.uid)).toEqual(["b"]);

		// A newer sync that only sees "a" drops "b" (a cancelled meeting).
		expect(
			await syncEvents(
				db,
				[event({ uid: "a", summary: "Early" })],
				"2026-06-02T00:00:00.000Z",
			),
		).toEqual({ inserted: 0, updated: 0, deleted: 1 });
		expect((await listCalendarEvents(db)).map((e) => e.uid)).toEqual(["a"]);
		expect((await getEventByUid(db, "a"))?.summary).toBe("Early");
	});

	it("writes nothing when the feed is unchanged", async () => {
		const db = getDb();
		const feed = [
			event({
				uid: "a",
				endAt: "2026-06-05T10:00:00.000Z",
				location: "Room 1",
				organizer: "boss@example.com",
				allDay: false,
			}),
			event({ uid: "b", allDay: true, startAt: "2026-06-06T00:00:00.000Z" }),
		];
		await syncEvents(db, feed, "2026-06-01T00:00:00.000Z");

		// The whole point: a cron run against a quiet feed issues no writes. The
		// old blind upsert rewrote every row here, 96 times a day.
		expect(await syncEvents(db, feed, "2026-06-02T00:00:00.000Z")).toEqual({
			inserted: 0,
			updated: 0,
			deleted: 0,
		});
	});

	it("updates only the instance that actually moved", async () => {
		const db = getDb();
		await syncEvents(
			db,
			[event({ uid: "a" }), event({ uid: "b" })],
			"2026-06-01T00:00:00.000Z",
		);

		expect(
			await syncEvents(
				db,
				[
					event({ uid: "a", startAt: "2026-06-05T11:00:00.000Z" }),
					event({ uid: "b" }),
				],
				"2026-06-02T00:00:00.000Z",
			),
		).toEqual({ inserted: 0, updated: 1, deleted: 0 });
		expect((await getEventByUid(db, "a"))?.startAt).toBe(
			"2026-06-05T11:00:00.000Z",
		);
	});

	it("detects a nullable field being cleared", async () => {
		const db = getDb();
		await syncEvents(
			db,
			[
				event({
					uid: "a",
					location: "Room 1",
					endAt: "2026-06-05T10:00:00.000Z",
				}),
			],
			"2026-06-01T00:00:00.000Z",
		);

		// A null-blind comparison would miss this and leave the stale room on
		// screen forever.
		expect(
			await syncEvents(
				db,
				[
					event({
						uid: "a",
						location: null,
						endAt: "2026-06-05T10:00:00.000Z",
					}),
				],
				"2026-06-02T00:00:00.000Z",
			),
		).toEqual({ inserted: 0, updated: 1, deleted: 0 });
		expect((await getEventByUid(db, "a"))?.location).toBeNull();
	});

	it("treats recurrence overrides as separate instances", async () => {
		const db = getDb();
		expect(
			await syncEvents(
				db,
				[
					event({ uid: "weekly", recurrenceId: "2026-06-02T09:00:00.000Z" }),
					event({
						uid: "weekly",
						recurrenceId: "2026-06-09T09:00:00.000Z",
						startAt: "2026-06-09T09:00:00.000Z",
					}),
				],
				"2026-06-01T00:00:00.000Z",
			),
		).toEqual({ inserted: 2, updated: 0, deleted: 0 });
		expect(await listEvents(db)).toHaveLength(2);
	});

	it("ignores a duplicate instance rather than counting it as a delete", async () => {
		const db = getDb();
		await syncEvents(db, [event({ uid: "a" })], "2026-06-01T00:00:00.000Z");
		expect(
			await syncEvents(
				db,
				[event({ uid: "a" }), event({ uid: "a" })],
				"2026-06-02T00:00:00.000Z",
			),
		).toEqual({ inserted: 0, updated: 0, deleted: 0 });
		expect(await listEvents(db)).toHaveLength(1);
	});
});

describe("linkTaskToEvent", () => {
	it("pins the task due date to the event start and clears on unlink", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Work" });
		const task = await createTask(db, {
			projectId: project.id,
			title: "Prep deck",
		});

		await syncEvents(
			db,
			[
				{
					uid: "meeting-1",
					summary: "Board meeting",
					startAt: "2026-06-15T14:00:00.000Z",
					endAt: "2026-06-15T15:00:00.000Z",
					allDay: false,
					location: null,
					organizer: null,
				},
			],
			"2026-06-01T00:00:00.000Z",
		);

		const linked = await linkTaskToEvent(db, task.id, "meeting-1");
		expect(linked?.calendarEventUid).toBe("meeting-1");
		expect(linked?.dueAt).toBe("2026-06-15T14:00:00.000Z");

		const unlinked = await linkTaskToEvent(db, task.id, null);
		expect(unlinked?.calendarEventUid).toBeNull();
		// Due date is left intact after unlinking.
		expect((await getTask(db, task.id))?.dueAt).toBe(
			"2026-06-15T14:00:00.000Z",
		);
	});

	it("re-pins the due date when the linked meeting moves earlier", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Work" });
		const task = await createTask(db, {
			projectId: project.id,
			title: "Prep deck",
		});

		await syncEvents(
			db,
			[
				{
					uid: "meeting-1",
					summary: "Board meeting",
					startAt: "2026-06-15T14:00:00.000Z",
					endAt: "2026-06-15T15:00:00.000Z",
					allDay: false,
					location: null,
					organizer: null,
				},
			],
			"2026-06-01T00:00:00.000Z",
		);
		await linkTaskToEvent(db, task.id, "meeting-1");
		expect((await getTask(db, task.id))?.dueAt).toBe(
			"2026-06-15T14:00:00.000Z",
		);

		// Meeting moves two days earlier; a later sync overwrites the cached event.
		await syncEvents(
			db,
			[
				{
					uid: "meeting-1",
					summary: "Board meeting",
					startAt: "2026-06-13T10:00:00.000Z",
					endAt: "2026-06-13T11:00:00.000Z",
					allDay: false,
					location: null,
					organizer: null,
				},
			],
			"2026-06-02T00:00:00.000Z",
		);

		const changed = await repinLinkedTaskDueDates(db);
		expect(changed).toBe(1);
		expect((await getTask(db, task.id))?.dueAt).toBe(
			"2026-06-13T10:00:00.000Z",
		);

		// Idempotent: a second pass with no change reports zero updates.
		expect(await repinLinkedTaskDueDates(db)).toBe(0);
	});

	it("leaves the due date untouched when the linked event is gone", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Work" });
		const task = await createTask(db, {
			projectId: project.id,
			title: "Prep deck",
		});
		await syncEvents(
			db,
			[
				{
					uid: "meeting-1",
					summary: "Board meeting",
					startAt: "2026-06-15T14:00:00.000Z",
					endAt: null,
					allDay: false,
					location: null,
					organizer: null,
				},
			],
			"2026-06-01T00:00:00.000Z",
		);
		await linkTaskToEvent(db, task.id, "meeting-1");
		await syncEvents(db, [], "2026-06-02T00:00:00.000Z"); // event drops out of cache

		expect(await repinLinkedTaskDueDates(db)).toBe(0);
		expect((await getTask(db, task.id))?.dueAt).toBe(
			"2026-06-15T14:00:00.000Z",
		);
	});

	it("throws for an unknown event uid", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Work" });
		const task = await createTask(db, {
			projectId: project.id,
			title: "Thing",
		});
		await expect(linkTaskToEvent(db, task.id, "nope")).rejects.toThrow();
	});
});
