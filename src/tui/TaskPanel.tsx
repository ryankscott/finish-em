import { format, isBefore, isValid, parseISO } from "date-fns";
import { Box, Text } from "ink";

import { toDisplayString } from "../lib/task-links";
import type { Priority, Project, Task } from "../server/types";

export type TaskPanelRow = {
	task: Task;
	depth: 0 | 1;
	parentTitle?: string;
};

export function buildTaskPanelRows(tasks: Task[]): TaskPanelRow[] {
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

	const rows: TaskPanelRow[] = [];
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

const priorityColor = (priority: Priority): string => {
	switch (priority) {
		case 1:
			return "red";
		case 2:
			return "yellow";
		case 3:
			return "green";
		default:
			return "blue";
	}
};

const formatDueDate = (dueAt: string): string => {
	try {
		return format(parseISO(dueAt), "MMM dd");
	} catch {
		return dueAt;
	}
};

const isOverdueDueDate = (dueAt: string): boolean => {
	try {
		const dueDate = parseISO(dueAt);
		return isValid(dueDate) && isBefore(dueDate, new Date());
	} catch {
		return false;
	}
};

const formatScheduledDate = (scheduledAt: string): string => {
	try {
		return format(parseISO(scheduledAt), "MMM dd");
	} catch {
		return scheduledAt;
	}
};

const recurrenceLabel = (preset: string | null): string => {
	if (!preset) return "Does not recur";
	return preset.replace(/_/g, " ");
};

const PROP_WIDTHS = {
	priority: 4,
	recurrence: 14,
	scheduled: 9,
	due: 9,
	project: 14,
} as const;

const truncate = (text: string, maxLen: number): string => {
	if (text.length <= maxLen) return text.padEnd(maxLen);
	return `${text.slice(0, maxLen - 1)}…`;
};

type TaskRowItemProps = {
	task: Task;
	flatIndex: number;
	selectedIndex: number;
	focused: boolean;
	expandedTaskId?: number | null;
	hasSubtasks?: boolean;
	projectMap?: Record<number, Project>;
	isSubtask?: boolean;
	isLastSubtask?: boolean;
};

const TaskRowItem = ({
	task,
	flatIndex,
	selectedIndex,
	focused,
	expandedTaskId,
	hasSubtasks = false,
	projectMap,
	isSubtask = false,
	isLastSubtask = false,
}: TaskRowItemProps) => {
	const isSelected = flatIndex === selectedIndex;
	const isExpanded = hasSubtasks && expandedTaskId === task.id;
	const isCompleted = task.status === "completed";
	const isOverdue = task.dueAt ? isOverdueDueDate(task.dueAt) : false;
	const pColor = priorityColor(task.priority);
	const project = projectMap?.[task.projectId];
	const titleColor =
		isSelected && focused ? "cyan" : isSelected ? "blueBright" : undefined;
	const circle = isCompleted ? "✓" : "○";
	const recurrenceLabelText = `🔁 ${truncate(task.recurrencePreset ? recurrenceLabel(task.recurrencePreset) : "-", PROP_WIDTHS.recurrence - 3)}`;
	const scheduledLabel = `🗓 ${truncate(task.scheduledAt ? formatScheduledDate(task.scheduledAt) : "-", PROP_WIDTHS.scheduled - 3)}`;
	const dueLabel = `⏰ ${truncate(task.dueAt ? formatDueDate(task.dueAt) : "-", PROP_WIDTHS.due - 3)}`;
	const projectLabel = `📁 ${truncate(project ? project.name : "-", PROP_WIDTHS.project - 3)}`;

	return (
		<Box flexDirection="column">
			<Box>
				{isSubtask && <Text dimColor>{isLastSubtask ? "  └─ " : "  ├─ "}</Text>}
				<Box width={2}>
					<Text color={isSelected && focused ? "cyan" : undefined}>
						{hasSubtasks ? (isExpanded ? "▼" : isSelected ? "❯" : " ") : " "}
					</Text>
				</Box>
				<Box width={2}>
					<Text color={pColor}>{circle}</Text>
				</Box>
				<Box flexGrow={1}>
					<Text
						bold={isSelected && focused}
						color={titleColor}
						dimColor={isCompleted}
						strikethrough={isCompleted}
					>
						{toDisplayString(task.title)}
					</Text>
				</Box>
				<Box marginLeft={1} gap={1}>
					<Box width={PROP_WIDTHS.priority}>
						<Text color={pColor} dimColor={isCompleted}>🚩{task.priority}</Text>
					</Box>
					<Text dimColor>·</Text>
					<Box width={PROP_WIDTHS.recurrence}>
						<Text dimColor={isCompleted}>{recurrenceLabelText}</Text>
					</Box>
					<Text dimColor>·</Text>
					<Box width={PROP_WIDTHS.scheduled}>
						<Text dimColor={isCompleted}>{scheduledLabel}</Text>
					</Box>
					<Text dimColor>·</Text>
					<Box width={PROP_WIDTHS.due}>
						<Text
							color={isOverdue && !isCompleted ? "red" : undefined}
							dimColor={isCompleted || !isOverdue}
						>
							{dueLabel}
						</Text>
					</Box>
					<Text dimColor>·</Text>
					<Box width={PROP_WIDTHS.project}>
						<Text dimColor={isCompleted}>{projectLabel}</Text>
					</Box>
				</Box>
			</Box>
			{isExpanded && (
				<Box
					flexDirection="column"
					marginTop={1}
					marginLeft={isSubtask ? 8 : 4}
				>
					{task.notes && (
						<Box flexDirection="column">
							<Text dimColor>Notes:</Text>
							<Text>{toDisplayString(task.notes)}</Text>
						</Box>
					)}
					{project && (
						<Box width={"100%"} justifyContent="flex-end">
							<Text backgroundColor={project.color}>
								Project: <Text color={"brightwhite"}> {project.name} </Text>
							</Text>
						</Box>
					)}
				</Box>
			)}
		</Box>
	);
};

type TaskPanelProps = {
	rows: TaskPanelRow[];
	viewLabel: string;
	focused: boolean;
	selectedIndex: number;
	expandedTaskId?: number | null;
	expandableTaskIds?: Set<number>;
	projectMap?: Record<number, Project>;
	activeProject?: Project | null;
};

export const TaskPanel = ({
	rows,
	viewLabel,
	focused,
	selectedIndex,
	expandedTaskId,
	expandableTaskIds,
	projectMap,
	activeProject,
}: TaskPanelProps) => {
	const borderColor = focused ? "magentaBright" : "gray";

	return (
		<Box
			flexDirection="column"
			flexGrow={1}
			borderStyle="round"
			borderColor={borderColor}
			paddingX={1}
		>
			<Box marginBottom={1}>
				<Text bold color="magentaBright">
					{viewLabel}
				</Text>
			</Box>
			{activeProject && (
				<Box flexDirection="column" marginBottom={1}>
					<Text>
						Description: <Text bold>{activeProject.description || "None"}</Text>
					</Text>
					<Text>
						Start: <Text bold>{activeProject.startAt ?? "None"}</Text>
					</Text>
					<Text>
						End: <Text bold>{activeProject.endAt ?? "None"}</Text>
					</Text>
					<Text>
						Color:{" "}
						<Text backgroundColor={activeProject.color} color="black">
							{"   "}
						</Text>
					</Text>
					<Box marginTop={1}>
						<Text dimColor>{"─".repeat(24)}</Text>
					</Box>
				</Box>
			)}

			{rows.length === 0 ? (
				<Text dimColor>No tasks</Text>
			) : (
				rows.map((row, index) => (
					<TaskRowItem
						key={row.task.id}
						task={row.task}
						flatIndex={index}
						selectedIndex={selectedIndex}
						focused={focused}
						expandedTaskId={expandedTaskId}
						hasSubtasks={expandableTaskIds?.has(row.task.id)}
						projectMap={projectMap}
						isSubtask={row.depth === 1}
						isLastSubtask={
							row.depth === 1 &&
							(index === rows.length - 1 || rows[index + 1]?.depth !== 1)
						}
					/>
				))
			)}
		</Box>
	);
};
