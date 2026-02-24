import {
	addDays,
	format,
	isBefore,
	isSameDay,
	isValid,
	parseISO,
	startOfDay,
	startOfWeek,
} from "date-fns";
import { Box, Text } from "ink";

import type { Goal, Priority, Project, Task } from "../server/types";

export type ViewMode = "day" | "work-week" | "week";

export type DayColumn = {
	key: string;
	label: string;
	date: Date | null;
	tasks: Task[];
	isOverdue?: boolean;
};

export type ColumnTaskRow = {
	task: Task;
	depth: 0 | 1;
	parentTitle?: string;
};

export function buildColumnTaskRows(tasks: Task[]): ColumnTaskRow[] {
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

	const rows: ColumnTaskRow[] = [];
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

export function dateKey(date: Date): string {
	return format(date, "yyyy-MM-dd");
}

export function columnStartDate(anchorDate: Date, viewMode: ViewMode): Date {
	if (viewMode === "work-week") {
		return startOfWeek(anchorDate, { weekStartsOn: 1 });
	}
	return anchorDate;
}

export function daysToShow(viewMode: ViewMode): number {
	if (viewMode === "day") return 1;
	if (viewMode === "work-week") return 5;
	return 7;
}

export function buildColumns(
	tasks: Task[],
	anchorDate: Date,
	viewMode: ViewMode,
): DayColumn[] {
	const today = startOfDay(new Date());
	const colStart = columnStartDate(anchorDate, viewMode);
	const count = daysToShow(viewMode);

	const overdueTasks = tasks.filter(
		(t) => t.dueAt && parseISO(t.dueAt) < colStart,
	);

	const cols: DayColumn[] = [];

	if (overdueTasks.length > 0) {
		cols.push({
			key: "overdue",
			label: "Overdue",
			date: null,
			tasks: overdueTasks,
			isOverdue: true,
		});
	}

	for (let i = 0; i < count; i++) {
		const day = addDays(colStart, i);
		const key = dateKey(day);
		const dayTasks = tasks.filter((t) => {
			if (!t.dueAt) return false;
			return dateKey(parseISO(t.dueAt)) === key;
		});
		cols.push({
			key,
			label: formatDayHeader(day, today),
			date: day,
			tasks: dayTasks,
		});
	}

	return cols;
}

function formatDayHeader(date: Date, today: Date): string {
	const dayMonth = format(date, "d MMM");
	if (isSameDay(date, today)) return `${dayMonth} · Today`;
	if (isSameDay(date, addDays(today, 1))) return `${dayMonth} · Tomorrow`;
	return `${dayMonth} · ${format(date, "EEE")}`;
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

type TaskCardProps = {
	row: ColumnTaskRow;
	project: Project | undefined;
	isSelected: boolean;
	focused: boolean;
};

const TaskCard = ({ row, project, isSelected, focused }: TaskCardProps) => {
	const task = row.task;
	const isCompleted = task.status === "completed";
	const isOverdue = task.dueAt ? isOverdueDueDate(task.dueAt) : false;
	const circle = isCompleted ? "✓" : "○";
	const pColor = priorityColor(task.priority);
	const titleColor =
		isSelected && focused ? "cyan" : isSelected ? "blueBright" : undefined;
	const hasRecurrence = task.recurrencePreset || task.recurrenceRRule;

	return (
		<Box flexDirection="column" marginBottom={0} paddingLeft={row.depth === 1 ? 2 : 0}>
			<Box>
				<Box width={2}>
					<Text color={isSelected && focused ? "cyan" : undefined}>
						{isSelected ? "❯" : " "}
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
						wrap="truncate"
					>
						{task.title}
					</Text>
					{task.parentTaskId !== null && row.parentTitle && (
						<Text dimColor>  subtask of {row.parentTitle}</Text>
					)}
				</Box>
			</Box>
				<Box paddingLeft={2} justifyContent="space-between">
					<Text dimColor wrap="truncate">
						{hasRecurrence ? "↻ " : ""}
						{project
							? project.isInbox
								? `⬚ ${project.name}`
								: `# ${project.name}`
							: ""}
						{task.notes
							? project || hasRecurrence
								? `  ${task.notes}`
								: task.notes
							: ""}
					</Text>
          {task.dueAt && (
					<Box marginLeft={1}>
						<Text
							color={isOverdue && !isCompleted ? "red" : undefined}
							dimColor={!isOverdue || isCompleted}
						>
							{formatDueDate(task.dueAt)}
						</Text>
					</Box>
				)}
				</Box>
		</Box>
	);
};

type GoalsSectionProps = {
	goals: Goal[];
	viewMode: ViewMode;
};

const GoalsSection = ({ goals, viewMode }: GoalsSectionProps) => {
	const label = viewMode === "day" ? "Daily goals" : "Weekly goals";
	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="gray"
			paddingX={1}
			marginBottom={1}
		>
			<Text bold color="magentaBright">
				{label}
			</Text>
			{goals.length === 0 ? (
				<Text dimColor>No goals yet. Press g to add a goal.</Text>
			) : (
				goals.map((goal) => (
					<Box key={goal.id}>
						<Text color={goal.done ? "green" : "gray"}>
							{goal.done ? "[✓] " : "[ ] "}
						</Text>
						<Text dimColor={goal.done} strikethrough={goal.done}>
							{goal.title}
						</Text>
					</Box>
				))
			)}
		</Box>
	);
};

type DayColumnViewProps = {
	col: DayColumn;
	projectMap: Record<number, Project>;
	selectedTaskIndex: number;
	isSelectedColumn: boolean;
	focused: boolean;
	columnWidth: number;
	selectedColumnWidth: number;
};

const DayColumnView = ({
	col,
	projectMap,
	selectedTaskIndex,
	isSelectedColumn,
	focused,
	columnWidth,
	selectedColumnWidth,
}: DayColumnViewProps) => {
	const headerColor = col.isOverdue ? "red" : "yellow";
	const borderColor = isSelectedColumn && focused ? "magentaBright" : "gray";
	const rows = buildColumnTaskRows(col.tasks);

	return (
		<Box
			flexDirection="column"
			width={isSelectedColumn ? selectedColumnWidth : columnWidth}
			borderStyle="round"
			borderColor={borderColor}
			paddingX={1}
		>
			<Box marginBottom={1}>
				<Text bold color={headerColor}>
					{col.label}
				</Text>
				<Text dimColor> {rows.length}</Text>
			</Box>
			{rows.length === 0 ? (
				<Text dimColor>No tasks</Text>
			) : (
				rows.map((row, taskIdx) => (
					<TaskCard
						key={row.task.id}
						row={row}
						project={projectMap[row.task.projectId]}
						isSelected={isSelectedColumn && taskIdx === selectedTaskIndex}
						focused={focused}
					/>
				))
			)}
		</Box>
	);
};

type UpcomingPanelProps = {
	columns: DayColumn[];
	goals: Goal[];
	projectMap: Record<number, Project>;
	viewMode: ViewMode;
	anchorDate: Date;
	focused: boolean;
	selectedColumnIndex: number;
	selectedTaskIndex: number;
	terminalWidth: number;
};

export const UpcomingPanel = ({
	columns,
	goals,
	projectMap,
	viewMode,
	anchorDate,
	focused,
	selectedColumnIndex,
	selectedTaskIndex,
	terminalWidth,
}: UpcomingPanelProps) => {
	const borderColor = focused ? "magentaBright" : "gray";

	const viewModeLabel =
		viewMode === "day"
			? "Day"
			: viewMode === "work-week"
				? "Work Week"
				: "Week";
	const dateLabel = format(anchorDate, "d MMM yyyy");

	const selectedColumnMultiplier = viewMode === "day" ? 1 : 1.5;
	const widthUnits =
		columns.length > 0
			? columns.length + (selectedColumnMultiplier - 1)
			: 1;
	const availableWidth = Math.max(terminalWidth - 2, 40);
	const minColumnWidth = viewMode === "day" ? 20 : 10;
	const columnWidth = Math.max(
		Math.floor(availableWidth / widthUnits),
		minColumnWidth,
	);
	const selectedColumnWidth = columnWidth * selectedColumnMultiplier;

	return (
		<Box
			flexDirection="column"
			flexGrow={1}
			borderStyle="round"
			borderColor={borderColor}
			paddingX={1}
		>
			{/* Header bar */}
			<Box marginBottom={1} justifyContent="space-between">
				<Text bold color="magentaBright">
					Upcoming
				</Text>
				<Text dimColor>
					{viewModeLabel} · {dateLabel} · v mode · t today · g goal
				</Text>
			</Box>

			{/* Goals section */}
			<GoalsSection goals={goals} viewMode={viewMode} />

			{/* Day columns */}
			{columns.length === 0 ? (
				<Text dimColor>No tasks</Text>
			) : (
				<Box flexDirection="row" flexWrap="nowrap">
					{columns.map((col, colIdx) => (
						<DayColumnView
							key={col.key}
							col={col}
							projectMap={projectMap}
							selectedTaskIndex={selectedTaskIndex}
							isSelectedColumn={colIdx === selectedColumnIndex}
							focused={focused}
							columnWidth={columnWidth}
							selectedColumnWidth={selectedColumnWidth}
						/>
					))}
				</Box>
			)}

			{/* Footer hint */}
			<Box marginTop={1}>
				<Text dimColor>
					{focused
						? "h/l: column · j/k: task · x: complete"
						: "Tab to focus"}
				</Text>
			</Box>
		</Box>
	);
};
