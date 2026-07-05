/**
 * Daily digest: surfaces tasks that need attention so they don't silently
 * pile up. Shared by the in-server notification scheduler and the
 * `finish-em digest` CLI command (used by the Claude Code SessionStart hook).
 */

import { getSettings } from "@/server/repos/settings";
import { listTasks } from "@/server/repos/tasks";
import type { Task } from "@/server/types";

const STALE_DAYS = 14;

const PRIORITY_LABEL: Record<Task["priority"], string> = {
	1: "🔴",
	2: "🟠",
	3: "🟡",
	4: "⚪",
};

export type Digest = {
	dueToday: Task[];
	overdue: Task[];
	stale: Task[];
};

function startOfDayIso(date: Date, timezone: string): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
	return new Date(`${parts}T00:00:00.000Z`).toISOString();
}

export function computeDigest(now: Date = new Date()): Digest {
	const { timezone } = getSettings();
	const startOfToday = startOfDayIso(now, timezone);
	const startOfTomorrow = new Date(
		new Date(startOfToday).getTime() + 86_400_000,
	).toISOString();
	const staleBefore = new Date(
		now.getTime() - STALE_DAYS * 86_400_000,
	).toISOString();

	const dueToday = listTasks({
		status: "open",
		rootsOnly: true,
		from: startOfToday,
		to: startOfTomorrow,
	}).filter((task) => task.dueAt !== null && task.dueAt < startOfTomorrow);

	const overdue = listTasks({
		status: "open",
		rootsOnly: true,
		to: startOfToday,
	}).filter((task) => task.dueAt !== null && task.dueAt < startOfToday);

	const dueTodayIds = new Set(dueToday.map((task) => task.id));
	const overdueIds = new Set(overdue.map((task) => task.id));

	const stale = listTasks({
		status: "open",
		rootsOnly: true,
		staleBefore,
	}).filter(
		(task) => !dueTodayIds.has(task.id) && !overdueIds.has(task.id),
	);

	return { dueToday, overdue, stale };
}

export function isDigestEmpty(digest: Digest): boolean {
	return (
		digest.dueToday.length === 0 &&
		digest.overdue.length === 0 &&
		digest.stale.length === 0
	);
}

function formatTaskLine(task: Task): string {
	return `[${task.id}] ${PRIORITY_LABEL[task.priority]} ${task.title}`;
}

function formatSection(label: string, tasks: Task[], limit: number): string[] {
	if (tasks.length === 0) return [];
	const shown = tasks.slice(0, limit).map(formatTaskLine);
	const remainder = tasks.length - shown.length;
	const lines = [`${label} (${tasks.length}):`, ...shown.map((l) => `  ${l}`)];
	if (remainder > 0) lines.push(`  …and ${remainder} more`);
	return lines;
}

export function formatDigestText(digest: Digest, limit = 5): string {
	const sections = [
		...formatSection("Overdue", digest.overdue, limit),
		...formatSection("Due today", digest.dueToday, limit),
		...formatSection("Stale", digest.stale, limit),
	];
	return sections.join("\n");
}
