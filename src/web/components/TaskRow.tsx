import { format, parseISO } from "date-fns";
import {
	Calendar,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Circle,
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
import { useTaskMutations } from "../lib/queries";
import { useUndo } from "../lib/undo";
import { useIsMobile } from "../lib/use-is-mobile";
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
		if (e.pointerType === "mouse") return;
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
	const isMobile = useIsMobile();
	// Swiping to delete an already-deleted row (the Deleted view) doesn't mean
	// anything, so the gesture is only wired up everywhere else.
	const swipeEnabled = isMobile && !task.deletedAt;
	const { dragX, dragging, consumeSwipe, handlers } = useSwipeActions(
		task,
		swipeEnabled,
	);
	const tappable = isMobile && Boolean(onOpen);
	// The chevron gutter exists to align expand/collapse controls across a
	// mixed tree of parent and leaf tasks. On mobile that alignment isn't
	// worth the width it eats on an already-narrow row, so leaf tasks (the
	// overwhelming majority) skip the gutter entirely instead of just hiding
	// its icon.
	const showChevronGutter = hasSubtasks || !isMobile;
	const row = (
		/*
		 * biome-ignore lint/a11y/noStaticElementInteractions: the row can't become
		 * a button -- it contains its own interactive children (task links and the
		 * subtask disclosure), which nesting inside a button would break.
		 * biome-ignore lint/a11y/useKeyWithClickEvents: this handler exists only to
		 * give touch an equivalent of the `e` / enter hotkeys, which the global
		 * hotkey scope already provides for keyboard users; it's attached solely on
		 * mobile, where there is no key to press.
		 */
		<div
			data-selected={selected || undefined}
			className={cn(
				// Taller rows below md so a row is a comfortable tap target; the
				// desktop density is unchanged.
				"flex min-h-[44px] items-start gap-2 rounded-md px-3 py-2.5 md:min-h-0 md:py-1.5",
				selected
					? "bg-surface-raised ring-1 ring-accent/60"
					: "hover:bg-surface",
				// An unselected row is otherwise transparent, which is fine at
				// rest but means the swipe color underneath would bleed through
				// the whole row instead of just the sliver the drag actually
				// exposes. Give it an opaque backing for the duration of the drag.
				swipeEnabled && !selected && "bg-background",
				swipeEnabled && "touch-pan-y",
			)}
			style={{
				paddingLeft: isMobile ? `${8 + depth * 16}px` : `${12 + depth * 22}px`,
				transform: swipeEnabled ? `translateX(${dragX}px)` : undefined,
				transition:
					swipeEnabled && !dragging
						? "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)"
						: undefined,
			}}
			onClick={
				tappable
					? () => {
							// Swallow the click that trails a committed swipe.
							if (consumeSwipe()) return;
							onOpen?.();
						}
					: undefined
			}
			{...handlers}
		>
			{showChevronGutter ? (
				hasSubtasks && onToggleExpand ? (
					<button
						type="button"
						aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
						aria-expanded={expanded}
						onClick={(e) => {
							// Without this the row's tap-to-edit would fire too and the
							// chevron could never collapse anything.
							e.stopPropagation();
							onToggleExpand();
						}}
						className={cn(
							"-my-2.5 -ml-1 flex shrink-0 items-center justify-center text-muted",
							// A 14px chevron is not a touch target; pad it out on mobile
							// without changing the desktop row height.
							isMobile ? "min-h-11 w-7" : "mt-[3px] w-4 self-start",
						)}
					>
						{expanded ? (
							<ChevronDown className="h-3.5 w-3.5" />
						) : (
							<ChevronRight className="h-3.5 w-3.5" />
						)}
					</button>
				) : (
					<span className="mt-[3px] w-4 shrink-0 text-muted" />
				)
			) : null}
			{completed ? (
				<CheckCircle2 className="mt-[3px] h-4 w-4 shrink-0 text-p3" />
			) : (
				<Circle className="mt-[3px] h-4 w-4 shrink-0 text-muted" />
			)}
			<div className="flex min-w-0 flex-1 flex-col">
				<div className="flex items-center gap-2">
					<span
						className={cn("truncate", completed && "text-muted line-through")}
					>
						<InlineText text={task.title} />
					</span>
					<span className="ml-auto flex shrink-0 items-center gap-2 text-xs text-muted">
						{task.recurrencePreset || task.recurrenceRRule ? (
							<Repeat className="h-3.5 w-3.5" />
						) : null}
						{task.scheduledAt ? (
							<span className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								{format(parseISO(task.scheduledAt), "MMM d")}
							</span>
						) : null}
						{task.dueAt ? (
							<span
								className={cn(
									"flex items-center gap-1",
									!completed && isOverdueDueDate(task.dueAt) && "text-p1",
								)}
							>
								<Clock className="h-3 w-3" />
								{format(parseISO(task.dueAt), "MMM d")}
							</span>
						) : null}
						<PriorityFlag priority={task.priority} />
						{showProject && project ? (
							<span className="max-w-32 truncate">
								{project.emoji ? `${project.emoji} ` : ""}
								{project.name}
							</span>
						) : null}
					</span>
				</div>
				{task.notes ? (
					<p className="truncate text-xs italic text-muted">{task.notes}</p>
				) : null}
			</div>
		</div>
	);

	if (!swipeEnabled) return row;

	return (
		<div className="relative overflow-hidden rounded-md">
			<div
				aria-hidden
				className="absolute inset-0 flex items-center justify-start rounded-md bg-p3 pl-5 text-background"
				style={{
					opacity: dragX > 0 ? Math.min(1, dragX / SWIPE_THRESHOLD) : 0,
				}}
			>
				{completed ? (
					<RotateCcw className="h-5 w-5" />
				) : (
					<Check className="h-5 w-5" />
				)}
			</div>
			<div
				aria-hidden
				className="absolute inset-0 flex items-center justify-end rounded-md bg-p1 pr-5 text-background"
				style={{
					opacity: dragX < 0 ? Math.min(1, -dragX / SWIPE_THRESHOLD) : 0,
				}}
			>
				<Trash2 className="h-5 w-5" />
			</div>
			{row}
		</div>
	);
}
