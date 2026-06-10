import { format, parseISO } from "date-fns";
import type React from "react";
import { useCallback } from "react";
import { parseProjectCreateInput } from "../../lib/parsing/parse-project-input";
import { parseDatePhrase } from "../../lib/parsing/parse-task-input";
import { normalizeBareUrlsInText } from "../../lib/task-links";
import type { Goal, Project, Task } from "../../server/types";
import type { ApiClient } from "../api-client";
import type { StatusMessageTone } from "../StatusMessage";
import type { InputMode } from "./useInputBar";

const CALENDAR_PICKER_MODES: InputMode[] = [
	"calendarPickerDueDate",
	"calendarPickerScheduledDate",
	"calendarPickerProjectStartDate",
	"calendarPickerProjectEndDate",
];

/** Returns true if the enumPickerTargetMode encodes a modal field return. */
export function isModalEnumTarget(mode: string | null): boolean {
	return typeof mode === "string" && mode.startsWith("modal:");
}

/** Parse `modal:<modalMode>:<fieldKey>` into its parts. */
function parseModalTarget(
	mode: string,
): { modalMode: InputMode; fieldKey: string } | null {
	const parts = mode.split(":");
	if (parts.length < 3) return null;
	return { modalMode: parts[1] as InputMode, fieldKey: parts[2] ?? "" };
}

type UseSubmitInputParams = {
	api: ApiClient;
	inputMode: InputMode;
	inputValue: string;
	editingSettingField: "timezone" | null;
	selectedTask: Task | null;
	selectedGoal: Goal | null;
	activeProjectId: number | null;
	activeProject: Project | null;
	projects: Project[];
	goalPeriodType: "daily" | "weekly";
	goalPeriodStart: string;
	enumPickerTargetMode: string | null;
	pushToast: (text: string, tone?: StatusMessageTone) => void;
	closeInput: () => void;
	loadData: () => Promise<void>;
	setLoading: (loading: boolean) => void;
	setErrorText: (text: string | null) => void;
	setStatusText: (text: string) => void;
	setEditingSettingField: (field: "timezone" | null) => void;
	// Modal submit params
	modalValues: Record<string, string>;
	setModalValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	setModalFieldIndex: (idx: number) => void;
	setValidationError: (err: string | null) => void;
	setInputMode: (mode: InputMode) => void;
	editingTaskId: number | null;
	reminderPickerDateRef: React.MutableRefObject<string>;
};

// Modes where an empty/blank value is intentional (e.g. clearing notes or dates).
const ALLOW_EMPTY_MODES: InputMode[] = [
	"editNotes",
	"editBlockedReason",
	"editDueDate",
	"editScheduledDate",
	"editProjectEndDate",
	"editProjectStartDate",
	"editProjectJiraDiscovery",
	"editProjectJiraDelivery",
	"editProjectConfluence",
	"editProjectJiraDocs",
	"editProjectJiraReleaseNote",
	"editProjectTeamsReleaseNote",
	"editProjectJiraDiscoveryStatus",
	"editProjectJiraDeliveryStatus",
	"calendarPickerDueDate",
	"calendarPickerScheduledDate",
	"calendarPickerProjectStartDate",
	"calendarPickerProjectEndDate",
];

