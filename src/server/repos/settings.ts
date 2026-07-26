import { nowIso } from "@/server/db/client";
import type { Db } from "@/server/db/types";
import { mapSettingsRow } from "@/server/repos/mappers";
import type { AppSettings } from "@/server/types";

export async function getSettings(db: Db): Promise<AppSettings> {
	const row = await db
		.prepare("SELECT * FROM settings WHERE id = 1")
		.get<Record<string, unknown>>();
	return mapSettingsRow(row as Record<string, unknown>);
}

export async function updateSettings(
	db: Db,
	patch: Partial<{
		timezone: string;
		calendarIcsUrl: string | null;
		calendarLastSyncedAt: string | null;
	}>,
): Promise<AppSettings> {
	const current = await getSettings(db);
	const timezone = patch.timezone ?? current.timezone;
	const calendarIcsUrl =
		patch.calendarIcsUrl === undefined
			? current.calendarIcsUrl
			: patch.calendarIcsUrl;
	const calendarLastSyncedAt =
		patch.calendarLastSyncedAt === undefined
			? current.calendarLastSyncedAt
			: patch.calendarLastSyncedAt;

	await db
		.prepare(
			"UPDATE settings SET timezone = ?, calendar_ics_url = ?, calendar_last_synced_at = ?, updated_at = ? WHERE id = 1",
		)
		.run(timezone, calendarIcsUrl, calendarLastSyncedAt, nowIso());

	return getSettings(db);
}
