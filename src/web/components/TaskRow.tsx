import { format, parseISO } from "date-fns";
import {
	Bell,
	BellRing,
	Check,
	ChevronDown,
	ChevronRight,
	Clock,
	Repeat,
	RotateCcw,
	Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { isOverdueDueDate } from "@/lib/datetime";
import type { Project, Task } from "@/server/types";

import { cn } from "../lib/cn";
import { formatMinutes, taskEstimate } from "../lib/day-plan";
import { useAllReminders, useTaskMutations } from "../lib/queries";
import { reminderTime } from "../lib/reminders";
import { useUndo } from "../lib/undo";
import { useIsMobile } from "../lib/use-is-mobile";
import { useUi } from "../state/ui";
import { DateField } from "./DateField";
import { InlineText } from "./InlineText";
import { PriorityFlag } from "./PriorityFlag";

// Distance a swipe needs to travel before release commits the action, and the
// rubber-band ceiling past that -- dragging further doesn't do anything more,
// it just resists, so the gesture doesn't feel like it's flown off the rails.
const SWIPE_THRESHOLD = 72;
const SWIPE_MAX = 96;

/**
 * Touch-only swipe-to-complete (right) / swipe-to-delete (left), the mobile
 * substitute for the `x` / `d` hotkeys -- there's no keyboard on a phone, and
 * before this a task row had no tap or gesture affordance at all on touch.
 * Vertical list scroll wins until a drag clearly commits to the horizontal
 * axis, so this can't fight the page's own scroll gesture.
 */
function useSwipeActions(task: Task, enabled: boolean) {
	const { completeTask, deleteTask } = useTaskMutations();
	const { undoLast } = useUndo();
	const [dragX, setDragX] = useState(0);
	const [dragging, setDragging] = useState(false);
	const gestureRef = useRef<{ x: number; y: number; locked: boolean } | null>(
		null,
	);
	const swipedRef = useRef(false);

	if (!enabled) {
		return {
			dragX: 0,
			dragging: false,
			consumeSwipe: () => false,
			handlers: {},
		};
	}

	const withUndo = (message: string) => ({
		onSuccess: () =>
			toast.success(message, {
				action: { label: "Undo", onClick: () => undoLast() },
			}),
		onError: (err: unknown) =>
			toast.error(err instanceof Error ? err.message : String(err)),
	});

	function commit(direction: 1 | -1) {
		if (direction === 1) {
			completeTask.mutate(
				task,
				withUndo(
					task.status === "completed" ? "Task reopened" : "Task completed",
				),
			);
		} else {
			deleteTask.mutate(task, withUndo("Task deleted"));
		}
	}

	function handlePointerDown(e: React.PointerEvent) {
		if (
			e.pointerType === "mouse" ||
			(e.target as HTMLElement).closest("button, a, input")
		)
			return;
		gestureRef.current = { x: e.clientX, y: e.clientY, locked: false };
	}

	function handlePointerMove(e: React.PointerEvent) {
		const gesture = gestureRef.current;
		if (!gesture) return;
		const dx = e.clientX - gesture.x;
		const dy = e.clientY - gesture.y;
		if (!gesture.locked) {
			if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
			if (Math.abs(dy) > Math.abs(dx)) {
				// Vertical intent -- let the page scroll, this gesture is done.
				gestureRef.current = null;
				return;
			}
			gesture.locked = true;
			setDragging(true);
			// currentTarget (the row itself), not target (whichever child the
			// finger happens to be over) -- and capture can throw for pointer
			// ids the browser doesn't consider active, which should never lose
			// the gesture over.
			try {
				e.currentTarget.setPointerCapture(e.pointerId);
			} catch {
				// Gesture still tracks via the move/up handlers either way.
			}
		}
		e.preventDefault();
		setDragX(Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, dx)));
	}

	function handlePointerEnd() {
		const gesture = gestureRef.current;
		gestureRef.current = null;
		setDragging(false);
		if (!gesture?.locked) {
			setDragX(0);
			return;
		}
		// A completed swipe is followed by a click event on the row. Flag it so
		// the row's tap-to-edit handler can ignore that one, otherwise every
		// swipe would also pop the editor open.
		swipedRef.current = true;
		if (dragX >= SWIPE_THRESHOLD) commit(1);
		else if (dragX <= -SWIPE_THRESHOLD) commit(-1);
		setDragX(0);
	}

	return {
		dragX,
		dragging,
		/** True (once) if the click now arriving was the tail of a swipe. */
		consumeSwipe: () => {
			const was = swipedRef.current;
			swipedRef.current = false;
			return was;
		},
		handlers: {
			onPointerDown: handlePointerDown,
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerEnd,
			onPointerCancel: handlePointerEnd,
		},
	};
}

