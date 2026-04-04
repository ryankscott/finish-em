import {
	addDays,
	endOfDay,
	format,
	parseISO,
	startOfDay,
} from "date-fns";
import { useCallback, useEffect, useState } from "react";

export function isOverdueTask(task: { dueAt: string | null }, now: Date): boolean {
	return !!task.dueAt && parseISO(task.dueAt) < startOfDay(now);
}

import type {
	AppSettings,
	Goal,
	Project,
	Task,
} from "../../server/types";
import type { ApiClient } from "../api-client";
import { columnStartDate, daysToShow } from "../UpcomingPanel";
import type { ViewMode } from "../UpcomingPanel";
import type { View } from "./useNavigation";

const EMPTY_VIEW_COUNTS = {
	today: 0,
	blocked: 0,
	overdue: 0,
	inbox: 0,
	upcoming: 0,
	completed: 0,
	deleted: 0,
	projectCounts: {} as Record<number, number>,
};

export type ViewCounts = typeof EMPTY_VIEW_COUNTS;

type UseAppDataParams = {
	api: ApiClient;
	view: View;
	activeProjectId: number | null;
	anchorDate: Date;
	viewMode: ViewMode;
	goalPeriodType: "daily" | "weekly";
	goalPeriodStart: string;
};

type UseAppDataResult = {
	projects: Project[];
	tasks: Task[];
	goals: Goal[];
	settings: AppSettings | null;
	viewCounts: ViewCounts;
	loading: boolean;
	setLoading: (loading: boolean) => void;
	statusText: string;
	setStatusText: (text: string) => void;
	errorText: string | null;
	setErrorText: (text: string | null) => void;
	loadData: () => Promise<void>;
};

export function useAppData({
	api,
	view,
	activeProjectId,
	anchorDate,
	viewMode,
	goalPeriodType,
	goalPeriodStart,
}: UseAppDataParams): UseAppDataResult {
	const [projects, setProjects] = useState<Project[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [loading, setLoading] = useState(false);
	const [statusText, setStatusText] = useState("Ready");
	const [errorText, setErrorText] = useState<string | null>(null);
	const [viewCounts, setViewCounts] = useState<ViewCounts>(EMPTY_VIEW_COUNTS);

	const loadData = useCallback(async () => {
		setLoading(true);
		setErrorText(null);
		// Set title immediately so it updates before the async fetch completes
		if (view === "settings") setStatusText("Settings");
		else if (view === "inbox") setStatusText("Inbox");
		else if (view === "today") setStatusText("Today");
		else if (view === "blocked") setStatusText("Blocked");
		else if (view === "overdue") setStatusText("Overdue");
		else if (view === "upcoming") setStatusText("Upcoming");
		else if (view === "completed") setStatusText("Completed");
		else if (view === "deleted") setStatusText("Deleted");
		try {
			setSettings(await api.getSettings());
			const loadedProjects = await api.listProjects();
			setProjects(loadedProjects);
			const resolvedInbox = loadedProjects.find((project) => project.isInbox);

			const now = new Date();
			const todayStart = startOfDay(now).toISOString();
			const todayEnd = endOfDay(now).toISOString();
			const colStart = columnStartDate(anchorDate, viewMode);
			const rangeEnd = addDays(colStart, daysToShow(viewMode) - 1);
			const upcomingFrom = startOfDay(colStart).toISOString();
			const upcomingTo = endOfDay(rangeEnd).toISOString();

		const nonInboxProjects = loadedProjects.filter((p) => !p.isInbox);
		const [
			todayCountTasks,
			blockedTasks,
			upcomingRangeTasks,
			upcomingOverdueTasks,
			completedTasks,
			deletedTasks,
			inboxTasks,
			...projectTaskLists
		] = await Promise.all([
			api.listTasks({ status: "open", from: todayStart, to: todayEnd }),
			api.listTasks({ status: "open", blocked: true }),
			api.listTasks({ status: "open", from: upcomingFrom, to: upcomingTo }),
			api.listTasks({ status: "open", to: upcomingFrom }),
			api.listTasks({ status: "completed" }),
			api.listDeletedTasks(),
			resolvedInbox
				? api.listTasks({ projectId: resolvedInbox.id, status: "open" })
				: Promise.resolve([]),
			...nonInboxProjects.map((p) =>
				api.listTasks({ projectId: p.id, status: "open" }),
			),
		]);

		const overdueFilteredTasks = upcomingOverdueTasks.filter((t) =>
			isOverdueTask(t, now),
		);
		const projectCounts: Record<number, number> = Object.fromEntries(
			nonInboxProjects.map((p, i) => [p.id, projectTaskLists[i]?.length ?? 0]),
		);
		setViewCounts({
			today: todayCountTasks.length,
			blocked: blockedTasks.length,
			overdue: overdueFilteredTasks.length,
			inbox: inboxTasks.length,
			upcoming:
				upcomingRangeTasks.length +
				upcomingOverdueTasks.filter(
					(t) => t.dueAt && parseISO(t.dueAt) < startOfDay(colStart),
				).length,
			completed: completedTasks.length,
			deleted: deletedTasks.length,
			projectCounts,
		});

			if (view === "settings") {
				setTasks([]);
				setStatusText("Settings");
			} else if (view === "inbox") {
				if (!resolvedInbox) {
					setTasks([]);
					setStatusText("Inbox project not found");
					return;
				}
				setTasks(inboxTasks);
				setStatusText("Inbox");
			} else if (view === "today") {
				setTasks(todayCountTasks);
				setStatusText("Today");
			} else if (view === "blocked") {
				setTasks(blockedTasks);
				setStatusText("Blocked");
			} else if (view === "overdue") {
				setTasks(overdueFilteredTasks);
				setStatusText("Overdue");
			} else if (view === "upcoming") {
				const goalData = await api.listGoals({
					periodType: goalPeriodType,
					periodStart: goalPeriodStart,
				});
				const overdueFiltered = upcomingOverdueTasks.filter(
					(t) => t.dueAt && parseISO(t.dueAt) < startOfDay(colStart),
				);
				setTasks([...overdueFiltered, ...upcomingRangeTasks]);
				setGoals(goalData);
				setStatusText(
					`Upcoming · ${format(colStart, "d MMM")} – ${format(rangeEnd, "d MMM")}`,
				);
			} else if (view === "project") {
				if (!activeProjectId) {
					setTasks([]);
					setStatusText("No project selected");
				} else {
					const proj = loadedProjects.find((p) => p.id === activeProjectId);
					setTasks(
						await api.listTasks({ status: "open", projectId: activeProjectId }),
					);
					setStatusText(proj?.name ?? "Project");
				}
		} else if (view === "deleted") {
			setTasks(deletedTasks);
			setStatusText("Deleted");
		} else {
			setTasks(completedTasks);
			setStatusText("Completed");
		}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
			setStatusText("Failed to load");
			setViewCounts(EMPTY_VIEW_COUNTS);
		} finally {
			setLoading(false);
		}
	}, [
		activeProjectId,
		api,
		view,
		anchorDate,
		viewMode,
		goalPeriodType,
		goalPeriodStart,
	]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	return {
		projects,
		tasks,
		goals,
		settings,
		viewCounts,
		loading,
		setLoading,
		statusText,
		setStatusText,
		errorText,
		setErrorText,
		loadData,
	};
}
