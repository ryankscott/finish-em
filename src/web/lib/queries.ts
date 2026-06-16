import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Goal, Reminder, Task } from "@/server/types";
import type { TaskQuery } from "@/shared/api-client";
import { snapshotGoal, snapshotTaskFields } from "@/shared/undo";

import { api } from "./api";
import { recordUndo } from "./undo";

export const keys = {
	settings: ["settings"] as const,
	sync: ["sync"] as const,
	projects: ["projects"] as const,
	tasks: (query: TaskQuery = {}) => ["tasks", query] as const,
	deletedTasks: ["tasks", "deleted"] as const,
	goals: (
		query: { periodType?: "daily" | "weekly"; periodStart?: string } = {},
	) => ["goals", query] as const,
	reminders: ["reminders"] as const,
	taskReminders: (taskId: number) => ["reminders", "task", taskId] as const,
};

export function useSettings() {
	return useQuery({
		queryKey: keys.settings,
		queryFn: () => api.getSettings(),
	});
}

export function useProjects() {
	return useQuery({
		queryKey: keys.projects,
		queryFn: () => api.listProjects(),
	});
}

export function useTasks(query: TaskQuery = {}, enabled = true) {
	return useQuery({
		queryKey: keys.tasks(query),
		queryFn: () => api.listTasks(query),
		enabled,
	});
}

export function useDeletedTasks() {
	return useQuery({
		queryKey: keys.deletedTasks,
		queryFn: () => api.listDeletedTasks(),
	});
}

export function useGoals(query: {
	periodType?: "daily" | "weekly";
	periodStart?: string;
}) {
	return useQuery({
		queryKey: keys.goals(query),
		queryFn: () => api.listGoals(query),
	});
}

export function useAllReminders() {
	return useQuery({
		queryKey: keys.reminders,
		queryFn: () => api.listAllReminders(),
	});
}

export function useTaskReminders(taskId: number | null) {
	return useQuery({
		queryKey: keys.taskReminders(taskId ?? 0),
		queryFn: () => api.listTaskReminders(taskId as number),
		enabled: taskId !== null,
	});
}

export function useSyncStatus() {
	return useQuery({ queryKey: keys.sync, queryFn: () => api.getSyncStatus() });
}

/** Invalidate everything task-shaped after a mutation; cheap at this scale. */
function useInvalidateTasks() {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({ queryKey: ["tasks"] });
		queryClient.invalidateQueries({ queryKey: ["projects"] });
		queryClient.invalidateQueries({ queryKey: ["reminders"] });
	};
}

export function useTaskMutations() {
	const invalidate = useInvalidateTasks();

	const completeTask = useMutation({
		mutationFn: (task: Task) =>
			task.status === "completed"
				? api.uncompleteTask(task.id)
				: api.completeTask(task.id),
		onSuccess: (_data, task) =>
			recordUndo(
				task.status === "completed"
					? { kind: "task_reopen", taskId: task.id, label: task.title }
					: { kind: "task_complete", taskId: task.id, label: task.title },
			),
		onSettled: invalidate,
	});

	const deleteTask = useMutation({
		mutationFn: (task: Task) => api.deleteTask(task.id),
		onSuccess: (_data, task) =>
			recordUndo({ kind: "task_delete", taskId: task.id, label: task.title }),
		onSettled: invalidate,
	});

	const undeleteTask = useMutation({
		mutationFn: (taskId: number) => api.undeleteTask(taskId),
		onSettled: invalidate,
	});

	const createTask = useMutation({
		mutationFn: (input: Parameters<typeof api.createTask>[0]) =>
			api.createTask(input),
		onSuccess: (task) =>
			recordUndo({ kind: "task_create", taskId: task.id, label: task.title }),
		onSettled: invalidate,
	});

	const updateTask = useMutation({
		mutationFn: ({
			taskId,
			input,
		}: {
			taskId: number;
			input: Parameters<typeof api.updateTask>[1];
			before?: Task;
		}) => api.updateTask(taskId, input),
		onSuccess: (_data, { taskId, before }) => {
			if (before)
				recordUndo({
					kind: "task_update",
					taskId,
					label: before.title,
					before: snapshotTaskFields(before),
				});
		},
		onSettled: invalidate,
	});

	return { completeTask, deleteTask, undeleteTask, createTask, updateTask };
}

