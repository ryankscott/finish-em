import { format, parseISO } from "date-fns";
import { Bell, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { useReminderMutations, useTaskReminders } from "../lib/queries";

const TIME_SLOTS: Array<{ value: string; label: string }> = Array.from(
	{ length: 15 },
	(_, i) => {
		const hour = 7 + i;
		const h = String(hour).padStart(2, "0");
		const period = hour < 12 ? "AM" : "PM";
		const display = hour % 12 === 0 ? 12 : hour % 12;
		return { value: `${h}:00`, label: `${display}:00 ${period}` };
	},
);

export function TaskReminderField({ taskId }: { taskId: number }) {
	const { data: reminders = [] } = useTaskReminders(taskId);
	const { createReminder, deleteReminder } = useReminderMutations();
	const existing = reminders[0];

	const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
	const [time, setTime] = useState("09:00");

	const save = () => {
		if (!date) {
			toast.error("Pick a reminder date");
			return;
		}
		const dt = new Date(`${date}T${time}:00`);
		if (Number.isNaN(dt.getTime())) {
			toast.error("Invalid reminder date");
			return;
		}
		createReminder.mutate(
			{ taskId, remindAt: dt.toISOString() },
			{
				onSuccess: () => toast.success("Reminder set"),
				onError: (err) => toast.error(err.message),
			},
		);
	};

	const remove = () => {
		if (!existing) return;
		deleteReminder.mutate(existing.id, {
			onSuccess: () => toast.success("Reminder deleted"),
			onError: (err) => toast.error(err.message),
		});
	};

	return (
		<div className="flex flex-col gap-1 text-xs text-muted">
			<span className="flex items-center gap-1">
				<Bell className="h-3.5 w-3.5" />
				Reminder
				{existing ? (
					<span className="text-accent">
						· {format(parseISO(existing.remindAt), "MMM d, h:mm a")}
					</span>
				) : null}
			</span>
			<div className="flex items-center gap-2">
				<Input
					type="date"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					className="w-auto"
				/>
				<Select value={time} onValueChange={setTime}>
					<SelectTrigger className="h-9 w-auto">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{TIME_SLOTS.map((slot) => (
							<SelectItem key={slot.value} value={slot.value}>
								{slot.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<button
					type="button"
					onClick={save}
					className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-surface"
				>
					{existing ? "Update" : "Set"}
				</button>
				{existing ? (
					<button
						type="button"
						onClick={remove}
						aria-label="Delete reminder"
						className="rounded-md border border-border px-2 py-1.5 text-muted hover:text-p1"
					>
						<Trash2 className="h-3.5 w-3.5" />
					</button>
				) : null}
			</div>
		</div>
	);
}
