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

function MissedRow({ reminder }: { reminder: DueReminder }) {
	const { dismissReminder, snoozeReminder, completeFromReminder } =
		useReminderMutations();
	const [snoozeOpen, setSnoozeOpen] = useState(false);
	const onError = (err: Error) => toast.error(err.message);

	return (
		<li className="flex min-h-11 items-center gap-2 py-1 text-sm">
			<span className="min-w-0 flex-1 truncate font-medium">
				{reminder.taskTitle}
			</span>
			<span className="shrink-0 text-muted text-xs tabular-nums">
				{missedLabel(reminder)}
			</span>
			<Button
				size="sm"
				variant="outline"
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
						size="sm"
						variant="outline"
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
				size="icon"
				variant="ghost"
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
			className="shrink-0 border-border border-b bg-p1/10 px-4 py-2"
		>
			<button
				type="button"
				onClick={() => setExpanded((v) => !v)}
				aria-expanded={expanded}
				className="flex w-full items-center gap-2 text-left font-semibold text-p1 text-sm"
			>
				<BellRing className="h-4 w-4" />
				{missed.length === 1
					? "1 missed reminder"
					: `${missed.length} missed reminders`}
				<ChevronDown
					className={cn(
						"ml-auto h-4 w-4 transition-transform",
						expanded && "rotate-180",
					)}
				/>
			</button>
			{expanded ? (
				<ul className="mt-1 divide-y divide-border">
					{missed.map((reminder) => (
						<MissedRow key={reminder.id} reminder={reminder} />
					))}
				</ul>
			) : null}
		</section>
	);
}
