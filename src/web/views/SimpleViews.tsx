import { useParams } from "@tanstack/react-router";
import { endOfDay, startOfDay } from "date-fns";
import { useMemo } from "react";

import { Separator } from "@/components/ui/separator";
import { isOverdueTask } from "@/lib/datetime";

import { ProjectHeader } from "../components/ProjectHeader";
import { TaskListView } from "../components/TaskListView";
import { useDeletedTasks, useProjects, useTasks } from "../lib/queries";
import { useUi } from "../state/ui";

export function ViewTitle({ title, count }: { title: string; count?: number }) {
	return (
		<div className="flex flex-col">
			<div className="flex items-baseline gap-2 px-4 py-3">
				<h1 className="text-base font-semibold">{title}</h1>
				{count !== undefined ? (
					<span className="text-xs text-muted">{count}</span>
				) : null}
			</div>
			<Separator />
		</div>
	);
}

export function TodayView() {
	const now = new Date();
	const { data: todayTasks = [] } = useTasks({
		status: "open",
		from: startOfDay(now).toISOString(),
		to: endOfDay(now).toISOString(),
	});
	const { data: pastTasks = [] } = useTasks({
		status: "open",
		to: startOfDay(now).toISOString(),
	});
	const tasks = useMemo(() => {
		const overdue = pastTasks.filter((t) => isOverdueTask(t, now));
		const overdueIds = new Set(overdue.map((t) => t.id));
		return [...overdue, ...todayTasks.filter((t) => !overdueIds.has(t.id))];
	}, [todayTasks, pastTasks]);
	return (
		<>
			<ViewTitle title="Today" count={tasks.length} />
			<TaskListView tasks={tasks} emptyMessage="Nothing due today" />
		</>
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

export function BlockedView() {
	const { data: tasks = [] } = useTasks({ status: "open", blocked: true });
	return (
		<>
			<ViewTitle title="Blocked" count={tasks.length} />
			<TaskListView tasks={tasks} emptyMessage="Nothing blocked" />
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
			/>
		</>
	);
}

export function SearchView() {
	const ui = useUi();
	const { data: tasks = [] } = useTasks({ status: "open" });
	const query = ui.search.trim().toLowerCase();
	const matches = query
		? tasks.filter((t) => t.title.toLowerCase().includes(query))
		: [];
	return (
		<>
			<ViewTitle title={`Search: ${ui.search || "…"}`} count={matches.length} />
			<TaskListView tasks={matches} emptyMessage="No matching tasks" />
		</>
	);
}
