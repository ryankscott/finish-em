import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ensureScheme, toDisplaySegments } from "@/lib/task-links";
import type { Task } from "@/server/types";

import { useHotkeyScope } from "../lib/hotkeys";
import { useProjects, useTaskMutations } from "../lib/queries";
import { useUi } from "../state/ui";
import { type LinkChoice, LinkPickerDialog } from "./LinkPickerDialog";
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
	disableOpenLink = false,
	sectionLabels,
}: {
	tasks: Task[];
	emptyMessage?: string;
	showProject?: boolean;
	deletedView?: boolean;
	defaultProjectId?: number;
	disableOpenLink?: boolean;
	/**
	 * Task id -> heading rendered immediately above that task. Lets a caller
	 * split one list into labelled groups without splitting it into separate
	 * TaskListViews, which would give each group its own keyboard cursor.
	 */
	sectionLabels?: Map<number, string>;
}) {
	const { data: projects = [] } = useProjects();
	const { completeTask, deleteTask, undeleteTask } = useTaskMutations();
	const ui = useUi();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
	const [pickerLinks, setPickerLinks] = useState<LinkChoice[] | null>(null);
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: the deps are the trigger -- a selection or list change re-runs the scroll
	useEffect(() => {
		const el = containerRef.current?.querySelector("[data-selected]");
		el?.scrollIntoView({ block: "nearest" });
	}, [clampedIndex, rows]);

	const toggleExpanded = (taskId: number) => {
		setExpandedIds((prev) => {
			const next = new Set(prev);
			if (next.has(taskId)) next.delete(taskId);
			else next.add(taskId);
			return next;
		});
	};

	useHotkeyScope({
		j: () => setSelectedIndex((i) => Math.min(i + 1, rows.length - 1)),
		arrowdown: () => setSelectedIndex((i) => Math.min(i + 1, rows.length - 1)),
		k: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
		arrowup: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
		g: () => setSelectedIndex(0),
		"shift+g": () => setSelectedIndex(rows.length - 1),
		space: () => {
			if (!selected?.hasSubtasks) return;
			toggleExpanded(selected.task.id);
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
			deleteTask.mutate(selected.task, {
				onSuccess: () => toast.success("Task deleted"),
				onError: (err) => toast.error(err.message),
			});
		},
		u: () => {
			// Outside the Deleted view, fall through to the global undo handler.
			if (!deletedView || !selected) return false;
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
			if (disableOpenLink) return false;
			if (!selected) return;
			const titleSegs = toDisplaySegments(selected.task.title);
			const notesSegs = toDisplaySegments(selected.task.notes ?? "");
			const links: LinkChoice[] = [...titleSegs, ...notesSegs]
				.filter((s) => s.type === "link")
				.map((s) => ({
					url: (s as { type: "link"; url: string; displayLabel: string }).url,
					displayLabel: (
						s as { type: "link"; url: string; displayLabel: string }
					).displayLabel,
				}));
			if (links.length === 0) {
				toast.info("No links in this task");
			} else if (links.length === 1) {
				window.open(ensureScheme(links[0].url), "_blank");
			} else {
				setPickerLinks(links);
			}
		},
	});

	if (rows.length === 0) {
		return (
			<div className="px-4 py-8 text-center text-muted">{emptyMessage}</div>
		);
	}

	return (
		<>
			<div ref={containerRef} className="flex flex-col gap-0.5 px-2 py-2">
				{rows.map((row, index) => {
					const heading =
						row.depth === 0 ? sectionLabels?.get(row.task.id) : undefined;
					return (
						<Fragment key={row.task.id}>
							{heading ? (
								<span className="px-2 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted/70 first:pt-0">
									{heading}
								</span>
							) : null}
							<TaskRow
								task={row.task}
								project={projectById.get(row.task.projectId)}
								selected={index === clampedIndex}
								depth={row.depth}
								hasSubtasks={row.hasSubtasks}
								expanded={row.expanded}
								showProject={showProject}
								onOpen={() => {
									// Keep the keyboard cursor in sync with what was tapped, so a
									// later hotkey acts on the row the user just touched.
									setSelectedIndex(index);
									ui.openTaskEditor(row.task);
								}}
								onToggleExpand={() => toggleExpanded(row.task.id)}
							/>
						</Fragment>
					);
				})}
			</div>
			<LinkPickerDialog
				open={pickerLinks !== null}
				links={pickerLinks ?? []}
				onClose={() => setPickerLinks(null)}
			/>
		</>
	);
}
