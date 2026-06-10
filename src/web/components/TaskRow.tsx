import { format, parseISO } from "date-fns";
import {
	Ban,
	Calendar,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Circle,
	Clock,
	Repeat,
} from "lucide-react";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Project, Task } from "@/server/types";
import { isOverdueDueDate } from "@/tui/task-display-helpers";

import { cn } from "../lib/cn";
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
		<TooltipProvider>
			<div
				data-selected={selected || undefined}
				className={cn(
					"flex items-center gap-2 rounded-md px-3 py-1.5",
					selected
						? "bg-surface-raised ring-1 ring-accent/60"
						: "hover:bg-surface",
				)}
				style={{ paddingLeft: `${12 + depth * 22}px` }}
			>
				<span className="w-4 shrink-0 text-muted">
					{hasSubtasks ? (
						expanded ? (
							<ChevronDown className="h-3.5 w-3.5" />
						) : (
							<ChevronRight className="h-3.5 w-3.5" />
						)
					) : null}
				</span>
				{completed ? (
					<CheckCircle2 className="h-4 w-4 shrink-0 text-p3" />
				) : (
					<Circle className="h-4 w-4 shrink-0 text-muted" />
				)}
				<span
					className={cn(
						"truncate",
						completed && "text-muted line-through",
						task.blockedReason && "text-muted",
					)}
				>
					{task.title}
				</span>
				{task.blockedReason ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<span>
								<Ban className="h-3.5 w-3.5 shrink-0 text-p1" />
							</span>
						</TooltipTrigger>
						<TooltipContent>{task.blockedReason}</TooltipContent>
					</Tooltip>
				) : null}
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
		</TooltipProvider>
	);
}
