import { startOfWeek } from "date-fns";
import { Box, useStdout } from "ink";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSyncService } from "../server/sync/sync-service";
import type { Reminder } from "../server/types";
import type { ApiClient } from "./api-client";
import { CalendarPicker } from "./CalendarPicker";
import { CreateProjectModal } from "./CreateProjectModal";
import { CreateTaskModal } from "./CreateTaskModal";
import { Dashboard } from "./Dashboard";
import { EnumPicker, type EnumPickerItem } from "./EnumPicker";
import { HelpModal } from "./HelpModal";
import { useAppData } from "./hooks/useAppData";
import {
	initCalendarPicker,
	useCalendarPicker,
} from "./hooks/useCalendarPicker";
import type { InputMode } from "./hooks/useInputBar";
import { useInputBar } from "./hooks/useInputBar";
import { useKeybindings } from "./hooks/useKeybindings";
import { useNavDerived } from "./hooks/useNavDerived";
import { useNavigation } from "./hooks/useNavigation";
import { useReminderBell } from "./hooks/useReminderBell";
import { useSubmitInput } from "./hooks/useSubmitInput";
import { useTaskActions } from "./hooks/useTaskActions";
import { useToasts } from "./hooks/useToasts";
import { useUndo } from "./hooks/useUndo";
import { InputBar } from "./InputBar";
import { LinkPicker } from "./LinkPicker";
import { ProjectEditPicker } from "./ProjectEditPicker";
import { RemindersPanel } from "./RemindersPanel";
import { SettingsPanel } from "./SettingsPanel";
import { buildSidebarItems, Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { TaskActionPicker } from "./TaskActionPicker";
import { TaskEditPicker } from "./TaskEditPicker";
import { buildTaskPanelRows, TaskPanel } from "./TaskPanel";
import { dateKey, UpcomingPanel } from "./UpcomingPanel";

const CALENDAR_PICKER_MODES: InputMode[] = [
	"calendarPickerDueDate",
	"calendarPickerScheduledDate",
	"calendarPickerProjectStartDate",
	"calendarPickerProjectEndDate",
	"calendarPickerReminderDate",
];

export { applyTextEdit } from "./apply-text-edit";
export { shouldStartProjectEdit } from "./hooks/useMainKeys";

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
	const [syncEnabled, setSyncEnabled] = useState(() =>
		getSyncService().isEnabled(),
	);
	const [syncState, setSyncState] = useState<{
		syncing: boolean;
		lastSyncAt: string | null;
		error: string | null;
	}>({
		syncing: false,
		lastSyncAt: getSyncService().getStatus().lastSyncAt,
		error: null,
	});

	useEffect(() => {
		const svc = getSyncService();
		// Always start the timer so inbox import runs even when sync is disabled
		svc.startAutoSync();
		const unsub = svc.on((result) => {
			if (result instanceof Error) {
				setSyncState((s) => ({ ...s, syncing: false, error: result.message }));
			} else {
				setSyncState({
					syncing: false,
					lastSyncAt: new Date().toISOString(),
					error: null,
				});
				if (result.inboxImported > 0) {
					const n = result.inboxImported;
					pushToast(
						n === 1
							? "1 task imported from iPhone"
							: `${n} tasks imported from iPhone`,
						"success",
					);
				}
			}
		});
		if (svc.isEnabled()) {
			setSyncState((s) => ({ ...s, syncing: true }));
			svc
				.syncNow()
				.catch(() => {})
				.finally(() => {
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
			svc
				.syncNow()
				.catch(() => {})
				.finally(() => {
					setSyncState((s) => ({ ...s, syncing: false }));
				});
		}
		setSyncEnabled(svc.isEnabled());
	}, []);

	const goalPeriodType =
		nav.viewMode === "day" ? ("daily" as const) : ("weekly" as const);
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

	const inputBar = useInputBar({ projects: data.projects });

	// Global search: filter all open tasks by title
	const searchResults = useMemo(() => {
		if (inputBar.inputMode !== "globalSearch" || !inputBar.inputValue.trim())
			return [];
		const q = inputBar.inputValue.toLowerCase();
		return data.allTasks.filter((t) => t.title.toLowerCase().includes(q));
	}, [inputBar.inputMode, inputBar.inputValue, data.allTasks]);

	const isSearchMode = inputBar.inputMode === "globalSearch";
	const displayRows = isSearchMode
		? buildTaskPanelRows(searchResults)
		: navDerived.taskRows;
	const todayOverdueSplitIndex =
		!isSearchMode && nav.view === "today" ? data.viewCounts.overdue : undefined;
	const displayLabel = isSearchMode
		? `Search: ${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`
		: navDerived.viewLabel;
	const effectiveSelectedTask = isSearchMode
		? (searchResults[nav.taskIndex] ?? null)
		: navDerived.selectedTask;

	const prioritySections = useMemo(() => {
		if (isSearchMode || nav.view !== "priority") return undefined;
		const PRIORITY_META: Record<number, { label: string; color: string }> = {
			1: { label: "P1 · Urgent", color: "red" },
			2: { label: "P2 · High", color: "yellow" },
			3: { label: "P3 · Normal", color: "green" },
			4: { label: "P4 · Low", color: "blue" },
		};
		const result: { startIndex: number; label: string; color: string }[] = [];
		let lastPriority = -1;
		for (let i = 0; i < navDerived.taskRows.length; i++) {
			const row = navDerived.taskRows[i];
			if (!row) continue;
			if (row.depth === 0 && row.task.priority !== lastPriority) {
				const meta = PRIORITY_META[row.task.priority];
				if (meta) result.push({ startIndex: i, ...meta });
				lastPriority = row.task.priority;
			}
		}
		return result.length > 0 ? result : undefined;
	}, [isSearchMode, nav.view, navDerived.taskRows]);

	// Reset taskIndex when leaving search mode so it doesn't point out of bounds
	const prevInputModeRef = useRef(inputBar.inputMode);
	useEffect(() => {
		if (
			prevInputModeRef.current === "globalSearch" &&
			inputBar.inputMode !== "globalSearch"
		) {
			nav.setTaskIndex(0);
		}
		prevInputModeRef.current = inputBar.inputMode;
	}, [inputBar.inputMode, nav.setTaskIndex]);

	// Load reminders whenever the selected task changes
	useEffect(() => {
		const load = async () => {
			if (!effectiveSelectedTask) {
				setReminders([]);
				return;
			}
			try {
				setReminders(await api.listTaskReminders(effectiveSelectedTask.id));
			} catch {
				setReminders([]);
			}
		};
		void load();
	}, [api, effectiveSelectedTask]);

	const calendar = useCalendarPicker();
	const reminderPickerDateRef = useRef<string>("");

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

	const undo = useUndo({
		api,
		loadData: data.loadData,
		setStatusText: data.setStatusText,
		setErrorText: data.setErrorText,
	});

	const taskActions = useTaskActions({
		api,
		loadData: data.loadData,
		selectedTask: effectiveSelectedTask,
		activeProject: navDerived.activeProject,
		selectedGoal,
		pushToast,
		recordUndo: undo.recordUndo,
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
		selectedTask: effectiveSelectedTask,
		selectedGoal,
		activeProjectId: nav.activeProjectId,
		activeProject: navDerived.activeProject,
		projects: data.projects,
		goalPeriodType,
		goalPeriodStart,
		enumPickerTargetMode: inputBar.enumPickerTargetMode,
		pushToast,
		recordUndo: undo.recordUndo,
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
		reminderPickerDateRef,
	});

	const sidebarItems = useMemo(
		() => buildSidebarItems(data.projects),
		[data.projects],
	);

	const selectedReminder =
		nav.view === "reminders"
			? (data.allReminders[nav.taskIndex] ?? null)
			: (reminders[0] ?? null);
	const selectedTaskHasSubtasks = effectiveSelectedTask
		? navDerived.expandableTaskIds.has(effectiveSelectedTask.id)
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
		searchResultCount: searchResults.length,
		allRemindersCount: data.allReminders.length,
		selectedTask: effectiveSelectedTask,
		goals: data.goals,
		goalIndex: nav.goalIndex,
		setGoalIndex: nav.setGoalIndex,
		viewMode: nav.viewMode,
		setViewMode: nav.setViewMode,
		setAnchorDate: nav.setAnchorDate,
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
		toggleSelectedTaskSomeday: taskActions.toggleSelectedTaskSomeday,
		deleteSelectedTask: taskActions.deleteSelectedTask,
		undeleteSelectedTask: taskActions.undeleteSelectedTask,
		deleteActiveProject: taskActions.deleteActiveProject,
		deleteSelectedReminder: taskActions.deleteSelectedReminder,
		toggleSelectedGoal: taskActions.toggleSelectedGoal,
		deleteSelectedGoal: taskActions.deleteSelectedGoal,
		undoLast: undo.undoLast,
		reminderPickerDateRef,
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
				) : nav.view === "reminders" ? (
					<RemindersPanel
						reminders={data.allReminders}
						selectedIndex={nav.taskIndex}
						focused={nav.focusArea === "tasks"}
						terminalWidth={contentPaneTerminalWidth}
						terminalHeight={terminalHeight}
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
						rows={displayRows}
						projectMap={navDerived.projectMap}
						viewLabel={displayLabel}
						focused={nav.focusArea === "tasks"}
						selectedIndex={nav.taskIndex}
						expandedTaskId={isSearchMode ? null : nav.expandedTaskId}
						expandableTaskIds={
							isSearchMode ? undefined : navDerived.expandableTaskIds
						}
						activeProject={
							nav.view === "project" && !isSearchMode
								? navDerived.activeProject
								: null
						}
						terminalHeight={terminalHeight}
						overdueSplitIndex={todayOverdueSplitIndex}
						sections={prioritySections}
					/>
				)}
			</Box>

			{inputBar.isLinkPickerMode && inputBar.linkPickerLinks && (
				<LinkPicker
					links={inputBar.linkPickerLinks}
					selectedIndex={inputBar.linkPickerIndex}
				/>
			)}

			{inputBar.inputMode === "taskActionPicker" && (
				<TaskActionPicker
					selectedIndex={inputBar.pickerIndex}
					isCompleted={effectiveSelectedTask?.completedAt != null}
				/>
			)}

			{inputBar.inputMode === "taskEditPicker" && (
				<TaskEditPicker selectedIndex={inputBar.pickerIndex} />
			)}

			{inputBar.inputMode === "projectEditPicker" &&
				navDerived.activeProject && (
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
						data.projects.map((p) => [
							String(p.id),
							p.emoji ? `${p.emoji} ${p.name}` : p.name,
						]),
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
						data.projects.map((p) => [
							String(p.id),
							p.emoji ? `${p.emoji} ${p.name}` : p.name,
						]),
					)}
				/>
			)}
			{(inputBar.inputMode === "createProjectModal" ||
				inputBar.inputMode === "editProjectModal") && (
				<CreateProjectModal
					mode={inputBar.inputMode}
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
