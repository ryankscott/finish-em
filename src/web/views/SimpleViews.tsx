import { useParams } from "@tanstack/react-router";
import { format, startOfDay } from "date-fns";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { isOverdueTask } from "@/lib/datetime";
import { ensureScheme } from "@/lib/task-links";

import {
	type LinkChoice,
	LinkPickerDialog,
} from "../components/LinkPickerDialog";
import { NowBar } from "../components/NowBar";
import { ProjectHeader } from "../components/ProjectHeader";
import { TaskListView } from "../components/TaskListView";
import { WeeklyGoalsBanner } from "../components/WeeklyGoalsBanner";
import { dayWindow, partitionDay } from "../lib/day-plan";
import { useHotkeyScope } from "../lib/hotkeys";
import { useDeletedTasks, useProjects, useTasks } from "../lib/queries";
import { useUi } from "../state/ui";

export function ViewTitle({
	title,
	count,
	action,
}: {
	title: string;
	count?: number;
	action?: React.ReactNode;
}) {
	return (
		<div className="workspace-page !pb-3">
			<div className="flex items-baseline gap-2 pt-1 pb-3">
				<h1 className="text-[28px] font-semibold tracking-tight">{title}</h1>
				{count !== undefined ? (
					<span className="text-xs text-muted">{count}</span>
				) : null}
				{action ? <div className="ml-auto self-center">{action}</div> : null}
			</div>
			<Separator />
		</div>
	);
}

export function TodayView() {
	const ui = useUi();
	const now = new Date();
	const today = dayWindow(now);
	// Everything committed to today OR to an earlier day that never got closed.
	// Leftovers surfacing here the next morning is what makes the shutdown
	// routine optional rather than a cron job.
	const { data: committed = [] } = useTasks({
		status: "open",
		scheduledTo: today.to,
	});
	// Through end of today, not just up to midnight, so a task due later
	// today shows up before it lapses into "overdue" tomorrow.
	const { data: dueTasks = [] } = useTasks({
		status: "open",
		to: today.to,
	});

	const { tasks, sectionLabels, focused, next } = useMemo(() => {
		const overdue = dueTasks.filter((t) => isOverdueTask(t, now));
		const dueToday = dueTasks.filter(
			(t) => t.dueAt !== null && !isOverdueTask(t, now),
		);
		const {
			leftover,
			today: planned,
			unplannedDueToday,
			unplannedOverdue,
		} = partitionDay(committed, dueToday, overdue, now);

		const labels = new Map<number, string>();
		if (leftover.length > 0 && leftover[0].scheduledAt) {
			labels.set(
				leftover[0].id,
				`Left over from ${format(new Date(leftover[0].scheduledAt), "EEE d MMM")}`,
			);
		}
		if (unplannedDueToday.length > 0) {
			labels.set(unplannedDueToday[0].id, "Due today, not planned");
		}
		if (unplannedOverdue.length > 0) {
			labels.set(unplannedOverdue[0].id, "Deadline passed, not planned");
		}

		const ordered = [
			...leftover,
			...planned,
			...unplannedDueToday,
			...unplannedOverdue,
		];
		return {
			tasks: ordered,
			sectionLabels: labels,
			focused: ordered.find((t) => t.startedAt !== null) ?? null,
			next: leftover[0] ?? planned[0] ?? null,
		};
	}, [committed, dueTasks, now]);

	return (
		<div className="workspace-page">
			<p className="hidden text-[11px] md:text-xs uppercase tracking-[1.1px] text-muted md:block">
				{format(now, "EEEE, d MMMM")}
			</p>
			<h1 className="mt-0 mb-2 text-[34px] md:mt-2 leading-tight font-semibold tracking-[-1.3px]">
				Today
			</h1>
			<p className="text-xs text-muted">
				{tasks.length} {tasks.length === 1 ? "task" : "tasks"} planned
			</p>
			<div className="mt-5">
				<WeeklyGoalsBanner />
			</div>
			<NowBar focused={focused} next={next} />
			{
				<div className="mt-5 flex items-center justify-between">
					<span className="text-xs font-medium">Your plan</span>
					<button
						type="button"
						onClick={() => ui.setPlanDayOpen(true)}
						className="min-h-11 text-xs text-accent"
					>
						Plan day
					</button>
				</div>
			}
			<TaskListView
				tasks={tasks}
				emptyMessage="A little breathing room. Add a task or plan your day."
				sectionLabels={sectionLabels}
				dimUnfocused={focused !== null}
			/>
			<button
				type="button"
				onClick={() => ui.openQuickAdd()}
				className="flex min-h-[55px] items-center gap-2.5 px-2 text-xs text-accent"
			>
				<Plus className="size-[18px]" />
				Add a task
			</button>
		</div>
	);
}

