import { addDays, set, isAfter, isPast, subMinutes } from "date-fns";
import { Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReminderModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAddReminder: (remindAt: string) => Promise<void>;
	dueAt: string | null;
}

function hasTime(dateString: string | null): boolean {
	if (!dateString) return false;
	const date = new Date(dateString);
	return date.getUTCHours() !== 0 || date.getUTCMinutes() !== 0;
}

function parseTimeInput(input: string): string | null {
	const now = new Date();
	const trimmed = input.trim().toLowerCase();

	// Match patterns like "9am", "18:00", "3pm", "9:30am"
	const timeOnlyMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
	if (timeOnlyMatch) {
		let hours = Number.parseInt(timeOnlyMatch[1], 10);
		const minutes = timeOnlyMatch[2]
			? Number.parseInt(timeOnlyMatch[2], 10)
			: 0;
		const meridiem = timeOnlyMatch[3];

		if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
			return null;
		}
		if (meridiem && (hours < 1 || hours > 12)) {
			return null;
		}

		if (meridiem === "pm" && hours < 12) {
			hours += 12;
		}
		if (meridiem === "am" && hours === 12) {
			hours = 0;
		}

		let next = set(now, { hours, minutes, seconds: 0, milliseconds: 0 });

		// If time has passed today, schedule for tomorrow
		if (!isAfter(next, now)) {
			next = addDays(next, 1);
		}

		return next.toISOString();
	}

	// Match patterns like "Mon 18:00", "ev Tue 7pm", "tomorrow 9am"
	const dayTimeMatch = trimmed.match(
		/^(?:(ev|every|tomorrow|today)\s+)?(?:(mon|tue|wed|thu|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i,
	);
	if (dayTimeMatch) {
		const dayName = dayTimeMatch[2];
		let hours = Number.parseInt(dayTimeMatch[3], 10);
		const minutes = dayTimeMatch[4] ? Number.parseInt(dayTimeMatch[4], 10) : 0;
		const meridiem = dayTimeMatch[5];

		if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
			return null;
		}
		if (meridiem && (hours < 1 || hours > 12)) {
			return null;
		}

		if (meridiem === "pm" && hours < 12) {
			hours += 12;
		}
		if (meridiem === "am" && hours === 12) {
			hours = 0;
		}

		let next = set(now, { hours, minutes, seconds: 0, milliseconds: 0 });

		if (dayName) {
			const dayMap: Record<string, number> = {
				sun: 0,
				sunday: 0,
				mon: 1,
				monday: 1,
				tue: 2,
				tuesday: 2,
				wed: 3,
				wednesday: 3,
				thu: 4,
				thursday: 4,
				fri: 5,
				friday: 5,
				sat: 6,
				saturday: 6,
			};
			const targetDay = dayMap[dayName];
			const currentDay = next.getDay();
			let daysToAdd = targetDay - currentDay;

			if (
				daysToAdd < 0 ||
				(daysToAdd === 0 && !isAfter(next, now))
			) {
				daysToAdd += 7;
			}

			next = addDays(next, daysToAdd);
		}

		// If time has passed, schedule for tomorrow (or next occurrence)
		if (!isAfter(next, now)) {
			next = addDays(next, 1);
		}

		return next.toISOString();
	}

	// Match "today" or "tomorrow"
	if (trimmed === "today") {
		let next = set(now, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 });
		if (!isAfter(next, now)) {
			next = addDays(next, 1);
		}
		return next.toISOString();
	}

	if (trimmed === "tomorrow") {
		return set(addDays(now, 1), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString();
	}

	return null;
}

export function ReminderModal({
	isOpen,
	onClose,
	onAddReminder,
	dueAt,
}: ReminderModalProps) {
	const [timeInput, setTimeInput] = useState("");
	const [beforeTaskMinutes, setBeforeTaskMinutes] = useState("30");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const hasDueTime = hasTime(dueAt);

	const handleAddReminder = async () => {
		setError(null);

		if (!timeInput.trim()) {
			setError("Please enter a time");
			return;
		}

		const parsedTime = parseTimeInput(timeInput);
		if (!parsedTime) {
			setError(
				'Invalid time format. Try "9am", "18:00", "Mon 18:00", or "tomorrow 9am"',
			);
			return;
		}

		setIsSubmitting(true);
		try {
			await onAddReminder(parsedTime);
			setTimeInput("");
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add reminder");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleAddBeforeTaskReminder = async () => {
		setError(null);

		if (!dueAt || !hasDueTime) {
			setError("Task must have a due date with a time");
			return;
		}

		const minutes = Number.parseInt(beforeTaskMinutes, 10);
		if (Number.isNaN(minutes) || minutes <= 0) {
			setError("Please enter a valid number of minutes");
			return;
		}

		const dueDate = new Date(dueAt);
		const reminderDate = subMinutes(dueDate, minutes);

		// Check if reminder is in the past
		if (isPast(reminderDate)) {
			setError("Reminder time would be in the past");
			return;
		}

		setIsSubmitting(true);
		try {
			await onAddReminder(reminderDate.toISOString());
			setBeforeTaskMinutes("30");
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add reminder");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Reminders</DialogTitle>
				</DialogHeader>

				<Tabs defaultValue="datetime" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="datetime">Date & time</TabsTrigger>
						<TabsTrigger value="before" disabled={!hasDueTime}>
							Before task
						</TabsTrigger>
					</TabsList>

					<TabsContent value="datetime" className="space-y-4">
						<div className="flex items-center gap-2 border rounded-md px-3 py-2">
							<Bell className="size-5 text-zinc-500" />
							<Input
								value={timeInput}
								onChange={(e) => setTimeInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										void handleAddReminder();
									}
								}}
								placeholder="16:00"
								className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
							/>
						</div>

						<p className="text-sm text-zinc-500">
							Set a notification for a specific time ("9am") or date and time
							("Mon 18:00" or "ev Tue 7pm").
						</p>

						{error && <p className="text-sm text-red-600">{error}</p>}

						<div className="flex justify-between items-center">
							<Button variant="ghost" size="sm" className="h-10 w-10 p-0">
								?
							</Button>
							<Button onClick={handleAddReminder} disabled={isSubmitting}>
								{isSubmitting ? "Adding..." : "Add reminder"}
							</Button>
						</div>
					</TabsContent>

					<TabsContent value="before" className="space-y-4">
						{!hasDueTime ? (
							<p className="text-sm text-zinc-500">
								Task must have a due date with a specific time to set a reminder
								before the task.
							</p>
						) : (
							<>
								<div className="flex items-center gap-2 border rounded-md px-3 py-2">
									<Bell className="size-5 text-zinc-500" />
									<Input
										type="number"
										min="1"
										value={beforeTaskMinutes}
										onChange={(e) => setBeforeTaskMinutes(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												void handleAddBeforeTaskReminder();
											}
										}}
										placeholder="30"
										className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
									/>
									<span className="text-sm text-zinc-600">mins before</span>
								</div>

								<p className="text-sm text-zinc-500">
									Get a notification when it's time for this task.
								</p>

								{error && <p className="text-sm text-red-600">{error}</p>}

								<div className="flex justify-between items-center">
									<Button variant="ghost" size="sm" className="h-10 w-10 p-0">
										?
									</Button>
									<Button
										onClick={handleAddBeforeTaskReminder}
										disabled={isSubmitting}
									>
										{isSubmitting ? "Adding..." : "Add reminder"}
									</Button>
								</div>
							</>
						)}
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
