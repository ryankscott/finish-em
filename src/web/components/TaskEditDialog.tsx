import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { RecurrencePreset } from "@/server/types";

import { formatDateField, resolveDateField } from "../lib/date-field";
import { useHotkeyScope } from "../lib/hotkeys";
import { useProjects, useTaskMutations } from "../lib/queries";
import { useUi } from "../state/ui";
import { DateField } from "./DateField";
import { PriorityFlag } from "./PriorityFlag";
import { TaskReminderField } from "./TaskReminderField";

const RECURRENCE_OPTIONS: Array<{ value: string; label: string }> = [
	{ value: "__none__", label: "None" },
	{ value: "daily", label: "Daily" },
	{ value: "weekly", label: "Weekly" },
	{ value: "monthly", label: "Monthly" },
	{ value: "yearly", label: "Yearly" },
	{ value: "every_weekday", label: "Every weekday" },
];

export function TaskEditDialog() {
	const ui = useUi();
	const { data: projects = [] } = useProjects();
	const { updateTask } = useTaskMutations();
	const task = ui.editingTask;

	const [title, setTitle] = useState("");
	const [projectId, setProjectId] = useState<number>(0);
	const [priority, setPriority] = useState<number>(4);
	const [due, setDue] = useState("");
	const [scheduled, setScheduled] = useState("");
	const [recurrence, setRecurrence] = useState("");
	const [blockedReason, setBlockedReason] = useState("");
	const [notes, setNotes] = useState("");

	useEffect(() => {
		if (!task) return;
		setTitle(task.title);
		setProjectId(task.projectId);
		setPriority(task.priority);
		setDue(formatDateField(task.dueAt));
		setScheduled(formatDateField(task.scheduledAt));
		setRecurrence(task.recurrencePreset ?? "");
		setBlockedReason(task.blockedReason ?? "");
		setNotes(task.notes);
	}, [task]);

	const submit = () => {
		if (!task) return;
		if (!title.trim()) {
			toast.error("Title is required");
			return;
		}
		const dueAt = resolveDateField(due, task.dueAt);
		const scheduledAt = resolveDateField(scheduled, task.scheduledAt);
		if (dueAt === "invalid" || scheduledAt === "invalid") {
			toast.error(
				"Dates accept: today, tomorrow, monday, next week, 2026-07-01",
			);
			return;
		}
		updateTask.mutate(
			{
				taskId: task.id,
				input: {
					title: title.trim(),
					projectId,
					priority: priority as 1 | 2 | 3 | 4,
					dueAt,
					scheduledAt,
					recurrencePreset: (recurrence || null) as RecurrencePreset,
					blockedReason: blockedReason.trim() ? blockedReason.trim() : null,
					notes,
				},
			},
			{
				onSuccess: () => {
					toast.success("Task saved");
					ui.closeTaskEditor();
				},
				onError: (err) => toast.error(err.message),
			},
		);
	};

	useHotkeyScope(
		{
			escape: () => ui.closeTaskEditor(),
			"mod+enter": () => submit(),
		},
		{ enabled: task !== null, allowInInput: true },
	);

	return (
		<Dialog
			open={task !== null}
			onOpenChange={(open) => !open && ui.closeTaskEditor()}
		>
			<DialogContent className="w-full max-w-xl">
				<DialogHeader>
					<DialogTitle>Edit task</DialogTitle>
				</DialogHeader>
				<div className="mt-4 flex flex-col gap-3">
					<div className="flex flex-col gap-1">
						<Label>Title</Label>
						<Input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							autoFocus
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1">
							<Label>Project</Label>
							<Select
								value={String(projectId)}
								onValueChange={(v) => setProjectId(Number(v))}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{projects.map((project) => (
										<SelectItem key={project.id} value={String(project.id)}>
											{project.emoji ? `${project.emoji} ` : ""}
											{project.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label>Priority</Label>
							<Select
								value={String(priority)}
								onValueChange={(v) => setPriority(Number(v))}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1">
										<div className="flex items-center gap-2">
											<PriorityFlag priority={1} />
											<span>Urgent</span>
										</div>
									</SelectItem>
									<SelectItem value="2">
										<div className="flex items-center gap-2">
											<PriorityFlag priority={2} />
											<span>High</span>
										</div>
									</SelectItem>
									<SelectItem value="3">
										<div className="flex items-center gap-2">
											<PriorityFlag priority={3} />
											<span>Normal</span>
										</div>
									</SelectItem>
									<SelectItem value="4">
										<div className="flex items-center gap-2">
											<PriorityFlag priority={4} />
											<span>Low</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1">
							<Label>Due date</Label>
							<DateField value={due} onChange={setDue} />
						</div>
						<div className="flex flex-col gap-1">
							<Label>Scheduled date</Label>
							<DateField value={scheduled} onChange={setScheduled} />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1">
							<Label>Recurrence</Label>
							<Select
								value={recurrence || "__none__"}
								onValueChange={(v) => setRecurrence(v === "__none__" ? "" : v)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{RECURRENCE_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1">
							<Label>Blocked reason</Label>
							<Input
								value={blockedReason}
								onChange={(e) => setBlockedReason(e.target.value)}
								placeholder="Empty = not blocked"
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<Label>Notes</Label>
						<Textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
						/>
					</div>
					{task ? <TaskReminderField taskId={task.id} /> : null}
				</div>
				<div className="mt-4 flex items-center justify-end gap-3 text-xs text-muted">
					<span>esc to cancel · ⌘⏎ to save</span>
					<button
						type="button"
						onClick={submit}
						className="rounded-md bg-accent px-4 py-2 font-medium text-background"
					>
						Save task
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
