import type { Task } from "@/server/types";

/** YYYY-MM-DD for an ISO instant in a given IANA timezone. */
export function dayKeyInZone(iso: string, timeZone: string): string {
	try {
		// en-CA formats as YYYY-MM-DD.
		return new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(new Date(iso));
	} catch {
		return iso.slice(0, 10);
	}
}

export type CompletedGroup = {
	dayKey: string;
	tasks: Task[];
};

/**
 * Group completed tasks by the day they were completed (falling back to
 * updatedAt when completedAt is missing), most recent day first. Tasks within a
 * day keep their input order.
 */
export function groupCompletedTasksByDate(
	tasks: Task[],
	timeZone: string,
): CompletedGroup[] {
	const groups = new Map<string, Task[]>();
	for (const task of tasks) {
		const stamp = task.completedAt ?? task.updatedAt;
		const key = dayKeyInZone(stamp, timeZone);
		const bucket = groups.get(key);
		if (bucket) {
			bucket.push(task);
		} else {
			groups.set(key, [task]);
		}
	}
	return [...groups.entries()]
		.sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
		.map(([dayKey, dayTasks]) => ({ dayKey, tasks: dayTasks }));
}

/** "Monday, Jul 7" style label for a YYYY-MM-DD day key, with Today/Yesterday. */
export function formatDayLabel(dayKey: string, todayKey: string): string {
	if (dayKey === todayKey) return "Today";
	// Parse as local calendar date (no timezone shift).
	const [y, m, d] = dayKey.split("-").map(Number);
	const date = new Date(y, (m ?? 1) - 1, d ?? 1);
	const label = date.toLocaleDateString(undefined, {
		weekday: "long",
		month: "short",
		day: "numeric",
	});
	// Yesterday check
	const today = new Date(
		Number(todayKey.slice(0, 4)),
		Number(todayKey.slice(5, 7)) - 1,
		Number(todayKey.slice(8, 10)),
	);
	const diffDays = Math.round(
		(today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
	);
	if (diffDays === 1) return `Yesterday · ${label}`;
	return label;
}
