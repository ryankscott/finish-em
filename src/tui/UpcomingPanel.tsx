import {
	addDays,
	format,
	isSameDay,
	parseISO,
	startOfDay,
	startOfWeek,
} from "date-fns";
import { Box, Text } from "ink";

import { toDisplayString } from "../lib/task-links";
import type { Goal, Project, Task } from "../server/types";
import { formatDueDate, isOverdueDueDate, priorityColor } from "./task-display-helpers";
import type { TaskRow } from "./task-row-utils";
import { buildTaskRows } from "./task-row-utils";

export type ViewMode = "day" | "work-week" | "week";

export type DayColumn = {
	key: string;
	label: string;
	date: Date | null;
	tasks: Task[];
	isOverdue?: boolean;
};

export type ColumnTaskRow = TaskRow;

export function buildColumnTaskRows(tasks: Task[]): ColumnTaskRow[] {
	return buildTaskRows(tasks);
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
						{toDisplayString(task.title)}
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
							? `  ${toDisplayString(task.notes)}`
							: toDisplayString(task.notes)
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
	selectedGoalIndex: number;
	focused: boolean;
};

const GoalsSection = ({ goals, viewMode, selectedGoalIndex, focused }: GoalsSectionProps) => {
	const label = viewMode === "day" ? "Daily goals" : "Weekly goals";
	const borderColor = focused ? "magentaBright" : "gray";
	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor={borderColor}
			paddingX={1}
			marginBottom={1}
		>
			<Box justifyContent="space-between">
				<Text bold color="magentaBright">
					{label}
				</Text>
				{focused && (
					<Text dimColor>j/k select · x toggle · e edit title · Del delete</Text>
				)}
			</Box>
			{goals.length === 0 ? (
				<Text dimColor>No goals yet. Press g to add a goal.</Text>
			) : (
				goals.map((goal, i) => {
					const isSelected = i === selectedGoalIndex;
					const showCursor = isSelected && focused;
					return (
						<Box key={goal.id}>
							<Box width={2}>
								<Text color={showCursor ? "cyan" : undefined}>
									{showCursor ? "❯" : " "}
								</Text>
							</Box>
							<Text color={goal.done ? "green" : "gray"}>
								{goal.done ? "[✓] " : "[ ] "}
							</Text>
							<Text
								color={showCursor ? "cyan" : undefined}
								bold={showCursor}
								dimColor={goal.done && !showCursor}
								strikethrough={goal.done}
							>
								{goal.title}
							</Text>
						</Box>
					);
				})
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
	focusArea: "tasks" | "goals" | "sidebar";
	selectedColumnIndex: number;
	selectedTaskIndex: number;
	selectedGoalIndex: number;
	terminalWidth: number;
};

export const UpcomingPanel = ({
	columns,
	goals,
	projectMap,
	viewMode,
	anchorDate,
	focused,
	focusArea,
	selectedColumnIndex,
	selectedTaskIndex,
	selectedGoalIndex,
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
			<Box marginBottom={1} justifyContent="space-between">
				<Text bold color="magentaBright">
					Upcoming
				</Text>
				<Text dimColor>
					{viewModeLabel} · {dateLabel} · v mode · t today · g goal
				</Text>
			</Box>

			<GoalsSection
				goals={goals}
				viewMode={viewMode}
				selectedGoalIndex={selectedGoalIndex}
				focused={focusArea === "goals"}
			/>

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

		<Box marginTop={1}>
			<Text dimColor>
				{focused && focusArea === "tasks"
					? "h/l: column · j/k: task · x: complete · Tab: goals"
					: focused && focusArea === "goals"
						? "Tab: tasks"
						: "Tab to focus"}
			</Text>
		</Box>
		</Box>
	);
};
