import { nowIso } from "@/lib/datetime";
import type { BatchOp, Db } from "@/server/db/types";

import type { ProjectResource, ProjectResourceInput } from "@/server/types";

function mapRow(row: Record<string, unknown>): ProjectResource {
	return {
		id: Number(row.id),
		label: String(row.label),
		url: String(row.url),
		sortOrder: Number(row.sort_order),
	};
}

/** Resources for a single project, in display order. */
export async function listResources(
	db: Db,
	projectId: number,
): Promise<ProjectResource[]> {
	const rows = await db
		.prepare(
			"SELECT * FROM project_resources WHERE project_id = ? ORDER BY sort_order ASC, id ASC",
		)
		.all<Record<string, unknown>>(projectId);
	return rows.map(mapRow);
}

/**
 * Resources for every project, grouped by project id.
 *
 * listProjects used to call listResources once per project. That is 1+N queries,
 * which on D1 is 1+N network round trips; one grouped query keeps it at 2 for
 * the whole page.
 */
export async function listResourcesByProject(
	db: Db,
): Promise<Map<number, ProjectResource[]>> {
	const rows = await db
		.prepare(
			"SELECT * FROM project_resources ORDER BY project_id ASC, sort_order ASC, id ASC",
		)
		.all<Record<string, unknown>>();

	const grouped = new Map<number, ProjectResource[]>();
	for (const row of rows) {
		const projectId = Number(row.project_id);
		const list = grouped.get(projectId);
		if (list) {
			list.push(mapRow(row));
		} else {
			grouped.set(projectId, [mapRow(row)]);
		}
	}
	return grouped;
}

/**
 * Replace a project's resource list wholesale. Empty labels/urls are skipped so
 * blank rows from a form don't persist. sort_order follows input order.
 *
 * The delete and the inserts go in one batch: D1 rejects explicit
 * BEGIN/COMMIT/ROLLBACK, so batch is what keeps this atomic. Without it a
 * failure partway through would leave the project with some resources deleted
 * and only some of the replacements written.
 */
export async function setResources(
	db: Db,
	projectId: number,
	resources: ProjectResourceInput[],
): Promise<ProjectResource[]> {
	const now = nowIso();
	const cleaned = resources
		.map((r) => ({ label: r.label.trim(), url: r.url.trim() }))
		.filter((r) => r.label.length > 0 && r.url.length > 0);

	const ops: BatchOp[] = [
		{
			sql: "DELETE FROM project_resources WHERE project_id = ?",
			params: [projectId],
		},
		...cleaned.map((r, index) => ({
			sql: "INSERT INTO project_resources (project_id, label, url, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
			params: [projectId, r.label, r.url, index, now, now],
		})),
	];

	await db.batch(ops);

	return listResources(db, projectId);
}
