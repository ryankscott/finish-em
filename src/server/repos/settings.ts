import { getDb, nowIso } from "@/server/db/client";
import { mapSettingsRow } from "@/server/repos/mappers";
import type { AppSettings } from "@/server/types";

export function getSettings(): AppSettings {
	const db = getDb();
	const row = db.prepare("SELECT * FROM settings WHERE id = 1").get() as Record<
		string,
		unknown
	>;
	return mapSettingsRow(row);
}

export function updateSettings(
	patch: Partial<{
		timezone: string;
		calendarIcsUrl: string | null;
		calendarLastSyncedAt: string | null;
	}>,
): AppSettings {
	const current = getSettings();
	const timezone = patch.timezone ?? current.timezone;
	const calendarIcsUrl =
		patch.calendarIcsUrl === undefined
			? current.calendarIcsUrl
			: patch.calendarIcsUrl;
	const calendarLastSyncedAt =
		patch.calendarLastSyncedAt === undefined
			? current.calendarLastSyncedAt
			: patch.calendarLastSyncedAt;

	getDb()
		.prepare(
			"UPDATE settings SET timezone = ?, calendar_ics_url = ?, calendar_last_synced_at = ?, updated_at = ? WHERE id = 1",
		)
		.run(timezone, calendarIcsUrl, calendarLastSyncedAt, nowIso());

	return getSettings();
}
