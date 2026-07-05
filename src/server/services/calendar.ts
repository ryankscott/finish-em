/**
 * Calendar integration service. Fetches an externally published ICS feed
 * (e.g. an Outlook "Publish a calendar" URL), expands recurring meetings into
 * concrete instances within a window, and caches them in the calendar_events
 * table for fast range queries. Read-only: finish-em never writes back to the
 * calendar.
 */

import * as ical from "node-ical";

import {
	type CalendarEventInput,
	listEvents,
	pruneStale,
	upsertEvents,
} from "@/server/repos/calendar";
import { getSettings, updateSettings } from "@/server/repos/settings";
import { repinLinkedTaskDueDates } from "@/server/repos/tasks";
import type { CalendarEvent } from "@/server/types";

// How far back/forward we materialise recurring meetings, in days.
const WINDOW_PAST_DAYS = 7;
const WINDOW_FUTURE_DAYS = 60;

function windowBounds(now: Date): { start: Date; end: Date } {
	const start = new Date(now.getTime() - WINDOW_PAST_DAYS * 86_400_000);
	const end = new Date(now.getTime() + WINDOW_FUTURE_DAYS * 86_400_000);
	return { start, end };
}

function asString(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	if (typeof value === "string") return value.trim() || null;
	// node-ical organizer can be an object with params/val
	if (typeof value === "object" && "val" in (value as Record<string, unknown>)) {
		const val = (value as { val?: unknown }).val;
		return typeof val === "string" ? val.replace(/^mailto:/i, "") || null : null;
	}
	return null;
}

type IcalEvent = {
	type?: string;
	uid?: string;
	summary?: string;
	location?: unknown;
	organizer?: unknown;
	start?: Date & { dateOnly?: boolean };
	end?: Date & { dateOnly?: boolean };
	datetype?: string;
	rrule?: {
		between: (after: Date, before: Date, inc?: boolean) => Date[];
	};
	recurrences?: Record<string, IcalEvent>;
	exdate?: Record<string, Date>;
};

function isAllDay(event: IcalEvent): boolean {
	if (event.datetype === "date") return true;
	return Boolean(event.start?.dateOnly);
}

function eventDurationMs(event: IcalEvent): number {
	if (event.start && event.end) {
		const d = event.end.getTime() - event.start.getTime();
		if (d > 0) return d;
	}
	return 0;
}

function toInput(
	uid: string,
	recurrenceId: string,
	summary: string,
	start: Date,
	durationMs: number,
	allDay: boolean,
	location: string | null,
	organizer: string | null,
): CalendarEventInput {
	const end = durationMs > 0 ? new Date(start.getTime() + durationMs) : null;
	return {
		uid,
		recurrenceId,
		summary: summary || "(no title)",
		startAt: start.toISOString(),
		endAt: end ? end.toISOString() : null,
		allDay,
		location,
		organizer,
	};
}

/**
 * Expand a single parsed VEVENT (which may be recurring) into concrete
 * instances within [start, end].
 */
export function expandEvent(
	event: IcalEvent,
	start: Date,
	end: Date,
): CalendarEventInput[] {
	if (event.type && event.type !== "VEVENT") return [];
	if (!event.uid || !event.start) return [];

	const uid = event.uid;
	const summary = event.summary ?? "";
	const allDay = isAllDay(event);
	const location = asString(event.location);
	const organizer = asString(event.organizer);
	const durationMs = eventDurationMs(event);

	if (!event.rrule) {
		// Single occurrence; only keep it if it falls in the window.
		if (event.start < start || event.start > end) return [];
		return [
			toInput(uid, "", summary, event.start, durationMs, allDay, location, organizer),
		];
	}

	const out: CalendarEventInput[] = [];
	const exdates = new Set(
		Object.values(event.exdate ?? {}).map((d) => d.toDateString()),
	);

	for (const occurrence of event.rrule.between(start, end, true)) {
		if (exdates.has(occurrence.toDateString())) continue;

		// A recurrence override (changed/moved single instance) replaces the slot.
		const overrideKey = occurrence.toISOString().slice(0, 10);
		const override = event.recurrences?.[overrideKey];
		if (override?.start) {
			out.push(
				toInput(
					uid,
					occurrence.toISOString(),
					override.summary ?? summary,
					override.start,
					eventDurationMs(override) || durationMs,
					allDay,
					asString(override.location) ?? location,
					organizer,
				),
			);
			continue;
		}

		out.push(
			toInput(
				uid,
				occurrence.toISOString(),
				summary,
				occurrence,
				durationMs,
				allDay,
				location,
				organizer,
			),
		);
	}
	return out;
}

/**
 * Fetch the configured ICS URL, parse + expand it, and refresh the cache.
 * Returns the number of cached event instances. No-op (returns 0) when no URL
 * is configured. Throws on fetch/parse failure so callers can surface it.
 */
export async function fetchAndSyncCalendar(now: Date = new Date()): Promise<{
	count: number;
	lastSyncedAt: string;
}> {
	const settings = getSettings();
	const url = settings.calendarIcsUrl?.trim();
	if (!url) {
		return { count: 0, lastSyncedAt: settings.calendarLastSyncedAt ?? "" };
	}

	const { start, end } = windowBounds(now);
	const data = (await ical.async.fromURL(url)) as Record<string, IcalEvent>;

	const instances: CalendarEventInput[] = [];
	for (const value of Object.values(data)) {
		instances.push(...expandEvent(value, start, end));
	}

	const syncedAt = now.toISOString();
	upsertEvents(instances, syncedAt);
	pruneStale(syncedAt);
	// Keep tasks linked to a meeting pinned to that meeting's current start, so
	// a rescheduled meeting drags its task's due date along with it.
	repinLinkedTaskDueDates();
	updateSettings({ calendarLastSyncedAt: syncedAt });

	return { count: instances.length, lastSyncedAt: syncedAt };
}

export function listCalendarEvents(range: {
	from?: string;
	to?: string;
} = {}): CalendarEvent[] {
	return listEvents(range);
}
