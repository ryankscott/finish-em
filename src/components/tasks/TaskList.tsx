import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/api-client";
import { useHotkeys } from "@/lib/hotkeys";

import type { Reminder, Task as TaskType } from "@/server/types";
import { ReminderModal } from "./ReminderModal";
import { Task } from "./Task";

type ReminderMap = Record<number, Reminder[]>;

export function TaskList(props: {
	tasks: TaskType[];
	onRefresh: () => Promise<void> | void;
}) {
	const { tasks, onRefresh } = props;
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
	const [editingTitle, setEditingTitle] = useState("");
	const [reminders, setReminders] = useState<ReminderMap>({});
	const [query, setQuery] = useState("");
	const [reminderModalOpen, setReminderModalOpen] = useState(false);
	const [reminderModalTaskId, setReminderModalTaskId] = useState<number | null>(
		null,
	);

	const filteredTasks = useMemo(() => {
		if (query.trim().length === 0) {
			return tasks;
		}
		const lowercase = query.toLowerCase();
		return tasks.filter((task) => task.title.toLowerCase().includes(lowercase));
	}, [query, tasks]);

	useEffect(() => {
		let active = true;

		const loadAllReminders = async () => {
			const entries = await Promise.all(
				tasks.map(async (task) => {
					const list = await api.listTaskReminders(task.id);
					return [task.id, list] as const;
				}),
			);

			if (!active) {
				return;
			}

			setReminders(Object.fromEntries(entries));
		};

		void loadAllReminders();

		return () => {
			active = false;
		};
	}, [tasks]);

	const selectedTask = filteredTasks[selectedIndex] ?? null;

	useHotkeys(
		{
			j: () =>
				setSelectedIndex((index) =>
					Math.min(index + 1, filteredTasks.length - 1),
				),
			k: () => setSelectedIndex((index) => Math.max(index - 1, 0)),
			x: async () => {
				if (!selectedTask) {
					return;
				}
				if (selectedTask.status === "completed") {
					await api.uncompleteTask(selectedTask.id);
				} else {
					await api.completeTask(selectedTask.id);
				}
				await onRefresh();
			},
			e: () => {
				if (!selectedTask) {
					return;
				}
				setEditingTaskId(selectedTask.id);
				setEditingTitle(selectedTask.title);
			},
			"/": () => {
				const input = document.getElementById(
					"task-filter-input",
				) as HTMLInputElement | null;
				input?.focus();
			},
		},
		{ allowInInput: ["/"] },
	);

	const saveEdit = async (taskId: number) => {
		const title = editingTitle.trim();
		if (!title) {
			return;
		}

		await api.updateTask(taskId, { title });
		setEditingTaskId(null);
		await onRefresh();
	};

	const addReminder = async (taskId: number, remindAt: string) => {
		const reminder = await api.createReminder(taskId, { remindAt });
		setReminders((current) => ({
			...current,
			[taskId]: [...(current[taskId] ?? []), reminder],
		}));
	};

	const deleteReminder = async (reminderId: number) => {
		await api.deleteReminder(reminderId);
		// Refresh reminders for all tasks
		const entries = await Promise.all(
			tasks.map(async (task) => {
				const list = await api.listTaskReminders(task.id);
				return [task.id, list] as const;
			}),
		);
		setReminders(Object.fromEntries(entries));
	};

	const openReminderModal = (taskId: number) => {
		setReminderModalTaskId(taskId);
		setReminderModalOpen(true);
	};

	const closeReminderModal = () => {
		setReminderModalOpen(false);
		setReminderModalTaskId(null);
	};

	return (
		<div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
			<div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-3">
				<h2 className="font-semibold text-zinc-900">
					Tasks ({filteredTasks.length})
				</h2>
				<input
					id="task-filter-input"
					placeholder="Filter tasks..."
					className="w-56 rounded-md border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-red-400"
					value={query}
					onChange={(event) => {
						setQuery(event.target.value);
						setSelectedIndex(0);
					}}
				/>
			</div>

			<ul className="divide-y divide-zinc-100">
				{filteredTasks.map((task, index) => {
					const taskReminders = reminders[task.id] ?? [];
					const isSelected = index === selectedIndex;
					const isEditing = editingTaskId === task.id;

					return (
						<Task
							key={task.id}
							task={task}
							isSelected={isSelected}
							isEditing={isEditing}
							editingTitle={editingTitle}
							taskReminders={taskReminders}
							onMouseEnter={() => setSelectedIndex(index)}
							onCompleteToggle={async () => {
								if (task.status === "completed") {
									await api.uncompleteTask(task.id);
								} else {
									await api.completeTask(task.id);
								}
								await onRefresh();
							}}
							onEditingTitleChange={setEditingTitle}
							onSaveEdit={() => saveEdit(task.id)}
							onCancelEdit={() => setEditingTaskId(null)}
							onRefresh={onRefresh}
							onOpenReminderModal={() => openReminderModal(task.id)}
							onDeleteReminder={deleteReminder}
						/>
					);
				})}

				{filteredTasks.length === 0 && (
					<li className="p-6 text-center text-sm text-zinc-500">
						No tasks found
					</li>
				)}
			</ul>

			{reminderModalTaskId !== null && (
				<ReminderModal
					isOpen={reminderModalOpen}
					onClose={closeReminderModal}
					onAddReminder={(remindAt) =>
						addReminder(reminderModalTaskId, remindAt)
					}
					dueAt={tasks.find((t) => t.id === reminderModalTaskId)?.dueAt ?? null}
				/>
			)}
		</div>
	);
}
