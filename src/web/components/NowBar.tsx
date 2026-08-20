import { format, parseISO } from "date-fns";
import { Check, Play, Square } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toDisplayString } from "@/lib/task-links";
import type { Task } from "@/server/types";
import { cn } from "../lib/cn";
import { formatMinutes, taskEstimate } from "../lib/day-plan";
import { useTaskMutations } from "../lib/queries";
import { useElapsed } from "../lib/use-elapsed";

/**
 * The one thing being worked on, and the single button that starts it.
 *
 * Deliberately the loudest element on the Today screen: the gap between opening
 * the app and doing something is the whole problem this solves, so starting must
 * cost one click and require no decision.
 */
export function NowBar({
	focused,
	next,
}: {
	focused: Task | null;
	next: Task | null;
}) {
	const { startTask, stopTask, completeTask } = useTaskMutations();
	const elapsed = useElapsed(focused?.startedAt ?? null);

	// useElapsed re-renders this component every second, so reading the clock
	// here stays in step with the label without a second interval.
	const estimate = focused ? taskEstimate(focused) : 0;
	const elapsedMinutes = focused?.startedAt
		? Math.max(0, (Date.now() - Date.parse(focused.startedAt)) / 60_000)
		: 0;
	const overEstimate = estimate > 0 && elapsedMinutes > estimate;
	const progress =
		estimate > 0 ? Math.min(100, (elapsedMinutes / estimate) * 100) : 0;

	if (focused) {
		return (
			<div className="mx-4 mt-3 flex items-center gap-3 rounded-lg border border-accent bg-surface-raised px-4 py-3">
				<div className="min-w-0 flex-1">
					<div className="text-[10px] font-semibold uppercase tracking-wide text-accent">
						Now
					</div>
					<div className="truncate text-base font-medium">
						{toDisplayString(focused.title)}
					</div>
					{focused.startedAt ? (
						<>
							<div
								className={cn(
									"text-xs",
									overEstimate ? "text-amber-500" : "text-muted",
								)}
							>
								started {format(parseISO(focused.startedAt), "HH:mm")} ·{" "}
								{overEstimate
									? `${elapsed} over ${formatMinutes(estimate)}`
									: `${elapsed} of ${formatMinutes(estimate)}`}
							</div>
							{/* Running long is normal, so this is an amber note rather than
							    an alarm: no modal, no toast, nothing to dismiss. */}
							<div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-border">
								<span
									className={cn(
										"block h-full",
										overEstimate ? "bg-amber-500" : "bg-accent",
									)}
									style={{ width: `${progress}%` }}
								/>
							</div>
						</>
					) : null}
				</div>
				<Button
					size="sm"
					onClick={() =>
						completeTask.mutate(focused, {
							onSuccess: () => toast.success("Task completed"),
							onError: (err) => toast.error(err.message),
						})
					}
				>
					<Check className="size-4" /> Done
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={() => stopTask.mutate(focused.id)}
					aria-label="Stop"
				>
					<Square className="size-4" />
				</Button>
			</div>
		);
	}

	if (!next) return null;

	return (
		<div className="mx-4 mt-3 rounded-lg border border-border bg-surface-raised px-4 py-3">
			<div className="text-[10px] font-semibold uppercase tracking-wide text-muted">
				Next up
			</div>
			<button
				type="button"
				className="mt-1 flex w-full items-center gap-3 text-left"
				onClick={() => startTask.mutate(next.id)}
			>
				<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-background">
					<Play className="size-4" />
				</span>
				<span className="min-w-0 flex-1">
					<span className="block truncate text-base font-medium">
						{toDisplayString(next.title)}
					</span>
					<span className="block text-xs text-muted">
						Start this · {formatMinutes(taskEstimate(next))}
					</span>
				</span>
			</button>
		</div>
	);
}
