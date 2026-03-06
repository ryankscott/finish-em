import { addDays, format, startOfDay } from "date-fns";
import { useInput } from "ink";

import { openUrl } from "../../lib/open-url";
import { toDisplaySegments } from "../../lib/task-links";
import type { Goal, Project, Reminder, Task } from "../../server/types";
import type { EnumPickerItem } from "../EnumPicker";
import { TASK_EDIT_FIELDS } from "../TaskEditPicker";
import { PROJECT_EDIT_FIELDS } from "../ProjectEditPicker";
import type { InputMode } from "./useInputBar";
import { moveCursorByDays, stepCalendarMonth } from "./useCalendarPicker";
import type { FocusArea, View } from "./useNavigation";
import type { ColumnTaskRow, DayColumn, ViewMode } from "../UpcomingPanel";
import type { SettingsRow } from "../SettingsPanel";
import type { SidebarItem } from "../Sidebar";

const CALENDAR_PICKER_MODES: InputMode[] = [
	"calendarPickerDueDate",
	"calendarPickerScheduledDate",
	"calendarPickerProjectStartDate",
	"calendarPickerProjectEndDate",
];

export function shouldStartProjectEdit(
	input: string,
	view: View,
	activeProjectId: number | null,
	focusArea: FocusArea,
): boolean {
	return input === "e" && view === "project" && activeProjectId !== null && focusArea === "sidebar";
}

/** Pure helper for e key: returns mode and initial value for text-only edit (task title or project name). Used by key handler and tests. */
export function getEKeyEditOutcome(
	view: View,
	focusArea: FocusArea,
	activeProjectId: number | null,
	activeProject: Project | null,
	selectedTask: Task | null,
): { mode: InputMode; initialValue: string } | null {
	if (shouldStartProjectEdit("e", view, activeProjectId, focusArea) && activeProject) {
		return { mode: "editProjectName", initialValue: activeProject.name };
	}
	if (selectedTask) {
		return { mode: "editTask", initialValue: selectedTask.title };
	}
	return null;
}

