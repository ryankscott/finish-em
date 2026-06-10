import { Box, Text } from "ink";

import { getLinkDisplayLabel, toDisplayString } from "../lib/task-links";
import type { JiraTicketStatus, Project, Task } from "../server/types";
import {
	blockedIndicator,
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

function statusColor(status: JiraTicketStatus): string {
	if (status === "done") return "green";
	if (status === "in_progress") return "cyan";
	return "yellow";
}

function statusLabel(status: JiraTicketStatus): string {
	if (status === "done") return "Done";
	if (status === "in_progress") return "In Progress";
	return "Todo";
}

function shortUrl(url: string): string {
	return getLinkDisplayLabel(url, null);
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
	terminalWidth?: number;
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
	terminalWidth = 120,
}: TaskRowItemProps) => {
	const isSelected = flatIndex === selectedIndex;
	const isExpanded = hasSubtasks && expandedTaskId === task.id;
	const isCompleted = task.status === "completed";
	const isBlocked = task.blockedReason !== null;
	const isOverdue = task.dueAt ? isOverdueDueDate(task.dueAt) : false;
	const pColor = priorityColor(task.priority);
	const project = projectMap?.[task.projectId];
	const titleColor =
		isSelected && focused ? "cyan" : isSelected ? "blueBright" : undefined;
	const circle = isCompleted ? "✓" : "○";
	const recurrenceLabelText = `🔁 ${truncate(task.recurrencePreset ? recurrenceLabel(task.recurrencePreset) : "-", PROP_WIDTHS.recurrence - 3)}`;
	const scheduledLabel = `🗓 ${truncate(task.scheduledAt ? formatScheduledDate(task.scheduledAt) : "-", PROP_WIDTHS.scheduled - 3)}`;
	const dueLabel = `⏰ ${truncate(task.dueAt ? formatDueDate(task.dueAt) : "-", PROP_WIDTHS.due - 3)}`;
	const projectIcon = project?.emoji ?? (project?.isInbox ? "📥" : "●");
	const projectLabel = `${projectIcon} ${truncate(project ? project.name : "-", PROP_WIDTHS.project - 3)}`;

	// border(2) + paddingX*2(2) + expand(2) + circle(2) + blocked(2) + metadata+margin(27)
	const prefixCost = isSubtask ? 42 : 37;
	const titleWidth = Math.max(10, terminalWidth - prefixCost);
	const titleText = truncate(toDisplayString(task.title), titleWidth);

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
					<Text color={isCompleted ? undefined : pColor}>{circle}</Text>
				</Box>
				<Box width={2}>
					<Text color={isBlocked ? "yellow" : undefined}>
						{blockedIndicator(task.blockedReason)}
					</Text>
				</Box>
				<Box width={titleWidth}>
					<Text
						bold={isSelected && focused}
						color={titleColor}
						dimColor={isCompleted}
						strikethrough={isCompleted}
					>
						{titleText}
					</Text>
				</Box>
				<Box
					width={PROP_WIDTHS.due + PROP_WIDTHS.project + 3}
					marginLeft={1}
					gap={1}
				>
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
					<Text dimColor italic>
						{truncate(toDisplayString(task.notes), 80)}
					</Text>
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
					{task.blockedReason && (
						<Text color="yellow">Blocked: {task.blockedReason}</Text>
					)}
					{project && <Text dimColor>Project: {project.name}</Text>}
				</Box>
			)}
		</Box>
	);
};

export type TaskSection = {
	startIndex: number;
	label: string;
	color: string;
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
	terminalHeight?: number;
	terminalWidth?: number;
	overdueSplitIndex?: number;
	sections?: TaskSection[];
};

function rowLineHeight(
	row: TaskRow,
	expandedTaskId: number | null | undefined,
): number {
	if (expandedTaskId === row.task.id) {
		// title line + blank line before detail block + at least 1 detail line
		let h = 3;
		if (row.task.notes) h++;
		if (row.task.blockedReason) h++;
		return h;
	}
	return row.task.notes ? 2 : 1;
}

