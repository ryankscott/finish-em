import { Bell, Flag, Plus } from "lucide-react";
import { TaskDatePicker } from "@/components/tasks/TaskDatePicker";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { formatDateLabel } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { Priority, Reminder, Task as TaskType } from "@/server/types";
import { Badge } from "../ui/badge";

export const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
	1: "border-transparent bg-red-600 text-white [a&]:hover:bg-red-700 dark:bg-red-700 dark:[a&]:hover:bg-red-800",
	2: "border-transparent bg-amber-500 text-white [a&]:hover:bg-amber-600 dark:bg-amber-600 dark:[a&]:hover:bg-amber-700",
	3: "border-transparent bg-blue-600 text-white [a&]:hover:bg-blue-700 dark:bg-blue-700 dark:[a&]:hover:bg-blue-800",
	4: "border-transparent bg-slate-200 text-slate-700 [a&]:hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:[a&]:hover:bg-slate-500",
};

interface TaskProps {
	task: TaskType;
	isSelected: boolean;
	isEditing: boolean;
	editingTitle: string;
	taskReminders: Reminder[];
	onMouseEnter: () => void;
	onCompleteToggle: () => Promise<void>;
	onEditingTitleChange: (title: string) => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
	onRefresh: () => Promise<void> | void;
	onOpenReminderModal: () => void;
	onDeleteReminder: (reminderId: number) => Promise<void>;
}

/**
 * Format a reminder date for display like "Today 16:00"
 */
function formatReminderDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const reminderDay = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);

	const timeStr = date.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: false,
	});

	if (reminderDay.getTime() === today.getTime()) {
		return `Today ${timeStr}`;
	}
	if (reminderDay.getTime() === tomorrow.getTime()) {
		return `Tomorrow ${timeStr}`;
	}

	// For other days, show the day name
	const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
	return `${dayName} ${timeStr}`;
}

export function Task(props: TaskProps) {
	const {
		task,
		isSelected,
		isEditing,
		editingTitle,
		taskReminders,
		onMouseEnter,
		onCompleteToggle,
		onEditingTitleChange,
		onSaveEdit,
		onCancelEdit,
		onRefresh,
		onOpenReminderModal,
		onDeleteReminder,
	} = props;

	return (
		<li
			className={`p-3 transition-colors ${isSelected ? "bg-red-50" : "bg-white"}`}
			onMouseEnter={onMouseEnter}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="space-y-2 flex-1">
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={onCompleteToggle}
							className={`h-5 w-5 rounded-full border ${task.status === "completed" ? "bg-green-500 border-green-500" : "border-zinc-300"}`}
							aria-label="Toggle complete"
						/>

						{isEditing ? (
							<input
								className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm"
								value={editingTitle}
								onChange={(event) => onEditingTitleChange(event.target.value)}
								onBlur={onSaveEdit}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										onSaveEdit();
									}
									if (event.key === "Escape") {
										onCancelEdit();
									}
								}}
							/>
						) : (
							<p
								className={`font-medium ${task.status === "completed" ? "line-through text-zinc-500" : "text-zinc-900"}`}
							>
								{task.title}
							</p>
						)}
					</div>

					<div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-600">
						<Badge
							variant="outline"
							className={cn(
								PRIORITY_BADGE_CLASSES[task.priority],
								"px-2 py-0.5 text-xs gap-1",
							)}
						>
							<Flag className="size-3" aria-hidden />P{task.priority}
						</Badge>
						<span>Due: {formatDateLabel(task.dueAt)}</span>
						<span>Scheduled: {formatDateLabel(task.scheduledAt)}</span>
						{task.recurrencePreset && (
							<span>Repeat: {task.recurrencePreset}</span>
						)}
						{task.recurrenceRRule && <span>RRULE: {task.recurrenceRRule}</span>}
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Select
							value={String(task.priority)}
							className="h-7 w-24 px-2 py-1 text-xs"
							onChange={async (event) => {
								const priority = Number(event.target.value) as Priority;
								await api.updateTask(task.id, { priority });
								await onRefresh();
							}}
							aria-label="Priority"
						>
							<option value="1">P1</option>
							<option value="2">P2</option>
							<option value="3">P3</option>
							<option value="4">P4</option>
						</Select>
						<TaskDatePicker
							value={task.dueAt}
							placeholder="Due date"
							className="h-7 w-37.5 px-2 py-1 text-xs"
							onChange={async (value) => {
								await api.updateTask(task.id, {
									dueAt: value,
								});
								await onRefresh();
							}}
							showRepeat={true}
							currentPreset={task.recurrencePreset}
							currentRRule={task.recurrenceRRule}
							onRecurrenceChange={async (preset, rrule) => {
								await api.updateTask(task.id, {
									recurrencePreset: preset,
									recurrenceRRule: rrule,
								});
								await onRefresh();
							}}
						/>
						<TaskDatePicker
							value={task.scheduledAt}
							placeholder="Scheduled date"
							className="h-7 w-42.5 px-2 py-1 text-xs"
							onChange={async (value) => {
								await api.updateTask(task.id, {
									scheduledAt: value,
								});
								await onRefresh();
							}}
						/>
					</div>

					{/* Reminders Section */}
					<div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-zinc-700">
								Reminders
							</span>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 w-6 p-0"
								onClick={onOpenReminderModal}
							>
								<Plus className="size-4" />
							</Button>
						</div>

						{taskReminders.length > 0 ? (
							<div className="space-y-2">
								{taskReminders.map((reminder) => (
									<div
										key={reminder.id}
										className="flex items-center gap-2 text-sm"
									>
										<Bell className="size-4 text-zinc-500" />
										<span className="text-zinc-900">
											{formatReminderDate(
												reminder.snoozedUntil ?? reminder.remindAt,
											)}
										</span>
										<button
											type="button"
											onClick={() => onDeleteReminder(reminder.id)}
											className="ml-auto text-xs text-zinc-500 hover:text-red-600"
										>
											Remove
										</button>
									</div>
								))}
							</div>
						) : (
							<p className="text-xs text-zinc-500">No reminders set</p>
						)}
					</div>
				</div>
			</div>
		</li>
	);
}
