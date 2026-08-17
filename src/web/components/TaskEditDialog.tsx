import { ChevronRight, Plus, Sparkles } from "lucide-react";
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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { RecurrencePreset } from "@/server/types";
import { cn } from "../lib/cn";
import { formatDateField, resolveDateField } from "../lib/date-field";
import { useHotkeyScope } from "../lib/hotkeys";
import {
	useCalendarMutations,
	useProjects,
	useTaskMutations,
} from "../lib/queries";
import { useIsMobile } from "../lib/use-is-mobile";
import { useKeyboardInset } from "../lib/use-viewport-inset";
import { useUi } from "../state/ui";
import { DateField } from "./DateField";
import { MeetingLinkField } from "./MeetingLinkField";
import { PriorityFlag } from "./PriorityFlag";
import { ProjectPickerSheet } from "./ProjectPickerSheet";
import { RecurrenceSelector } from "./RecurrenceSelector";
import { TaskReminderField } from "./TaskReminderField";

const PRIORITY_LABELS: Record<number, string> = {
	1: "Urgent",
	2: "High",
	3: "Normal",
	4: "Low",
};

// claude:// opens Claude Desktop directly; q is prefilled into the prompt
// field there (truncated by the app at ~14k chars, so clamp well under that).
function buildClaudeDelegateHref(
	title: string,
	projectName: string | undefined,
	dueLabel: string,
	notes: string,
): string {
	const lines = [`Task: ${title}`];
	if (projectName) lines.push(`Project: ${projectName}`);
	if (dueLabel) lines.push(`Due: ${dueLabel}`);
	if (notes.trim()) lines.push("", notes.trim());
	const prompt = lines.join("\n").slice(0, 8000);
	return `claude://claude.ai/new?q=${encodeURIComponent(prompt)}`;
}