function computeScrollWindow(
	rows: TaskRow[],
	selectedIndex: number,
	expandedTaskId: number | null | undefined,
	availableHeight: number,
): { scrollOffset: number; endIndex: number } {
	if (rows.length === 0) return { scrollOffset: 0, endIndex: 0 };

	const heights = rows.map((r) => rowLineHeight(r, expandedTaskId));
	const cumulative: number[] = [0];
	for (const h of heights)
		cumulative.push(cumulative[cumulative.length - 1]! + h);

	const totalHeight = cumulative[rows.length]!;
	if (totalHeight <= availableHeight) {
		return { scrollOffset: 0, endIndex: rows.length };
	}

	// Ideal: center the selected row in the available window
	const selTop = cumulative[selectedIndex]!;
	const selHeight = heights[selectedIndex] ?? 1;
	const idealWindowTop = selTop + selHeight / 2 - availableHeight / 2;

	// Find the row where cumulative height first exceeds idealWindowTop
	let scrollOffset = 0;
	for (let i = 0; i < rows.length; i++) {
		if (cumulative[i]! >= idealWindowTop) {
			scrollOffset = i;
			break;
		}
		scrollOffset = i;
	}
	scrollOffset = Math.max(0, scrollOffset);

	// Ensure selectedIndex is visible from scrollOffset
	if (selectedIndex < scrollOffset) scrollOffset = selectedIndex;

	// Find endIndex: render rows until we fill availableHeight
	let heightUsed = 0;
	let endIndex = scrollOffset;
	for (let i = scrollOffset; i < rows.length; i++) {
		const h = heights[i] ?? 1;
		if (heightUsed + h > availableHeight && endIndex > scrollOffset) break;
		heightUsed += h;
		endIndex = i + 1;
	}

	// If selectedIndex is beyond endIndex, push scrollOffset forward
	if (selectedIndex >= endIndex) {
		let consumed = 0;
		let newOffset = selectedIndex;
		for (let i = selectedIndex; i >= 0; i--) {
			consumed += heights[i] ?? 1;
			if (consumed > availableHeight) {
				newOffset = i + 1;
				break;
			}
			if (i === 0) newOffset = 0;
		}
		scrollOffset = newOffset;
		heightUsed = 0;
		endIndex = scrollOffset;
		for (let i = scrollOffset; i < rows.length; i++) {
			const h = heights[i] ?? 1;
			if (heightUsed + h > availableHeight && endIndex > scrollOffset) break;
			heightUsed += h;
			endIndex = i + 1;
		}
	}

	return { scrollOffset, endIndex };
}

