import { getDb, nowIso } from "@/server/db/client";
import { mapProjectRow } from "@/server/repos/mappers";

import type { Project } from "@/server/types";

export function listProjects(): Project[] {
	const db = getDb();
	const rows = db
		.prepare("SELECT * FROM projects ORDER BY is_inbox DESC, name ASC")
		.all() as Record<string, unknown>[];
	return rows.map(mapProjectRow);
}

export function getProject(projectId: number): Project | null {
	const db = getDb();
	const row = db
		.prepare("SELECT * FROM projects WHERE id = ?")
		.get(projectId) as Record<string, unknown> | undefined;

	return row ? mapProjectRow(row) : null;
}

export function createProject(input: {
	name: string;
	emoji?: string | null;
	description?: string;
	startAt?: string | null;
	endAt?: string | null;
	color?: string;
	isInbox?: boolean;
	jiraDiscoveryUrl?: string | null;
	jiraDeliveryUrl?: string | null;
	confluenceUrl?: string | null;
	jiraDocsUrl?: string | null;
	jiraReleaseNoteUrl?: string | null;
	teamsReleaseNoteUrl?: string | null;
}): Project {
	const db = getDb();
	const now = nowIso();
	const emoji = input.emoji ?? null;
	const description = input.description ?? "";
	const startAt = input.startAt ?? null;
	const endAt = input.endAt ?? null;
	const color = input.color ?? "#ef4444";
	const isInbox = input.isInbox ? 1 : 0;
	const jiraDiscoveryUrl = input.jiraDiscoveryUrl ?? null;
	const jiraDeliveryUrl = input.jiraDeliveryUrl ?? null;
	const confluenceUrl = input.confluenceUrl ?? null;
	const jiraDocsUrl = input.jiraDocsUrl ?? null;
	const jiraReleaseNoteUrl = input.jiraReleaseNoteUrl ?? null;
	const teamsReleaseNoteUrl = input.teamsReleaseNoteUrl ?? null;

	if (isInbox === 1) {
		db.prepare("UPDATE projects SET is_inbox = 0, updated_at = ?").run(now);
	}

	const result = db
		.prepare(
			"INSERT INTO projects (name, emoji, description, start_at, end_at, color, is_inbox, jira_discovery_url, jira_delivery_url, confluence_url, jira_docs_url, jira_release_note_url, teams_release_note_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		)
		.run(
			input.name,
			emoji,
			description,
			startAt,
			endAt,
			color,
			isInbox,
			jiraDiscoveryUrl,
			jiraDeliveryUrl,
			confluenceUrl,
			jiraDocsUrl,
			jiraReleaseNoteUrl,
			teamsReleaseNoteUrl,
			now,
			now,
		);

	const id = Number(result.lastInsertRowid);
	const row = db
		.prepare("SELECT * FROM projects WHERE id = ?")
		.get(id) as Record<string, unknown>;

	return mapProjectRow(row);
}

export function updateProject(
	projectId: number,
	patch: Partial<{
		name: string;
		emoji: string | null;
		description: string;
		startAt: string | null;
		endAt: string | null;
		color: string;
		isInbox: boolean;
		jiraDiscoveryUrl: string | null;
		jiraDeliveryUrl: string | null;
		confluenceUrl: string | null;
		jiraDocsUrl: string | null;
		jiraReleaseNoteUrl: string | null;
		teamsReleaseNoteUrl: string | null;
	}>,
): Project | null {
	const db = getDb();
	const existing = getProject(projectId);

	if (!existing) {
		return null;
	}

	const now = nowIso();
	const name = patch.name ?? existing.name;
	const emoji = patch.emoji ?? existing.emoji;
	const description = patch.description ?? existing.description;
	const startAt = patch.startAt ?? existing.startAt;
	const endAt = patch.endAt ?? existing.endAt;
	const color = patch.color ?? existing.color;
	const isInbox = patch.isInbox ?? existing.isInbox;
	const jiraDiscoveryUrl =
		"jiraDiscoveryUrl" in patch
			? (patch.jiraDiscoveryUrl ?? null)
			: existing.jiraDiscoveryUrl;
	const jiraDeliveryUrl =
		"jiraDeliveryUrl" in patch
			? (patch.jiraDeliveryUrl ?? null)
			: existing.jiraDeliveryUrl;
	const confluenceUrl =
		"confluenceUrl" in patch
			? (patch.confluenceUrl ?? null)
			: existing.confluenceUrl;
	const jiraDocsUrl =
		"jiraDocsUrl" in patch ? (patch.jiraDocsUrl ?? null) : existing.jiraDocsUrl;
	const jiraReleaseNoteUrl =
		"jiraReleaseNoteUrl" in patch
			? (patch.jiraReleaseNoteUrl ?? null)
			: existing.jiraReleaseNoteUrl;
	const teamsReleaseNoteUrl =
		"teamsReleaseNoteUrl" in patch
			? (patch.teamsReleaseNoteUrl ?? null)
			: existing.teamsReleaseNoteUrl;

	if (isInbox) {
		db.prepare("UPDATE projects SET is_inbox = 0, updated_at = ?").run(now);
	}

	db.prepare(
		"UPDATE projects SET name = ?, emoji = ?, description = ?, start_at = ?, end_at = ?, color = ?, is_inbox = ?, jira_discovery_url = ?, jira_delivery_url = ?, confluence_url = ?, jira_docs_url = ?, jira_release_note_url = ?, teams_release_note_url = ?, updated_at = ? WHERE id = ?",
	).run(
		name,
		emoji,
		description,
		startAt,
		endAt,
		color,
		isInbox ? 1 : 0,
		jiraDiscoveryUrl,
		jiraDeliveryUrl,
		confluenceUrl,
		jiraDocsUrl,
		jiraReleaseNoteUrl,
		teamsReleaseNoteUrl,
		now,
		projectId,
	);

	return getProject(projectId);
}

export function deleteProject(projectId: number): boolean {
	const db = getDb();
	const existing = getProject(projectId);

	if (!existing || existing.isInbox) {
		return false;
	}

	const inbox = db
		.prepare("SELECT id FROM projects WHERE is_inbox = 1 LIMIT 1")
		.get() as { id: number };

	db.prepare("UPDATE tasks SET project_id = ? WHERE project_id = ?").run(
		inbox.id,
		projectId,
	);

	const result = db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
	return result.changes > 0;
}

export function getInboxProjectId(): number {
	const db = getDb();
	const row = db
		.prepare("SELECT id FROM projects WHERE is_inbox = 1 LIMIT 1")
		.get() as { id: number };
	return row.id;
}