export function useProjectMutations() {
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: keys.projects });
		queryClient.invalidateQueries({ queryKey: ["tasks"] });
	};

	const createProject = useMutation({
		mutationFn: (input: Parameters<typeof api.createProject>[0]) =>
			api.createProject(input),
		onSettled: invalidate,
	});

	const updateProject = useMutation({
		mutationFn: ({
			projectId,
			input,
		}: {
			projectId: number;
			input: Parameters<typeof api.updateProject>[1];
		}) => api.updateProject(projectId, input),
		onSettled: invalidate,
	});

	const deleteProject = useMutation({
		mutationFn: (projectId: number) => api.deleteProject(projectId),
		onSettled: invalidate,
	});

	return { createProject, updateProject, deleteProject };
}

export function useGoalMutations() {
	const queryClient = useQueryClient();
	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ["goals"] });

	const createGoal = useMutation({
		mutationFn: (input: Parameters<typeof api.createGoal>[0]) =>
			api.createGoal(input),
		onSuccess: (goal) =>
			recordUndo({ kind: "goal_create", goalId: goal.id, label: goal.title }),
		onSettled: invalidate,
	});

	const updateGoal = useMutation({
		mutationFn: ({
			goalId,
			input,
		}: {
			goalId: number;
			input: Parameters<typeof api.updateGoal>[1];
			before?: { title?: string; done?: boolean };
			label?: string;
		}) => api.updateGoal(goalId, input),
		onSuccess: (_data, { goalId, before, label }) => {
			if (before)
				recordUndo({
					kind: "goal_update",
					goalId,
					label: label ?? "goal",
					before,
				});
		},
		onSettled: invalidate,
	});

	const deleteGoal = useMutation({
		mutationFn: (goal: Goal) => api.deleteGoal(goal.id),
		onSuccess: (_data, goal) =>
			recordUndo({
				kind: "goal_delete",
				label: goal.title,
				snapshot: snapshotGoal(goal),
			}),
		onSettled: invalidate,
	});

	return { createGoal, updateGoal, deleteGoal };
}

export function useReminderMutations() {
	const queryClient = useQueryClient();
	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ["reminders"] });

	const createReminder = useMutation({
		mutationFn: ({ taskId, remindAt }: { taskId: number; remindAt: string }) =>
			api.createReminder(taskId, { remindAt }),
		onSuccess: (reminder) =>
			recordUndo({
				kind: "reminder_create",
				reminderId: reminder.id,
				label: "reminder",
			}),
		onSettled: invalidate,
	});

	const deleteReminder = useMutation({
		mutationFn: (reminder: Reminder) => api.deleteReminder(reminder.id),
		onSuccess: (_data, reminder) =>
			recordUndo({
				kind: "reminder_delete",
				label: "reminder",
				taskId: reminder.taskId,
				remindAt: reminder.remindAt,
			}),
		onSettled: invalidate,
	});

	return { createReminder, deleteReminder };
}

export function useSettingsMutations() {
	const queryClient = useQueryClient();
	const updateSettings = useMutation({
		mutationFn: (input: Parameters<typeof api.updateSettings>[0]) =>
			api.updateSettings(input),
		onSettled: () => queryClient.invalidateQueries({ queryKey: keys.settings }),
	});
	return { updateSettings };
}

export function useSyncMutations() {
	const queryClient = useQueryClient();
	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: keys.sync });
		queryClient.invalidateQueries({ queryKey: ["tasks"] });
	};

	const enableSync = useMutation({
		mutationFn: () => api.enableSync(),
		onSettled: invalidate,
	});
	const disableSync = useMutation({
		mutationFn: () => api.disableSync(),
		onSettled: invalidate,
	});
	const syncNow = useMutation({
		mutationFn: () => api.syncNow(),
		onSettled: invalidate,
	});

	return { enableSync, disableSync, syncNow };
}