export function TaskEditDialog() {
	const ui = useUi();
	const isMobile = useIsMobile();
	const keyboardInset = useKeyboardInset();
	const { data: projects = [] } = useProjects();
	const { updateTask } = useTaskMutations();
	const { linkTaskToEvent } = useCalendarMutations();
	const task = ui.editingTask;
	const [projectPickerOpen, setProjectPickerOpen] = useState(false);

	const [title, setTitle] = useState("");
	const [calendarEventUid, setCalendarEventUid] = useState<string | null>(null);
	const [projectId, setProjectId] = useState<number>(0);
	const [priority, setPriority] = useState<number>(4);
	const [due, setDue] = useState("");
	const [scheduled, setScheduled] = useState("");
	const [recurrencePreset, setRecurrencePreset] =
		useState<RecurrencePreset>(null);
	const [recurrenceRRule, setRecurrenceRRule] = useState<string | null>(null);
	const [notes, setNotes] = useState("");
	const [someday, setSomeday] = useState(false);

	useEffect(() => {
		if (!task) return;
		setTitle(task.title);
		setProjectId(task.projectId);
		setPriority(task.priority);
		setDue(formatDateField(task.dueAt));
		setScheduled(formatDateField(task.scheduledAt));
		setRecurrencePreset(task.recurrencePreset ?? null);
		setRecurrenceRRule(task.recurrenceRRule ?? null);
		setNotes(task.notes);
		setSomeday(task.someday);
		setCalendarEventUid(task.calendarEventUid ?? null);
	}, [task]);

	const onLinkMeeting = (event: { uid: string; startAt: string } | null) => {
		if (!task) return;
		const eventUid = event ? event.uid : null;
		setCalendarEventUid(eventUid);
		// Linking pins the due date to the meeting start; reflect it in the field
		// so saving the task keeps the dates consistent.
		if (event) setDue(formatDateField(event.startAt));
		linkTaskToEvent.mutate(
			{ taskId: task.id, eventUid },
			{
				onSuccess: () =>
					toast.success(event ? "Linked to meeting" : "Meeting unlinked"),
				onError: (err) => toast.error(err.message),
			},
		);
	};

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
				before: task,
				input: {
					title: title.trim(),
					projectId,
					priority: priority as 1 | 2 | 3 | 4,
					dueAt,
					scheduledAt,
					recurrencePreset,
					recurrenceRRule,
					notes,
					someday,
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

	const selectedProject = projects.find((p) => p.id === projectId);
	const twoCol = isMobile ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3";

	const fields = (
		<div className={cn("flex flex-col", isMobile ? "gap-4" : "gap-3")}>
			<div className="flex flex-col gap-1">
				<Label>Title</Label>
				<Input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					// Autofocus on a phone opens the keyboard over the form before the
					// user has seen what they're editing.
					autoFocus={!isMobile}
					className={isMobile ? "h-11 text-base" : undefined}
					// Titles routinely start with lowercase token-like words (e.g. a
					// pasted "project:Work" fragment); iOS's default autocapitalize
					// keeps "fixing" that, same as QuickAdd's editor.
					autoCorrect="off"
					autoCapitalize="off"
					spellCheck={false}
				/>
			</div>
			<div className={twoCol}>
				<div className="flex flex-col gap-1">
					<Label>Project</Label>
					{isMobile ? (
						// Same searchable sheet quick-add uses: a Radix Select listing 13
						// projects with 40-character names is unusable on a phone.
						<button
							type="button"
							onClick={() => setProjectPickerOpen(true)}
							className="flex min-h-11 w-full items-center gap-2 rounded-md border border-border px-3 text-left text-base"
						>
							<span className="shrink-0">{selectedProject?.emoji ?? "●"}</span>
							<span className="min-w-0 flex-1 truncate">
								{selectedProject?.name ?? "Choose project"}
							</span>
							<ChevronRight className="h-4 w-4 shrink-0 text-muted" />
						</button>
					) : (
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
					)}
				</div>
				<div className="flex flex-col gap-1">
					<Label>Priority</Label>
					{isMobile ? (
						// Four options fit as buttons, which beats opening a select just
						// to move between them.
						<div className="flex gap-1.5">
							{[1, 2, 3, 4].map((p) => (
								<button
									key={p}
									type="button"
									onClick={() => setPriority(p)}
									aria-pressed={priority === p}
									className={cn(
										"flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border text-sm",
										priority === p
											? "border-accent bg-accent/15 text-foreground"
											: "border-border text-muted",
									)}
								>
									<PriorityFlag priority={p} />
									{PRIORITY_LABELS[p]}
								</button>
							))}
						</div>
					) : (
						<Select
							value={String(priority)}
							onValueChange={(v) => setPriority(Number(v))}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[1, 2, 3, 4].map((p) => (
									<SelectItem key={p} value={String(p)}>
										<div className="flex items-center gap-2">
											<PriorityFlag priority={p} />
											<span>{PRIORITY_LABELS[p]}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>
			</div>
			<div className={twoCol}>
				<div className="flex flex-col gap-1">
					<Label>Due date</Label>
					<DateField value={due} onChange={setDue} />
				</div>
				<div className="flex flex-col gap-1">
					<Label>Scheduled date</Label>
					<DateField value={scheduled} onChange={setScheduled} />
				</div>
			</div>
			<div className={twoCol}>
				<div className="flex flex-col gap-1">
					<Label>Recurrence</Label>
					<RecurrenceSelector
						value={{
							preset: recurrencePreset,
							rrule: recurrenceRRule,
							startDate: due,
						}}
						startDate={due}
						onChange={({ preset, rrule, startDate }) => {
							setRecurrencePreset(preset);
							setRecurrenceRRule(rrule);
							if (startDate) setDue(startDate);
						}}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<Label htmlFor="task-someday">Someday</Label>
					<div
						className={cn("flex items-center gap-2", isMobile ? "h-11" : "h-9")}
					>
						<Switch
							id="task-someday"
							checked={someday}
							onCheckedChange={setSomeday}
						/>
						<label
							htmlFor="task-someday"
							className="cursor-pointer text-sm text-muted"
						>
							Park in Someday
						</label>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<Label>Link to meeting</Label>
				<MeetingLinkField value={calendarEventUid} onChange={onLinkMeeting} />
			</div>
			<div className="flex flex-col gap-1">
				<Label>Notes</Label>
				<Textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					rows={3}
					className={isMobile ? "text-base" : undefined}
				/>
			</div>
			{task ? <TaskReminderField taskId={task.id} /> : null}
			{isMobile && task ? (
				// Stands in for the `s` hotkey, which is the only way to add a subtask
				// on desktop and therefore unreachable on a phone.
				<button
					type="button"
					onClick={() => {
						const parent = task;
						ui.closeTaskEditor();
						ui.openQuickAdd({ parentTask: parent });
					}}
					className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-border text-sm text-muted"
				>
					<Plus className="h-4 w-4" />
					Add subtask
				</button>
			) : null}
			{task ? (
				<a
					href={buildClaudeDelegateHref(
						title,
						selectedProject?.name,
						due,
						notes,
					)}
					className={cn(
						"flex items-center justify-center gap-2 rounded-md border border-border text-sm text-muted hover:bg-surface hover:text-foreground",
						isMobile ? "min-h-11" : "px-3 py-2",
					)}
				>
					<Sparkles className="h-4 w-4" />
					Delegate to Claude
				</a>
			) : null}
		</div>
	);

	const picker =
		isMobile && task ? (
			<ProjectPickerSheet
				open={projectPickerOpen}
				onOpenChange={setProjectPickerOpen}
				projects={projects}
				selectedId={projectId}
				onSelect={(project) => setProjectId(project.id)}
			/>
		) : null;

	if (isMobile) {
		return (
			<>
				<Sheet
					open={task !== null}
					onOpenChange={(open) => !open && ui.closeTaskEditor()}
				>
					<SheetContent
						side="bottom"
						showClose={false}
						className="flex h-dvh max-h-none flex-col rounded-none p-0"
						style={
							keyboardInset > 0 ? { bottom: `${keyboardInset}px` } : undefined
						}
						aria-describedby={undefined}
					>
						<div className="flex shrink-0 items-center justify-between border-b border-border px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
							<SheetTitle>Edit task</SheetTitle>
							<button
								type="button"
								onClick={() => ui.closeTaskEditor()}
								className="min-h-9 px-2 text-sm text-muted"
							>
								Cancel
							</button>
						</div>
						<div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
							{fields}
						</div>
						{/* Pinned: the form is taller than a phone screen, and Save
						    shouldn't require scrolling to the bottom to find. */}
						<div className="shrink-0 border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
							<button
								type="button"
								onClick={submit}
								className="min-h-[44px] w-full rounded-md bg-accent font-medium text-background"
							>
								Save task
							</button>
						</div>
					</SheetContent>
				</Sheet>
				{picker}
			</>
		);
	}

	return (
		<Dialog
			open={task !== null}
			onOpenChange={(open) => !open && ui.closeTaskEditor()}
		>
			<DialogContent className="w-full max-w-xl">
				<DialogHeader>
					<DialogTitle>Edit task</DialogTitle>
				</DialogHeader>
				<div className="mt-4">{fields}</div>
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
