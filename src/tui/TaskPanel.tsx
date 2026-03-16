import { Box, Text } from "ink";

import { toDisplayString } from "../lib/task-links";
import type { Project, Task } from "../server/types";
import {
	formatDueDate,
	formatScheduledDate,
	isOverdueDueDate,
	priorityColor,
	recurrenceLabel,
	truncate,
} from "./task-display-helpers";
import type { TaskRow } from "./task-row-utils";
import { buildTaskRows } from "./task-row-utils";

export type TaskPanelRow = TaskRow;

export function buildTaskPanelRows(tasks: Task[]): TaskPanelRow[] {
	return buildTaskRows(tasks);
}

const PROP_WIDTHS = {
	priority: 4,
	recurrence: 14,
	scheduled: 9,
	due: 9,
	project: 14,
} as const;

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
		{!isExpanded && task.notes && (
			<Box marginLeft={isSubtask ? 11 : 6}>
				<Text dimColor italic>{truncate(toDisplayString(task.notes), 80)}</Text>
			</Box>
		)}
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
						<Text dimColor>Project: {project.name}</Text>
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
					Description: <Text bold>{activeProject.description ? toDisplayString(activeProject.description) : "None"}</Text>
				</Text>
					<Text>
						Start: <Text bold>{activeProject.startAt ?? "None"}</Text>
					</Text>
					<Text>
						End: <Text bold>{activeProject.endAt ?? "None"}</Text>
					</Text>
					{activeProject.jiraDiscoveryUrl && (
						<Text>
							Jira Discovery: <Text bold>{activeProject.jiraDiscoveryUrl}</Text>
						</Text>
					)}
					{activeProject.jiraDeliveryUrl && (
						<Text>
							Jira Delivery: <Text bold>{activeProject.jiraDeliveryUrl}</Text>
						</Text>
					)}
					{activeProject.confluenceUrl && (
						<Text>
							Confluence: <Text bold>{activeProject.confluenceUrl}</Text>
						</Text>
					)}
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
