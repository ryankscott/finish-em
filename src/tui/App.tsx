import { startOfWeek } from "date-fns";
import { Box, useStdout } from "ink";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Reminder } from "../server/types";
import type { ApiClient } from "./api-client";
import { CalendarPicker } from "./CalendarPicker";
import { Dashboard } from "./Dashboard";
import { EnumPicker, type EnumPickerItem } from "./EnumPicker";
import { HelpModal } from "./HelpModal";
import { InputBar } from "./InputBar";
import { LinkPicker } from "./LinkPicker";
import { ProjectEditPicker } from "./ProjectEditPicker";
import { SettingsPanel } from "./SettingsPanel";
import { buildSidebarItems, Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { TaskEditPicker } from "./TaskEditPicker";
import { TaskPanel } from "./TaskPanel";
import { ToastStack } from "./ToastStack";
import { dateKey, UpcomingPanel } from "./UpcomingPanel";
import { useAppData } from "./hooks/useAppData";
import { useCalendarPicker, initCalendarPicker } from "./hooks/useCalendarPicker";
import { useInputBar } from "./hooks/useInputBar";
import type { InputMode } from "./hooks/useInputBar";
import { useKeybindings } from "./hooks/useKeybindings";
import { useNavDerived } from "./hooks/useNavDerived";
import { useNavigation } from "./hooks/useNavigation";
import { useSubmitInput } from "./hooks/useSubmitInput";
import { useTaskActions } from "./hooks/useTaskActions";
import { useReminderBell } from "./hooks/useReminderBell";
import { useToasts } from "./hooks/useToasts";

const CALENDAR_PICKER_MODES: InputMode[] = [
	"calendarPickerDueDate",
	"calendarPickerScheduledDate",
	"calendarPickerProjectStartDate",
	"calendarPickerProjectEndDate",
];

export { shouldStartProjectEdit } from "./hooks/useMainKeys";
export { applyTextEdit } from "./apply-text-edit";

const SIDEBAR_WIDTH = 36;

type AppProps = {
	api: ApiClient;
	onQuit: () => void;
};

export const App = ({ api, onQuit }: AppProps) => {
	const { stdout } = useStdout();
	const terminalHeight = stdout?.rows ?? 24;
	const terminalWidth = stdout?.columns ?? 120;
	const contentPaneTerminalWidth = Math.max(terminalWidth - SIDEBAR_WIDTH, 40);

	const { visibleToasts, pushToast } = useToasts();
	useReminderBell(api, pushToast);
	const nav = useNavigation();
	const [reminders, setReminders] = useState<Reminder[]>([]);
	const [enumPickerItems, setEnumPickerItems] = useState<EnumPickerItem[]>([]);
	const [enumPickerTitle, setEnumPickerTitle] = useState("");

	const goalPeriodType = nav.viewMode === "day" ? ("daily" as const) : ("weekly" as const);
	const goalPeriodStart = useMemo(() => {
		if (nav.viewMode === "day") return dateKey(nav.anchorDate);
		return dateKey(startOfWeek(nav.anchorDate, { weekStartsOn: 1 }));
	}, [nav.viewMode, nav.anchorDate]);

	const data = useAppData({
		api,
		view: nav.view,
		activeProjectId: nav.activeProjectId,
		anchorDate: nav.anchorDate,
		viewMode: nav.viewMode,
		goalPeriodType,
		goalPeriodStart,
	});

	const navDerived = useNavDerived({
		nav,
		tasks: data.tasks,
		projects: data.projects,
		settings: data.settings,
	});

	// Load reminders whenever the selected task changes
	useEffect(() => {
		const load = async () => {
			if (!navDerived.selectedTask) {
				setReminders([]);
				return;
			}
			try {
				setReminders(await api.listTaskReminders(navDerived.selectedTask.id));
			} catch {
				setReminders([]);
			}
		};
		void load();
	}, [api, navDerived.selectedTask]);

	const inputBar = useInputBar({ projects: data.projects });

	const calendar = useCalendarPicker();

	const openCalendarPicker = useCallback(
		(calendarMode: InputMode, existingIsoDate?: string) => {
			const { cursorDate, visibleMonth } = initCalendarPicker(existingIsoDate);
			calendar.setCursorDate(cursorDate);
			calendar.setVisibleMonth(visibleMonth);
			inputBar.openInput(calendarMode);
		},
		[calendar, inputBar],
	);

	const selectedGoal = data.goals[nav.goalIndex] ?? null;

	const taskActions = useTaskActions({
		api,
		loadData: data.loadData,
		selectedTask: navDerived.selectedTask,
		activeProject: navDerived.activeProject,
		selectedGoal,
		pushToast,
		setLoading: data.setLoading,
		setErrorText: data.setErrorText,
		setStatusText: data.setStatusText,
		setView: nav.setView,
		setActiveProjectId: nav.setActiveProjectId,
		setReminders,
	});

	const { submitInput } = useSubmitInput({
		api,
		inputMode: inputBar.inputMode,
		inputValue: inputBar.inputValue,
		editingSettingField: inputBar.editingSettingField,
		selectedTask: navDerived.selectedTask,
		selectedGoal,
		activeProjectId: nav.activeProjectId,
		activeProject: navDerived.activeProject,
		projects: data.projects,
		goalPeriodType,
		goalPeriodStart,
		enumPickerTargetMode: inputBar.enumPickerTargetMode,
		pushToast,
		closeInput: inputBar.closeInput,
		loadData: data.loadData,
		setLoading: data.setLoading,
		setErrorText: data.setErrorText,
		setStatusText: data.setStatusText,
		setEditingSettingField: inputBar.setEditingSettingField,
	});

	const sidebarItems = useMemo(
		() => buildSidebarItems(data.projects),
		[data.projects],
	);

	const selectedReminder = reminders[0] ?? null;
	const selectedTaskHasSubtasks = navDerived.selectedTask
		? navDerived.expandableTaskIds.has(navDerived.selectedTask.id)
		: false;

	useKeybindings({
		isTextInputMode: inputBar.isTextInputMode,
		inputValueRef: inputBar.inputValueRef,
		inputCursorRef: inputBar.inputCursorRef,
		autocompleteNextValue: inputBar.inputAutocomplete?.nextValue ?? null,
		setInputValue: inputBar.setInputValue,
		setInputCursorOffset: inputBar.setInputCursorOffset,
		closeInput: inputBar.closeInput,
		submitInput,
		openCalendarPicker,
		calendarCursorDate: calendar.cursorDate,
		setCalendarCursorDate: calendar.setCursorDate,
		calendarVisibleMonth: calendar.visibleMonth,
		setCalendarVisibleMonth: calendar.setVisibleMonth,
		inputValue: inputBar.inputValue,
		showHelp: nav.showHelp,
		setShowHelp: nav.setShowHelp,
		inputMode: inputBar.inputMode,
		setInputMode: inputBar.openInput,
		linkPickerLinks: inputBar.linkPickerLinks,
		setLinkPickerLinks: inputBar.setLinkPickerLinks,
		linkPickerIndex: inputBar.linkPickerIndex,
		setLinkPickerIndex: inputBar.setLinkPickerIndex,
		pickerIndex: inputBar.pickerIndex,
		setPickerIndex: inputBar.setPickerIndex,
		enumPickerIndex: inputBar.enumPickerIndex,
		setEnumPickerIndex: inputBar.setEnumPickerIndex,
		enumPickerItems,
		setEnumPickerItems,
		enumPickerTitle,
		setEnumPickerTitle,
		enumPickerTargetMode: inputBar.enumPickerTargetMode,
		setEnumPickerTargetMode: inputBar.setEnumPickerTargetMode,
		view: nav.view,
		focusArea: nav.focusArea,
		setFocusArea: nav.setFocusArea,
		sidebarItems,
		sidebarIndex: nav.sidebarIndex,
		setSidebarIndex: nav.setSidebarIndex,
		applySidebarSelection: nav.applySidebarSelection,
		settingsRows: navDerived.settingsRows,
		setSettingsIndex: nav.setSettingsIndex,
		selectedSettingsRow: navDerived.selectedSettingsRow,
		setEditingSettingField: inputBar.setEditingSettingField,
		columns: navDerived.columns,
		setColumnIndex: nav.setColumnIndex,
		currentColumnRows: navDerived.currentColumnRows,
		taskRows: navDerived.taskRows,
		setTaskIndex: nav.setTaskIndex,
		goals: data.goals,
		goalIndex: nav.goalIndex,
		setGoalIndex: nav.setGoalIndex,
		viewMode: nav.viewMode,
		setViewMode: nav.setViewMode,
		setAnchorDate: nav.setAnchorDate,
		selectedTask: navDerived.selectedTask,
		selectedTaskHasSubtasks,
		expandedTaskId: nav.expandedTaskId,
		setExpandedTaskId: nav.setExpandedTaskId,
		activeProjectId: nav.activeProjectId,
		activeProject: navDerived.activeProject,
		projects: data.projects,
		projectMap: navDerived.projectMap,
		selectedReminder,
		setStatusText: data.setStatusText,
		loadData: data.loadData,
		toggleSelectedTask: taskActions.toggleSelectedTask,
		deleteSelectedTask: taskActions.deleteSelectedTask,
		undeleteSelectedTask: taskActions.undeleteSelectedTask,
		deleteActiveProject: taskActions.deleteActiveProject,
		deleteSelectedReminder: taskActions.deleteSelectedReminder,
		toggleSelectedGoal: taskActions.toggleSelectedGoal,
		deleteSelectedGoal: taskActions.deleteSelectedGoal,
		onQuit,
	});

	if (nav.showDashboard) {
		return (
			<Dashboard
				onDismiss={() => nav.setShowDashboard(false)}
				terminalWidth={stdout?.columns ?? 120}
				terminalHeight={terminalHeight}
			/>
		);
	}

	return (
		<Box flexDirection="column" height={terminalHeight}>
			<Box flexDirection="row" flexGrow={1}>
				<Sidebar
					items={sidebarItems}
					viewCounts={data.viewCounts}
					selectedIndex={nav.sidebarIndex}
					focused={nav.focusArea === "sidebar"}
					width={SIDEBAR_WIDTH}
				/>
				{nav.view === "settings" ? (
					<SettingsPanel
						settings={data.settings}
						rows={navDerived.settingsRows}
						selectedIndex={nav.settingsIndex}
						focused={nav.focusArea === "tasks"}
					/>
				) : nav.view === "upcoming" ? (
				<UpcomingPanel
					columns={navDerived.columns}
					goals={data.goals}
					projectMap={navDerived.projectMap}
					viewMode={nav.viewMode}
					anchorDate={nav.anchorDate}
					focused={nav.focusArea === "tasks" || nav.focusArea === "goals"}
					focusArea={nav.focusArea}
					selectedColumnIndex={nav.columnIndex}
					selectedTaskIndex={nav.taskIndex}
					selectedGoalIndex={nav.goalIndex}
					terminalWidth={contentPaneTerminalWidth}
				/>
				) : (
					<TaskPanel
						rows={navDerived.taskRows}
						projectMap={navDerived.projectMap}
						viewLabel={navDerived.viewLabel}
						focused={nav.focusArea === "tasks"}
						selectedIndex={nav.taskIndex}
						expandedTaskId={nav.expandedTaskId}
						expandableTaskIds={navDerived.expandableTaskIds}
						activeProject={nav.view === "project" ? navDerived.activeProject : null}
					/>
				)}
			</Box>

			{inputBar.isLinkPickerMode && inputBar.linkPickerLinks && (
				<LinkPicker
					links={inputBar.linkPickerLinks}
					selectedIndex={inputBar.linkPickerIndex}
				/>
			)}

			{inputBar.inputMode === "taskEditPicker" && (
				<TaskEditPicker selectedIndex={inputBar.pickerIndex} />
			)}

			{inputBar.inputMode === "projectEditPicker" && navDerived.activeProject && (
				<ProjectEditPicker
					selectedIndex={inputBar.pickerIndex}
					projectName={navDerived.activeProject.name}
				/>
			)}

			{inputBar.isEnumPickerMode && (
				<EnumPicker
					title={enumPickerTitle}
					items={enumPickerItems}
					selectedIndex={inputBar.enumPickerIndex}
				/>
			)}

			{CALENDAR_PICKER_MODES.includes(inputBar.inputMode) && (
				<CalendarPicker
					cursorDate={calendar.cursorDate}
					visibleMonth={calendar.visibleMonth}
				/>
			)}

			{inputBar.isBottomBarMode && (
				<InputBar
					inputMode={inputBar.inputMode}
					inputValue={inputBar.inputValue}
					inputCursorOffset={inputBar.inputCursorOffset}
					autocomplete={inputBar.inputAutocomplete}
				/>
			)}

			<StatusBar
				isInputMode={inputBar.isInputMode}
				statusText={data.loading ? "Loading..." : data.statusText}
				errorText={data.errorText}
				terminalWidth={terminalWidth}
			/>
			<ToastStack toasts={visibleToasts} />
			{nav.showHelp && (
				<HelpModal
					terminalWidth={stdout?.columns ?? 120}
					terminalHeight={terminalHeight}
				/>
			)}
		</Box>
	);
};
