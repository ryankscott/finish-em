import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
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
import { toDisplayString } from "@/lib/task-links";
import type { Task } from "@/server/types";
import { dayKey } from "../lib/day-plan";

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

	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open && !pending) onClose();
			}}
		>
			<DialogContent>
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
						<Input
							id={dateId}
							type="date"
							required
							value={date}
							onChange={(event) => setDate(event.target.value)}
						/>
					</div>
					{timebox && (
						<div className="grid gap-2">
							<Label htmlFor={timeId}>Start time (optional)</Label>
							<div className="flex gap-2">
								<Input
									id={timeId}
									type="time"
									value={time}
									onChange={(event) => setTime(event.target.value)}
								/>
								{time && (
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="size-11 shrink-0 text-muted md:size-9"
										aria-label="Clear start time"
										title="Clear start time"
										onClick={() => setTime("")}
									>
										<X aria-hidden="true" />
									</Button>
								)}
							</div>
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
