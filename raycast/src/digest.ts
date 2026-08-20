import { apiGet } from "./api";

/**
 * Client-side reimplementation of the server's old computeDigest().
 *
 * The digest service was removed with the Cloudflare migration (it existed to
 * drive a macOS notification, which a Worker cannot send). The Today view still
 * wants the same three buckets, and every filter it relied on is still exposed
 * by GET /api/tasks, so it is rebuilt here from the same queries rather than
 * keeping a server endpoint alive for one caller.
 */

const STALE_DAYS = 14;
const DAY_MS = 86_400_000;

export type Task = {
	id: number;
	title: string;
	priority: 1 | 2 | 3 | 4;
	dueAt: string | null;
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

function query(params: Record<string, string | boolean>): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		search.set(key, String(value));
	}
	return `/api/tasks?${search.toString()}`;
}

export async function fetchDigest(now = new Date()): Promise<Digest> {
	const settings = await apiGet<{ timezone: string }>("/api/settings");
	const startOfToday = startOfDayIso(now, settings.timezone);
	const startOfTomorrow = new Date(
		new Date(startOfToday).getTime() + DAY_MS,
	).toISOString();
	const staleBefore = new Date(
		now.getTime() - STALE_DAYS * DAY_MS,
	).toISOString();

	const [dueTodayRaw, overdueRaw, staleRaw] = await Promise.all([
		apiGet<Task[]>(
			query({
				status: "open",
				rootsOnly: true,
				from: startOfToday,
				to: startOfTomorrow,
			}),
		),
		apiGet<Task[]>(
			query({ status: "open", rootsOnly: true, to: startOfToday }),
		),
		apiGet<Task[]>(query({ status: "open", rootsOnly: true, staleBefore })),
	]);

	const dueToday = dueTodayRaw.filter(
		(task) => task.dueAt !== null && task.dueAt < startOfTomorrow,
	);
	const overdue = overdueRaw.filter(
		(task) => task.dueAt !== null && task.dueAt < startOfToday,
	);

	// Stale means "untouched for a fortnight and not already surfaced above",
	// otherwise the same task would appear in two sections.
	const shown = new Set([...dueToday, ...overdue].map((task) => task.id));
	const stale = staleRaw.filter((task) => !shown.has(task.id));

	return { dueToday, overdue, stale };
}
