import { addDays, format, startOfDay } from "date-fns";
import { useInput } from "ink";
import { useEffectEvent } from "react";

import { openUrl } from "../../lib/open-url";
import { toDisplaySegments } from "../../lib/task-links";
import type { Goal, Project, Reminder, Task } from "../../server/types";
import type { EnumPickerItem } from "../EnumPicker";
import { getModalFields, type ModalMode } from "../modal-field-defs";
import { PROJECT_EDIT_FIELDS } from "../ProjectEditPicker";
import type { SettingsRow } from "../SettingsPanel";
import type { SidebarItem } from "../Sidebar";
import { getTaskActions } from "../TaskActionPicker";
import { TASK_EDIT_FIELDS } from "../TaskEditPicker";
import type { ColumnTaskRow, DayColumn, ViewMode } from "../UpcomingPanel";
import { moveCursorByDays, stepCalendarMonth } from "./useCalendarPicker";
import type { InputMode } from "./useInputBar";
import type { FocusArea, View } from "./useNavigation";

const CALENDAR_PICKER_MODES: InputMode[] = [
	"calendarPickerDueDate",
	"calendarPickerScheduledDate",
	"calendarPickerProjectStartDate",
	"calendarPickerProjectEndDate",
	"calendarPickerReminderDate",
];

const REMINDER_TIME_OPTIONS: { label: string; value: string }[] = [
	{ label: "7:00 AM", value: "07:00" },
	{ label: "8:00 AM", value: "08:00" },
	{ label: "9:00 AM", value: "09:00" },
	{ label: "10:00 AM", value: "10:00" },
	{ label: "11:00 AM", value: "11:00" },
	{ label: "12:00 PM", value: "12:00" },
	{ label: "1:00 PM", value: "13:00" },
	{ label: "2:00 PM", value: "14:00" },
	{ label: "3:00 PM", value: "15:00" },
	{ label: "4:00 PM", value: "16:00" },
	{ label: "5:00 PM", value: "17:00" },
	{ label: "6:00 PM", value: "18:00" },
	{ label: "7:00 PM", value: "19:00" },
	{ label: "8:00 PM", value: "20:00" },
	{ label: "9:00 PM", value: "21:00" },
];

function projectToModalValues(project: Project): Record<string, string> {
	return {
		name: project.name ?? "",
		emoji: project.emoji ?? "",
		description: project.description ?? "",
		startAt: project.startAt ? format(new Date(project.startAt), "yyyy-MM-dd") : "",
		endAt: project.endAt ? format(new Date(project.endAt), "yyyy-MM-dd") : "",
		jiraDiscovery: project.jiraDiscoveryUrl ?? "",
		jiraDiscoveryStatus: project.jiraDiscoveryStatus ?? "",
		jiraDelivery: project.jiraDeliveryUrl ?? "",
		jiraDeliveryStatus: project.jiraDeliveryStatus ?? "",
		confluenceUrl: project.confluenceUrl ?? "",
		jiraDocsUrl: project.jiraDocsUrl ?? "",
		jiraDocsStatus: project.jiraDocsStatus ?? "",
		jiraReleaseNoteUrl: project.jiraReleaseNoteUrl ?? "",
		jiraReleaseNoteStatus: project.jiraReleaseNoteStatus ?? "",
		teamsReleaseNoteUrl: project.teamsReleaseNoteUrl ?? "",
	};
}

export function taskToModalValues(task: Task): Record<string, string> {
	return {
		title: task.title ?? "",
		project: task.projectId != null ? String(task.projectId) : "",
		priority: task.priority != null ? String(task.priority) : "",
		dueAt: task.dueAt ? format(new Date(task.dueAt), "yyyy-MM-dd") : "",
		scheduledAt: task.scheduledAt ? format(new Date(task.scheduledAt), "yyyy-MM-dd") : "",
		recurrence: task.recurrencePreset ?? "",
		blockedReason: task.blockedReason ?? "",
		notes: task.notes ?? "",
	};
}

export function shouldStartProjectEdit(
	input: string,
	view: View,
	activeProjectId: number | null,
	focusArea: FocusArea,
): boolean {
	return (
		input === "e" &&
		view === "project" &&
		activeProjectId !== null &&
		focusArea === "sidebar"
	);
}

/** Outcome of the "/" sidebar toggle: next visibility and whether to move focus to tasks (when collapsing from sidebar). */
export function getSidebarToggleOutcome(
	sidebarVisible: boolean,
	focusArea: FocusArea,
): { nextVisible: boolean; moveFocusToTasks: boolean } {
	const nextVisible = !sidebarVisible;
	const moveFocusToTasks = nextVisible === false && focusArea === "sidebar";
	return { nextVisible, moveFocusToTasks };
}