export function useSubmitInput({
	api,
	inputMode,
	inputValue,
	editingSettingField,
	selectedTask,
	selectedGoal,
	activeProjectId,
	activeProject,
	projects,
	goalPeriodType,
	goalPeriodStart,
	enumPickerTargetMode,
	pushToast,
	closeInput,
	loadData,
	setLoading,
	setErrorText,
	setStatusText,
	setEditingSettingField,
	modalValues,
	setModalValues,
	setModalFieldIndex,
	setValidationError,
	setInputMode,
	editingTaskId,
	reminderPickerDateRef,
}: UseSubmitInputParams) {
	const submitInput = useCallback(
		async (overrideValue?: string) => {
			const value = (
				overrideValue !== undefined ? overrideValue : inputValue
			).trim();

			// Modal picker return: enum or calendar picker was opened from a modal field.
			// Write result back to the modal field and return to the modal — don't close or load.
			const target = enumPickerTargetMode;
			if (
				(inputMode === "enumPicker" ||
					CALENDAR_PICKER_MODES.includes(inputMode)) &&
				isModalEnumTarget(target)
			) {
				const parsed = parseModalTarget(target!);
				if (parsed) {
					setModalValues((prev) => ({ ...prev, [parsed.fieldKey]: value }));
					setInputMode(parsed.modalMode);
				}
				return;
			}

			// Modal submit uses modalValues, not inputValue — never treat empty inputValue as cancel.
			const isModalSubmitMode =
				inputMode === "createTaskModal" ||
				inputMode === "createProjectModal" ||
				inputMode === "editTaskModal" ||
				inputMode === "editProjectModal";
			if (
				value.length === 0 &&
				!ALLOW_EMPTY_MODES.includes(inputMode) &&
				!isModalSubmitMode
			) {
				closeInput();
				return;
			}

			setLoading(true);
			setErrorText(null);
			try {
				if (inputMode === "editSetting") {
					if (!editingSettingField) {
						setStatusText("No setting selected");
					} else if (editingSettingField === "timezone") {
						await api.updateSettings({ timezone: value });
						setStatusText("Timezone updated");
					}
					setEditingSettingField(null);
				} else if (inputMode === "quickAdd") {
					await api.createTask({
						title: normalizeBareUrlsInText(value),
						projectId:
							activeProjectId ??
							projects.find((project) => project.isInbox)?.id ??
							1,
					});
					setStatusText("Task created");
				} else if (inputMode === "createSubtask") {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						await api.createTask({
							projectId: selectedTask.projectId,
							parentTaskId: selectedTask.id,
							title: normalizeBareUrlsInText(value),
						});
						setStatusText("Subtask created");
					}
				} else if (inputMode === "createProject") {
					const parsed = parseProjectCreateInput(value);
					if (parsed.errors.length > 0) {
						setStatusText(`Project not created: ${parsed.errors.join("; ")}`);
					} else {
						await api.createProject({
							name: String(parsed.input.name),
							emoji: parsed.input.emoji ?? undefined,
							description: parsed.input.description,
							startAt: parsed.input.startAt,
							endAt: parsed.input.endAt,
							color: parsed.input.color,
							isInbox: parsed.input.isInbox,
							jiraDiscoveryUrl: parsed.input.jiraDiscoveryUrl,
							jiraDeliveryUrl: parsed.input.jiraDeliveryUrl,
							confluenceUrl: parsed.input.confluenceUrl,
						});
						setStatusText(
							parsed.warnings.length > 0
								? `Project created (warnings: ${parsed.warnings.join("; ")})`
								: "Project created",
						);
					}
				} else if (inputMode === "editProject") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						const parsed = parseProjectCreateInput(value);
						if (parsed.errors.length > 0) {
							setStatusText(`Project not updated: ${parsed.errors.join("; ")}`);
						} else {
							const patch = {
								name: parsed.input.name,
								emoji: parsed.input.emoji ?? undefined,
								description: parsed.input.description,
								startAt: parsed.input.startAt,
								endAt: parsed.input.endAt,
								jiraDiscoveryUrl: parsed.input.jiraDiscoveryUrl,
								jiraDeliveryUrl: parsed.input.jiraDeliveryUrl,
								confluenceUrl: parsed.input.confluenceUrl,
							};
							await api.updateProject(activeProjectId, patch);
							setStatusText(
								parsed.warnings.length > 0
									? `Project updated (warnings: ${parsed.warnings.join("; ")})`
									: "Project updated",
							);
						}
					}
				} else if (inputMode === "addReminder") {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						const reminder = await api.createReminder(selectedTask.id, {
							remindAt: value,
						});
						const reminderTime = (() => {
							try {
								return format(parseISO(reminder.remindAt), "MMM d, h:mm a");
							} catch {
								return reminder.remindAt;
							}
						})();
						setStatusText("Reminder created");
						pushToast(`Reminder set for ${reminderTime}`, "success");
					}
				} else if (inputMode === "editTask") {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						await api.updateTask(selectedTask.id, {
							title: normalizeBareUrlsInText(value),
						});
						setStatusText("Task updated");
					}
				} else if (inputMode === "addGoal") {
					await api.createGoal({
						periodType: goalPeriodType,
						periodStart: goalPeriodStart,
						title: value,
					});
					setStatusText("Goal created");
				} else if (inputMode === "editGoalTitle") {
					if (!selectedGoal) {
						setStatusText("No goal selected");
					} else {
						await api.updateGoal(selectedGoal.id, { title: value });
						setStatusText("Goal updated");
					}
				} else if (inputMode === "editNotes") {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						await api.updateTask(selectedTask.id, {
							notes: normalizeBareUrlsInText(value),
						});
						setStatusText("Notes updated");
					}
				} else if (inputMode === "editBlockedReason") {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						await api.updateTask(selectedTask.id, {
							blockedReason: value.length > 0 ? value : null,
						});
						setStatusText(value.length > 0 ? "Task blocked" : "Task unblocked");
					}
				} else if (inputMode === "editReminder") {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						const reminder = await api.createReminder(selectedTask.id, {
							remindAt: value,
						});
						const reminderTime = (() => {
							try {
								return format(parseISO(reminder.remindAt), "MMM d, h:mm a");
							} catch {
								return reminder.remindAt;
							}
						})();
						setStatusText("Reminder created");
						pushToast(`Reminder set for ${reminderTime}`, "success");
					}
				} else if (
					inputMode === "editDueDate" ||
					inputMode === "calendarPickerDueDate"
				) {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						const parsed = parseDatePhrase(value);
						const dueTimezone =
							parsed !== null
								? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
								: undefined;
						await api.updateTask(selectedTask.id, {
							dueAt: parsed,
							dueTimezone,
						});
						setStatusText(parsed ? "Due date updated" : "Due date cleared");
					}
				} else if (
					inputMode === "editScheduledDate" ||
					inputMode === "calendarPickerScheduledDate"
				) {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						const parsed = parseDatePhrase(value);
						await api.updateTask(selectedTask.id, { scheduledAt: parsed });
						setStatusText(
							parsed ? "Scheduled date updated" : "Scheduled date cleared",
						);
					}
				} else if (inputMode === "enumPicker") {
					// Route to the appropriate handler based on enumPickerTargetMode
					const target = enumPickerTargetMode;
					if (target === "editPriority") {
						if (!selectedTask) {
							setStatusText("No task selected");
						} else {
							const priority = Number(value) as 1 | 2 | 3 | 4;
							if (priority >= 1 && priority <= 4) {
								await api.updateTask(selectedTask.id, { priority });
								setStatusText("Priority updated");
							}
						}
					} else if (target === "editRecurrence") {
						if (!selectedTask) {
							setStatusText("No task selected");
						} else {
							const preset =
								value === "none"
									? null
									: (value as
											| "daily"
											| "weekly"
											| "monthly"
											| "yearly"
											| "every_weekday");
							await api.updateTask(selectedTask.id, {
								recurrencePreset: preset,
								recurrenceRRule: null,
							});
							setStatusText(
								preset ? "Recurrence updated" : "Recurrence cleared",
							);
						}
					} else if (target === "editMoveProject") {
						if (!selectedTask) {
							setStatusText("No task selected");
						} else {
							const projectId = Number(value);
							if (projectId > 0) {
								await api.updateTask(selectedTask.id, { projectId });
								setStatusText("Task moved to project");
							}
						}
					} else if (target === "editProjectJiraDiscoveryStatus") {
						if (!activeProjectId) {
							setStatusText("No project selected");
						} else {
							const status = value || null;
							await api.updateProject(activeProjectId, {
								jiraDiscoveryStatus: status as
									| import("../../server/types").JiraTicketStatus
									| null,
							});
							setStatusText(
								status
									? `Discovery status set to ${status}`
									: "Discovery status cleared",
							);
						}
					} else if (target === "editProjectJiraDeliveryStatus") {
						if (!activeProjectId) {
							setStatusText("No project selected");
						} else {
							const status = value || null;
							await api.updateProject(activeProjectId, {
								jiraDeliveryStatus: status as
									| import("../../server/types").JiraTicketStatus
									| null,
							});
							setStatusText(
								status
									? `Delivery status set to ${status}`
									: "Delivery status cleared",
							);
						}
					} else if (target === "editProjectJiraDocsStatus") {
						if (!activeProjectId) {
							setStatusText("No project selected");
						} else {
							const status = value || null;
							await api.updateProject(activeProjectId, {
								jiraDocsStatus: status as
									| import("../../server/types").JiraTicketStatus
									| null,
							});
							setStatusText(
								status ? `Docs status set to ${status}` : "Docs status cleared",
							);
						}
					} else if (target === "editProjectJiraReleaseNoteStatus") {
						if (!activeProjectId) {
							setStatusText("No project selected");
						} else {
							const status = value || null;
							await api.updateProject(activeProjectId, {
								jiraReleaseNoteStatus: status as
									| import("../../server/types").JiraTicketStatus
									| null,
							});
							setStatusText(
								status
									? `Release Note status set to ${status}`
									: "Release Note status cleared",
							);
						}
					} else if (target === "createReminder") {
						if (!selectedTask) {
							setStatusText("No task selected");
						} else {
							const dateStr = reminderPickerDateRef.current;
							const [h, m] = value.split(":").map(Number);
							const dt = new Date(dateStr);
							dt.setHours(h ?? 9, m ?? 0, 0, 0);
							const remindAt = dt.toISOString();
							const reminder = await api.createReminder(selectedTask.id, {
								remindAt,
							});
							const reminderTime = (() => {
								try {
									return format(parseISO(reminder.remindAt), "MMM d, h:mm a");
								} catch {
									return reminder.remindAt;
								}
							})();
							pushToast(`Reminder set for ${reminderTime}`, "success");
							setStatusText("Reminder created");
						}
					}
				} else if (inputMode === "editPriority") {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						const priority = Number(value) as 1 | 2 | 3 | 4;
						if (priority >= 1 && priority <= 4) {
							await api.updateTask(selectedTask.id, { priority });
							setStatusText("Priority updated");
						}
					}
				} else if (inputMode === "editRecurrence") {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						const preset =
							value === "none"
								? null
								: (value as
										| "daily"
										| "weekly"
										| "monthly"
										| "yearly"
										| "every_weekday");
						await api.updateTask(selectedTask.id, {
							recurrencePreset: preset,
							recurrenceRRule: null,
						});
						setStatusText(preset ? "Recurrence updated" : "Recurrence cleared");
					}
				} else if (inputMode === "editMoveProject") {
					if (!selectedTask) {
						setStatusText("No task selected");
					} else {
						const projectId = Number(value);
						if (projectId > 0) {
							await api.updateTask(selectedTask.id, { projectId });
							setStatusText("Task moved to project");
						}
					}
				} else if (inputMode === "editProjectName") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						await api.updateProject(activeProjectId, { name: value });
						setStatusText("Project name updated");
					}
				} else if (inputMode === "editProjectEmoji") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						await api.updateProject(activeProjectId, { emoji: value || null });
						setStatusText("Project emoji updated");
					}
				} else if (inputMode === "editProjectDescription") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						await api.updateProject(activeProjectId, { description: value });
						setStatusText("Project description updated");
					}
				} else if (
					inputMode === "editProjectStartDate" ||
					inputMode === "calendarPickerProjectStartDate"
				) {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						const parsed = parseDatePhrase(value);
						await api.updateProject(activeProjectId, { startAt: parsed });
						setStatusText(
							parsed
								? "Project start date updated"
								: "Project start date cleared",
						);
					}
				} else if (
					inputMode === "editProjectEndDate" ||
					inputMode === "calendarPickerProjectEndDate"
				) {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						const parsed = parseDatePhrase(value);
						await api.updateProject(activeProjectId, { endAt: parsed });
						setStatusText(
							parsed ? "Project end date updated" : "Project end date cleared",
						);
					}
				} else if (inputMode === "editProjectJiraDiscovery") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						await api.updateProject(activeProjectId, {
							jiraDiscoveryUrl: value || null,
						});
						setStatusText(
							value
								? "Discovery Jira URL updated"
								: "Discovery Jira URL cleared",
						);
					}
				} else if (inputMode === "editProjectJiraDiscoveryStatus") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						const status = value || null;
						await api.updateProject(activeProjectId, {
							jiraDiscoveryStatus: status as
								| import("../../server/types").JiraTicketStatus
								| null,
						});
						setStatusText(
							status
								? `Discovery status set to ${status}`
								: "Discovery status cleared",
						);
					}
				} else if (inputMode === "editProjectJiraDelivery") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						await api.updateProject(activeProjectId, {
							jiraDeliveryUrl: value || null,
						});
						setStatusText(
							value ? "Delivery epic URL updated" : "Delivery epic URL cleared",
						);
					}
				} else if (inputMode === "editProjectJiraDeliveryStatus") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						const status = value || null;
						await api.updateProject(activeProjectId, {
							jiraDeliveryStatus: status as
								| import("../../server/types").JiraTicketStatus
								| null,
						});
						setStatusText(
							status
								? `Delivery status set to ${status}`
								: "Delivery status cleared",
						);
					}
				} else if (inputMode === "editProjectConfluence") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						await api.updateProject(activeProjectId, {
							confluenceUrl: value || null,
						});
						setStatusText(value ? "PRD URL updated" : "PRD URL cleared");
					}
				} else if (inputMode === "editProjectJiraDocs") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						await api.updateProject(activeProjectId, {
							jiraDocsUrl: value || null,
						});
						setStatusText(
							value ? "Docs Jira URL updated" : "Docs Jira URL cleared",
						);
					}
				} else if (inputMode === "editProjectJiraDocsStatus") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						const status = value || null;
						await api.updateProject(activeProjectId, {
							jiraDocsStatus: status as
								| import("../../server/types").JiraTicketStatus
								| null,
						});
						setStatusText(
							status ? `Docs status set to ${status}` : "Docs status cleared",
						);
					}
				} else if (inputMode === "editProjectJiraReleaseNote") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						await api.updateProject(activeProjectId, {
							jiraReleaseNoteUrl: value || null,
						});
						setStatusText(
							value
								? "Release Note Jira URL updated"
								: "Release Note Jira URL cleared",
						);
					}
				} else if (inputMode === "editProjectJiraReleaseNoteStatus") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						const status = value || null;
						await api.updateProject(activeProjectId, {
							jiraReleaseNoteStatus: status as
								| import("../../server/types").JiraTicketStatus
								| null,
						});
						setStatusText(
							status
								? `Release Note status set to ${status}`
								: "Release Note status cleared",
						);
					}
				} else if (inputMode === "editProjectTeamsReleaseNote") {
					if (!activeProjectId) {
						setStatusText("No project selected");
					} else {
						await api.updateProject(activeProjectId, {
							teamsReleaseNoteUrl: value || null,
						});
						setStatusText(value ? "Teams URL updated" : "Teams URL cleared");
					}
				} else if (inputMode === "createTaskModal") {
					const title = modalValues.title?.trim();
					if (!title) {
						setValidationError("Title is required");
						setModalFieldIndex(0);
						return;
					}
					const inboxProject = projects.find((p) => p.isInbox);
					const projectId = modalValues.project
						? Number(modalValues.project)
						: (activeProjectId ?? inboxProject?.id ?? 1);
					const dueAt = parseDatePhrase(modalValues.dueAt ?? "");
					const scheduledAt = parseDatePhrase(modalValues.scheduledAt ?? "");
					const priorityNum = modalValues.priority
						? Number(modalValues.priority)
						: undefined;
					const priority =
						priorityNum !== undefined && priorityNum >= 1 && priorityNum <= 4
							? (priorityNum as 1 | 2 | 3 | 4)
							: undefined;
					const recurrenceRaw = modalValues.recurrence;
					const recurrencePreset =
						recurrenceRaw && recurrenceRaw !== "none"
							? (recurrenceRaw as
									| "daily"
									| "weekly"
									| "monthly"
									| "yearly"
									| "every_weekday")
							: null;
					const blockedReason = modalValues.blockedReason?.trim() || undefined;
					const notes = modalValues.notes?.trim()
						? normalizeBareUrlsInText(modalValues.notes.trim())
						: undefined;
					await api.createTask({
						title: normalizeBareUrlsInText(title),
						projectId,
						priority,
						dueAt: dueAt || undefined,
						dueTimezone: dueAt
							? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
							: undefined,
						scheduledAt: scheduledAt || undefined,
						recurrencePreset,
						blockedReason,
						notes,
					});
					pushToast("Task created", "success");
				} else if (inputMode === "editTaskModal") {
					const title = modalValues.title?.trim();
					if (!title) {
						setValidationError("Title is required");
						setModalFieldIndex(0);
						return;
					}
					if (!editingTaskId) {
						setStatusText("No task selected");
						return;
					}
					const projectId = modalValues.project
						? Number(modalValues.project)
						: undefined;
					const dueAt = parseDatePhrase(modalValues.dueAt ?? "");
					const scheduledAt = parseDatePhrase(modalValues.scheduledAt ?? "");
					const priorityNum = modalValues.priority
						? Number(modalValues.priority)
						: undefined;
					const priority =
						priorityNum !== undefined && priorityNum >= 1 && priorityNum <= 4
							? (priorityNum as 1 | 2 | 3 | 4)
							: null;
					const recurrenceRaw = modalValues.recurrence;
					const recurrencePreset =
						recurrenceRaw && recurrenceRaw !== "none"
							? (recurrenceRaw as
									| "daily"
									| "weekly"
									| "monthly"
									| "yearly"
									| "every_weekday")
							: null;
					const blockedReason = modalValues.blockedReason?.trim() || null;
					const notes = modalValues.notes?.trim()
						? normalizeBareUrlsInText(modalValues.notes.trim())
						: null;
					await api.updateTask(editingTaskId, {
						title: normalizeBareUrlsInText(title),
						projectId,
						priority: priority ?? undefined,
						dueAt: dueAt || null,
						dueTimezone: dueAt
							? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
							: undefined,
						scheduledAt: scheduledAt || null,
						recurrencePreset,
						blockedReason,
						notes: notes ?? undefined,
					});
					pushToast("Task updated", "success");
				} else if (inputMode === "createProjectModal") {
					const name = modalValues.name?.trim();
					if (!name) {
						setValidationError("Name is required");
						setModalFieldIndex(0);
						return;
					}
					const startAt = parseDatePhrase(modalValues.startAt ?? "");
					const endAt = parseDatePhrase(modalValues.endAt ?? "");
					await api.createProject({
						name,
						emoji: modalValues.emoji?.trim() || undefined,
						description: modalValues.description?.trim(),
						startAt: startAt || undefined,
						endAt: endAt || undefined,
						jiraDiscoveryUrl: modalValues.jiraDiscovery?.trim() || undefined,
						jiraDiscoveryStatus: (modalValues.jiraDiscoveryStatus?.trim() ||
							undefined) as
							| import("../../server/types").JiraTicketStatus
							| undefined,
						jiraDeliveryUrl: modalValues.jiraDelivery?.trim() || undefined,
						jiraDeliveryStatus: (modalValues.jiraDeliveryStatus?.trim() ||
							undefined) as
							| import("../../server/types").JiraTicketStatus
							| undefined,
						confluenceUrl: modalValues.confluenceUrl?.trim() || undefined,
						jiraDocsUrl: modalValues.jiraDocsUrl?.trim() || undefined,
						jiraDocsStatus: (modalValues.jiraDocsStatus?.trim() || undefined) as
							| import("../../server/types").JiraTicketStatus
							| undefined,
						jiraReleaseNoteUrl:
							modalValues.jiraReleaseNoteUrl?.trim() || undefined,
						jiraReleaseNoteStatus: (modalValues.jiraReleaseNoteStatus?.trim() ||
							undefined) as
							| import("../../server/types").JiraTicketStatus
							| undefined,
						teamsReleaseNoteUrl:
							modalValues.teamsReleaseNoteUrl?.trim() || undefined,
					});
					pushToast("Project created", "success");
				} else if (inputMode === "editProjectModal") {
					const name = modalValues.name?.trim();
					if (!name) {
						setValidationError("Name is required");
						setModalFieldIndex(0);
						return;
					}
					if (!activeProjectId) {
						setStatusText("No project selected");
						return;
					}
					const startAt = parseDatePhrase(modalValues.startAt ?? "");
					const endAt = parseDatePhrase(modalValues.endAt ?? "");
					await api.updateProject(activeProjectId, {
						name,
						emoji: modalValues.emoji?.trim() || null,
						description: modalValues.description?.trim(),
						startAt: startAt || null,
						endAt: endAt || null,
						jiraDiscoveryUrl: modalValues.jiraDiscovery?.trim() || null,
						jiraDiscoveryStatus: (modalValues.jiraDiscoveryStatus?.trim() ||
							null) as import("../../server/types").JiraTicketStatus | null,
						jiraDeliveryUrl: modalValues.jiraDelivery?.trim() || null,
						jiraDeliveryStatus: (modalValues.jiraDeliveryStatus?.trim() ||
							null) as import("../../server/types").JiraTicketStatus | null,
						confluenceUrl: modalValues.confluenceUrl?.trim() || null,
						jiraDocsUrl: modalValues.jiraDocsUrl?.trim() || null,
						jiraDocsStatus: (modalValues.jiraDocsStatus?.trim() || null) as
							| import("../../server/types").JiraTicketStatus
							| null,
						jiraReleaseNoteUrl: modalValues.jiraReleaseNoteUrl?.trim() || null,
						jiraReleaseNoteStatus: (modalValues.jiraReleaseNoteStatus?.trim() ||
							null) as import("../../server/types").JiraTicketStatus | null,
						teamsReleaseNoteUrl:
							modalValues.teamsReleaseNoteUrl?.trim() || null,
					});
					pushToast("Project updated", "success");
				}
				closeInput();
				await loadData();
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				setErrorText(message);
			} finally {
				setLoading(false);
			}
		},
		[
			api,
			closeInput,
			editingSettingField,
			enumPickerTargetMode,
			goalPeriodStart,
			goalPeriodType,
			inputMode,
			inputValue,
			loadData,
			activeProjectId,
			projects,
			selectedTask,
			selectedGoal,
			activeProject,
			pushToast,
			setEditingSettingField,
			setErrorText,
			setLoading,
			setStatusText,
			modalValues,
			setModalValues,
			setModalFieldIndex,
			setValidationError,
			setInputMode,
			editingTaskId,
		],
	);

	return { submitInput };
}
