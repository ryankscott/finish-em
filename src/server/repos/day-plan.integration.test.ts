import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getDb, resetDbForTests } from "@/server/db/client";
import {
	getDayLog,
	markDayClosed,
	markDayPlanned,
} from "@/server/repos/day-log";
import {
	completeTask,
	createTask,
	deleteTask,
	getStartedTask,
	getTask,
	listTasks,
	planDay,
	shiftScheduledAt,
	startTask,
	stopTask,
	updateTask,
} from "@/server/repos/tasks";

const dbPath = path.join(os.tmpdir(), `finish-em-day-plan-${Date.now()}.db`);

beforeEach(() => {
	process.env.TODO_DB_PATH = dbPath;
	resetDbForTests();
	if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

afterEach(() => {
	resetDbForTests();
	if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

const TODAY = "2026-08-20T00:00:00.000Z";
const TOMORROW = "2026-08-21T00:00:00.000Z";

async function makeTask(title: string) {
	return createTask(await getDb(), { projectId: 1, title });
}

describe("planDay", () => {
	it("commits tasks to a day in the given order, 1-based", async () => {
		const db = await getDb();
		const a = await makeTask("a");
		const b = await makeTask("b");
		const c = await makeTask("c");

		const plan = await planDay(db, TODAY, [c.id, a.id, b.id]);

		expect(plan.map((t) => t.title)).toEqual(["c", "a", "b"]);
		expect(plan.map((t) => t.planOrder)).toEqual([1, 2, 3]);
		expect(plan.every((t) => t.scheduledAt === TODAY)).toBe(true);
	});

	it("leaves unplanned tasks at plan_order 0 so they are distinguishable", async () => {
		const db = await getDb();
		const planned = await makeTask("planned");
		const backlog = await makeTask("backlog");

		await planDay(db, TODAY, [planned.id]);

		expect((await getTask(db, backlog.id))?.planOrder).toBe(0);
		expect((await getTask(db, planned.id))?.planOrder).toBe(1);
	});

	it("unparks a someday task that is committed to a day", async () => {
		const db = await getDb();
		const task = await makeTask("parked");
		await updateTask(db, task.id, { someday: true });

		await planDay(db, TODAY, [task.id]);

		expect((await getTask(db, task.id))?.someday).toBe(false);
	});

	it("re-planning a day replaces the order", async () => {
		const db = await getDb();
		const a = await makeTask("a");
		const b = await makeTask("b");
		await planDay(db, TODAY, [a.id, b.id]);

		const plan = await planDay(db, TODAY, [b.id, a.id]);

		expect(plan.map((t) => t.title)).toEqual(["b", "a"]);
	});
});

describe("scheduled filters", () => {
	it("separates the commitment window from the deadline window", async () => {
		const db = await getDb();
		// Committed to today, but the deadline is not for another week.
		const planned = await createTask(db, {
			projectId: 1,
			title: "planned today, due later",
			scheduledAt: TODAY,
			dueAt: "2026-08-27T00:00:00.000Z",
		});
		// Due today, but never committed to.
		await createTask(db, {
			projectId: 1,
			title: "due today, not planned",
			dueAt: TODAY,
		});

		const plan = await listTasks(db, {
			status: "open",
			scheduledFrom: TODAY,
			scheduledTo: "2026-08-20T23:59:59.999Z",
		});
		expect(plan.map((t) => t.id)).toEqual([planned.id]);

		const backlog = await listTasks(db, { status: "open", unplanned: true });
		expect(backlog.map((t) => t.title)).toEqual(["due today, not planned"]);
	});
});

describe("focus", () => {
	it("keeps exactly one task started", async () => {
		const db = await getDb();
		const a = await makeTask("a");
		const b = await makeTask("b");

		await startTask(db, a.id);
		expect((await getStartedTask(db))?.id).toBe(a.id);

		await startTask(db, b.id);
		expect((await getStartedTask(db))?.id).toBe(b.id);
		expect((await getTask(db, a.id))?.startedAt).toBeNull();
	});

	it("stops a task", async () => {
		const db = await getDb();
		const task = await makeTask("a");
		await startTask(db, task.id);

		await stopTask(db, task.id);

		expect(await getStartedTask(db)).toBeNull();
	});

	it("clears the focus when the task is completed", async () => {
		const db = await getDb();
		const task = await makeTask("a");
		await startTask(db, task.id);

		await completeTask(db, task.id);

		expect(await getStartedTask(db)).toBeNull();
	});

	it("does not report a deleted task as the focus", async () => {
		const db = await getDb();
		const task = await makeTask("a");
		await startTask(db, task.id);

		await deleteTask(db, task.id);

		expect(await getStartedTask(db)).toBeNull();
	});

	it("refuses to start a completed task", async () => {
		const db = await getDb();
		const task = await makeTask("a");
		await completeTask(db, task.id);

		expect(await startTask(db, task.id)).toBeNull();
	});
});

describe("commitment and the backlog", () => {
	it("resets the rank when a task is pushed back to the backlog", async () => {
		const db = await getDb();
		const a = await makeTask("a");
		const b = await makeTask("b");
		await planDay(db, TODAY, [a.id, b.id]);

		const updated = await updateTask(db, b.id, { scheduledAt: null });

		expect(updated?.planOrder).toBe(0);
	});
});

describe("recurrence keeps its commitment moving", () => {
	it("does not leave the next occurrence committed to the day just finished", async () => {
		const db = await getDb();
		const task = await createTask(db, {
			projectId: 1,
			title: "daily habit",
			scheduledAt: TODAY,
			dueAt: TODAY,
			recurrencePreset: "daily",
		});

		const { nextTask } = await completeTask(db, task.id);

		expect(nextTask).not.toBeNull();
		expect(nextTask?.dueAt).toBe(TOMORROW);
		// The whole point: the new occurrence must not still be sitting in today's
		// plan, or a recurring task can never be finished for the day.
		expect(nextTask?.scheduledAt).toBe(TOMORROW);
		expect(nextTask?.planOrder).toBe(0);
	});

	it("leaves an uncommitted recurring task uncommitted", async () => {
		const db = await getDb();
		const task = await createTask(db, {
			projectId: 1,
			title: "daily habit",
			dueAt: TODAY,
			recurrencePreset: "daily",
		});

		const { nextTask } = await completeTask(db, task.id);

		expect(nextTask?.scheduledAt).toBeNull();
	});
});

describe("shiftScheduledAt", () => {
	it("moves the commitment by the same span as the deadline", () => {
		expect(shiftScheduledAt(TODAY, TODAY, TOMORROW)).toBe(TOMORROW);
	});

	it("keeps a commitment that leads the deadline ahead of it", () => {
		// Planned Wednesday, due Friday: next week it should be planned Wednesday.
		expect(
			shiftScheduledAt(
				"2026-08-19T00:00:00.000Z",
				"2026-08-21T00:00:00.000Z",
				"2026-08-28T00:00:00.000Z",
			),
		).toBe("2026-08-26T00:00:00.000Z");
	});

	it("has nothing to move when there was no commitment", () => {
		expect(shiftScheduledAt(null, TODAY, TOMORROW)).toBeNull();
	});
});

describe("day log", () => {
	it("reads as unplanned and unclosed before anything happens", async () => {
		const db = await getDb();
		expect(await getDayLog(db, "2026-08-20")).toEqual({
			day: "2026-08-20",
			plannedAt: null,
			closedAt: null,
		});
	});

	it("stamps planned and closed independently on one row", async () => {
		const db = await getDb();
		await markDayPlanned(db, "2026-08-20");
		const afterPlan = await getDayLog(db, "2026-08-20");
		expect(afterPlan.plannedAt).not.toBeNull();
		expect(afterPlan.closedAt).toBeNull();

		await markDayClosed(db, "2026-08-20");
		const afterClose = await getDayLog(db, "2026-08-20");
		expect(afterClose.plannedAt).toBe(afterPlan.plannedAt);
		expect(afterClose.closedAt).not.toBeNull();
	});
});
