import { BellRing, Check, ChevronDown, Clock, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "../lib/cn";
import { useDueReminders, useReminderMutations } from "../lib/queries";
import {
	type DueReminder,
	missedLabel,
	SNOOZE_OPTIONS,
} from "../lib/reminders";
import { useIsMobile } from "../lib/use-is-mobile";

function MissedRow({ reminder }: { reminder: DueReminder }) {
	const { dismissReminder, snoozeReminder, completeFromReminder } =
		useReminderMutations();
	const [snoozeOpen, setSnoozeOpen] = useState(false);
	const isMobile = useIsMobile();
	// Red outline buttons, compact on desktop; touch keeps a usable target.
	const action = cn(
		"gap-1 border border-p1/40 bg-transparent px-2 text-p1 text-xs shadow-none hover:bg-p1/10 hover:text-p1 [&_svg]:size-3.5",
		isMobile ? "h-9" : "h-6",
	);
	const onError = (err: Error) => toast.error(err.message);

	return (
		<li className="flex items-center gap-1.5 py-0.5 text-sm">
			<span className="min-w-0 flex-1 truncate">{reminder.taskTitle}</span>
			<span className="mr-1 shrink-0 text-p1/70 text-xs tabular-nums">
				{missedLabel(reminder)}
			</span>
			<Button
				variant="ghost"
				className={action}
				aria-label={`Complete ${reminder.taskTitle}`}
				onClick={() =>
					completeFromReminder.mutate(
						{ taskId: reminder.taskId, title: reminder.taskTitle },
						{ onError },
					)
				}
			>
				<Check />
				Done
			</Button>
			<Popover open={snoozeOpen} onOpenChange={setSnoozeOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						className={action}
						aria-label={`Snooze ${reminder.taskTitle}`}
					>
						<Clock />
						Snooze
						<ChevronDown />
					</Button>
				</PopoverTrigger>
				<PopoverContent align="end" className="w-48 p-1">
					{SNOOZE_OPTIONS.map((option) => (
						<button
							key={option.label}
							type="button"
							className="flex w-full rounded px-2 py-1.5 text-left text-sm hover:bg-surface"
							onClick={() => {
								setSnoozeOpen(false);
								snoozeReminder.mutate(
									{
										reminderId: reminder.id,
										preset: option.preset,
										customMinutes: option.customMinutes,
									},
									{
										onSuccess: () => toast.success(`Snoozed: ${option.label}`),
										onError,
									},
								);
							}}
						>
							{option.label}
						</button>
					))}
				</PopoverContent>
			</Popover>
			<Button
				variant="ghost"
				className={cn(action, "border-transparent px-1")}
				aria-label={`Dismiss reminder for ${reminder.taskTitle}`}
				onClick={() => dismissReminder.mutate(reminder.id, { onError })}
			>
				<X />
			</Button>
		</li>
	);
}

/**
 * A missed reminder stays on screen until it is completed, snoozed or
 * dismissed, so a toast that timed out or a notification swiped away on
 * another device can't lose it.
 */
export function MissedRemindersBanner() {
	const { data: due = [] } = useDueReminders();
	const missed = due.filter((r) => r.firedAt !== null);
	const [expanded, setExpanded] = useState(true);

	if (missed.length === 0) return null;

	return (
		<section
			aria-label="Missed reminders"
			className="shrink-0 border-p1/20 border-b bg-p1/5 px-4 py-1"
		>
			<button
				type="button"
				onClick={() => setExpanded((v) => !v)}
				aria-expanded={expanded}
				className="flex w-full items-center gap-1.5 py-0.5 text-left font-semibold text-p1 text-xs"
			>
				<BellRing className="h-3.5 w-3.5" />
				{missed.length === 1
					? "1 missed reminder"
					: `${missed.length} missed reminders`}
				<ChevronDown
					className={cn(
						"ml-auto h-3.5 w-3.5 transition-transform",
						expanded && "rotate-180",
					)}
				/>
			</button>
			{expanded ? (
				<ul className="divide-y divide-p1/10">
					{missed.map((reminder) => (
						<MissedRow key={reminder.id} reminder={reminder} />
					))}
				</ul>
			) : null}
		</section>
	);
}
