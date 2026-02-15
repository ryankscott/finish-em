import { api } from "@/lib/api-client";
import { DatePicker } from "@/components/DatePicker";
import { Select } from "@/components/ui/select";
import { formatDateLabel } from "@/lib/datetime";

import type { Reminder, Task as TaskType } from "@/server/types";

type ReminderPreset =
	| "this_morning"
	| "this_evening"
	| "tomorrow_morning"
	| "next_week";

interface TaskProps {
	task: TaskType;
	isSelected: boolean;
	isEditing: boolean;
	editingTitle: string;
	taskReminder: Reminder | null;
	selectedReminderPreset: ReminderPreset | "";
	onMouseEnter: () => void;
	onCompleteToggle: () => Promise<void>;
	onEditingTitleChange: (title: string) => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
	onRefresh: () => Promise<void> | void;
	onAddReminder: (preset: ReminderPreset) => void;
	onSnooze: (reminderId: number, preset: ReminderPreset) => void;
}

export function Task(props: TaskProps) {
	const {
		task,
		isSelected,
		isEditing,
		editingTitle,
		taskReminder,
		selectedReminderPreset,
		onMouseEnter,
		onCompleteToggle,
		onEditingTitleChange,
		onSaveEdit,
		onCancelEdit,
		onRefresh,
		onAddReminder,
		onSnooze,
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
								autoFocus
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
						<span className="rounded bg-zinc-100 px-2 py-0.5">
							P{task.priority}
						</span>
						<span>Due: {formatDateLabel(task.dueAt)}</span>
						<span>Scheduled: {formatDateLabel(task.scheduledAt)}</span>
						{task.recurrencePreset && (
							<span>Repeat: {task.recurrencePreset}</span>
						)}
						{task.recurrenceRRule && <span>RRULE: {task.recurrenceRRule}</span>}
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<DatePicker
							value={task.dueAt}
							placeholder="Due date"
							className="h-7 w-37.5 px-2 py-1 text-xs"
							onChange={async (value) => {
								await api.updateTask(task.id, {
									dueAt: value,
								});
								await onRefresh();
							}}
						/>
						<DatePicker
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
						<Select
							value={selectedReminderPreset}
							className="h-7 w-44 px-2 py-1 text-xs"
							onChange={(event) => {
								const preset = event.target.value as
									| ""
									| "this_morning"
									| "this_evening"
									| "tomorrow_morning"
									| "next_week";
								if (!preset) {
									return;
								}
								onAddReminder(preset);
							}}
						>
							<option value="">Add reminder...</option>
							<option value="this_morning">This morning</option>
							<option value="this_evening">This evening</option>
							<option value="tomorrow_morning">Tomorrow morning</option>
							<option value="next_week">Next week</option>
						</Select>
					</div>

					{taskReminder && (
						<div className="rounded border border-zinc-200 bg-zinc-50 p-2 text-xs">
							<div className="flex items-center justify-between gap-2">
								<span>
									{new Date(
										taskReminder.snoozedUntil ?? taskReminder.remindAt,
									).toLocaleString()}{" "}
									({taskReminder.status})
								</span>
								<Select
									defaultValue=""
									className="h-6 w-40 px-2 text-xs"
									onChange={(event) => {
										const preset = event.target.value as
											| ""
											| "this_morning"
											| "this_evening"
											| "tomorrow_morning"
											| "next_week";
										if (!preset) {
											return;
										}
										onSnooze(taskReminder.id, preset);
										event.currentTarget.value = "";
									}}
								>
									<option value="">Snooze...</option>
									<option value="this_morning">This morning</option>
									<option value="this_evening">This evening</option>
									<option value="tomorrow_morning">Tomorrow morning</option>
									<option value="next_week">Next week</option>
								</Select>
							</div>
						</div>
					)}
				</div>
			</div>
		</li>
	);
}
