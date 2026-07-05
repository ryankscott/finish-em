import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { resetDbForTests } from "@/server/db/client";
import {
	getEventByUid,
	listEvents,
	pruneStale,
	upsertEvents,
} from "@/server/repos/calendar";
import { createProject } from "@/server/repos/projects";
import {
	createTask,
	getTask,
	linkTaskToEvent,
	repinLinkedTaskDueDates,
} from "@/server/repos/tasks";
import { expandEvent, listCalendarEvents } from "@/server/services/calendar";

const dbPath = path.join(os.tmpdir(), `finish-em-calendar-test-${Date.now()}.db`);

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
	it("keeps a single event inside the window and drops one outside", () => {
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
		expect(inside[0]?.endAt).toBe(new Date("2026-06-10T09:30:00Z").toISOString());

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

	it("expands a recurring event into multiple instances", () => {
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

	it("skips excluded dates", () => {
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
	it("upserts, lists by range, and prunes stale events", () => {
		upsertEvents(
			[
				{
					uid: "a",
					summary: "Early",
					startAt: "2026-06-05T09:00:00.000Z",
					endAt: null,
					allDay: false,
					location: null,
					organizer: null,
				},
				{
					uid: "b",
					summary: "Late",
					startAt: "2026-06-20T09:00:00.000Z",
					endAt: null,
					allDay: false,
					location: null,
					organizer: null,
				},
			],
			"2026-06-01T00:00:00.000Z",
		);

		expect(listEvents()).toHaveLength(2);
		const ranged = listEvents({
			from: "2026-06-10T00:00:00.000Z",
			to: "2026-06-30T00:00:00.000Z",
		});
		expect(ranged.map((e) => e.uid)).toEqual(["b"]);

		// A newer sync that only re-sees "a" should prune "b".
		upsertEvents(
			[
				{
					uid: "a",
					summary: "Early",
					startAt: "2026-06-05T09:00:00.000Z",
					endAt: null,
					allDay: false,
					location: null,
					organizer: null,
				},
			],
			"2026-06-02T00:00:00.000Z",
		);
		const removed = pruneStale("2026-06-02T00:00:00.000Z");
		expect(removed).toBe(1);
		expect(listCalendarEvents().map((e) => e.uid)).toEqual(["a"]);
		expect(getEventByUid("a")?.summary).toBe("Early");
	});
});

describe("linkTaskToEvent", () => {
	it("pins the task due date to the event start and clears on unlink", () => {
		const project = createProject({ name: "Work" });
		const task = createTask({ projectId: project.id, title: "Prep deck" });

		upsertEvents(
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

		const linked = linkTaskToEvent(task.id, "meeting-1");
		expect(linked?.calendarEventUid).toBe("meeting-1");
		expect(linked?.dueAt).toBe("2026-06-15T14:00:00.000Z");

		const unlinked = linkTaskToEvent(task.id, null);
		expect(unlinked?.calendarEventUid).toBeNull();
		// Due date is left intact after unlinking.
		expect(getTask(task.id)?.dueAt).toBe("2026-06-15T14:00:00.000Z");
	});

	it("re-pins the due date when the linked meeting moves earlier", () => {
		const project = createProject({ name: "Work" });
		const task = createTask({ projectId: project.id, title: "Prep deck" });

		upsertEvents(
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
		linkTaskToEvent(task.id, "meeting-1");
		expect(getTask(task.id)?.dueAt).toBe("2026-06-15T14:00:00.000Z");

		// Meeting moves two days earlier; a later sync overwrites the cached event.
		upsertEvents(
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

		const changed = repinLinkedTaskDueDates();
		expect(changed).toBe(1);
		expect(getTask(task.id)?.dueAt).toBe("2026-06-13T10:00:00.000Z");

		// Idempotent: a second pass with no change reports zero updates.
		expect(repinLinkedTaskDueDates()).toBe(0);
	});

	it("leaves the due date untouched when the linked event is gone", () => {
		const project = createProject({ name: "Work" });
		const task = createTask({ projectId: project.id, title: "Prep deck" });
		upsertEvents(
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
		linkTaskToEvent(task.id, "meeting-1");
		pruneStale("2026-06-02T00:00:00.000Z"); // event drops out of cache

		expect(repinLinkedTaskDueDates()).toBe(0);
		expect(getTask(task.id)?.dueAt).toBe("2026-06-15T14:00:00.000Z");
	});

	it("throws for an unknown event uid", () => {
		const project = createProject({ name: "Work" });
		const task = createTask({ projectId: project.id, title: "Thing" });
		expect(() => linkTaskToEvent(task.id, "nope")).toThrow();
	});
});
