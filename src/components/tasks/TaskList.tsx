import { useEffect, useMemo, useState } from "react";

import { QuickAddModal } from "@/components/quick-add/QuickAddModal";
import { api } from "@/lib/api-client";
import { useHotkeys } from "@/lib/hotkeys";
import type { Reminder, Task as TaskType } from "@/server/types";

import { ReminderModal } from "./ReminderModal";
import { Task } from "./Task";

type ReminderMap = Record<number, Reminder[]>;

type TaskRow = {
	task: TaskType;
	depth: 0 | 1;
	parentTitle?: string;
};

function buildTaskRows(tasks: TaskType[], allTasks: TaskType[]): TaskRow[] {
	const taskById = new Map(tasks.map((task) => [task.id, task]));
	const allTaskById = new Map(allTasks.map((task) => [task.id, task]));
	const childrenByParent = new Map<number, TaskType[]>();
	const roots: TaskType[] = [];

	for (const task of tasks) {
		if (task.parentTaskId !== null && taskById.has(task.parentTaskId)) {
			const children = childrenByParent.get(task.parentTaskId) ?? [];
			children.push(task);
			childrenByParent.set(task.parentTaskId, children);
			continue;
		}
		roots.push(task);
	}

	const rows: TaskRow[] = [];
	for (const root of roots) {
		const parentTitle =
			root.parentTaskId !== null
				? allTaskById.get(root.parentTaskId)?.title
				: undefined;
		rows.push({
			task: root,
			depth: 0,
			parentTitle,
		});
		for (const child of childrenByParent.get(root.id) ?? []) {
			rows.push({
				task: child,
				depth: 1,
				parentTitle: root.title,
			});
		}
	}

	return rows;
}

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
	const [subtaskParent, setSubtaskParent] = useState<TaskType | null>(null);

	const filteredTasks = useMemo(() => {
		if (query.trim().length === 0) {
			return tasks;
		}
		const lowercase = query.toLowerCase();
		return tasks.filter((task) => task.title.toLowerCase().includes(lowercase));
	}, [query, tasks]);

	const taskRows = useMemo(
		() => buildTaskRows(filteredTasks, tasks),
		[filteredTasks, tasks],
	);

	useEffect(() => {
		setSelectedIndex((index) =>
			Math.max(0, Math.min(index, Math.max(taskRows.length - 1, 0))),
		);
	}, [taskRows.length]);

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

	const selectedTask = taskRows[selectedIndex]?.task ?? null;

	const exitEditMode = () => {
		setEditingTaskId(null);
		setEditingTitle("");
	};

	const enterEditMode = (task: TaskType) => {
		setEditingTaskId(task.id);
		setEditingTitle(task.title);
	};

	useHotkeys(
		{
			j: () =>
				setSelectedIndex((index) =>
					Math.min(index + 1, Math.max(taskRows.length - 1, 0)),
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
				enterEditMode(selectedTask);
			},
			escape: () => {
				exitEditMode();
			},
			"/": () => {
				const input = document.getElementById(
					"task-filter-input",
				) as HTMLInputElement | null;
				input?.focus();
			},
		},
		{ allowInInput: ["/", "escape"] },
	);

	const saveEdit = async (taskId: number) => {
		const title = editingTitle.trim();
		if (!title) {
			return;
		}

		await api.updateTask(taskId, { title });
		exitEditMode();
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
		<div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
			<div className="flex items-center justify-between gap-3 border-b border-zinc-200 p-3">
				<h2 className="font-semibold text-zinc-900">Tasks ({taskRows.length})</h2>
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
				{taskRows.map((row, index) => {
					const task = row.task;
					const taskReminders = reminders[task.id] ?? [];
					const isSelected = index === selectedIndex;
					const isEditing = editingTaskId === task.id;
					const hasChildren = tasks.some(
						(candidate) => candidate.parentTaskId === task.id,
					);
					const parentOptions = tasks.filter(
						(candidate) =>
							candidate.projectId === task.projectId &&
							candidate.id !== task.id &&
							candidate.parentTaskId === null,
					);

					return (
						<Task
							key={task.id}
							task={task}
							isSelected={isSelected}
							isEditing={isEditing}
							editingTitle={editingTitle}
							taskReminders={taskReminders}
							depth={row.depth}
							parentTitle={row.parentTitle}
							parentOptions={parentOptions.map((option) => ({
								id: option.id,
								title: option.title,
							}))}
							disableParentSelection={hasChildren}
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
							onCancelEdit={exitEditMode}
							onEnterEditMode={() => enterEditMode(task)}
							onExitEditMode={exitEditMode}
							onRefresh={onRefresh}
							onOpenReminderModal={() => openReminderModal(task.id)}
							onDeleteReminder={deleteReminder}
							onOpenSubtaskModal={() => setSubtaskParent(task)}
						/>
					);
				})}

				{taskRows.length === 0 && (
					<li className="p-6 text-center text-sm text-zinc-500">
						No tasks found
					</li>
				)}
			</ul>

			{reminderModalTaskId !== null && (
				<ReminderModal
					isOpen={reminderModalOpen}
					onClose={closeReminderModal}
					onAddReminder={(remindAt) => addReminder(reminderModalTaskId, remindAt)}
					dueAt={tasks.find((t) => t.id === reminderModalTaskId)?.dueAt ?? null}
				/>
			)}

			<QuickAddModal
				open={subtaskParent !== null}
				parentTask={
					subtaskParent
						? {
								id: subtaskParent.id,
								title: subtaskParent.title,
						  }
						: null
				}
				onClose={() => setSubtaskParent(null)}
				onCreated={async () => {
					await onRefresh();
				}}
			/>
		</div>
	);
}
