import { format, parseISO } from "date-fns";
import { useCallback } from "react";

import type { Goal, Project, Task } from "../../server/types";
import type { ApiClient } from "../api-client";
import type { InputMode } from "./useInputBar";
import { normalizeBareUrlsInText } from "../../lib/task-links";
import { parseTaskCreateInput } from "../parse-task-create-input";
import { parseDatePhrase } from "../parse-task-input";
import { parseProjectCreateInput } from "../parse-project-input";
import type { StatusMessageTone } from "../StatusMessage";

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
	enumPickerTargetMode: InputMode | null;
	pushToast: (text: string, tone?: StatusMessageTone) => void;
	closeInput: () => void;
	loadData: () => Promise<void>;
	setLoading: (loading: boolean) => void;
	setErrorText: (text: string | null) => void;
	setStatusText: (text: string) => void;
	setEditingSettingField: (field: "timezone" | null) => void;
};

// Modes where an empty/blank value is intentional (e.g. clearing notes or dates).
const ALLOW_EMPTY_MODES: InputMode[] = [
	"editNotes",
	"editDueDate",
	"editScheduledDate",
	"editProjectEndDate",
	"editProjectStartDate",
	"editProjectJiraDiscovery",
	"editProjectJiraDelivery",
	"editProjectConfluence",
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
}: UseSubmitInputParams) {
	const submitInput = useCallback(async (overrideValue?: string) => {
		const value = (overrideValue !== undefined ? overrideValue : inputValue).trim();
		if (value.length === 0 && !ALLOW_EMPTY_MODES.includes(inputMode)) {
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
				const parsed = parseTaskCreateInput(value, projects);
				if (parsed.usedTokens) {
					if (parsed.errors.length > 0) {
						setStatusText(`Task not created: ${parsed.errors.join("; ")}`);
					} else {
						const title = normalizeBareUrlsInText(String(parsed.input.title));
						const notes =
							parsed.input.notes != null
								? normalizeBareUrlsInText(parsed.input.notes)
								: undefined;
						await api.createTask({
							title,
							projectId:
								parsed.input.projectId ??
								activeProjectId ??
								projects.find((project) => project.isInbox)?.id ??
								1,
							parentTaskId: parsed.input.parentTaskId,
							notes,
							priority: parsed.input.priority,
							scheduledAt: parsed.input.scheduledAt,
							dueAt: parsed.input.dueAt,
							dueTimezone: parsed.input.dueTimezone,
							recurrencePreset: parsed.input.recurrencePreset,
							recurrenceRRule: parsed.input.recurrenceRRule,
						});
						setStatusText(
							parsed.warnings.length > 0
								? `Task created (warnings: ${parsed.warnings.join("; ")})`
								: "Task created",
						);
					}
				} else {
					await api.createQuickAdd(value);
					setStatusText("Task created");
				}
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
				await api.updateTask(selectedTask.id, { notes: normalizeBareUrlsInText(value) });
				setStatusText("Notes updated");
			}
		} else if (inputMode === "editReminder") {
			if (!selectedTask) {
				setStatusText("No task selected");
			} else {
				const reminder = await api.createReminder(selectedTask.id, { remindAt: value });
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
		} else if (inputMode === "editDueDate" || inputMode === "calendarPickerDueDate") {
			if (!selectedTask) {
				setStatusText("No task selected");
			} else {
				const parsed = parseDatePhrase(value);
				const dueTimezone =
					parsed !== null
						? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
						: undefined;
				await api.updateTask(selectedTask.id, { dueAt: parsed, dueTimezone });
				setStatusText(parsed ? "Due date updated" : "Due date cleared");
			}
		} else if (inputMode === "editScheduledDate" || inputMode === "calendarPickerScheduledDate") {
			if (!selectedTask) {
				setStatusText("No task selected");
			} else {
				const parsed = parseDatePhrase(value);
				await api.updateTask(selectedTask.id, { scheduledAt: parsed });
				setStatusText(parsed ? "Scheduled date updated" : "Scheduled date cleared");
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
						value === "none" ? null : (value as "daily" | "weekly" | "monthly" | "yearly" | "every_weekday");
					await api.updateTask(selectedTask.id, { recurrencePreset: preset, recurrenceRRule: null });
					setStatusText(preset ? "Recurrence updated" : "Recurrence cleared");
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
					value === "none" ? null : (value as "daily" | "weekly" | "monthly" | "yearly" | "every_weekday");
				await api.updateTask(selectedTask.id, { recurrencePreset: preset, recurrenceRRule: null });
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
		} else if (inputMode === "editProjectStartDate" || inputMode === "calendarPickerProjectStartDate") {
			if (!activeProjectId) {
				setStatusText("No project selected");
			} else {
				const parsed = parseDatePhrase(value);
				await api.updateProject(activeProjectId, { startAt: parsed });
				setStatusText(parsed ? "Project start date updated" : "Project start date cleared");
			}
		} else if (inputMode === "editProjectEndDate" || inputMode === "calendarPickerProjectEndDate") {
			if (!activeProjectId) {
				setStatusText("No project selected");
			} else {
				const parsed = parseDatePhrase(value);
				await api.updateProject(activeProjectId, { endAt: parsed });
				setStatusText(parsed ? "Project end date updated" : "Project end date cleared");
			}
		} else if (inputMode === "editProjectJiraDiscovery") {
			if (!activeProjectId) {
				setStatusText("No project selected");
			} else {
				await api.updateProject(activeProjectId, { jiraDiscoveryUrl: value || null });
				setStatusText(value ? "Jira Discovery URL updated" : "Jira Discovery URL cleared");
			}
		} else if (inputMode === "editProjectJiraDelivery") {
			if (!activeProjectId) {
				setStatusText("No project selected");
			} else {
				await api.updateProject(activeProjectId, { jiraDeliveryUrl: value || null });
				setStatusText(value ? "Jira Delivery URL updated" : "Jira Delivery URL cleared");
			}
		} else if (inputMode === "editProjectConfluence") {
			if (!activeProjectId) {
				setStatusText("No project selected");
			} else {
				await api.updateProject(activeProjectId, { confluenceUrl: value || null });
				setStatusText(value ? "Confluence URL updated" : "Confluence URL cleared");
			}
		}
		closeInput();
		await loadData();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [
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
	]);

	return { submitInput };
}
