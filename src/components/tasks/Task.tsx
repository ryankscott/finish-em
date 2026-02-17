import { format,  parseISO } from "date-fns";
import {  CalendarClock, Check, Flag, Pencil, Repeat } from "lucide-react";
import { useEffect, useState } from "react";
import { TaskDatePicker } from "@/components/tasks/TaskDatePicker";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
	SelectRoot,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select-v2";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import type { Priority, Reminder, Task as TaskType, RecurrencePreset } from "@/server/types";

export const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
	1: "fill-red-600 stroke-red-600 red-600 border-red-600 ",
	2: "fill-amber-500 stroke-amber-500 amber-500 border-amber-500 ",
	3: "fill-blue-600 stroke-blue-600 blue-600 border-blue-600 ",
	4: "fill-slate-200 stroke-slate-200 slate-200 border-slate-200 ",
};

interface TaskProps {
	task: TaskType;
	isSelected: boolean;
	isEditing: boolean;
	editingTitle: string;
	taskReminders: Reminder[];
	onMouseEnter: () => void;
	onCompleteToggle: () => Promise<void>;
	onEnterEditMode: () => void;
	onExitEditMode: () => void;
	onEditingTitleChange: (title: string) => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
	onRefresh: () => Promise<void> | void;
	onOpenReminderModal: () => void;
	onDeleteReminder: (reminderId: number) => Promise<void>;
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
		onEnterEditMode,
		onExitEditMode,
		onEditingTitleChange,
		onSaveEdit,
		onCancelEdit,
		onRefresh,
		onOpenReminderModal,
		onDeleteReminder,
	} = props;

	const [editingDescription, setEditingDescription] = useState(task.notes);

	useEffect(() => {
		setEditingDescription(task.notes);
	}, [task.id, task.notes]);

	const handleDescriptionSave = async () => {
		const notes = editingDescription.trim();
		await api.updateTask(task.id, { notes });
		await onRefresh();
	};

	const formatFullDate = (dateString: string | null | undefined) => {
		if (!dateString) return null;
		return format(parseISO(dateString), "EEEE, MMMM d, yyyy HH:mm");
	};

	const getPriorityLabel = (priority: Priority) => {
		const labels = {
			1: "Urgent",
			2: "High",
			3: "Medium",
			4: "Low"
		};
		return labels[priority];
	};

	const getRecurrenceLabel = () => {
		if (task.recurrencePreset) {
			const labels: Record<NonNullable<RecurrencePreset>, string> = {
				daily: "Daily",
				weekly: "Weekly",
				monthly: "Monthly",
				yearly: "Yearly",
				every_weekday: "Every weekday"
			};
			return labels[task.recurrencePreset];
		}
		if (task.recurrenceRRule) {
			return "Custom recurrence";
		}
		return null;
	};

	return (
		<TooltipProvider>
		<li
			className={`p-3 transition-colors ${isSelected ? "bg-red-50" : "bg-white"}`}
			onMouseEnter={onMouseEnter}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="space-y-2 flex-1">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2 flex-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={onCompleteToggle}
									className={`h-5 w-5 rounded-full border p-0 hover:bg-transparent ${PRIORITY_BADGE_CLASSES[task.priority]}`}
									aria-label="Toggle complete"
								/>
							</TooltipTrigger>
							<TooltipContent>
								{task.status === "completed" ? "Mark as incomplete" : "Mark as complete"}
							</TooltipContent>
						</Tooltip>
							{isEditing ? (
								<input
									className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm"
									value={editingTitle}
									onChange={(event) => onEditingTitleChange(event.target.value)}
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
								<div className="flex-1">
									<p
										className={`font-medium ${task.status === "completed" ? "line-through text-zinc-500" : "text-zinc-900"}`}
									>
										{task.title}
									</p>
									{task.notes && (
										<p className="text-xs text-zinc-500 mt-1 whitespace-pre-wrap">
											{task.notes}
										</p>
									)}
								</div>
							)}

						</div>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-7 gap-1 px-2 text-xs"
									onClick={isEditing ? onExitEditMode : onEnterEditMode}
								>
									{isEditing ? <Check className="size-3" /> : <Pencil className="size-3" />}
									{isEditing ? "Save" : "Edit"}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{isEditing ? "Save changes" : "Edit task details"}
							</TooltipContent>
						</Tooltip>
					</div>
{/* Description editing in edit mode */}
					{isEditing && (
						<div className="space-y-1">
							<label className="text-xs text-zinc-600">Description</label>
							<Textarea
								value={editingDescription}
								onChange={(event) => setEditingDescription(event.target.value)}
								onBlur={handleDescriptionSave}
								className="min-h-16 text-xs"
								placeholder="Add a description..."
							/>
						</div>
					)}

					<div className="flex flex-wrap items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<SelectRoot
									value={String(task.priority)}
									onValueChange={async (value) => {
										if (!isEditing) {
											return;
										}
										const priority = Number(value) as Priority;
										await api.updateTask(task.id, { priority });
										await onRefresh();
									}}
								>
									<SelectTrigger
										disabled={!isEditing}
										className="h-7 w-18 px-2 py-1 text-xs"
										aria-label="Priority"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: 4 }, (_, i) => i + 1).map((priority) => (
											<SelectItem key={priority} value={String(priority)}>
												<div className="flex items-center gap-1">
													<Flag
														className={`size-3 ${PRIORITY_BADGE_CLASSES[priority as Priority]}`}
														aria-hidden="true"
													/>
													P{priority}
												</div>
											</SelectItem>
										))}
									</SelectContent>
  								</SelectRoot>
							</TooltipTrigger>
							<TooltipContent>
								Priority: {getPriorityLabel(task.priority)}
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<TaskDatePicker
										value={task.dueAt}
										placeholder="Due date"
										className="h-7 w-24 px-2 py-1 text-xs"
										disabled={!isEditing}
										onChange={async (value) => {
											if (!isEditing) {
												return;
											}
											await api.updateTask(task.id, {
												dueAt: value,
											});
											await onRefresh();
										}}
										showRepeat={true}
										currentPreset={task.recurrencePreset}
										currentRRule={task.recurrenceRRule}
										onRecurrenceChange={async (preset, rrule) => {
											if (!isEditing) {
												return;
											}
											await api.updateTask(task.id, {
												recurrencePreset: preset,
												recurrenceRRule: rrule,
											});
											await onRefresh();
										}}
										icon={
											(task.recurrencePreset || task.recurrenceRRule) ? (
												<Repeat className="mr-2 h-4 w-4" />
											) : (
												<CalendarClock className="mr-2 h-4 w-4" />
											)
										}
									/>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								{task.dueAt ? (
									<>
										Due: {formatFullDate(task.dueAt)}
										{(task.recurrencePreset || task.recurrenceRRule) && (
											<div className="text-xs opacity-80 mt-1">
												Recurs: {getRecurrenceLabel()}
											</div>
										)}
									</>
								) : "No due date set"}
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<TaskDatePicker
										value={task.scheduledAt}
										placeholder="Scheduled date"
										className="h-7 w-24 px-2 py-1 text-xs"
										disabled={!isEditing}
										onChange={async (value) => {
											if (!isEditing) {
												return;
											}
											await api.updateTask(task.id, {
												scheduledAt: value,
											});
											await onRefresh();
										}}
									/>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								{task.scheduledAt ? `Scheduled: ${formatFullDate(task.scheduledAt)}` : "No scheduled date set"}
							</TooltipContent>
						</Tooltip>
					</div>



				</div>
			</div>
		</li>
		</TooltipProvider>
	);
}