/** Pure helper for e key: returns mode and initial value for text-only edit (task title or project name). Used by key handler and tests. */
export function getEKeyEditOutcome(
	view: View,
	focusArea: FocusArea,
	activeProjectId: number | null,
	activeProject: Project | null,
	selectedTask: Task | null,
): { mode: InputMode; initialValue: string } | null {
	if (
		shouldStartProjectEdit("e", view, activeProjectId, focusArea) &&
		activeProject
	) {
		return { mode: "editProjectName", initialValue: activeProject.name };
	}
	if (selectedTask) {
		return { mode: "editTask", initialValue: selectedTask.title };
	}
	return null;
}

type UseMainKeysParams = {
	isActive: boolean;
	showDashboard: boolean;
	setShowDashboard: (show: boolean) => void;
	showHelp: boolean;
	setShowHelp: (show: boolean) => void;
	inputMode: InputMode;
	setInputMode: (mode: InputMode) => void;
	linkPickerLinks: { url: string; displayLabel: string }[] | null;
	setLinkPickerLinks: (
		links: { url: string; displayLabel: string }[] | null,
	) => void;
	linkPickerIndex: number;
	setLinkPickerIndex: React.Dispatch<React.SetStateAction<number>>;
	pickerIndex: number;
	setPickerIndex: React.Dispatch<React.SetStateAction<number>>;
	enumPickerIndex: number;
	setEnumPickerIndex: React.Dispatch<React.SetStateAction<number>>;
	enumPickerItems: EnumPickerItem[];
	setEnumPickerItems: (items: EnumPickerItem[]) => void;
	enumPickerTitle: string;
	setEnumPickerTitle: (title: string) => void;
	enumPickerTargetMode: string | null;
	setEnumPickerTargetMode: (mode: string | null) => void;
	// Modal create state
	isModalMode: boolean;
	isModalTextActive: boolean;
	modalFieldIndex: number;
	setModalFieldIndex: React.Dispatch<React.SetStateAction<number>>;
	modalValuesRef: React.MutableRefObject<Record<string, string>>;
	setValidationError: (err: string | null) => void;
	closeInput: () => void;
	openModalWithValues: (mode: InputMode, values: Record<string, string>, taskId?: number) => void;
	openCalendarPicker: (
		calendarMode: InputMode,
		existingIsoDate?: string,
	) => void;
	calendarCursorDate: Date;
	setCalendarCursorDate: React.Dispatch<React.SetStateAction<Date>>;
	calendarVisibleMonth: Date;
	setCalendarVisibleMonth: React.Dispatch<React.SetStateAction<Date>>;
	view: View;
	focusArea: FocusArea;
	setFocusArea: React.Dispatch<React.SetStateAction<FocusArea>>;
	sidebarVisible: boolean;
	setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
	sidebarItems: SidebarItem[];
	sidebarIndex: number;
	setSidebarIndex: React.Dispatch<React.SetStateAction<number>>;
	applySidebarSelection: (item: SidebarItem) => void;
	settingsRows: SettingsRow[];
	setSettingsIndex: React.Dispatch<React.SetStateAction<number>>;
	selectedSettingsRow: SettingsRow | null;
	setEditingSettingField: (field: "timezone" | null) => void;
	onSyncToggle: () => void;
	columns: DayColumn[];
	setColumnIndex: React.Dispatch<React.SetStateAction<number>>;
	currentColumnRows: ColumnTaskRow[];
	taskRows: { task: Task }[];
	setTaskIndex: React.Dispatch<React.SetStateAction<number>>;
	allRemindersCount: number;
	goals: Goal[];
	goalIndex: number;
	setGoalIndex: React.Dispatch<React.SetStateAction<number>>;
	viewMode: ViewMode;
	setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
	setAnchorDate: React.Dispatch<React.SetStateAction<Date>>;
	selectedTask: Task | null;
	selectedTaskHasSubtasks: boolean;
	expandedTaskId: number | null;
	setExpandedTaskId: (id: number | null) => void;
	activeProjectId: number | null;
	activeProject: Project | null;
	projects: Project[];
	projectMap: Record<number, Project>;
	selectedReminder: Reminder | null;
	reminderPickerDateRef: React.MutableRefObject<string>;
	setStatusText: (text: string) => void;
	setInputValue: (value: string) => void;
	loadData: () => Promise<void>;
	toggleSelectedTask: () => Promise<void>;
	deleteSelectedTask: () => Promise<void>;
	undeleteSelectedTask: () => Promise<void>;
	deleteActiveProject: () => Promise<void>;
	deleteSelectedReminder: (reminder: Reminder) => Promise<void>;
	toggleSelectedGoal: () => Promise<void>;
	deleteSelectedGoal: () => Promise<void>;
	submitInput: (overrideValue?: string) => Promise<void>;
	onQuit: () => void;
};