type UseMainKeysParams = {
	isActive: boolean;
	showHelp: boolean;
	setShowHelp: (show: boolean) => void;
	inputMode: InputMode;
	setInputMode: (mode: InputMode) => void;
	linkPickerLinks: { url: string; displayLabel: string }[] | null;
	setLinkPickerLinks: (links: { url: string; displayLabel: string }[] | null) => void;
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
	enumPickerTargetMode: InputMode | null;
	setEnumPickerTargetMode: (mode: InputMode | null) => void;
	calendarCursorDate: Date;
	setCalendarCursorDate: React.Dispatch<React.SetStateAction<Date>>;
	calendarVisibleMonth: Date;
	setCalendarVisibleMonth: React.Dispatch<React.SetStateAction<Date>>;
	view: View;
	focusArea: FocusArea;
	setFocusArea: React.Dispatch<React.SetStateAction<FocusArea>>;
	sidebarItems: SidebarItem[];
	sidebarIndex: number;
	setSidebarIndex: React.Dispatch<React.SetStateAction<number>>;
	applySidebarSelection: (item: SidebarItem) => void;
	settingsRows: SettingsRow[];
	setSettingsIndex: React.Dispatch<React.SetStateAction<number>>;
	selectedSettingsRow: SettingsRow | null;
	setEditingSettingField: (field: "timezone" | null) => void;
	columns: DayColumn[];
	setColumnIndex: React.Dispatch<React.SetStateAction<number>>;
	currentColumnRows: ColumnTaskRow[];
	taskRows: { task: Task }[];
	setTaskIndex: React.Dispatch<React.SetStateAction<number>>;
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
	calendarCursorDate,
	setCalendarCursorDate,
	calendarVisibleMonth,
	setCalendarVisibleMonth,
	view,
	focusArea,
	setFocusArea,
	sidebarItems,
	sidebarIndex,
	setSidebarIndex,
	applySidebarSelection,
	settingsRows,
	setSettingsIndex,
	selectedSettingsRow,
	setEditingSettingField,
	columns,
	setColumnIndex,
	currentColumnRows,
	taskRows,
	setTaskIndex,
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

	const openEnumPicker = (
		title: string,
		items: EnumPickerItem[],
		targetMode: InputMode,
	) => {
		setEnumPickerTitle(title);
		setEnumPickerItems(items);
		setEnumPickerIndex(0);
		setEnumPickerTargetMode(targetMode);
		setInputMode("enumPicker");
	};

	useInput(
		(input, key) => {
			if (showHelp) {
				if (key.escape || input === "?") setShowHelp(false);
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
						setInputValue(selectedTask?.dueAt ? selectedTask.dueAt.slice(0, 10) : "");
					} else if (field.key === "scheduled") {
						setInputMode("editScheduledDate");
						setInputValue(selectedTask?.scheduledAt ? selectedTask.scheduledAt.slice(0, 10) : "");
					} else if (field.key === "reminder") {
						setInputMode("editReminder");
						setInputValue("");
					} else if (field.key === "notes") {
						setInputMode("editNotes");
						setInputValue(selectedTask?.notes ?? "");
					} else if (field.key === "priority") {
						openEnumPicker("Set priority:", PRIORITY_ITEMS, "editPriority");
					} else if (field.key === "recurrence") {
						openEnumPicker("Set recurrence:", RECURRENCE_ITEMS, "editRecurrence");
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
					setPickerIndex((i) => Math.min(i + 1, PROJECT_EDIT_FIELDS.length - 1));
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
						else if (field.key === "emoji") initialValue = activeProject.emoji ?? "";
						else if (field.key === "description") initialValue = activeProject.description ?? "";
						else if (field.key === "startDate") initialValue = activeProject.startAt?.slice(0, 10) ?? "";
						else if (field.key === "endDate") initialValue = activeProject.endAt?.slice(0, 10) ?? "";
						else if (field.key === "jiraDiscovery") initialValue = activeProject.jiraDiscoveryUrl ?? "";
						else if (field.key === "jiraDelivery") initialValue = activeProject.jiraDeliveryUrl ?? "";
						else if (field.key === "confluence") initialValue = activeProject.confluenceUrl ?? "";
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
			if (inputMode === "enumPicker" || inputMode === "editRecurrence" || inputMode === "editPriority" || inputMode === "editMoveProject") {
				if (key.escape) {
					setInputMode("none");
					setStatusText("Ready");
					return;
				}
				if (input === "j" || key.downArrow) {
					setEnumPickerIndex((i) => Math.min(i + 1, enumPickerItems.length - 1));
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
				setInputValue(dateStr);
				void submitInput(dateStr);
				return;
			}
			// Arrow keys / hjkl: move by day
			if (input === "h" || key.leftArrow) {
				const { cursorDate, visibleMonth } = moveCursorByDays(calendarCursorDate, -1);
				setCalendarCursorDate(cursorDate);
				setCalendarVisibleMonth(visibleMonth);
				return;
			}
			if (input === "l" || key.rightArrow) {
				const { cursorDate, visibleMonth } = moveCursorByDays(calendarCursorDate, 1);
				setCalendarCursorDate(cursorDate);
				setCalendarVisibleMonth(visibleMonth);
				return;
			}
			if (input === "k" || key.upArrow) {
				const { cursorDate, visibleMonth } = moveCursorByDays(calendarCursorDate, -7);
				setCalendarCursorDate(cursorDate);
				setCalendarVisibleMonth(visibleMonth);
				return;
			}
			if (input === "j" || key.downArrow) {
				const { cursorDate, visibleMonth } = moveCursorByDays(calendarCursorDate, 7);
				setCalendarCursorDate(cursorDate);
				setCalendarVisibleMonth(visibleMonth);
				return;
			}
			// [ / ] step month
			if (input === "[") {
				const { cursorDate, visibleMonth } = stepCalendarMonth(calendarCursorDate, calendarVisibleMonth, -1);
				setCalendarCursorDate(cursorDate);
				setCalendarVisibleMonth(visibleMonth);
				return;
			}
			if (input === "]") {
				const { cursorDate, visibleMonth } = stepCalendarMonth(calendarCursorDate, calendarVisibleMonth, 1);
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
					view === "upcoming" ? ["sidebar", "tasks", "goals"] : ["sidebar", "tasks"];
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
					if (input === "j" || key.downArrow) {
						setTaskIndex((c) =>
							Math.min(c + 1, Math.max(taskRows.length - 1, 0)),
						);
						return;
					}
					if (input === "k" || key.upArrow) {
						setTaskIndex((c) => Math.max(c - 1, 0));
						return;
					}
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

			if (input === "n") {
				if (!selectedTask) {
					setStatusText("No task selected");
					return;
				}
				setInputMode("editReminder");
				setInputValue("");
				return;
			}

			if (input === "E") {
				if (shouldStartProjectEdit("e", view, activeProjectId, focusArea)) {
					if (!activeProject) {
						setStatusText("No project selected");
						return;
					}
					setInputMode("projectEditPicker");
					setPickerIndex(0);
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
				if (view === "project" && activeProject && !activeProject.isInbox) {
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
		{ isActive },
	);
}
