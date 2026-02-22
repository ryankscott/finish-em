import { format, isBefore, isValid, parseISO } from "date-fns";
import { Box, Text } from "ink";

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
			return "blue";
		default:
			return "gray";
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
		return format(parseISO(scheduledAt), "MMM dd, HH:mm");
	} catch {
		return scheduledAt;
	}
};

const recurrenceLabel = (preset: string | null): string => {
	if (!preset) return "Does not recur";
	return preset.replace(/_/g, " ");
};

type TaskCluster = { startIndex: number; rows: TaskPanelRow[] };

function buildClusters(rows: TaskPanelRow[]): TaskCluster[] {
	const clusters: TaskCluster[] = [];
	let current: TaskPanelRow[] = [];
	let startIndex = 0;

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		if (row.depth === 0) {
			if (current.length > 0) {
				clusters.push({ startIndex, rows: current });
			}
			startIndex = i;
			current = [row];
		} else {
			current.push(row);
		}
	}
	if (current.length > 0) {
		clusters.push({ startIndex, rows: current });
	}
	return clusters;
}

type TaskRowItemProps = {
	task: Task;
	flatIndex: number;
	selectedIndex: number;
	focused: boolean;
	expandedTaskId?: number | null;
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
	projectMap,
	isSubtask = false,
	isLastSubtask = false,
}: TaskRowItemProps) => {
	const isSelected = flatIndex === selectedIndex;
	const isExpanded = expandedTaskId === task.id;
	const isCompleted = task.status === "completed";
	const isOverdue = task.dueAt ? isOverdueDueDate(task.dueAt) : false;
	const pColor = priorityColor(task.priority);
	const project = projectMap?.[task.projectId];
	const titleColor = isSelected && focused ? "cyan" : isSelected ? "blueBright" : undefined;
	const circle = isCompleted ? "✓" : "○";

	return (
		<Box flexDirection="column">
			<Box>
				{isSubtask && (
					<Text dimColor>{isLastSubtask ? "  └─ " : "  ├─ "}</Text>
				)}
				<Box width={2}>
					<Text color={isSelected && focused ? "cyan" : undefined}>
						{isExpanded ? "▼" : isSelected ? "❯" : " "}
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
						{task.title}
					</Text>
				</Box>
				{task.dueAt && (
					<Box marginLeft={1}>
						<Text color={isOverdue && !isCompleted ? "red" : undefined} dimColor={!isOverdue || isCompleted}>
							{formatDueDate(task.dueAt)}
						</Text>
					</Box>
				)}
			</Box>
			{isExpanded && (
				<Box flexDirection="column" marginTop={1} marginLeft={isSubtask ? 8 : 4}>
					<Box>
						<Text>
							Priority:{" "}
							<Text color={pColor} bold>
								{task.priority}
							</Text>
						</Text>
					</Box>
					<Box>
						<Text>
							Recurs:{" "}
							<Text bold>{recurrenceLabel(task.recurrencePreset)}</Text>
						</Text>
					</Box>
					{task.scheduledAt && (
						<Box>
							<Text>
								Scheduled:{" "}
								<Text bold>{formatScheduledDate(task.scheduledAt)}</Text>
							</Text>
						</Box>
					)}
					{task.notes && (
						<Box flexDirection="column">
							<Text dimColor>Notes:</Text>
							<Text>{task.notes}</Text>
						</Box>
					)}
					{project && (
						<Box width={"100%"} justifyContent="flex-end">
							<Text backgroundColor={project.color}>
								Project:{" "}
								<Text color={"brightwhite"}> {project.name} </Text>
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
	projectMap?: Record<number, Project>;
};

export const TaskPanel = ({
	rows,
	viewLabel,
	focused,
	selectedIndex,
	expandedTaskId,
	projectMap,
}: TaskPanelProps) => {
	const borderColor = focused ? "magentaBright" : "gray";
	const clusters = buildClusters(rows);

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

			{rows.length === 0 ? (
				<Text dimColor>No tasks</Text>
			) : (
				clusters.map((cluster) => {
					const parentRow = cluster.rows[0];
					const childRows = cluster.rows.slice(1);
					const isClusterSelected = cluster.rows.some(
						(_, i) => cluster.startIndex + i === selectedIndex,
					);
					const clusterBorderColor =
						isClusterSelected && focused ? "cyan" : "gray";

					return (
						<Box
							key={parentRow.task.id}
							flexDirection="column"
							paddingX={1}
							borderStyle="round"
							borderColor={clusterBorderColor}
						>
							<TaskRowItem
								task={parentRow.task}
								flatIndex={cluster.startIndex}
								selectedIndex={selectedIndex}
								focused={focused}
								expandedTaskId={expandedTaskId}
								projectMap={projectMap}
							/>
							{childRows.map((childRow, i) => (
								<TaskRowItem
									key={childRow.task.id}
									task={childRow.task}
									flatIndex={cluster.startIndex + 1 + i}
									selectedIndex={selectedIndex}
									focused={focused}
									expandedTaskId={expandedTaskId}
									projectMap={projectMap}
									isSubtask
									isLastSubtask={i === childRows.length - 1}
								/>
							))}
						</Box>
					);
				})
			)}
		</Box>
	);
};
