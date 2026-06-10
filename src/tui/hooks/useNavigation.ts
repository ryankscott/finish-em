import { startOfDay } from "date-fns";
import { useCallback, useState } from "react";

import type { SidebarItem } from "../Sidebar";
import type { ViewMode } from "../UpcomingPanel";

export type View =
	| "inbox"
	| "today"
	| "blocked"
	| "overdue"
	| "upcoming"
	| "priority"
	| "completed"
	| "deleted"
	| "project"
	| "settings"
	| "reminders";

export type FocusArea = "sidebar" | "tasks" | "goals";

type UseNavigationResult = {
	view: View;
	setView: (view: View) => void;
	activeProjectId: number | null;
	setActiveProjectId: (id: number | null) => void;
	focusArea: FocusArea;
	setFocusArea: React.Dispatch<React.SetStateAction<FocusArea>>;
	taskIndex: number;
	setTaskIndex: React.Dispatch<React.SetStateAction<number>>;
	columnIndex: number;
	setColumnIndex: React.Dispatch<React.SetStateAction<number>>;
	goalIndex: number;
	setGoalIndex: React.Dispatch<React.SetStateAction<number>>;
	sidebarIndex: number;
	setSidebarIndex: React.Dispatch<React.SetStateAction<number>>;
	settingsIndex: number;
	setSettingsIndex: React.Dispatch<React.SetStateAction<number>>;
	expandedTaskId: number | null;
	setExpandedTaskId: (id: number | null) => void;
	showDashboard: boolean;
	setShowDashboard: (show: boolean) => void;
	showHelp: boolean;
	setShowHelp: (show: boolean) => void;
	viewMode: ViewMode;
	setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
	anchorDate: Date;
	setAnchorDate: React.Dispatch<React.SetStateAction<Date>>;
	applySidebarSelection: (item: SidebarItem) => void;
};

export function useNavigation(): UseNavigationResult {
	const [view, setView] = useState<View>("today");
	const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
	const [focusArea, setFocusArea] = useState<FocusArea>("sidebar");
	const [taskIndex, setTaskIndex] = useState(0);
	const [columnIndex, setColumnIndex] = useState(0);
	const [goalIndex, setGoalIndex] = useState(0);
	const [sidebarIndex, setSidebarIndex] = useState(0);
	const [settingsIndex, setSettingsIndex] = useState(0);
	const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
	const [showDashboard, setShowDashboard] = useState(true);
	const [showHelp, setShowHelp] = useState(false);
	const [viewMode, setViewMode] = useState<ViewMode>("work-week");
	const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));

	const applySidebarSelection = useCallback((item: SidebarItem) => {
		if (item.type === "nav") {
			setView(item.view);
			setActiveProjectId(null);
		} else {
			setView("project");
			setActiveProjectId(item.project.id);
		}
		setTaskIndex(0);
	}, []);

	return {
		view,
		setView,
		activeProjectId,
		setActiveProjectId,
		focusArea,
		setFocusArea,
		taskIndex,
		setTaskIndex,
		columnIndex,
		setColumnIndex,
		goalIndex,
		setGoalIndex,
		sidebarIndex,
		setSidebarIndex,
		settingsIndex,
		setSettingsIndex,
		expandedTaskId,
		setExpandedTaskId,
		showDashboard,
		setShowDashboard,
		showHelp,
		setShowHelp,
		viewMode,
		setViewMode,
		anchorDate,
		setAnchorDate,
		applySidebarSelection,
	};
}
