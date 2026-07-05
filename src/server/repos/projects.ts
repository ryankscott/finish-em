import { getDb, nowIso } from "@/server/db/client";
import { mapProjectRow } from "@/server/repos/mappers";
import { listResources, setResources } from "@/server/repos/project-resources";

import type { Project, ProjectResourceInput } from "@/server/types";

function withResources(project: Project): Project {
	return { ...project, resources: listResources(project.id) };
}

export function listProjects(): Project[] {
	const db = getDb();
	const rows = db
		.prepare(
			"SELECT * FROM projects ORDER BY is_inbox DESC, sort_order ASC, name ASC",
		)
		.all() as Record<string, unknown>[];
	return rows.map(mapProjectRow).map(withResources);
}

export function getProject(projectId: number): Project | null {
	const db = getDb();
	const row = db
		.prepare("SELECT * FROM projects WHERE id = ?")
		.get(projectId) as Record<string, unknown> | undefined;

	return row ? withResources(mapProjectRow(row)) : null;
}

export function createProject(input: {
	name: string;
	emoji?: string | null;
	description?: string;
	startAt?: string | null;
	endAt?: string | null;
	color?: string;
	isInbox?: boolean;
	resources?: ProjectResourceInput[];
}): Project {
	const db = getDb();
	const now = nowIso();
	const emoji = input.emoji ?? null;
	const description = input.description ?? "";
	const startAt = input.startAt ?? null;
	const endAt = input.endAt ?? null;
	const color = input.color ?? "#ef4444";
	const isInbox = input.isInbox ? 1 : 0;

	if (isInbox === 1) {
		db.prepare("UPDATE projects SET is_inbox = 0, updated_at = ?").run(now);
	}

	// Append new projects to the end of the sidebar ordering.
	const maxRow = db
		.prepare("SELECT MAX(sort_order) AS max FROM projects")
		.get() as { max: number | null };
	const sortOrder = (maxRow.max ?? -1) + 1;

	const result = db
		.prepare(
			"INSERT INTO projects (name, emoji, description, start_at, end_at, color, is_inbox, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		)
		.run(
			input.name,
			emoji,
			description,
			startAt,
			endAt,
			color,
			isInbox,
			sortOrder,
			now,
			now,
		);

	const id = Number(result.lastInsertRowid);
	if (input.resources) {
		setResources(id, input.resources);
	}

	const row = db
		.prepare("SELECT * FROM projects WHERE id = ?")
		.get(id) as Record<string, unknown>;

	return withResources(mapProjectRow(row));
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
		resources: ProjectResourceInput[];
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

	if (isInbox) {
		db.prepare("UPDATE projects SET is_inbox = 0, updated_at = ?").run(now);
	}

	db.prepare(
		"UPDATE projects SET name = ?, emoji = ?, description = ?, start_at = ?, end_at = ?, color = ?, is_inbox = ?, updated_at = ? WHERE id = ?",
	).run(
		name,
		emoji,
		description,
		startAt,
		endAt,
		color,
		isInbox ? 1 : 0,
		now,
		projectId,
	);

	if (patch.resources !== undefined) {
		setResources(projectId, patch.resources);
	}

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
		.get() as { id: number } | undefined;

	if (!inbox) {
		throw new Error("No inbox project found; cannot reassign tasks before delete");
	}

	db.prepare("UPDATE tasks SET project_id = ? WHERE project_id = ?").run(
		inbox.id,
		projectId,
	);

	const result = db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);
	return result.changes > 0;
}

export function reorderProjects(orderedIds: number[]): Project[] {
	const db = getDb();
	const now = nowIso();
	const update = db.prepare(
		"UPDATE projects SET sort_order = ?, updated_at = ? WHERE id = ? AND is_inbox = 0",
	);
	orderedIds.forEach((id, index) => {
		update.run(index, now, id);
	});
	return listProjects();
}

export function getInboxProjectId(): number {
	const db = getDb();
	const row = db
		.prepare("SELECT id FROM projects WHERE is_inbox = 1 LIMIT 1")
		.get() as { id: number };
	return row.id;
}
