import { format, parseISO } from "date-fns";
import {
	Calendar,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Circle,
	Clock,
	Repeat,
} from "lucide-react";

import type { Project, Task } from "@/server/types";
import { isOverdueDueDate } from "@/tui/task-display-helpers";

import { cn } from "../lib/cn";
import { InlineText } from "./InlineText";
import { PriorityFlag } from "./PriorityFlag";

export function TaskRow({
	task,
	project,
	selected,
	depth,
	hasSubtasks,
	expanded,
	showProject,
}: {
	task: Task;
	project: Project | undefined;
	selected: boolean;
	depth: number;
	hasSubtasks: boolean;
	expanded: boolean;
	showProject: boolean;
}) {
	const completed = task.status === "completed";
	return (
		<div
			data-selected={selected || undefined}
			className={cn(
				"flex items-start gap-2 rounded-md px-3 py-1.5",
				selected
					? "bg-surface-raised ring-1 ring-accent/60"
					: "hover:bg-surface",
			)}
			style={{ paddingLeft: `${12 + depth * 22}px` }}
		>
			<span className="mt-[3px] w-4 shrink-0 text-muted">
				{hasSubtasks ? (
					expanded ? (
						<ChevronDown className="h-3.5 w-3.5" />
					) : (
						<ChevronRight className="h-3.5 w-3.5" />
					)
				) : null}
			</span>
			{completed ? (
				<CheckCircle2 className="mt-[3px] h-4 w-4 shrink-0 text-p3" />
			) : (
				<Circle className="mt-[3px] h-4 w-4 shrink-0 text-muted" />
			)}
			<div className="flex min-w-0 flex-1 flex-col">
				<div className="flex items-center gap-2">
					<span
						className={cn(
							"truncate",
							completed && "text-muted line-through",
						)}
					>
						<InlineText text={task.title} />
					</span>
					<span className="ml-auto flex shrink-0 items-center gap-2 text-xs text-muted">
						{task.recurrencePreset || task.recurrenceRRule ? (
							<Repeat className="h-3.5 w-3.5" />
						) : null}
						{task.scheduledAt ? (
							<span className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								{format(parseISO(task.scheduledAt), "MMM d")}
							</span>
						) : null}
						{task.dueAt ? (
							<span
								className={cn(
									"flex items-center gap-1",
									!completed && isOverdueDueDate(task.dueAt) && "text-p1",
								)}
							>
								<Clock className="h-3 w-3" />
								{format(parseISO(task.dueAt), "MMM d")}
							</span>
						) : null}
						<PriorityFlag priority={task.priority} />
						{showProject && project ? (
							<span className="max-w-32 truncate">
								{project.emoji ? `${project.emoji} ` : ""}
								{project.name}
							</span>
						) : null}
					</span>
				</div>
				{task.notes ? (
					<p className="truncate text-xs italic text-muted">{task.notes}</p>
				) : null}
			</div>
		</div>
	);
}
