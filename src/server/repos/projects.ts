import { nowIso } from "@/lib/datetime";
import type { BatchOp, Db } from "@/server/db/types";
import { mapProjectRow } from "@/server/repos/mappers";
import {
	listResources,
	listResourcesByProject,
	setResources,
} from "@/server/repos/project-resources";

import type { Project, ProjectResourceInput } from "@/server/types";

async function withResources(db: Db, project: Project): Promise<Project> {
	return { ...project, resources: await listResources(db, project.id) };
}

export async function listProjects(db: Db): Promise<Project[]> {
	const rows = await db
		.prepare(
			"SELECT * FROM projects ORDER BY is_inbox DESC, sort_order ASC, name ASC",
		)
		.all<Record<string, unknown>>();

	// One grouped resource query instead of one per project.
	const resources = await listResourcesByProject(db);
	return rows.map(mapProjectRow).map((project) => ({
		...project,
		resources: resources.get(project.id) ?? [],
	}));
}

export async function getProject(
	db: Db,
	projectId: number,
): Promise<Project | null> {
	const row = await db
		.prepare("SELECT * FROM projects WHERE id = ?")
		.get<Record<string, unknown>>(projectId);

	return row ? withResources(db, mapProjectRow(row)) : null;
}

export async function createProject(
	db: Db,
	input: {
		name: string;
		emoji?: string | null;
		description?: string;
		startAt?: string | null;
		endAt?: string | null;
		color?: string;
		isInbox?: boolean;
		resources?: ProjectResourceInput[];
	},
): Promise<Project> {
	const now = nowIso();
	const emoji = input.emoji ?? null;
	const description = input.description ?? "";
	const startAt = input.startAt ?? null;
	const endAt = input.endAt ?? null;
	const color = input.color ?? "#ef4444";
	const isInbox = input.isInbox ? 1 : 0;

	if (isInbox === 1) {
		await db
			.prepare("UPDATE projects SET is_inbox = 0, updated_at = ?")
			.run(now);
	}

	// Append new projects to the end of the sidebar ordering.
	const maxRow = await db
		.prepare("SELECT MAX(sort_order) AS max FROM projects")
		.get<{ max: number | null }>();
	const sortOrder = (maxRow?.max ?? -1) + 1;

	const row = await db
		.prepare(
			`INSERT INTO projects (name, emoji, description, start_at, end_at, color, is_inbox, sort_order, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			 RETURNING *`,
		)
		.get<Record<string, unknown>>(
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

	const project = mapProjectRow(row as Record<string, unknown>);
	if (input.resources) {
		await setResources(db, project.id, input.resources);
	}

	return withResources(db, project);
}

export async function updateProject(
	db: Db,
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
): Promise<Project | null> {
	const existing = await getProject(db, projectId);

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
		await db
			.prepare("UPDATE projects SET is_inbox = 0, updated_at = ?")
			.run(now);
	}

	await db
		.prepare(
			"UPDATE projects SET name = ?, emoji = ?, description = ?, start_at = ?, end_at = ?, color = ?, is_inbox = ?, updated_at = ? WHERE id = ?",
		)
		.run(
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
		await setResources(db, projectId, patch.resources);
	}

	return getProject(db, projectId);
}

export async function deleteProject(
	db: Db,
	projectId: number,
): Promise<boolean> {
	const existing = await getProject(db, projectId);

	if (!existing || existing.isInbox) {
		return false;
	}

	const inbox = await db
		.prepare("SELECT id FROM projects WHERE is_inbox = 1 LIMIT 1")
		.get<{ id: number }>();

	if (!inbox) {
		throw new Error(
			"No inbox project found; cannot reassign tasks before delete",
		);
	}

	// Reassign and delete atomically. tasks.project_id is ON DELETE CASCADE, so
	// if the reassign landed but the delete didn't we would have moved tasks to
	// the inbox for a project that still exists; if the delete landed without the
	// reassign, the cascade would take the tasks with it.
	await db.batch([
		{
			sql: "UPDATE tasks SET project_id = ? WHERE project_id = ?",
			params: [inbox.id, projectId],
		},
		{ sql: "DELETE FROM projects WHERE id = ?", params: [projectId] },
	]);

	return true;
}

export async function reorderProjects(
	db: Db,
	orderedIds: number[],
): Promise<Project[]> {
	const now = nowIso();
	const ops: BatchOp[] = orderedIds.map((id, index) => ({
		sql: "UPDATE projects SET sort_order = ?, updated_at = ? WHERE id = ? AND is_inbox = 0",
		params: [index, now, id],
	}));
	await db.batch(ops);
	return listProjects(db);
}

export async function getInboxProjectId(db: Db): Promise<number> {
	const row = await db
		.prepare("SELECT id FROM projects WHERE is_inbox = 1 LIMIT 1")
		.get<{ id: number }>();
	if (!row) {
		throw new Error("No inbox project found");
	}
	return row.id;
}
