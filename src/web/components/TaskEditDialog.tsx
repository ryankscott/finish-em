import { ArrowUpRight, Plus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatDateField } from "../lib/date-field";
import { useHotkeyScope } from "../lib/hotkeys";
import {
	useCalendarMutations,
	useProjects,
	useTaskMutations,
} from "../lib/queries";
import {
	newTaskDraft,
	resolveTaskDraft,
	type TaskDraft,
	taskToDraft,
} from "../lib/task-draft";
import { useIsMobile } from "../lib/use-is-mobile";
import { useKeyboardInset } from "../lib/use-viewport-inset";
import { useUi } from "../state/ui";
import { DelegatePanel } from "./DelegatePanel";
import { MeetingLinkField } from "./MeetingLinkField";
import { TaskFields } from "./TaskFields";
import { TaskReminderField } from "./TaskReminderField";

export function TaskEditDialog() {
	const ui = useUi();
	const formId = useId();
	const headingId = useId();
	const task = ui.editingTask;
	const isMobile = useIsMobile();
	const keyboardInset = useKeyboardInset();
	const { data: projects = [] } = useProjects();
	const { updateTask, completeTask } = useTaskMutations();
	const { linkTaskToEvent } = useCalendarMutations();
	const [draft, setDraft] = useState<TaskDraft>(() => newTaskDraft(0));
	const [calendarEventUid, setCalendarEventUid] = useState<string | null>(null);
	const [error, setError] = useState("");
	const titleRef = useRef<HTMLTextAreaElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!task) return;
		setDraft(taskToDraft(task));
		setCalendarEventUid(task.calendarEventUid ?? null);
		setError("");
	}, [task]);
	useEffect(() => {
		if (task && !isMobile)
			requestAnimationFrame(() => closeRef.current?.focus());
	}, [task, isMobile]);
	const submit = (complete = false) => {
		if (!task || updateTask.isPending || completeTask.isPending) return;
		const result = resolveTaskDraft(draft, projects, task);
		if (result.error) {
			setError(result.error);
			return;
		}
		if (!result.input) return;
		updateTask.mutate(
			{
				taskId: task.id,
				before: task,
				input: {
					...result.input,
					dueTimezone: result.input.dueTimezone ?? undefined,
				},
			},
			{
				onSuccess: (saved) => {
					if (complete)
						completeTask.mutate(saved, {
							onSuccess: () => {
								toast.success(
									saved.status === "completed"
										? "Task reopened"
										: "Task completed",
								);
								ui.closeTaskEditor();
							},
							onError: (err) => setError(err.message),
						});
					else {
						toast.success("Changes saved");
						ui.closeTaskEditor();
					}
				},
				onError: (err) => setError(err.message),
			},
		);
	};
	useHotkeyScope(
		{ escape: () => ui.closeTaskEditor(), "mod+enter": () => submit() },
		{ enabled: task !== null, allowInInput: true },
	);
	const linkMeeting = (event: { uid: string; startAt: string } | null) => {
		if (!task) return;
		const eventUid = event?.uid ?? null;
		linkTaskToEvent.mutate(
			{ taskId: task.id, eventUid },
			{
				onSuccess: () => {
					setCalendarEventUid(eventUid);
					if (event)
						setDraft((prev) => ({
							...prev,
							due: formatDateField(event.startAt),
						}));
					toast.success(event ? "Linked to meeting" : "Meeting unlinked");
				},
				onError: (err) => setError(err.message),
			},
		);
	};
	const fields = (
		<form
			id={formId}
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<TaskFields
				value={draft}
				onChange={setDraft}
				projects={projects}
				titleRef={titleRef}
				afterNotes={task && <DelegatePanel task={task} />}
				advancedContent={
					task && (
						<>
							<TaskReminderField taskId={task.id} />
							<div className="flex flex-col gap-2">
								<span className="text-xs text-muted">Link to meeting</span>
								<MeetingLinkField
									value={calendarEventUid}
									onChange={linkMeeting}
								/>
							</div>
							<button
								type="button"
								onClick={() => {
									ui.closeTaskEditor();
									ui.openQuickAdd({ parentTask: task });
								}}
								className="flex min-h-11 items-center gap-2 text-xs text-muted"
							>
								<Plus className="size-4" />
								Add subtask
							</button>
						</>
					)
				}
			/>
			{error && (
				<p role="alert" className="mt-3 text-sm text-p1">
					{error}
				</p>
			)}
		</form>
	);
	const pending = updateTask.isPending || completeTask.isPending;
	const footer = (
		<div className="flex items-center justify-between gap-3 pt-5">
			<button
				type="button"
				disabled={pending}
				onClick={() => submit(true)}
				className="min-h-11 text-xs text-muted disabled:opacity-50"
			>
				{task?.status === "completed" ? "Reopen task" : "Mark complete"}
			</button>
			<Button type="submit" form={formId} disabled={pending}>
				{pending ? "Saving…" : "Save changes"}
				<ArrowUpRight className="size-4" />
			</Button>
		</div>
	);
	if (isMobile)
		return (
			<Sheet
				open={task !== null}
				onOpenChange={(next) => !next && ui.closeTaskEditor()}
			>
				<SheetContent
					side="bottom"
					showClose={false}
					aria-describedby={undefined}
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						closeRef.current?.focus();
					}}
					className="flex h-[100dvh] max-h-none flex-col rounded-none bg-surface-raised p-0"
					style={
						keyboardInset > 0
							? {
									bottom: keyboardInset,
									height: `calc(100dvh - ${keyboardInset}px)`,
								}
							: undefined
					}
				>
					<header className="flex shrink-0 items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
						<SheetTitle className="text-lg">Task details</SheetTitle>
						<button
							ref={closeRef}
							type="button"
							onClick={() => ui.closeTaskEditor()}
							className="min-h-11 px-2 text-xs text-muted"
						>
							Cancel
						</button>
					</header>
					<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3">
						{fields}
					</div>
					<div className="shrink-0 border-t border-border px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
						{footer}
					</div>
				</SheetContent>
			</Sheet>
		);
	if (!task) return null;
	return (
		<aside
			className="task-editor-panel flex h-full flex-col"
			aria-labelledby={headingId}
		>
			<header className="flex shrink-0 items-center justify-between gap-3 px-6 pt-5 pb-4">
				<h2 id={headingId} className="text-[15px] font-medium tracking-tight">
					Task details
				</h2>
				<button
					ref={closeRef}
					type="button"
					aria-label="Close task details"
					onClick={() => ui.closeTaskEditor()}
					className="flex size-10 items-center justify-center rounded-xl text-muted hover:bg-surface"
				>
					<X className="size-4" />
				</button>
			</header>
			<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-3">
				{fields}
			</div>
			<div className="shrink-0 border-t border-border px-6 pb-5">{footer}</div>
		</aside>
	);
}