export const TaskPanel = ({
	rows,
	viewLabel,
	focused,
	selectedIndex,
	expandedTaskId,
	expandableTaskIds,
	projectMap,
	activeProject,
	terminalHeight,
	terminalWidth,
	overdueSplitIndex,
	sections,
}: TaskPanelProps) => {
	const borderColor = focused ? "magentaBright" : "gray";
	const hasSplit =
		overdueSplitIndex != null &&
		overdueSplitIndex > 0 &&
		overdueSplitIndex < rows.length;
	const sectionIndexSet = sections
		? new Map(sections.map((s) => [s.startIndex, s]))
		: null;

	// Fixed overhead: border top+bottom (2) + view label + marginBottom (2) + status bar (1)
	let overhead = 5;
	if (activeProject) {
		overhead += 4; // description + start + end + separator
		const hasDiscovery = !!(
			activeProject.jiraDiscoveryUrl || activeProject.confluenceUrl
		);
		const hasDelivery = !!(
			activeProject.jiraDeliveryUrl ||
			activeProject.jiraDocsUrl ||
			activeProject.jiraReleaseNoteUrl ||
			activeProject.teamsReleaseNoteUrl
		);
		if (hasDiscovery) {
			overhead++; // "Discovery" header
			if (activeProject.jiraDiscoveryUrl) overhead++;
			if (activeProject.confluenceUrl) overhead++;
		}
		if (hasDelivery) {
			overhead++; // "Delivery" header
			if (activeProject.jiraDeliveryUrl) overhead++;
			if (activeProject.jiraDocsUrl) overhead++;
			if (activeProject.jiraReleaseNoteUrl) overhead++;
			if (activeProject.teamsReleaseNoteUrl) overhead++;
		}
	}
	// Each section header takes 2 lines (label + divider)
	if (hasSplit) overhead += 4;
	if (sections) overhead += sections.length * 2;
	const availableHeight = terminalHeight
		? Math.max(4, terminalHeight - overhead)
		: Infinity;

	const { scrollOffset, endIndex } =
		availableHeight === Infinity
			? { scrollOffset: 0, endIndex: rows.length }
			: computeScrollWindow(
					rows,
					selectedIndex,
					expandedTaskId,
					availableHeight,
				);

	const visibleRows = rows.slice(scrollOffset, endIndex);
	const rowsAbove = scrollOffset;
	const rowsBelow = rows.length - endIndex;

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
					{activeProject.description ? (
						<>
							<Text>{toDisplayString(activeProject.description)}</Text>
							<Text dimColor>{"─".repeat(24)}</Text>
						</>
					) : null}
					<Box flexDirection="row" gap={2}>
						<Text>
							<Text bold>Start</Text> {activeProject.startAt ?? "–"}
						</Text>
						<Text>
							<Text bold>End</Text> {activeProject.endAt ?? "–"}
						</Text>
					</Box>
					{(activeProject.jiraDiscoveryUrl ||
						activeProject.confluenceUrl ||
						activeProject.jiraDeliveryUrl ||
						activeProject.jiraDocsUrl ||
						activeProject.jiraReleaseNoteUrl ||
						activeProject.teamsReleaseNoteUrl) && (
						<Text dimColor>{"─".repeat(Math.max(terminalWidth - 36, 40))}</Text>
					)}
					{(activeProject.jiraDiscoveryUrl || activeProject.confluenceUrl) && (
						<>
							<Text dimColor>{"─".repeat(24)}</Text>
							<Text bold dimColor>
								Discovery
							</Text>
							{activeProject.jiraDiscoveryUrl && (
								<Text>
									{"  "}
									<Text bold>Jira </Text>
									<Text color="cyan">
										[{shortUrl(activeProject.jiraDiscoveryUrl)}]
									</Text>
									{activeProject.jiraDiscoveryStatus ? (
										<Text>
											{" "}
											<Text
												color={statusColor(activeProject.jiraDiscoveryStatus)}
											>
												{statusLabel(activeProject.jiraDiscoveryStatus)}
											</Text>
										</Text>
									) : null}
								</Text>
							)}
							{activeProject.confluenceUrl && (
								<Text>
									{"  "}
									<Text bold>PRD </Text>
									<Text color="cyan">
										[{shortUrl(activeProject.confluenceUrl)}]
									</Text>
								</Text>
							)}
						</>
					)}
					{(activeProject.jiraDeliveryUrl ||
						activeProject.jiraDocsUrl ||
						activeProject.jiraReleaseNoteUrl ||
						activeProject.teamsReleaseNoteUrl) && (
						<>
							<Text dimColor>{"─".repeat(24)}</Text>
							<Text bold dimColor>
								Delivery
							</Text>
							{activeProject.jiraDeliveryUrl && (
								<Text>
									{"  "}
									<Text bold>Epic </Text>
									<Text color="cyan">
										[{shortUrl(activeProject.jiraDeliveryUrl)}]
									</Text>
									{activeProject.jiraDeliveryStatus ? (
										<Text>
											{" "}
											<Text
												color={statusColor(activeProject.jiraDeliveryStatus)}
											>
												{statusLabel(activeProject.jiraDeliveryStatus)}
											</Text>
										</Text>
									) : null}
								</Text>
							)}
							{activeProject.jiraDocsUrl && (
								<Text>
									{"  "}
									<Text bold>Docs </Text>
									<Text color="cyan">
										[{shortUrl(activeProject.jiraDocsUrl)}]
									</Text>
									{activeProject.jiraDocsStatus ? (
										<Text>
											{" "}
											<Text color={statusColor(activeProject.jiraDocsStatus)}>
												{statusLabel(activeProject.jiraDocsStatus)}
											</Text>
										</Text>
									) : null}
								</Text>
							)}
							{activeProject.jiraReleaseNoteUrl && (
								<Text>
									{"  "}
									<Text bold>Release</Text>{" "}
									<Text color="cyan">
										[{shortUrl(activeProject.jiraReleaseNoteUrl)}]
									</Text>
									{activeProject.jiraReleaseNoteStatus ? (
										<Text>
											{" "}
											<Text
												color={statusColor(activeProject.jiraReleaseNoteStatus)}
											>
												{statusLabel(activeProject.jiraReleaseNoteStatus)}
											</Text>
										</Text>
									) : null}
								</Text>
							)}
							{activeProject.teamsReleaseNoteUrl && (
								<Text>
									{"  "}
									<Text bold>Teams </Text>
									<Text color="cyan">
										[{shortUrl(activeProject.teamsReleaseNoteUrl)}]
									</Text>
								</Text>
							)}
						</>
					)}
					<Text dimColor>{"─".repeat(24)}</Text>
				</Box>
			)}

			{rowsAbove > 0 && <Text dimColor>↑ {rowsAbove} above</Text>}

			{rows.length === 0 ? (
				<Text dimColor>No tasks</Text>
			) : (
				<>
					{hasSplit && (
						<Box flexDirection="column" marginBottom={1}>
							<Text bold color="red">
								Overdue
							</Text>
							<Text dimColor>{"─".repeat(24)}</Text>
						</Box>
					)}
					{visibleRows.map((row, localIndex) => {
						const absoluteIndex = scrollOffset + localIndex;
						const isTodaySectionStart =
							hasSplit && absoluteIndex === overdueSplitIndex;
						const sectionHeader = sectionIndexSet?.get(absoluteIndex);
						return (
							<Box key={row.task.id} flexDirection="column">
								{isTodaySectionStart && (
									<Box flexDirection="column" marginTop={1} marginBottom={1}>
										<Text bold color="magentaBright">
											Today
										</Text>
										<Text dimColor>{"─".repeat(24)}</Text>
									</Box>
								)}
								{sectionHeader && (
									<Box
										flexDirection="column"
										marginTop={absoluteIndex === 0 ? 0 : 1}
										marginBottom={1}
									>
										<Text
											bold
											color={
												sectionHeader.color as Parameters<
													typeof Text
												>[0]["color"]
											}
										>
											{sectionHeader.label}
										</Text>
										<Text dimColor>{"─".repeat(24)}</Text>
									</Box>
								)}
								<TaskRowItem
									task={row.task}
									flatIndex={absoluteIndex}
									selectedIndex={selectedIndex}
									focused={focused}
									expandedTaskId={expandedTaskId}
									hasSubtasks={expandableTaskIds?.has(row.task.id)}
									projectMap={projectMap}
									isSubtask={row.depth === 1}
									isLastSubtask={
										row.depth === 1 &&
										(absoluteIndex === rows.length - 1 ||
											rows[absoluteIndex + 1]?.depth !== 1)
									}
									terminalWidth={terminalWidth}
								/>
							</Box>
						);
					})}
				</>
			)}

			{rowsBelow > 0 && <Text dimColor>↓ {rowsBelow} below</Text>}
		</Box>
	);
};
