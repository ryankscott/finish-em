import { getDb, nowIso } from "@/server/db/client";

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
export function listResources(projectId: number): ProjectResource[] {
	const db = getDb();
	const rows = db
		.prepare(
			"SELECT * FROM project_resources WHERE project_id = ? ORDER BY sort_order ASC, id ASC",
		)
		.all(projectId) as Record<string, unknown>[];
	return rows.map(mapRow);
}

/**
 * Replace a project's resource list wholesale. Empty labels/urls are skipped so
 * blank rows from a form don't persist. sort_order follows input order.
 */
export function setResources(
	projectId: number,
	resources: ProjectResourceInput[],
): ProjectResource[] {
	const db = getDb();
	const now = nowIso();
	const cleaned = resources
		.map((r) => ({ label: r.label.trim(), url: r.url.trim() }))
		.filter((r) => r.label.length > 0 && r.url.length > 0);

	db.exec("BEGIN");
	try {
		db.prepare("DELETE FROM project_resources WHERE project_id = ?").run(
			projectId,
		);
		const insert = db.prepare(
			"INSERT INTO project_resources (project_id, label, url, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		);
		cleaned.forEach((r, index) => {
			insert.run(projectId, r.label, r.url, index, now, now);
		});
		db.exec("COMMIT");
	} catch (err) {
		db.exec("ROLLBACK");
		throw err;
	}

	return listResources(projectId);
}