export function InboxView() {
	const { data: projects = [] } = useProjects();
	const inbox = projects.find((p) => p.isInbox);
	const { data: tasks = [] } = useTasks(
		{ status: "open", projectId: inbox?.id },
		inbox !== undefined,
	);
	return (
		<>
			<ViewTitle title="Inbox" count={tasks.length} />
			<TaskListView
				tasks={tasks}
				emptyMessage="Inbox zero"
				showProject={false}
				defaultProjectId={inbox?.id}
			/>
		</>
	);
}

export function RecurringView() {
	const { data: tasks = [] } = useTasks({ status: "open", recurring: true });
	return (
		<>
			<ViewTitle title="Recurring" count={tasks.length} />
			<TaskListView
				tasks={tasks}
				emptyMessage="No recurring tasks"
				showProject={true}
			/>
		</>
	);
}

export function SomedayView() {
	const { data: tasks = [] } = useTasks({ status: "open", someday: true });
	return (
		<>
			<ViewTitle title="Someday" count={tasks.length} />
			<TaskListView
				tasks={tasks}
				emptyMessage="Nothing parked for someday"
				showProject={true}
			/>
		</>
	);
}

export function OverdueView() {
	const now = new Date();
	const { data: pastTasks = [] } = useTasks({
		status: "open",
		to: startOfDay(now).toISOString(),
	});
	const tasks = pastTasks.filter((t) => isOverdueTask(t, now));
	return (
		<>
			<ViewTitle title="Overdue" count={tasks.length} />
			<TaskListView tasks={tasks} emptyMessage="Nothing overdue" />
		</>
	);
}

export function PriorityView() {
	const { data: tasks = [] } = useTasks({ status: "open" });
	const sorted = useMemo(
		() => [...tasks].sort((a, b) => a.priority - b.priority),
		[tasks],
	);
	return (
		<>
			<ViewTitle title="By Priority" count={sorted.length} />
			<TaskListView tasks={sorted} emptyMessage="No open tasks" />
		</>
	);
}

export function CompletedView() {
	const { data: tasks = [] } = useTasks({ status: "completed" });
	return (
		<>
			<ViewTitle title="Completed" count={tasks.length} />
			<TaskListView tasks={tasks} emptyMessage="Nothing completed yet" />
		</>
	);
}

export function DeletedView() {
	const { data: tasks = [] } = useDeletedTasks();
	return (
		<>
			<ViewTitle title="Deleted" count={tasks.length} />
			<TaskListView tasks={tasks} emptyMessage="Trash is empty" deletedView />
		</>
	);
}

export function ProjectView() {
	const { projectId } = useParams({ from: "/projects/$projectId" });
	const id = Number(projectId);
	const { data: projects = [] } = useProjects();
	const project = projects.find((p) => p.id === id);
	const { data: tasks = [] } = useTasks({ status: "open", projectId: id });
	const [pickerLinks, setPickerLinks] = useState<LinkChoice[] | null>(null);

	useHotkeyScope({
		o: () => {
			if (!project) return;
			const links: LinkChoice[] = project.resources.map((resource) => ({
				url: resource.url,
				displayLabel: resource.label,
			}));
			if (links.length === 0) {
				toast.info("No project links");
			} else if (links.length === 1) {
				window.open(ensureScheme(links[0].url), "_blank");
			} else {
				setPickerLinks(links);
			}
		},
	});

	return (
		<>
			{project ? (
				<ProjectHeader project={project} count={tasks.length} />
			) : (
				<ViewTitle title="Project" count={tasks.length} />
			)}
			<TaskListView
				tasks={tasks}
				emptyMessage="No open tasks in this project"
				showProject={false}
				defaultProjectId={id}
				disableOpenLink
			/>
			<LinkPickerDialog
				open={pickerLinks !== null}
				links={pickerLinks ?? []}
				onClose={() => setPickerLinks(null)}
			/>
		</>
	);
}

export function SearchView() {
	const ui = useUi();
	const { data: tasks = [] } = useTasks({ status: "open" });
	const query = ui.search.trim().toLowerCase();
	const matches = query
		? tasks.filter(
				(t) =>
					t.title.toLowerCase().includes(query) ||
					t.notes.toLowerCase().includes(query),
			)
		: [];
	return (
		<>
			<ViewTitle title={`Search: ${ui.search || "…"}`} count={matches.length} />
			<TaskListView tasks={matches} emptyMessage="No matching tasks" />
		</>
	);
}
