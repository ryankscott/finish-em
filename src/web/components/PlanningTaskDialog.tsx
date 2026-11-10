import { format, parseISO } from "date-fns";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toDisplayString } from "@/lib/task-links";
import type { Task } from "@/server/types";
import {
	dayKey,
	GRID_END_HOUR,
	GRID_START_HOUR,
	SNAP_MINUTES,
} from "../lib/day-plan";
import { DateField } from "./DateField";

const startTimes = Array.from(
	{ length: ((GRID_END_HOUR - GRID_START_HOUR) * 60) / SNAP_MINUTES },
	(_, index) => {
		const minutes = GRID_START_HOUR * 60 + index * SNAP_MINUTES;
		const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
		return `${hours}:${String(minutes % 60).padStart(2, "0")}`;
	},
);
const customTimePattern = "(?:[01][0-9]|2[0-3]):[0-5][0-9]";

export function PlanningTaskDialog({
	task,
	day,
	timebox,
	pending,
	error,
	onClose,
	onSave,
}: {
	task: Task;
	day: Date;
	timebox: boolean;
	pending: boolean;
	error: string;
	onClose: () => void;
	onSave: (date: string, time?: string) => void;
}) {
	const dateId = useId();
	const timeId = useId();
	const [date, setDate] = useState(dayKey(day));
	const [time, setTime] = useState(() =>
		task.plannedStartAt && dayKey(parseISO(task.plannedStartAt)) === dayKey(day)
			? format(parseISO(task.plannedStartAt), "HH:mm")
			: "",
	);

	const [custom, setCustom] = useState(
		() => !!time && !startTimes.includes(time),
	);
	const customTimeId = useId();

	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open && !pending) onClose();
			}}
		>
			<DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{timebox ? "Set timebox" : "Plan task"}</DialogTitle>
					<DialogDescription>
						{toDisplayString(task.title)}
						{task.dueAt && ` · Due ${format(parseISO(task.dueAt), "d MMM")}`}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						onSave(date, timebox ? time : undefined);
					}}
					className="grid gap-4"
				>
					<div className="grid gap-2">
						<Label htmlFor={dateId}>Work day</Label>
						<DateField
							id={dateId}
							aria-label="Work day"
							value={date}
							onChange={setDate}
							showIcon
							dateOnly
							allowNone={false}
							className="rounded-xl border border-border bg-surface px-3 text-foreground"
						/>
					</div>
					{timebox && (
						<div className="grid gap-2">
							<Label htmlFor={timeId}>Start time</Label>
							<Select
								value={custom ? "custom" : time || "none"}
								onValueChange={(value) => {
									setCustom(value === "custom");
									if (value !== "custom")
										setTime(value === "none" ? "" : value);
								}}
							>
								<SelectTrigger id={timeId} className="h-11 md:h-9">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No start time</SelectItem>
									<SelectItem value="custom">Enter an exact time</SelectItem>
									<SelectSeparator />
									{startTimes.map((option) => (
										<SelectItem key={option} value={option}>
											{option}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{custom && (
								<>
									<Label htmlFor={customTimeId}>Exact time (24-hour)</Label>
									<Input
										id={customTimeId}
										type="text"
										required
										pattern={customTimePattern}
										title="Enter a 24-hour time like 09:05 or 14:30"
										placeholder="HH:mm"
										value={time}
										onChange={(event) => setTime(event.target.value)}
									/>
								</>
							)}
						</div>
					)}
					{error && (
						<p role="alert" className="text-sm text-p1">
							{error}
						</p>
					)}
					<DialogFooter>
						{task.scheduledAt && (
							<Button
								type="button"
								variant="ghost"
								className="text-muted"
								disabled={pending}
								onClick={() => onSave("")}
							>
								Remove from plan
							</Button>
						)}
						<Button type="submit" disabled={pending}>
							Save plan
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