export function useMainKeys({
	isActive,
	showDashboard,
	setShowDashboard,
	showHelp,
	setShowHelp,
	inputMode,
	setInputMode,
	linkPickerLinks,
	setLinkPickerLinks,
	linkPickerIndex,
	setLinkPickerIndex,
	pickerIndex,
	setPickerIndex,
	enumPickerIndex,
	setEnumPickerIndex,
	enumPickerItems,
	setEnumPickerItems,
	enumPickerTitle: _enumPickerTitle,
	setEnumPickerTitle,
	enumPickerTargetMode: _enumPickerTargetMode,
	setEnumPickerTargetMode,
	isModalMode,
	isModalTextActive,
	modalFieldIndex,
	setModalFieldIndex,
	modalValuesRef,
	setValidationError,
	closeInput,
	openModalWithValues,
	openCalendarPicker,
	calendarCursorDate,
	setCalendarCursorDate,
	calendarVisibleMonth,
	setCalendarVisibleMonth,
	view,
	focusArea,
	setFocusArea,
	sidebarVisible,
	setSidebarVisible,
	sidebarItems,
	sidebarIndex,
	setSidebarIndex,
	applySidebarSelection,
	settingsRows,
	setSettingsIndex,
	selectedSettingsRow,
	setEditingSettingField,
	onSyncToggle,
	columns,
	setColumnIndex,
	currentColumnRows,
	taskRows,
	setTaskIndex,
	allRemindersCount,
	goals,
	goalIndex,
	setGoalIndex,
	viewMode,
	setViewMode,
	setAnchorDate,
	selectedTask,
	selectedTaskHasSubtasks,
	expandedTaskId,
	setExpandedTaskId,
	activeProjectId,
	activeProject,
	projects,
	projectMap: _projectMap,
	selectedReminder,
	reminderPickerDateRef,
	setStatusText,
	setInputValue,
	loadData,
	toggleSelectedTask,
	deleteSelectedTask,
	undeleteSelectedTask,
	deleteActiveProject,
	deleteSelectedReminder,
	toggleSelectedGoal,
	deleteSelectedGoal,
	submitInput,
	onQuit,
}: UseMainKeysParams) {
	const PRIORITY_ITEMS: EnumPickerItem[] = [
		{ label: "P1 – Urgent", value: "1" },
		{ label: "P2 – High", value: "2" },
		{ label: "P3 – Normal", value: "3" },
		{ label: "P4 – Low", value: "4" },
	];

	const RECURRENCE_ITEMS: EnumPickerItem[] = [
		{ label: "None (clear)", value: "none" },
		{ label: "Daily", value: "daily" },
		{ label: "Every weekday", value: "every_weekday" },
		{ label: "Weekly", value: "weekly" },
		{ label: "Monthly", value: "monthly" },
		{ label: "Yearly", value: "yearly" },
	];

	const JIRA_STATUS_ITEMS: EnumPickerItem[] = [
		{ label: "Todo", value: "todo" },
		{ label: "In Progress", value: "in_progress" },
		{ label: "Done", value: "done" },
		{ label: "Clear", value: "" },
	];

	const INLINE_STATUS_KEYS = new Set([
		"jiraDiscoveryStatus",
		"jiraDeliveryStatus",
		"jiraDocsStatus",
		"jiraReleaseNoteStatus",
	]);
	const STATUS_CYCLE = ["", "todo", "in_progress", "done"];

	const openEnumPicker = (
		title: string,
		items: EnumPickerItem[],
		targetMode: string,
	) => {
		setEnumPickerTitle(title);
		setEnumPickerItems(items);
		setEnumPickerIndex(0);
		setEnumPickerTargetMode(targetMode);
		setInputMode("enumPicker");
	};

	const handleInput = useEffectEvent(
		(input: string, key: Parameters<Parameters<typeof useInput>[0]>[1]) => {
			if (showDashboard) {
				setShowDashboard(false);
				return;
			}

			if (showHelp) {
				if (key.escape || input === "?") setShowHelp(false);
				return;
			}

			// --- Create modal navigation ---
			if (isModalMode) {
				if (key.escape) {
					closeInput();
					return;
				}

				const modalMode = inputMode as ModalMode;
				const fields = getModalFields(modalMode);
				const fieldCount = fields.length;

				// In modal text mode: only Esc (above) and Enter/navigation are intercepted here;
				// character input is handled by useTextInputKeys.
				if (
					isModalTextActive &&
					!key.return &&
					!key.tab &&
					!key.upArrow &&
					!key.downArrow
				) {
					return;
				}

				const currentField = fields[modalFieldIndex];

				if (currentField && INLINE_STATUS_KEYS.has(currentField.key)) {
					if (key.rightArrow || input === "l") {
						const cur = modalValuesRef.current[currentField.key] ?? "";
						const idx = STATUS_CYCLE.indexOf(cur);
						const next = STATUS_CYCLE[(idx === -1 ? 0 : idx + 1) % STATUS_CYCLE.length];
						setModalValues((prev) => ({ ...prev, [currentField.key]: next }));
						return;
					}
					if (key.leftArrow || input === "h") {
						const cur = modalValuesRef.current[currentField.key] ?? "";
						const idx = STATUS_CYCLE.indexOf(cur);
						const safeIdx = idx === -1 ? 0 : idx;
						const prev = STATUS_CYCLE[(safeIdx - 1 + STATUS_CYCLE.length) % STATUS_CYCLE.length];
						setModalValues((prevVals) => ({ ...prevVals, [currentField.key]: prev }));
						return;
					}
				}

				if (input === "j" || key.downArrow || (key.tab && !key.shift)) {
					setModalFieldIndex((i) => (i + 1) % fieldCount);
					setValidationError(null);
					// Reset cursor to end of new field value
					return;
				}
				if (input === "k" || key.upArrow || (key.tab && key.shift)) {
					setModalFieldIndex((i) => (i - 1 + fieldCount) % fieldCount);
					setValidationError(null);
					return;
				}

				if (key.return) {
					if (!currentField) return;

					if (currentField.type === "submit") {
						void submitInput();
						return;
					}

					if (currentField.type === "enum") {
						if (currentField.key === "priority") {
							openEnumPicker(
								"Set priority:",
								PRIORITY_ITEMS,
								`modal:${modalMode}:priority`,
							);
						} else if (currentField.key === "recurrence") {
							openEnumPicker(
								"Set recurrence:",
								RECURRENCE_ITEMS,
								`modal:${modalMode}:recurrence`,
							);
						} else if (currentField.key === "project") {
							const projectItems: EnumPickerItem[] = projects.map((p) => ({
								label: p.emoji ? `${p.emoji} ${p.name}` : p.name,
								value: String(p.id),
							}));
							openEnumPicker(
								"Move to project:",
								projectItems,
								`modal:${modalMode}:project`,
							);
						} else if (INLINE_STATUS_KEYS.has(currentField.key)) {
							setModalFieldIndex((i) => (i + 1) % fieldCount);
							setValidationError(null);
						}
						return;
					}

					if (currentField.type === "text" || currentField.type === "date") {
						// Enter on a text/date field: advance to next field
						setModalFieldIndex((i) => (i + 1) % fieldCount);
						setValidationError(null);
						return;
					}
				}

				// E opens calendar picker from date fields
				if (input === "E" && currentField?.type === "date") {
					const dateCalendarModeMap: Record<string, InputMode> = {
						dueAt: "calendarPickerDueDate",
						scheduledAt: "calendarPickerScheduledDate",
						startAt: "calendarPickerProjectStartDate",
						endAt: "calendarPickerProjectEndDate",
					};
					const calendarMode = dateCalendarModeMap[currentField.key];
					if (calendarMode) {
						const existingValue =
							modalValuesRef.current[currentField.key] || undefined;
						setEnumPickerTargetMode(`modal:${modalMode}:${currentField.key}`);
						openCalendarPicker(calendarMode, existingValue);
					}
					return;
				}

				return;
			}

			// --- Task Action Picker navigation ---
			if (inputMode === "taskActionPicker") {
				if (key.escape) {
					setInputMode("none");
					setStatusText("Ready");
					return;
				}
				const actions = getTaskActions(selectedTask?.completedAt != null);
				if (input === "j" || key.downArrow) {
					setPickerIndex((i) => Math.min(i + 1, actions.length - 1));
					return;
				}
				if (input === "k" || key.upArrow) {
					setPickerIndex((i) => Math.max(i - 1, 0));
					return;
				}
				if (key.return) {
					const action = actions[pickerIndex];
					if (!action) return;
					setInputMode("none");
					if (action.key === "edit") {
						if (selectedTask) {
							openModalWithValues(
								"editTaskModal",
								taskToModalValues(selectedTask),
								selectedTask.id,
							);
						}
					} else if (action.key === "toggle") {
						void toggleSelectedTask();
					} else if (action.key === "delete") {
						void deleteSelectedTask();
					}
					return;
				}
				return;
			}

			// --- Task Edit Picker navigation ---
			if (inputMode === "taskEditPicker") {
				if (key.escape) {
					setInputMode("none");
					setStatusText("Ready");
					return;
				}
				if (input === "j" || key.downArrow) {
					setPickerIndex((i) => Math.min(i + 1, TASK_EDIT_FIELDS.length - 1));
					return;
				}
				if (input === "k" || key.upArrow) {
					setPickerIndex((i) => Math.max(i - 1, 0));
					return;
				}
				if (key.return) {
					const field = TASK_EDIT_FIELDS[pickerIndex];
					if (!field) return;
					if (field.key === "due") {
						setInputMode("editDueDate");
						setInputValue(
							selectedTask?.dueAt ? selectedTask.dueAt.slice(0, 10) : "",
						);
					} else if (field.key === "scheduled") {
						setInputMode("editScheduledDate");
						setInputValue(
							selectedTask?.scheduledAt
								? selectedTask.scheduledAt.slice(0, 10)
								: "",
						);
					} else if (field.key === "reminder") {
						openCalendarPicker("calendarPickerReminderDate");
					} else if (field.key === "blocked") {
						setInputMode("editBlockedReason");
						setInputValue(selectedTask?.blockedReason ?? "");
					} else if (field.key === "notes") {
						setInputMode("editNotes");
						setInputValue(selectedTask?.notes ?? "");
					} else if (field.key === "priority") {
						openEnumPicker("Set priority:", PRIORITY_ITEMS, "editPriority");
					} else if (field.key === "recurrence") {
						openEnumPicker(
							"Set recurrence:",
							RECURRENCE_ITEMS,
							"editRecurrence",
						);
					} else if (field.key === "project") {
						const projectItems: EnumPickerItem[] = projects.map((p) => ({
							label: p.emoji ? `${p.emoji} ${p.name}` : p.name,
							value: String(p.id),
						}));
						openEnumPicker("Move to project:", projectItems, "editMoveProject");
					}
					return;
				}
				return;
			}

			// --- Project Edit Picker navigation ---
			if (inputMode === "projectEditPicker") {
				if (key.escape) {
					setInputMode("none");
					setStatusText("Ready");
					return;
				}
				if (input === "j" || key.downArrow) {
					setPickerIndex((i) =>
						Math.min(i + 1, PROJECT_EDIT_FIELDS.length - 1),
					);
					return;
				}
				if (input === "k" || key.upArrow) {
					setPickerIndex((i) => Math.max(i - 1, 0));
					return;
				}
				if (key.return) {
					const field = PROJECT_EDIT_FIELDS[pickerIndex];
					if (!field) return;
					let initialValue = "";
					if (activeProject) {
						if (field.key === "name") initialValue = activeProject.name;
						else if (field.key === "emoji")
							initialValue = activeProject.emoji ?? "";
						else if (field.key === "description")
							initialValue = activeProject.description ?? "";
						else if (field.key === "startDate")
							initialValue = activeProject.startAt?.slice(0, 10) ?? "";
						else if (field.key === "endDate")
							initialValue = activeProject.endAt?.slice(0, 10) ?? "";
						else if (field.key === "jiraDiscovery")
							initialValue = activeProject.jiraDiscoveryUrl ?? "";
						else if (field.key === "jiraDelivery")
							initialValue = activeProject.jiraDeliveryUrl ?? "";
						else if (field.key === "confluence")
							initialValue = activeProject.confluenceUrl ?? "";
						else if (field.key === "jiraDocs")
							initialValue = activeProject.jiraDocsUrl ?? "";
						else if (field.key === "jiraReleaseNote")
							initialValue = activeProject.jiraReleaseNoteUrl ?? "";
						else if (field.key === "teamsReleaseNote")
							initialValue = activeProject.teamsReleaseNoteUrl ?? "";
					}
					if (field.key === "jiraDiscoveryStatus") {
						setInputMode("editProjectJiraDiscoveryStatus");
						setInputValue(activeProject?.jiraDiscoveryStatus ?? "");
						return;
					}
					if (field.key === "jiraDeliveryStatus") {
						setInputMode("editProjectJiraDeliveryStatus");
						setInputValue(activeProject?.jiraDeliveryStatus ?? "");
						return;
					}
					if (field.key === "jiraDocsStatus") {
						setInputMode("editProjectJiraDocsStatus");
						setInputValue(activeProject?.jiraDocsStatus ?? "");
						return;
					}
					if (field.key === "jiraReleaseNoteStatus") {
						setInputMode("editProjectJiraReleaseNoteStatus");
						setInputValue(activeProject?.jiraReleaseNoteStatus ?? "");
						return;
					}
					const modeMap: Record<string, InputMode> = {
						name: "editProjectName",
						emoji: "editProjectEmoji",
						description: "editProjectDescription",
						startDate: "editProjectStartDate",
						endDate: "editProjectEndDate",
						jiraDiscovery: "editProjectJiraDiscovery",
						jiraDelivery: "editProjectJiraDelivery",
						confluence: "editProjectConfluence",
						jiraDocs: "editProjectJiraDocs",
						jiraReleaseNote: "editProjectJiraReleaseNote",
						teamsReleaseNote: "editProjectTeamsReleaseNote",
					};
					const mode = modeMap[field.key];
					if (mode) {
						setInputMode(mode);
						setInputValue(initialValue);
					}
					return;
				}
				return;
			}

			// --- Enum Picker navigation ---
			if (
				inputMode === "enumPicker" ||
				inputMode === "editRecurrence" ||
				inputMode === "editPriority" ||
				inputMode === "editMoveProject"
			) {
				if (key.escape) {
					setInputMode("none");
					setStatusText("Ready");
					return;
				}
				if (input === "j" || key.downArrow) {
					setEnumPickerIndex((i) =>
						Math.min(i + 1, enumPickerItems.length - 1),
					);
					return;
				}
				if (input === "k" || key.upArrow) {
					setEnumPickerIndex((i) => Math.max(i - 1, 0));
					return;
				}
				if (key.return) {
					const chosenValue = enumPickerItems[enumPickerIndex]?.value ?? "";
					setInputValue(chosenValue);
					// Pass chosenValue so submit runs with it immediately (state update is async).
					void submitInput(chosenValue);
					return;
				}
				return;
			}

			// --- Calendar Picker navigation ---
			if (CALENDAR_PICKER_MODES.includes(inputMode)) {
				if (key.escape) {
					setInputMode("none");
					setStatusText("Ready");
					return;
				}
				if (input === "c") {
					setInputValue("clear");
					void submitInput("clear");
					return;
				}
				if (key.return) {
					const dateStr = format(calendarCursorDate, "yyyy-MM-dd");
					if (inputMode === "calendarPickerReminderDate") {
						reminderPickerDateRef.current = dateStr;
						setEnumPickerTitle("Set reminder time:");
						setEnumPickerItems(REMINDER_TIME_OPTIONS);
						setEnumPickerIndex(0);
						setEnumPickerTargetMode("createReminder");
						setInputMode("enumPicker");
						return;
					}
					setInputValue(dateStr);
					void submitInput(dateStr);
					return;
				}
				// Arrow keys / hjkl: move by day
				if (input === "h" || key.leftArrow) {
					const { cursorDate, visibleMonth } = moveCursorByDays(
						calendarCursorDate,
						-1,
					);
					setCalendarCursorDate(cursorDate);
					setCalendarVisibleMonth(visibleMonth);
					return;
				}
				if (input === "l" || key.rightArrow) {
					const { cursorDate, visibleMonth } = moveCursorByDays(
						calendarCursorDate,
						1,
					);
					setCalendarCursorDate(cursorDate);
					setCalendarVisibleMonth(visibleMonth);
					return;
				}
				if (input === "k" || key.upArrow) {
					const { cursorDate, visibleMonth } = moveCursorByDays(
						calendarCursorDate,
						-7,
					);
					setCalendarCursorDate(cursorDate);
					setCalendarVisibleMonth(visibleMonth);
					return;
				}
				if (input === "j" || key.downArrow) {
					const { cursorDate, visibleMonth } = moveCursorByDays(
						calendarCursorDate,
						7,
					);
					setCalendarCursorDate(cursorDate);
					setCalendarVisibleMonth(visibleMonth);
					return;
				}
				// [ / ] step month
				if (input === "[") {
					const { cursorDate, visibleMonth } = stepCalendarMonth(
						calendarCursorDate,
						calendarVisibleMonth,
						-1,
					);
					setCalendarCursorDate(cursorDate);
					setCalendarVisibleMonth(visibleMonth);
					return;
				}
				if (input === "]") {
					const { cursorDate, visibleMonth } = stepCalendarMonth(
						calendarCursorDate,
						calendarVisibleMonth,
						1,
					);
					setCalendarCursorDate(cursorDate);
					setCalendarVisibleMonth(visibleMonth);
					return;
				}
				return;
			}

			if (inputMode === "linkPicker") {
				if (key.escape) {
					setInputMode("none");
					setLinkPickerLinks(null);
					setStatusText("Ready");
					return;
				}
				const links = linkPickerLinks ?? [];
				if (key.return && links.length > 0) {
					const chosen = links[linkPickerIndex];
					if (chosen) {
						openUrl(chosen.url);
						setStatusText("Opened link");
					}
					setInputMode("none");
					setLinkPickerLinks(null);
					return;
				}
				if (input === "j" || key.downArrow) {
					setLinkPickerIndex((i) => {
						const next = (i + 1) % links.length;
						setStatusText(
							`Open link (${next + 1}/${links.length}): ${links[next].displayLabel}  j/k  Enter=open Esc=cancel`,
						);
						return next;
					});
					return;
				}
				if (input === "k" || key.upArrow) {
					setLinkPickerIndex((i) => {
						const next = (i - 1 + links.length) % links.length;
						setStatusText(
							`Open link (${next + 1}/${links.length}): ${links[next].displayLabel}  j/k  Enter=open Esc=cancel`,
						);
						return next;
					});
					return;
				}
				const num = Number(input);
				if (input.length === 1 && num >= 1 && num <= links.length) {
					const idx = num - 1;
					setLinkPickerIndex(idx);
					setStatusText(
						`Open link (${num}/${links.length}): ${links[idx].displayLabel}  j/k  Enter=open Esc=cancel`,
					);
					return;
				}
				return;
			}

			if (input === "?") {
				setShowHelp(true);
				return;
			}

			if (input === "q") {
				onQuit();
				return;
			}

			if (key.tab) {
				const cycle: FocusArea[] =
					view === "upcoming"
						? ["sidebar", "tasks", "goals"]
						: ["sidebar", "tasks"];
				setFocusArea((current) => {
					const currentIndex = cycle.indexOf(current);
					const nextIndex = (currentIndex + 1) % cycle.length;
					return cycle[nextIndex] ?? "sidebar";
				});
				return;
			}

			if (input === "r") {
				void loadData();
				return;
			}

			if (input === "/") {
				setInputMode("globalSearch");
				setInputValue("");
				setTaskIndex(0);
				return;
			}

			if (input === "\\") {
				const outcome = getSidebarToggleOutcome(sidebarVisible, focusArea);
				setSidebarVisible(outcome.nextVisible);
				if (outcome.moveFocusToTasks) setFocusArea("tasks");
				return;
			}

			if (focusArea === "sidebar") {
				if (input === "j" || key.downArrow) {
					setSidebarIndex((c) =>
						Math.min(c + 1, Math.max(sidebarItems.length - 1, 0)),
					);
					return;
				}
				if (input === "k" || key.upArrow) {
					setSidebarIndex((c) => Math.max(c - 1, 0));
					return;
				}
				if (key.return) {
					const item = sidebarItems[sidebarIndex];
					if (item) applySidebarSelection(item);
					return;
				}
			}

			if (focusArea === "goals") {
				if (input === "j" || key.downArrow) {
					setGoalIndex((i) => Math.min(i + 1, Math.max(goals.length - 1, 0)));
					return;
				}
				if (input === "k" || key.upArrow) {
					setGoalIndex((i) => Math.max(i - 1, 0));
					return;
				}
				if (input === "x") {
					void toggleSelectedGoal();
					return;
				}
				if (key.delete || key.backspace) {
					void deleteSelectedGoal();
					return;
				}
				if (input === "e") {
					const selectedGoal = goals[goalIndex];
					if (!selectedGoal) return;
					setInputMode("editGoalTitle");
					setInputValue(selectedGoal.title);
					return;
				}
			}

			if (focusArea === "tasks") {
				if (view === "settings") {
					if (input === "j" || key.downArrow) {
						setSettingsIndex((current) =>
							Math.min(current + 1, Math.max(settingsRows.length - 1, 0)),
						);
						return;
					}
					if (input === "k" || key.upArrow) {
						setSettingsIndex((current) => Math.max(current - 1, 0));
						return;
					}
					if (input === "e" || key.return) {
						if (!selectedSettingsRow) return;
						if (selectedSettingsRow.field === "syncEnabled") {
							onSyncToggle();
							return;
						}
						setEditingSettingField(selectedSettingsRow.field);
						setInputMode("editSetting");
						setInputValue(selectedSettingsRow.value);
						return;
					}
				}

				if (view === "upcoming") {
					if (input === "h" || key.leftArrow) {
						setColumnIndex((c) => Math.max(c - 1, 0));
						setTaskIndex(0);
						return;
					}
					if (input === "l" || key.rightArrow) {
						setColumnIndex((c) =>
							Math.min(c + 1, Math.max(columns.length - 1, 0)),
						);
						setTaskIndex(0);
						return;
					}
					if (input === "j" || key.downArrow) {
						setTaskIndex((c) =>
							Math.min(c + 1, Math.max(currentColumnRows.length - 1, 0)),
						);
						return;
					}
					if (input === "k" || key.upArrow) {
						setTaskIndex((c) => Math.max(c - 1, 0));
						return;
					}
				} else {
					const listLength = view === "reminders" ? allRemindersCount : taskRows.length;
					if (input === "j" || key.downArrow) {
						setTaskIndex((c) =>
							Math.min(c + 1, Math.max(listLength - 1, 0)),
						);
						return;
					}
					if (input === "k" || key.upArrow) {
						setTaskIndex((c) => Math.max(c - 1, 0));
						return;
					}
				}

				if (key.return && selectedTask && view !== "settings" && view !== "reminders") {
					setInputMode("taskActionPicker");
					setPickerIndex(0);
					return;
				}
			}

			// Upcoming-specific global shortcuts
			if (view === "upcoming") {
				if (input === "[") {
					const step = viewMode === "day" ? 1 : 7;
					setAnchorDate((d) => addDays(d, -step));
					setColumnIndex(0);
					setTaskIndex(0);
					return;
				}
				if (input === "]") {
					const step = viewMode === "day" ? 1 : 7;
					setAnchorDate((d) => addDays(d, step));
					setColumnIndex(0);
					setTaskIndex(0);
					return;
				}
				if (input === "t") {
					setAnchorDate(startOfDay(new Date()));
					setColumnIndex(0);
					setTaskIndex(0);
					return;
				}
				if (input === "v") {
					setViewMode((m) =>
						m === "day" ? "work-week" : m === "work-week" ? "week" : "day",
					);
					setColumnIndex(0);
					setTaskIndex(0);
					return;
				}
				if (input === "g") {
					setInputMode("addGoal");
					setInputValue("");
					return;
				}
			}

			if (input === "x") {
				void toggleSelectedTask();
				return;
			}

			if (input === "a") {
				setInputMode("quickAdd");
				setInputValue("");
				return;
			}

			if (input === "A") {
				setInputMode("createTaskModal");
				setInputValue("");
				return;
			}

			if (input === "c") {
				if (!selectedTask) {
					setStatusText("No task selected");
					return;
				}
				setInputMode("editNotes");
				setInputValue(selectedTask.notes ?? "");
				return;
			}

			if (input === "s") {
				if (!selectedTask) {
					setStatusText("No task selected");
					return;
				}
				setInputMode("createSubtask");
				setInputValue("");
				return;
			}

			if (input === "p") {
				setInputMode("createProject");
				setInputValue("");
				return;
			}

			if (input === "P") {
				setInputMode("createProjectModal");
				setInputValue("");
				return;
			}

			if (input === "n") {
				if (!selectedTask) {
					setStatusText("No task selected");
					return;
				}
				openCalendarPicker("calendarPickerReminderDate");
				return;
			}

			if (input === "E") {
				if (activeProject && (focusArea === "sidebar" || (view === "project" && !selectedTask))) {
					openModalWithValues("editProjectModal", projectToModalValues(activeProject));
					return;
				}
				if (!selectedTask) return;
				setInputMode("taskEditPicker");
				setPickerIndex(0);
				return;
			}

			if (input === "e") {
				const outcome = getEKeyEditOutcome(
					view,
					focusArea,
					activeProjectId,
					activeProject,
					selectedTask,
				);
				if (!outcome) return;
				if (outcome.mode === "editProjectName" && !activeProject) {
					setStatusText("No project selected");
					return;
				}
				setInputMode(outcome.mode);
				setInputValue(outcome.initialValue);
				return;
			}

			if (input === " ") {
				if (!selectedTask) return;
				if (!selectedTaskHasSubtasks) return;
				setExpandedTaskId(
					expandedTaskId === selectedTask.id ? null : selectedTask.id,
				);
				return;
			}

			if (input === "D") {
				if (view === "project" && activeProject && !activeProject.isInbox && focusArea !== "sidebar") {
					void deleteActiveProject();
				}
				return;
			}

			if (input === "d") {
				if (!selectedTask) return;
				void deleteSelectedTask();
				return;
			}

			if (input === "u") {
				if (view !== "deleted") return;
				if (!selectedTask) return;
				void undeleteSelectedTask();
				return;
			}

			if (input === "o") {
				if (view === "project" && activeProject) {
					const projectLinks: { url: string; displayLabel: string }[] = [];
					if (activeProject.jiraDiscoveryUrl)
						projectLinks.push({
							url: activeProject.jiraDiscoveryUrl,
							displayLabel: "Jira Discovery",
						});
					if (activeProject.jiraDeliveryUrl)
						projectLinks.push({
							url: activeProject.jiraDeliveryUrl,
							displayLabel: "Jira Delivery",
						});
					if (activeProject.confluenceUrl)
						projectLinks.push({
							url: activeProject.confluenceUrl,
							displayLabel: "Confluence",
						});
					if (activeProject.jiraDocsUrl)
						projectLinks.push({
							url: activeProject.jiraDocsUrl,
							displayLabel: "Docs Jira",
						});
					if (activeProject.jiraReleaseNoteUrl)
						projectLinks.push({
							url: activeProject.jiraReleaseNoteUrl,
							displayLabel: "Release Note Jira",
						});
					if (activeProject.teamsReleaseNoteUrl)
						projectLinks.push({
							url: activeProject.teamsReleaseNoteUrl,
							displayLabel: "Teams Release Note",
						});
					if (projectLinks.length === 0) {
						setStatusText("No project links");
					} else if (projectLinks.length === 1) {
						openUrl(projectLinks[0].url);
						setStatusText("Opened link");
					} else {
						setLinkPickerLinks(projectLinks);
						setLinkPickerIndex(0);
						setInputMode("linkPicker");
						setStatusText(
							`Open link (1/${projectLinks.length}): ${projectLinks[0].displayLabel}  j/k  Enter=open Esc=cancel`,
						);
					}
					return;
				}
				if (!selectedTask) return;
				const titleSegments = toDisplaySegments(selectedTask.title);
				const notesSegments = toDisplaySegments(selectedTask.notes ?? "");
				const links: { url: string; displayLabel: string }[] = [];
				for (const s of [...titleSegments, ...notesSegments]) {
					if (s.type === "link")
						links.push({ url: s.url, displayLabel: s.displayLabel });
				}
				if (links.length === 0) {
					setStatusText("No link in task");
				} else if (links.length === 1) {
					openUrl(links[0].url);
					setStatusText("Opened link");
				} else {
					setLinkPickerLinks(links);
					setLinkPickerIndex(0);
					setInputMode("linkPicker");
					setStatusText(
						`Open link (1/${links.length}): ${links[0].displayLabel}  j/k  Enter=open Esc=cancel`,
					);
				}
				return;
			}

			if (input === "z") {
				if (!selectedReminder) return;
				void deleteSelectedReminder(selectedReminder);
				return;
			}
		},
	);

	useInput(
		(input, key) => {
			handleInput(input, key);
		},
		{ isActive },
	);
}
