import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getDb, resetDbForTests } from "@/server/db/client";
import { getVersion } from "@/server/repos/change-version";
import { listProjects } from "@/server/repos/projects";
import {
	listPushSubscriptions,
	upsertPushSubscription,
} from "@/server/repos/push-subscriptions";
import {
	createReminder,
	getReminder,
	markRemindersFired,
	snoozeReminder,
} from "@/server/repos/reminders";
import { completeTask, createTask } from "@/server/repos/tasks";
import {
	dispatchDueReminderPushes,
	type ReminderPushPayload,
	type SendFn,
} from "@/server/services/reminder-push";

const dbPath = path.join(os.tmpdir(), `finish-em-push-${Date.now()}.db`);

beforeEach(() => {
	process.env.TODO_DB_PATH = dbPath;
	resetDbForTests();
	if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

afterEach(() => {
	resetDbForTests();
	if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

function recorder(status = 201) {
	const sent: { endpoint: string; payload: ReminderPushPayload }[] = [];
	const send: SendFn = async (s, payload) => {
		sent.push({ endpoint: s.endpoint, payload });
		return { ok: status < 300, status, gone: status === 410 };
	};
	return { sent, send };
}

async function setup(minutesAgo = 1) {
	const db = getDb();
	const inbox = (await listProjects(db)).find((p) => p.isInbox);
	const task = await createTask(db, {
		projectId: inbox?.id ?? 0,
		title: "Call vet",
	});
	const reminder = await createReminder(db, {
		taskId: task.id,
		remindAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
	});
	await upsertPushSubscription(db, {
		endpoint: "https://web.push.apple.com/one",
		p256dh: "p",
		auth: "a",
	});
	return { db, task, reminder };
}

describe("dispatchDueReminderPushes", () => {
	it("does nothing without subscriptions", async () => {
		const db = getDb();
		const { send, sent } = recorder();
		expect(await dispatchDueReminderPushes(db, send)).toEqual({
			reminders: 0,
			sent: 0,
			removed: 0,
		});
		expect(sent).toHaveLength(0);
	});

	it("pushes a due reminder once and marks it fired", async () => {
		const { db, reminder } = await setup();
		const before = await getVersion(db);
		const { send, sent } = recorder();

		expect((await dispatchDueReminderPushes(db, send)).sent).toBe(1);
		expect(sent[0]?.payload).toMatchObject({
			title: "Call vet",
			tag: `reminder-${reminder.id}`,
			reminderId: reminder.id,
		});
		expect((await getReminder(db, reminder.id))?.status).toBe("fired");
		expect(await getVersion(db)).toBeGreaterThan(before);

		await dispatchDueReminderPushes(db, send);
		expect(sent).toHaveLength(1);
	});

	it("still pushes when an open tab delivered it first", async () => {
		const { db, reminder } = await setup();
		await markRemindersFired(db, [reminder.id]);
		const { send, sent } = recorder();
		await dispatchDueReminderPushes(db, send);
		expect(sent).toHaveLength(1);
	});

	it("pushes again after a snooze comes due", async () => {
		const { db, reminder } = await setup();
		const { send, sent } = recorder();
		await dispatchDueReminderPushes(db, send);
		await snoozeReminder(db, {
			reminderId: reminder.id,
			preset: "custom",
			customMinutes: 5,
		});
		await dispatchDueReminderPushes(db, send);
		expect(sent).toHaveLength(1);
		await dispatchDueReminderPushes(
			db,
			send,
			new Date(Date.now() + 6 * 60_000),
		);
		expect(sent).toHaveLength(2);
	});

	it("skips completed tasks and reminders more than a day late", async () => {
		const { db, task } = await setup();
		await completeTask(db, task.id);
		const stale = await setup(26 * 60);
		const { send, sent } = recorder();
		await dispatchDueReminderPushes(db, send);
		expect(sent).toHaveLength(0);
		expect((await getReminder(db, stale.reminder.id))?.firedAt).toBeNull();
	});

	it("removes subscriptions the push service reports as gone", async () => {
		const { db } = await setup();
		const { send } = recorder(410);
		expect((await dispatchDueReminderPushes(db, send)).removed).toBe(1);
		expect(await listPushSubscriptions(db)).toHaveLength(0);
	});
});
