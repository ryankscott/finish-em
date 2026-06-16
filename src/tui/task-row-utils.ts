import type { Task } from "../server/types";

export type TaskRow = {
	task: Task;
	depth: 0 | 1;
	parentTitle?: string;
};

export function buildTaskRows(tasks: Task[]): TaskRow[] {
	const visibleById = new Map(tasks.map((task) => [task.id, task]));
	const childrenByParent = new Map<number, Task[]>();
	const roots: Task[] = [];

	for (const task of tasks) {
		if (task.parentTaskId !== null && visibleById.has(task.parentTaskId)) {
			const children = childrenByParent.get(task.parentTaskId) ?? [];
			children.push(task);
			childrenByParent.set(task.parentTaskId, children);
			continue;
		}
		roots.push(task);
	}

	const rows: TaskRow[] = [];
	for (const root of roots) {
		rows.push({
			task: root,
			depth: 0,
			parentTitle:
				root.parentTaskId !== null
					? visibleById.get(root.parentTaskId)?.title
					: undefined,
		});
		for (const child of childrenByParent.get(root.id) ?? []) {
			rows.push({
				task: child,
				depth: 1,
				parentTitle: root.title,
			});
		}
	}

	return rows;
}