export function TaskRow({
	task,
	project,
	selected,
	depth,
	hasSubtasks,
	expanded,
	showProject,
	onOpen,
	onToggleExpand,
}: {
	task: Task;
	project: Project | undefined;
	selected: boolean;
	depth: number;
	hasSubtasks: boolean;
	expanded: boolean;
	showProject: boolean;
	/** Tap-to-edit on touch, where the `e` / enter hotkeys don't exist. */
	onOpen?: () => void;
	/** Chevron tap target, standing in for the `space` hotkey. */
	onToggleExpand?: () => void;
}) {
	const completed = task.status === "completed";
	const { data: reminders = [] } = useAllReminders();
	const { completeTask, updateTask } = useTaskMutations();
	const { undoLast } = useUndo();
	const ui = useUi();
	const reminder = reminders.find((r) => r.taskId === task.id);
	const isMobile = useIsMobile();
	const swipeEnabled = isMobile && !task.deletedAt;
	const { dragX, dragging, consumeSwipe, handlers } = useSwipeActions(
		task,
		swipeEnabled,
	);
	const editing = ui.editingTask?.id === task.id;
	const row = (
		// biome-ignore lint/a11y/noStaticElementInteractions: the row has native completion and edit buttons; clicking its non-interactive space also edits it.
		// biome-ignore lint/a11y/useKeyWithClickEvents: native child buttons and the list keyboard scope provide keyboard equivalents.
		<div
			data-selected={selected || undefined}
			className={cn(
				"group flex min-h-[76px] items-start gap-1 border-b border-border py-3.5 pr-1",
				editing && "rounded-lg bg-accent-soft",
				swipeEnabled && "bg-background touch-pan-y",
			)}
			style={{
				paddingLeft: `${depth * 16}px`,
				transform: swipeEnabled ? `translateX(${dragX}px)` : undefined,
				transition:
					swipeEnabled && !dragging
						? "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)"
						: undefined,
			}}
			onClick={(e) => {
				if (
					(e.target as HTMLElement).closest("button, a, input, [role=dialog]")
				)
					return;
				if (!consumeSwipe()) onOpen?.();
			}}
			{...handlers}
		>
			{hasSubtasks && (
				<button
					type="button"
					aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
					aria-expanded={expanded}
					onClick={(e) => {
						e.stopPropagation();
						onToggleExpand?.();
					}}
					className="flex h-11 w-6 shrink-0 items-center justify-center text-muted"
				>
					{expanded ? (
						<ChevronDown className="size-3.5" />
					) : (
						<ChevronRight className="size-3.5" />
					)}
				</button>
			)}
			<button
				type="button"
				aria-label={`${completed ? "Reopen" : "Complete"} ${task.title}`}
				aria-pressed={completed}
				disabled={!!task.deletedAt || completeTask.isPending}
				onClick={(e) => {
					e.stopPropagation();
					completeTask.mutate(task, {
						onSuccess: () =>
							toast.success(completed ? "Task reopened" : "Task completed", {
								action: { label: "Undo", onClick: () => void undoLast() },
							}),
						onError: (err) => toast.error(err.message),
					});
				}}
				className="-mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl disabled:opacity-40"
			>
				<span
					className={cn(
						"flex size-[21px] items-center justify-center rounded-[7px] border-[1.5px]",
						completed
							? "border-accent bg-accent text-accent-foreground"
							: "border-muted/70",
					)}
				>
					{completed && <Check className="size-3.5" />}
				</span>
			</button>
			<div className="min-w-0 flex-1">
				<div className="flex items-start gap-2">
					<span
						className={cn(
							"min-w-0 flex-1 break-words text-sm leading-relaxed",
							completed && "text-muted line-through",
						)}
					>
						<InlineText text={task.title} />
					</span>
					<button
						type="button"
						aria-label={`Edit ${task.title}`}
						onClick={(e) => {
							e.stopPropagation();
							onOpen?.();
						}}
						className="sr-only text-muted focus:not-sr-only focus:flex focus:size-8 focus:items-center focus:justify-center"
					>
						<ChevronRight className="size-4" />
					</button>
				</div>
				<div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted">
					{showProject && project && (
						<span>
							{project.emoji ? `${project.emoji} ` : ""}
							{project.name}
						</span>
					)}
					<span
						className={cn(
							"flex items-center gap-1",
							task.estimateMinutes === null && "opacity-60",
						)}
					>
						{formatMinutes(taskEstimate(task))}
					</span>
					{task.scheduledAt && (
						<span>
							<DateField
								compact
								value={format(parseISO(task.scheduledAt), "yyyy-MM-dd")}
								aria-label="Scheduled date"
								onChange={(value) =>
									updateTask.mutate(
										{
											taskId: task.id,
											before: task,
											input: {
												scheduledAt: value
													? new Date(`${value}T00:00:00`).toISOString()
													: null,
											},
										},
										{ onError: (err) => toast.error(err.message) },
									)
								}
								dateOnly
							/>
						</span>
					)}
					{task.plannedStartAt && (
						<span className="text-accent">
							{format(parseISO(task.plannedStartAt), "HH:mm")}
						</span>
					)}
					{task.dueAt && (
						<span
							className={cn(
								"flex items-center gap-1",
								!completed && isOverdueDueDate(task.dueAt) && "text-p1",
							)}
						>
							<Clock className="size-3" />
							Due {format(parseISO(task.dueAt), "d MMM")}
						</span>
					)}
					{reminder && !completed && (
						<span
							className={cn(
								"flex items-center gap-1",
								reminder.status === "fired" && "text-p1",
							)}
						>
							{reminder.status === "fired" ? (
								<BellRing className="size-3" />
							) : (
								<Bell className="size-3" />
							)}
							{format(reminderTime(reminder), "d MMM, h:mm a")}
						</span>
					)}
					{(task.recurrencePreset || task.recurrenceRRule) && (
						<Repeat className="size-3" aria-label="Repeating task" />
					)}
					{task.priority < 4 && <PriorityFlag priority={task.priority} />}
				</div>
			</div>
		</div>
	);
	if (!swipeEnabled) return row;
	return (
		<div className="relative overflow-hidden rounded-lg">
			<div
				aria-hidden
				className="absolute inset-0 flex items-center justify-start bg-accent pl-5 text-accent-foreground"
				style={{
					opacity: dragX > 0 ? Math.min(1, dragX / SWIPE_THRESHOLD) : 0,
				}}
			>
				{completed ? (
					<RotateCcw className="size-5" />
				) : (
					<Check className="size-5" />
				)}
			</div>
			<div
				aria-hidden
				className="absolute inset-0 flex items-center justify-end bg-p1 pr-5 text-background"
				style={{
					opacity: dragX < 0 ? Math.min(1, -dragX / SWIPE_THRESHOLD) : 0,
				}}
			>
				<Trash2 className="size-5" />
			</div>
			{row}
		</div>
	);
}
