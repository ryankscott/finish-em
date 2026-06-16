import { useCallback } from "react";

import type { Goal, Project, Reminder, Task } from "../../server/types";
import { type UndoRecord, snapshotGoal } from "../../shared/undo";
import type { ApiClient } from "../api-client";
import type { StatusMessageTone } from "../StatusMessage";

type UseTaskActionsParams = {
	api: ApiClient;
	loadData: () => Promise<void>;
	selectedTask: Task | null;
	activeProject: Project | null;
	selectedGoal: Goal | null;
	pushToast: (text: string, tone?: StatusMessageTone) => void;
	recordUndo: (record: UndoRecord) => void;
	setLoading: (loading: boolean) => void;
	setErrorText: (text: string | null) => void;
	setStatusText: (text: string) => void;
	setView: (view: "inbox") => void;
	setActiveProjectId: (id: number | null) => void;
	setReminders: (reminders: Reminder[]) => void;
};

type UseTaskActionsResult = {
	toggleSelectedTask: () => Promise<void>;
	toggleSelectedTaskSomeday: () => Promise<void>;
	deleteSelectedTask: () => Promise<void>;
	undeleteSelectedTask: () => Promise<void>;
	deleteActiveProject: () => Promise<void>;
	deleteSelectedReminder: (reminder: Reminder) => Promise<void>;
	toggleSelectedGoal: () => Promise<void>;
	deleteSelectedGoal: () => Promise<void>;
};

export function useTaskActions({
	api,
	loadData,
	selectedTask,
	activeProject,
	selectedGoal,
	pushToast,
	recordUndo,
	setLoading,
	setErrorText,
	setStatusText,
	setView,
	setActiveProjectId,
	setReminders,
}: UseTaskActionsParams): UseTaskActionsResult {
	const toggleSelectedTask = useCallback(async () => {
		if (!selectedTask) return;
		setLoading(true);
		setErrorText(null);
		try {
			if (selectedTask.status === "completed") {
				await api.uncompleteTask(selectedTask.id);
				recordUndo({
					kind: "task_reopen",
					taskId: selectedTask.id,
					label: selectedTask.title,
				});
				setStatusText("Task reopened");
			} else {
				await api.completeTask(selectedTask.id);
				recordUndo({
					kind: "task_complete",
					taskId: selectedTask.id,
					label: selectedTask.title,
				});
				setStatusText("Task completed");
			}
			await loadData();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [
		api,
		loadData,
		recordUndo,
		selectedTask,
		setErrorText,
		setLoading,
		setStatusText,
	]);

	const toggleSelectedTaskSomeday = useCallback(async () => {
		if (!selectedTask) return;
		setLoading(true);
		setErrorText(null);
		try {
			const next = !selectedTask.someday;
			await api.updateTask(selectedTask.id, { someday: next });
			recordUndo({
				kind: "task_update",
				taskId: selectedTask.id,
				label: selectedTask.title,
				before: { someday: selectedTask.someday },
			});
			setStatusText(next ? "Parked in Someday" : "Removed from Someday");
			await loadData();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [
		api,
		loadData,
		recordUndo,
		selectedTask,
		setErrorText,
		setLoading,
		setStatusText,
	]);

	const deleteSelectedTask = useCallback(async () => {
		if (!selectedTask) return;
		setLoading(true);
		setErrorText(null);
		try {
			await api.deleteTask(selectedTask.id);
			recordUndo({
				kind: "task_delete",
				taskId: selectedTask.id,
				label: selectedTask.title,
			});
			setStatusText("Task deleted");
			await loadData();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [
		api,
		loadData,
		recordUndo,
		selectedTask,
		setErrorText,
		setLoading,
		setStatusText,
	]);

	const undeleteSelectedTask = useCallback(async () => {
		if (!selectedTask) return;
		setLoading(true);
		setErrorText(null);
		try {
			await api.undeleteTask(selectedTask.id);
			pushToast("Task restored", "info");
			setStatusText("Task restored");
			await loadData();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [
		api,
		loadData,
		pushToast,
		selectedTask,
		setErrorText,
		setLoading,
		setStatusText,
	]);

	const deleteActiveProject = useCallback(async () => {
		if (!activeProject || activeProject.isInbox) return;
		setLoading(true);
		setErrorText(null);
		try {
			await api.deleteProject(activeProject.id);
			setStatusText("Project deleted");
			setView("inbox");
			setActiveProjectId(null);
			await loadData();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [
		api,
		activeProject,
		loadData,
		setActiveProjectId,
		setErrorText,
		setLoading,
		setStatusText,
		setView,
	]);

	const deleteSelectedReminder = useCallback(
		async (reminder: Reminder) => {
			setLoading(true);
			setErrorText(null);
			try {
				await api.deleteReminder(reminder.id);
				recordUndo({
					kind: "reminder_delete",
					label: "reminder",
					taskId: reminder.taskId,
					remindAt: reminder.remindAt,
				});
				setStatusText("Reminder deleted");
				pushToast("Reminder deleted", "info");
				if (selectedTask) {
					setReminders(await api.listTaskReminders(selectedTask.id));
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				setErrorText(message);
			} finally {
				setLoading(false);
			}
		},
		[
			api,
			pushToast,
			recordUndo,
			selectedTask,
			setErrorText,
			setLoading,
			setReminders,
			setStatusText,
		],
	);

	const toggleSelectedGoal = useCallback(async () => {
		if (!selectedGoal) return;
		setLoading(true);
		setErrorText(null);
		try {
			await api.updateGoal(selectedGoal.id, { done: !selectedGoal.done });
			recordUndo({
				kind: "goal_update",
				goalId: selectedGoal.id,
				label: selectedGoal.title,
				before: { done: selectedGoal.done },
			});
			setStatusText(selectedGoal.done ? "Goal reopened" : "Goal completed");
			await loadData();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [
		api,
		loadData,
		recordUndo,
		selectedGoal,
		setErrorText,
		setLoading,
		setStatusText,
	]);

	const deleteSelectedGoal = useCallback(async () => {
		if (!selectedGoal) return;
		setLoading(true);
		setErrorText(null);
		try {
			await api.deleteGoal(selectedGoal.id);
			recordUndo({
				kind: "goal_delete",
				label: selectedGoal.title,
				snapshot: snapshotGoal(selectedGoal),
			});
			setStatusText("Goal deleted");
			pushToast("Goal deleted", "info");
			await loadData();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [
		api,
		loadData,
		pushToast,
		recordUndo,
		selectedGoal,
		setErrorText,
		setLoading,
		setStatusText,
	]);

	return {
		toggleSelectedTask,
		toggleSelectedTaskSomeday,
		deleteSelectedTask,
		undeleteSelectedTask,
		deleteActiveProject,
		deleteSelectedReminder,
		toggleSelectedGoal,
		deleteSelectedGoal,
	};
}
