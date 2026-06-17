import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { endOfDay, startOfDay } from "date-fns";
import {
	Bell,
	CalendarDays,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Flag,
	Inbox,
	Moon,
	Pencil,
	Plus,
	Settings,
	Star,
	Sun,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { isOverdueTask } from "@/lib/datetime";
import type { Project } from "@/server/types";

import { cn } from "../lib/cn";
import {
	useDeletedTasks,
	useProjectMutations,
	useProjects,
	useTasks,
} from "../lib/queries";
import { useUi } from "../state/ui";

function NavLink({
	to,
	icon,
	label,
	count,
	active,
}: {
	to: string;
	icon: React.ReactNode;
	label: string;
	count?: number;
	active: boolean;
}) {
	return (
		<Link
			to={to}
			tabIndex={-1}
			className={cn(
				"flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
				active
					? "bg-surface-raised text-foreground"
					: "text-muted hover:bg-surface",
			)}
		>
			{icon}
			<span className="truncate">{label}</span>
			{count !== undefined && count > 0 ? (
				<span className="ml-auto text-xs text-muted">{count}</span>
			) : null}
		</Link>
	);
}

function ProjectNavLink({
	project,
	count,
	active,
}: {
	project: Project;
	count: number;
	active: boolean;
}) {
	const ui = useUi();
	const navigate = useNavigate();
	const { deleteProject } = useProjectMutations();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	const onDelete = () => {
		if (
			!window.confirm(
				`Delete project "${project.name}"? Its tasks are removed too.`,
			)
		) {
			return;
		}
		deleteProject.mutate(project.id, {
			onSuccess: () => {
				toast.success("Project deleted");
				if (pathname === `/projects/${project.id}`) navigate({ to: "/today" });
			},
			onError: (err) => toast.error(err.message),
		});
	};

	return (
		<div
			className={cn(
				"group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
				active
					? "bg-surface-raised text-foreground"
					: "text-muted hover:bg-surface",
			)}
		>
			<Link
				to={`/projects/${project.id}`}
				tabIndex={-1}
				className="flex min-w-0 flex-1 items-center gap-2"
			>
				<span className="w-4 text-center text-xs">{project.emoji ?? "●"}</span>
				<span className="truncate">{project.name}</span>
			</Link>
			<button
				type="button"
				aria-label="Edit project"
				onClick={() => ui.openProjectDialog({ mode: "edit", project })}
				className="hidden text-muted hover:text-foreground group-hover:block"
			>
				<Pencil className="h-3.5 w-3.5" />
			</button>
			<button
				type="button"
				aria-label="Delete project"
				onClick={onDelete}
				className="hidden text-muted hover:text-p1 group-hover:block"
			>
				<Trash2 className="h-3.5 w-3.5" />
			</button>
			{count > 0 ? (
				<span className="text-xs text-muted group-hover:hidden">{count}</span>
			) : null}
		</div>
	);
}

export function Sidebar() {
	const ui = useUi();
	const { data: projects = [] } = useProjects();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

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
	const { data: openTasks = [] } = useTasks({ status: "open" });
	const { data: somedayTasks = [] } = useTasks({
		status: "open",
		someday: true,
	});
	const { data: deletedTasks = [] } = useDeletedTasks();

	const overdueCount = pastTasks.filter((t) => isOverdueTask(t, now)).length;
	const inbox = projects.find((p) => p.isInbox);
	const inboxCount = inbox
		? openTasks.filter((t) => t.projectId === inbox.id).length
		: 0;
	const projectCounts = new Map<number, number>();
	for (const task of openTasks) {
		projectCounts.set(
			task.projectId,
			(projectCounts.get(task.projectId) ?? 0) + 1,
		);
	}

	// Collapsed strip with expand button
	if (ui.sidebarCollapsed) {
		return (
			<aside
				style={{ width: 40 }}
				className="flex shrink-0 flex-col items-center border-r border-border bg-surface/50 py-2"
			>
				<button
					type="button"
					aria-label="Expand sidebar"
					onClick={() => ui.toggleSidebarCollapsed()}
					className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
			</aside>
		);
	}

	if (!ui.sidebarVisible) return null;

	const iconClass = "h-4 w-4 shrink-0";
	return (
		<aside
			style={{ width: ui.sidebarWidth }}
			className="flex shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border bg-surface/50 p-2"
		>
			<div className="mb-1 flex items-center justify-end px-1">
				<button
					type="button"
					aria-label="Collapse sidebar"
					onClick={() => ui.toggleSidebarCollapsed()}
					className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>
			</div>
			<NavLink
				to="/today"
				icon={<Sun className={iconClass} />}
				label="Today"
				count={todayTasks.length + overdueCount}
				active={pathname === "/today" || pathname === "/"}
			/>
			<NavLink
				to="/inbox"
				icon={<Inbox className={iconClass} />}
				label="Inbox"
				count={inboxCount}
				active={pathname === "/inbox"}
			/>
			<NavLink
				to="/upcoming"
				icon={<CalendarDays className={iconClass} />}
				label="Upcoming"
				active={pathname === "/upcoming"}
			/>
			<NavLink
				to="/overdue"
				icon={<Flag className={iconClass} />}
				label="Overdue"
				count={overdueCount}
				active={pathname === "/overdue"}
			/>
			<NavLink
				to="/priority"
				icon={<Star className={iconClass} />}
				label="By Priority"
				active={pathname === "/priority"}
			/>
			<NavLink
				to="/completed"
				icon={<CheckCircle2 className={iconClass} />}
				label="Completed"
				active={pathname === "/completed"}
			/>
			<NavLink
				to="/deleted"
				icon={<Trash2 className={iconClass} />}
				label="Deleted"
				count={deletedTasks.length}
				active={pathname === "/deleted"}
			/>
			<NavLink
				to="/reminders"
				icon={<Bell className={iconClass} />}
				label="Reminders"
				active={pathname === "/reminders"}
			/>
			<NavLink
				to="/someday"
				icon={<Moon className={iconClass} />}
				label="Someday"
				count={somedayTasks.length}
				active={pathname === "/someday"}
			/>
			<Separator className="my-2" />
			<div className="mb-1 flex items-center px-3 text-[11px] font-semibold tracking-wide text-muted uppercase">
				<span>Projects</span>
				<button
					type="button"
					aria-label="New project"
					onClick={() => ui.openProjectDialog({ mode: "create" })}
					className="ml-auto text-muted hover:text-foreground"
				>
					<Plus className="h-3.5 w-3.5" />
				</button>
			</div>
			{projects
				.filter((p) => !p.isInbox)
				.map((project) => (
					<ProjectNavLink
						key={project.id}
						project={project}
						count={projectCounts.get(project.id) ?? 0}
						active={pathname === `/projects/${project.id}`}
					/>
				))}
			<div className="mt-auto">
				<Separator className="my-2" />
				<NavLink
					to="/settings"
					icon={<Settings className={iconClass} />}
					label="Settings"
					active={pathname === "/settings"}
				/>
			</div>
		</aside>
	);
}
