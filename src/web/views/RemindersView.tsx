import { format, parseISO } from "date-fns";
import { Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "../lib/cn";
import { useAllReminders, useReminderMutations } from "../lib/queries";
import { ViewTitle } from "./SimpleViews";

export function RemindersView() {
	const { data: reminders = [] } = useAllReminders();
	const { deleteReminder } = useReminderMutations();
	const now = new Date();

	return (
		<>
			<ViewTitle title="Reminders" count={reminders.length} />
			{reminders.length === 0 ? (
				<p className="px-4 py-6 text-sm text-muted">No upcoming reminders</p>
			) : (
				<ScrollArea className="flex-1">
					<div className="flex flex-col gap-0.5 p-2">
						{reminders.map((reminder) => {
							const when = parseISO(reminder.snoozedUntil ?? reminder.remindAt);
							const past = when < now;
							return (
								<div
									key={reminder.id}
									className="group flex items-center gap-3 rounded-md px-3 py-1.5 text-sm hover:bg-surface"
								>
									<Bell
										className={cn(
											"h-4 w-4 shrink-0",
											past ? "text-p1" : "text-muted",
										)}
									/>
									<span className="min-w-0 flex-1 truncate">
										{reminder.taskTitle}
									</span>
									<span
										className={cn(
											"shrink-0 text-xs",
											past ? "text-p1" : "text-muted",
										)}
									>
										{format(when, "MMM d, h:mm a")}
									</span>
									<button
										type="button"
										aria-label="Delete reminder"
										onClick={() =>
											deleteReminder.mutate(reminder.id, {
												onSuccess: () => toast.success("Reminder deleted"),
												onError: (err) => toast.error(err.message),
											})
										}
										className="hidden shrink-0 text-muted hover:text-p1 group-hover:block"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</button>
								</div>
							);
						})}
					</div>
				</ScrollArea>
			)}
		</>
	);
}
