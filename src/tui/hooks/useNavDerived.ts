import { useEffect, useMemo } from "react";

import type { AppSettings, Project, Task } from "../../server/types";
import { buildSettingsRows } from "../SettingsPanel";
import type { SettingsRow } from "../SettingsPanel";
import type { ColumnTaskRow, DayColumn, ViewMode } from "../UpcomingPanel";
import { buildColumnTaskRows, buildColumns } from "../UpcomingPanel";
import type { TaskRow } from "../task-row-utils";
import { buildTaskRows } from "../task-row-utils";
import type { View } from "./useNavigation";

type NavState = {
	view: View;
	activeProjectId: number | null;
	taskIndex: number;
	setTaskIndex: React.Dispatch<React.SetStateAction<number>>;
	columnIndex: number;
	settingsIndex: number;
	setSettingsIndex: React.Dispatch<React.SetStateAction<number>>;
	expandedTaskId: number | null;
	setExpandedTaskId: (id: number | null) => void;
	viewMode: ViewMode;
	anchorDate: Date;
};

type UseNavDerivedParams = {
	nav: NavState;
	tasks: Task[];
	projects: Project[];
	settings: AppSettings | null;
};

type UseNavDerivedResult = {
	taskRows: TaskRow[];
	expandableTaskIds: Set<number>;
	columns: DayColumn[];
	currentColumnRows: ColumnTaskRow[];
	selectedTask: Task | null;
	viewLabel: string;
	activeProject: Project | null;
	projectMap: Record<number, Project>;
	settingsRows: SettingsRow[];
	selectedSettingsRow: SettingsRow | null;
};

export function useNavDerived({
	nav,
	tasks,
	projects,
	settings,
}: UseNavDerivedParams): UseNavDerivedResult {
	const projectMap = useMemo(() => {
		const map: Record<number, Project> = {};
		for (const p of projects) map[p.id] = p;
		return map;
	}, [projects]);

	const columns = useMemo<DayColumn[]>(() => {
		if (nav.view !== "upcoming") return [];
		return buildColumns(tasks, nav.anchorDate, nav.viewMode);
	}, [nav.view, tasks, nav.anchorDate, nav.viewMode]);

	const taskRows = useMemo(() => buildTaskRows(tasks), [tasks]);

	const expandableTaskIds = useMemo(() => {
		const ids = new Set<number>();
		for (const row of taskRows) {
			if (row.depth === 1 && row.task.parentTaskId !== null) {
				ids.add(row.task.parentTaskId);
			}
		}
		return ids;
	}, [taskRows]);

	const currentColumnRows = useMemo(
		() => buildColumnTaskRows(columns[nav.columnIndex]?.tasks ?? []),
		[columns, nav.columnIndex],
	);

	const selectedTask = useMemo(() => {
		if (nav.view === "upcoming") {
			return currentColumnRows[nav.taskIndex]?.task ?? null;
		}
		return taskRows[nav.taskIndex]?.task ?? null;
	}, [nav.view, currentColumnRows, nav.taskIndex, taskRows]);

	const viewLabel = useMemo(() => {
		if (nav.view === "project") {
			const proj = projects.find((p) => p.id === nav.activeProjectId);
			if (!proj) return "Project";
			return proj.emoji ? `${proj.emoji} ${proj.name}` : proj.name;
		}
		return nav.view === "inbox"
			? "Inbox"
			: nav.view === "today"
				? "Today"
				: nav.view === "upcoming"
					? "Upcoming"
					: "Completed";
	}, [nav.view, projects, nav.activeProjectId]);

	const activeProject = useMemo(
		() => projects.find((p) => p.id === nav.activeProjectId) ?? null,
		[projects, nav.activeProjectId],
	);

	const settingsRows = useMemo(() => buildSettingsRows(settings), [settings]);
	const selectedSettingsRow = settingsRows[nav.settingsIndex] ?? settingsRows[0] ?? null;

	// Clamp taskIndex when task list changes
	useEffect(() => {
		nav.setTaskIndex((current) => {
			if (nav.view === "upcoming") {
				if (currentColumnRows.length === 0) return 0;
				return Math.min(current, currentColumnRows.length - 1);
			}
			if (taskRows.length === 0) return 0;
			return Math.min(current, taskRows.length - 1);
		});
	}, [nav.view, currentColumnRows.length, taskRows.length]);

	// Clear expandedTaskId when task is no longer expandable
	useEffect(() => {
		if (
			nav.expandedTaskId !== null &&
			!expandableTaskIds.has(nav.expandedTaskId)
		) {
			nav.setExpandedTaskId(null);
		}
	}, [nav.expandedTaskId, expandableTaskIds]);

	// Clamp settingsIndex when settings rows change
	useEffect(() => {
		nav.setSettingsIndex((current) => {
			if (settingsRows.length === 0) return 0;
			return Math.min(current, settingsRows.length - 1);
		});
	}, [settingsRows.length]);

	return {
		taskRows,
		expandableTaskIds,
		columns,
		currentColumnRows,
		selectedTask,
		viewLabel,
		activeProject,
		projectMap,
		settingsRows,
		selectedSettingsRow,
	};
}
