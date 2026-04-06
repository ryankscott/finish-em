import { startOfWeek } from "date-fns";
import { Box, useStdout } from "ink";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Reminder } from "../server/types";
import type { ApiClient } from "./api-client";
import { CalendarPicker } from "./CalendarPicker";
import { CreateProjectModal } from "./CreateProjectModal";
import { CreateTaskModal } from "./CreateTaskModal";
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
import { getSyncService } from "../server/sync/sync-service";

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
	const [sidebarVisible, setSidebarVisible] = useState(true);
	const contentPaneTerminalWidth = sidebarVisible
		? Math.max(terminalWidth - SIDEBAR_WIDTH, 40)
		: terminalWidth;

	const { visibleToasts, pushToast } = useToasts();
	useReminderBell(api, pushToast);
	const nav = useNavigation();
	const [reminders, setReminders] = useState<Reminder[]>([]);
	const [enumPickerItems, setEnumPickerItems] = useState<EnumPickerItem[]>([]);
	const [enumPickerTitle, setEnumPickerTitle] = useState("");
	const [syncEnabled, setSyncEnabled] = useState(() => getSyncService().isEnabled());
	const [syncState, setSyncState] = useState<{
		syncing: boolean;
		lastSyncAt: string | null;
		error: string | null;
	}>({ syncing: false, lastSyncAt: getSyncService().getStatus().lastSyncAt, error: null });

	useEffect(() => {
		const svc = getSyncService();
		// Always start the timer so inbox import runs even when sync is disabled
		svc.startAutoSync();
		const unsub = svc.on((result) => {
			if (result instanceof Error) {
				setSyncState((s) => ({ ...s, syncing: false, error: result.message }));
			} else {
				setSyncState({ syncing: false, lastSyncAt: new Date().toISOString(), error: null });
				if (result.inboxImported > 0) {
					const n = result.inboxImported;
					pushToast(
						n === 1 ? "1 task imported from iPhone" : `${n} tasks imported from iPhone`,
						"success",
					);
				}
			}
		});
		if (svc.isEnabled()) {
			setSyncState((s) => ({ ...s, syncing: true }));
			svc.syncNow().catch(() => {}).finally(() => {
				setSyncState((s) => ({ ...s, syncing: false }));
			});
		}
		return () => {
			unsub();
			svc.stopAutoSync();
		};
	}, [pushToast]);

	const onSyncToggle = useCallback(() => {
		const svc = getSyncService();
		if (svc.isEnabled()) {
			svc.disable();
			svc.startAutoSync(); // keep timer running for inbox polling
			setSyncState({ syncing: false, lastSyncAt: null, error: null });
		} else {
			svc.enable();
			setSyncState((s) => ({ ...s, syncing: true, error: null }));
			svc.syncNow().catch(() => {}).finally(() => {
				setSyncState((s) => ({ ...s, syncing: false }));
			});
		}
		setSyncEnabled(svc.isEnabled());
	}, []);

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
		syncEnabled,
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
		modalValues: inputBar.modalValues,
		setModalValues: inputBar.setModalValues,
		setModalFieldIndex: inputBar.setModalFieldIndex,
		setValidationError: inputBar.setValidationError,
		setInputMode: inputBar.openInput,
		editingTaskId: inputBar.editingTaskId,
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
		showDashboard: nav.showDashboard,
		setShowDashboard: nav.setShowDashboard,
		isTextInputMode: inputBar.isTextInputMode,
		inputValueRef: inputBar.inputValueRef,
		inputCursorRef: inputBar.inputCursorRef,
		autocompleteNextValue: inputBar.inputAutocomplete?.nextValue ?? null,
		setInputValue: inputBar.setInputValue,
		setInputCursorOffset: inputBar.setInputCursorOffset,
		closeInput: inputBar.closeInput,
		openModalWithValues: inputBar.openModalWithValues,
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
		isModalMode: inputBar.isModalMode,
		isModalTextActive: inputBar.isModalTextActive,
		modalFieldIndex: inputBar.modalFieldIndex,
		setModalFieldIndex: inputBar.setModalFieldIndex,
		modalValues: inputBar.modalValues,
		setModalValues: inputBar.setModalValues,
		modalValuesRef: inputBar.modalValuesRef,
		modalActiveFieldKeyRef: inputBar.modalActiveFieldKeyRef,
		setValidationError: inputBar.setValidationError,
		view: nav.view,
		focusArea: nav.focusArea,
		setFocusArea: nav.setFocusArea,
		sidebarVisible,
		setSidebarVisible,
		sidebarItems,
		sidebarIndex: nav.sidebarIndex,
		setSidebarIndex: nav.setSidebarIndex,
		applySidebarSelection: nav.applySidebarSelection,
		settingsRows: navDerived.settingsRows,
		setSettingsIndex: nav.setSettingsIndex,
		selectedSettingsRow: navDerived.selectedSettingsRow,
		setEditingSettingField: inputBar.setEditingSettingField,
		onSyncToggle,
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
				terminalWidth={stdout?.columns ?? 120}
				terminalHeight={terminalHeight}
			/>
		);
	}

	return (
		<Box flexDirection="column" height={terminalHeight}>
			<Box flexDirection="row" flexGrow={1}>
				{sidebarVisible && (
					<Sidebar
						items={sidebarItems}
						viewCounts={data.viewCounts}
						selectedIndex={nav.sidebarIndex}
						focused={nav.focusArea === "sidebar"}
						width={SIDEBAR_WIDTH}
					/>
				)}
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
				syncEnabled={syncEnabled}
				syncState={syncState}
				activeToast={visibleToasts[0] ?? null}
			/>
		{inputBar.inputMode === "createTaskModal" && (
			<CreateTaskModal
				activeFieldIndex={inputBar.modalFieldIndex}
				modalValues={inputBar.modalValues}
				inputCursorOffset={inputBar.inputCursorOffset}
				validationError={inputBar.validationError}
				projectLabels={Object.fromEntries(
					data.projects.map((p) => [String(p.id), p.emoji ? `${p.emoji} ${p.name}` : p.name]),
				)}
			/>
		)}
		{inputBar.inputMode === "editTaskModal" && (
			<CreateTaskModal
				mode="editTaskModal"
				activeFieldIndex={inputBar.modalFieldIndex}
				modalValues={inputBar.modalValues}
				inputCursorOffset={inputBar.inputCursorOffset}
				validationError={inputBar.validationError}
				projectLabels={Object.fromEntries(
					data.projects.map((p) => [String(p.id), p.emoji ? `${p.emoji} ${p.name}` : p.name]),
				)}
			/>
		)}
		{inputBar.inputMode === "createProjectModal" && (
			<CreateProjectModal
				activeFieldIndex={inputBar.modalFieldIndex}
				modalValues={inputBar.modalValues}
				inputCursorOffset={inputBar.inputCursorOffset}
				validationError={inputBar.validationError}
			/>
		)}
		{nav.showHelp && (
			<HelpModal
				terminalWidth={stdout?.columns ?? 120}
				terminalHeight={terminalHeight}
			/>
		)}
		</Box>
	);
};
