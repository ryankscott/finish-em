import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ensureScheme, parseTaskLinkSegments } from "@/lib/task-links";
import type { Project, Task } from "@/server/types";

import { useHotkeyScope } from "../lib/hotkeys";
import { useProjects, useTaskMutations } from "../lib/queries";
import { useUi } from "../state/ui";
import { TaskRow } from "./TaskRow";

type VisibleRow = {
	task: Task;
	depth: number;
	hasSubtasks: boolean;
	expanded: boolean;
};

/**
 * Shared keyboard-driven task list. Nests subtasks under parents that are
 * present in the same result set; orphan subtasks render at the top level,
 * matching the TUI.
 */
export function TaskListView({
	tasks,
	emptyMessage = "No tasks",
	showProject = true,
	deletedView = false,
	defaultProjectId,
}: {
	tasks: Task[];
	emptyMessage?: string;
	showProject?: boolean;
	deletedView?: boolean;
	defaultProjectId?: number;
}) {
	const { data: projects = [] } = useProjects();
	const { completeTask, deleteTask, undeleteTask } = useTaskMutations();
	const ui = useUi();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
	const containerRef = useRef<HTMLDivElement>(null);

	const projectById = useMemo(
		() => new Map(projects.map((p) => [p.id, p])),
		[projects],
	);

	const rows = useMemo<VisibleRow[]>(() => {
		const ids = new Set(tasks.map((t) => t.id));
		const childrenByParent = new Map<number, Task[]>();
		const roots: Task[] = [];
		for (const task of tasks) {
			if (task.parentTaskId !== null && ids.has(task.parentTaskId)) {
				const siblings = childrenByParent.get(task.parentTaskId) ?? [];
				siblings.push(task);
				childrenByParent.set(task.parentTaskId, siblings);
			} else {
				roots.push(task);
			}
		}
		const out: VisibleRow[] = [];
		const walk = (task: Task, depth: number) => {
			const children = childrenByParent.get(task.id) ?? [];
			const expanded = expandedIds.has(task.id);
			out.push({ task, depth, hasSubtasks: children.length > 0, expanded });
			if (expanded) {
				for (const child of children) walk(child, depth + 1);
			}
		};
		for (const root of roots) walk(root, 0);
		return out;
	}, [tasks, expandedIds]);

	const clampedIndex = Math.min(selectedIndex, Math.max(0, rows.length - 1));
	const selected = rows[clampedIndex];

	useEffect(() => {
		const el = containerRef.current?.querySelector("[data-selected]");
		el?.scrollIntoView({ block: "nearest" });
	}, [clampedIndex, rows]);

	useHotkeyScope({
		j: () => setSelectedIndex((i) => Math.min(i + 1, rows.length - 1)),
		arrowdown: () => setSelectedIndex((i) => Math.min(i + 1, rows.length - 1)),
		k: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
		arrowup: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
		g: () => setSelectedIndex(0),
		"shift+g": () => setSelectedIndex(rows.length - 1),
		space: () => {
			if (!selected?.hasSubtasks) return;
			setExpandedIds((prev) => {
				const next = new Set(prev);
				if (next.has(selected.task.id)) next.delete(selected.task.id);
				else next.add(selected.task.id);
				return next;
			});
		},
		x: () => {
			if (!selected) return;
			completeTask.mutate(selected.task, {
				onSuccess: (task) =>
					toast.success(
						task.status === "completed" ? "Task completed" : "Task reopened",
					),
				onError: (err) => toast.error(err.message),
			});
		},
		d: () => {
			if (!selected) return;
			deleteTask.mutate(selected.task.id, {
				onSuccess: () => toast.success("Task deleted"),
				onError: (err) => toast.error(err.message),
			});
		},
		u: () => {
			if (!deletedView || !selected) return;
			undeleteTask.mutate(selected.task.id, {
				onSuccess: () => toast.success("Task restored"),
				onError: (err) => toast.error(err.message),
			});
		},
		e: () => {
			if (selected) ui.openTaskEditor(selected.task);
		},
		enter: () => {
			if (selected) ui.openTaskEditor(selected.task);
		},
		s: () => {
			if (selected) ui.openQuickAdd({ parentTask: selected.task });
		},
		a: () => {
			ui.openQuickAdd({ projectId: defaultProjectId });
		},
		o: () => {
			if (!selected) return;
			const text = `${selected.task.title}\n${selected.task.notes}`;
			const link = parseTaskLinkSegments(text).find(
				(segment) => segment.type === "link",
			);
			if (link && "url" in link) {
				window.open(ensureScheme(link.url), "_blank");
			} else {
				toast.info("No links in this task");
			}
		},
	});

	if (rows.length === 0) {
		return (
			<div className="px-4 py-8 text-center text-muted">{emptyMessage}</div>
		);
	}

	return (
		<div ref={containerRef} className="flex flex-col gap-0.5 px-2 py-2">
			{rows.map((row, index) => (
				<TaskRow
					key={row.task.id}
					task={row.task}
					project={projectById.get(row.task.projectId)}
					selected={index === clampedIndex}
					depth={row.depth}
					hasSubtasks={row.hasSubtasks}
					expanded={row.expanded}
					showProject={showProject}
				/>
			))}
		</div>
	);
}
