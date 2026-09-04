import { addDays, format, startOfDay } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toDisplayString } from "@/lib/task-links";
import type { Task } from "@/server/types";

import { dayWindow } from "../lib/day-plan";
import { useHotkeyScope } from "../lib/hotkeys";
import { useDayLogMutations, useTaskMutations, useTasks } from "../lib/queries";
import { useIsMobile } from "../lib/use-is-mobile";
import { useUi } from "../state/ui";

/**
 * The shutdown routine. Every task still committed to today gets one explicit
 * decision, so nothing rolls over by default.
 *
 * The dialog owns no server state: each decision is an existing mutation, and
 * each one is already reversible through the undo stack, because
 * snapshotTaskFields covers scheduledAt.
 */
export function CloseDayDialog() {
	const ui = useUi();
	const isMobile = useIsMobile();
	// Recomputed each render; dayWindow rounds to the day boundary so the query
	// key below does not churn.
	const now = new Date();
	const { completeTask, deleteTask, updateTask } = useTaskMutations();
	const { markClosed } = useDayLogMutations();

	// Everything committed to today or any earlier day that never got closed.
	const { data: undecided = [] } = useTasks(
		{ status: "open", scheduledTo: dayWindow(now).to },
		ui.closeDayOpen,
	);

	const current = undecided[0] ?? null;
	const tomorrow = startOfDay(addDays(now, 1)).toISOString();

	const decide = (label: string, run: (task: Task) => void) => () => {
		if (!current) return;
		run(current);
		toast.success(label, { duration: 1500 });
	};

	const done = decide("Done", (task) => completeTask.mutate(task));
	const defer = decide("Moved to tomorrow", (task) =>
		updateTask.mutate({
			taskId: task.id,
			input: { scheduledAt: tomorrow },
			before: task,
		}),
	);
	const backlog = decide("Back to the backlog", (task) =>
		updateTask.mutate({
			taskId: task.id,
			input: { scheduledAt: null },
			before: task,
		}),
	);
	const park = decide("Parked for someday", (task) =>
		updateTask.mutate({
			taskId: task.id,
			input: { scheduledAt: null, someday: true },
			before: task,
		}),
	);
	const drop = decide("Dropped", (task) => deleteTask.mutate(task));

	const finish = () => {
		markClosed.mutate(format(now, "yyyy-MM-dd"));
		ui.setCloseDayOpen(false);
		toast.success("Day closed");
	};

	useHotkeyScope(
		{
			x: done,
			t: defer,
			b: backlog,
			s: park,
			d: drop,
		},
		{ enabled: ui.closeDayOpen && current !== null && !isMobile },
	);

	const buttonClass = isMobile ? "min-h-11 flex-1 text-base" : undefined;

	return (
		<Dialog open={ui.closeDayOpen} onOpenChange={ui.setCloseDayOpen}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{current
							? `Close the day — ${undecided.length} left to decide`
							: "Day closed"}
					</DialogTitle>
					<DialogDescription>
						{current
							? "Decide each one. Nothing moves to tomorrow unless you say so."
							: "Everything you committed to today has been dealt with."}
					</DialogDescription>
				</DialogHeader>

				{current ? (
					<>
						<div className="rounded-lg border border-border bg-surface-raised px-4 py-3">
							<div className="text-base font-medium">
								{toDisplayString(current.title)}
							</div>
							{current.scheduledAt &&
							startOfDay(new Date(current.scheduledAt)) < startOfDay(now) ? (
								<div className="mt-1 text-xs text-p1">
									left over from{" "}
									{format(new Date(current.scheduledAt), "EEE d MMM")}
								</div>
							) : null}
						</div>
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
							<Button className={buttonClass} onClick={done}>
								Done{isMobile ? "" : " (x)"}
							</Button>
							<Button variant="outline" className={buttonClass} onClick={defer}>
								Tomorrow{isMobile ? "" : " (t)"}
							</Button>
							<Button
								variant="outline"
								className={buttonClass}
								onClick={backlog}
							>
								Backlog{isMobile ? "" : " (b)"}
							</Button>
							<Button variant="outline" className={buttonClass} onClick={park}>
								Someday{isMobile ? "" : " (s)"}
							</Button>
							<Button
								variant="outline"
								className={`${buttonClass ?? ""} text-p1`}
								onClick={drop}
							>
								Drop{isMobile ? "" : " (d)"}
							</Button>
						</div>
						{undecided.length > 1 ? (
							<ScrollArea className="max-h-32">
								<ul className="pr-3 text-sm text-muted">
									{undecided.slice(1).map((task) => (
										<li key={task.id} className="truncate py-0.5">
											{toDisplayString(task.title)}
										</li>
									))}
								</ul>
							</ScrollArea>
						) : null}
					</>
				) : null}

				<DialogFooter>
					{current ? (
						<Button
							variant="outline"
							className={buttonClass}
							onClick={() => ui.setCloseDayOpen(false)}
						>
							Finish later
						</Button>
					) : (
						<Button className={buttonClass} onClick={finish}>
							Close the day
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
