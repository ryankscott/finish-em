import type { Project } from "@/server/types";

export function reorderProjectIds(
	projects: Project[],
	activeId: number,
	overId: number,
): number[] {
	const ids = projects.map((p) => p.id);
	const from = ids.indexOf(activeId),
		to = ids.indexOf(overId);
	if (from < 0 || to < 0 || from === to) return ids;
	const [moved] = ids.splice(from, 1);
	ids.splice(to, 0, moved);
	return ids;
}
