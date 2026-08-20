import { format, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

import { dayWindow, planCandidates } from "../lib/day-plan";
import {
	useCalendarEvents,
	useDayLogMutations,
	useProjects,
	useTaskMutations,
	useTasks,
} from "../lib/queries";
import { useUi } from "../state/ui";

/**
 * The guided step: choose what today actually is, in order.
 *
 * Candidates lead with what is already late or already committed, because a list
 * that opens with unfinished business is the one that gets planned honestly.
 * Meetings are shown alongside so the plan is made against the time that is
 * really left, not against a blank day.
 */
export function PlanDayDialog() {
	const ui = useUi();
	// Recomputed each render on purpose: dayWindow rounds to the day boundary, so
	// the query keys below stay stable even though the clock moves.
	const now = new Date();
	const today = dayWindow(now);
	const { planDay } = useTaskMutations();
	const { markPlanned } = useDayLogMutations();
	const { data: projects = [] } = useProjects();
	const inboxId = projects.find((p) => p.isInbox)?.id;

	// Already committed to today or earlier: these are the plan's starting point.
	const { data: committed = [] } = useTasks({
		status: "open",
		scheduledTo: today.to,
	});
	const { data: overdue = [] } = useTasks({
		status: "open",
		to: startOfDay(now).toISOString(),
	});
	const { data: dueToday = [] } = useTasks({
		status: "open",
		from: today.from,
		to: today.to,
	});
	const { data: inbox = [] } = useTasks(
		{ status: "open", projectId: inboxId, unplanned: true },
		inboxId !== undefined,
	);
	const { data: events = [] } = useCalendarEvents({
		from: today.from,
		to: today.to,
	});

	const candidates = useMemo(
		() => planCandidates([committed, overdue, dueToday, inbox]),
		[committed, overdue, dueToday, inbox],
	);

	// Selection order is the plan order, so the list is ranked by construction.
	// null means "untouched", which seeds from whatever is already committed
	// without needing an effect to copy it in when the dialog opens.
	const [picked, setPicked] = useState<number[] | null>(null);
	const chosen = picked ?? committed.map((t) => t.id);

	// Functional updater, not a read of `chosen`: several toggles can land in one
	// React batch, and reading the rendered value would make each one overwrite
	// the last instead of accumulating.
	const toggle = (task: Task) =>
		setPicked((prev) => {
			const base = prev ?? committed.map((t) => t.id);
			return base.includes(task.id)
				? base.filter((id) => id !== task.id)
				: [...base, task.id];
		});

	const setOpen = (open: boolean) => {
		if (!open) setPicked(null);
		ui.setPlanDayOpen(open);
	};

	const overTarget = chosen.length > ui.dailyTarget;

	const commit = () => {
		planDay.mutate(
			{ day: startOfDay(now).toISOString(), taskIds: chosen },
			{
				onSuccess: () => {
					markPlanned.mutate(format(now, "yyyy-MM-dd"));
					setOpen(false);
					toast.success(
						chosen.length === 0
							? "Today is deliberately empty"
							: `${chosen.length} committed to today`,
					);
				},
				onError: (err) => toast.error(err.message),
			},
		);
	};

	return (
		<Dialog open={ui.planDayOpen} onOpenChange={setOpen}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Plan {format(now, "EEEE d MMMM")}</DialogTitle>
					<DialogDescription>
						Pick what you are actually doing today, in the order you will do it.
						Everything you leave out stays where it is.
					</DialogDescription>
				</DialogHeader>

				{events.length > 0 ? (
					<div className="rounded-md border border-border px-3 py-2 text-xs text-muted">
						{events.length} meeting{events.length === 1 ? "" : "s"} today
						{events[0]?.startAt
							? `, first at ${format(new Date(events[0].startAt), "HH:mm")}`
							: null}
					</div>
				) : null}

				<ScrollArea className="max-h-80">
					<ul className="flex flex-col gap-1 pr-3">
						{candidates.length === 0 ? (
							<li className="py-6 text-center text-muted">
								Nothing waiting. Add a task first.
							</li>
						) : null}
						{candidates.map((task) => {
							const position = chosen.indexOf(task.id);
							return (
								<li key={task.id}>
									<button
										type="button"
										onClick={() => toggle(task)}
										className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-surface-raised"
									>
										<Checkbox checked={position !== -1} tabIndex={-1} />
										<span className="min-w-0 flex-1 truncate">
											{toDisplayString(task.title)}
										</span>
										{position !== -1 ? (
											<span className="shrink-0 text-xs text-accent">
												{position + 1}
											</span>
										) : null}
									</button>
								</li>
							);
						})}
					</ul>
				</ScrollArea>

				<DialogFooter className="items-center justify-between sm:justify-between">
					<span
						className={overTarget ? "text-xs text-p1" : "text-xs text-muted"}
					>
						{chosen.length} chosen
						{overTarget
							? ` — more than your usual ${ui.dailyTarget}`
							: ` of about ${ui.dailyTarget}`}
					</span>
					<span className="flex gap-2">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button onClick={commit}>Commit to today</Button>
					</span>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
