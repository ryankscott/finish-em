import {
	closestCenter,
	DndContext,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { endOfDay, startOfDay } from "date-fns";
import {
	Bell,
	BookOpen,
	CalendarClock,
	CalendarDays,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Flag,
	GripVertical,
	Inbox,
	Moon,
	MoreHorizontal,
	Pencil,
	Plus,
	RefreshCw,
	Settings,
	Star,
	Sun,
	Trash2,
} from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { isOverdueTask } from "@/lib/datetime";
import type { Project } from "@/server/types";
import { cn } from "../lib/cn";
import { reorderProjectIds } from "../lib/project-order";
import {
	useDeletedTasks,
	useDueReminders,
	useProjectMutations,
	useProjects,
	useTasks,
} from "../lib/queries";
import { useUi } from "../state/ui";
import { ConfirmDialog } from "./ConfirmDialog";

function NavLink({
	to,
	icon,
	label,
	count,
	alert,
	active,
}: {
	to: string;
	icon: React.ReactNode;
	label: string;
	count?: number;
	/** Shows the count as a red badge: something needs attention now. */
	alert?: boolean;
	active: boolean;
	isDrawer?: boolean;
}) {
	return (
		<Link
			to={to}
			aria-current={active ? "page" : undefined}
			className={cn(
				"flex items-center gap-2.5 rounded-xl px-3 text-[13px]",
				// The drawer is a touch surface with no hover state, so rows get
				// a real tap target instead of the dense desktop row height.
				"min-h-11 py-2.5",
				active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface",
			)}
		>
			{icon}
			<span className="truncate">{label}</span>
			{count !== undefined && count > 0 ? (
				<span
					className={cn(
						"ml-auto text-xs",
						alert
							? "rounded-full bg-p1 px-1.5 font-semibold text-background"
							: "text-muted",
					)}
				>
					{count}
				</span>
			) : null}
		</Link>
	);
}

function ProjectNavLink({
	project,
	count,
	active,
	disabled,
	instructionsId,
	onMove,
}: {
	project: Project;
	count: number;
	active: boolean;
	disabled: boolean;
	instructionsId: string;
	onMove: (direction: -1 | 1) => void;
}) {
	const ui = useUi();
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { deleteProject } = useProjectMutations();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: project.id, disabled });
	return (
		<div
			ref={setNodeRef}
			data-project-id={project.id}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
				zIndex: isDragging ? 10 : undefined,
			}}
			className={cn(
				"relative flex min-h-[52px] items-center gap-1 rounded-xl px-1 text-[13px]",
				active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface",
				isDragging && "bg-accent-soft shadow-md ring-1 ring-accent",
			)}
		>
			<button
				type="button"
				ref={setActivatorNodeRef}
				{...attributes}
				{...listeners}
				aria-label={`Reorder ${project.name}`}
				aria-describedby={instructionsId}
				onKeyDown={(e) => {
					if (e.key === "ArrowUp" || e.key === "ArrowDown") {
						e.preventDefault();
						e.stopPropagation();
						onMove(e.key === "ArrowUp" ? -1 : 1);
					}
				}}
				className="flex min-h-11 w-6 shrink-0 touch-none cursor-grab items-center justify-center rounded-lg text-muted active:cursor-grabbing [@media(pointer:coarse)]:w-11"
				disabled={disabled}
			>
				<GripVertical className="size-3.5" />
			</button>
			<Link
				to="/projects/$projectId"
				params={{ projectId: String(project.id) }}
				aria-current={active ? "page" : undefined}
				className="flex min-h-11 min-w-0 flex-1 items-center gap-2 py-2"
			>
				<span className="flex w-3 shrink-0 items-center justify-center text-xs">
					{project.emoji ?? (
						<span
							className="project-color-dot size-1.5 rounded-full"
							style={{ backgroundColor: project.color }}
						/>
					)}
				</span>
				<span className="min-w-0 break-words leading-relaxed">
					{project.name}
				</span>
			</Link>
			{count > 0 && (
				<span className="shrink-0 text-[11px] tabular-nums">{count}</span>
			)}
			<Popover open={menuOpen} onOpenChange={setMenuOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						aria-label={`Actions for project ${project.name}`}
						className="flex min-h-11 w-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-raised [@media(pointer:coarse)]:w-11"
					>
						<MoreHorizontal className="size-4" />
					</button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-44 rounded-xl bg-surface-raised p-1"
				>
					<button
						type="button"
						onClick={() => {
							setMenuOpen(false);
							ui.openProjectDialog({ mode: "edit", project });
						}}
						className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-xs hover:bg-surface"
					>
						<Pencil className="size-3.5" />
						Edit project
					</button>
					<button
						type="button"
						onClick={() => {
							setMenuOpen(false);
							setConfirmOpen(true);
						}}
						className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-xs text-p1 hover:bg-surface"
					>
						<Trash2 className="size-3.5" />
						Delete project
					</button>
				</PopoverContent>
			</Popover>
			<ConfirmDialog
				open={confirmOpen}
				onOpenChange={setConfirmOpen}
				title="Delete project"
				description={`Delete project “${project.name}”? Its tasks are moved to Inbox.`}
				onConfirm={() =>
					deleteProject.mutate(project.id, {
						onSuccess: () => {
							toast.success("Project deleted");
							if (pathname === `/projects/${project.id}`)
								navigate({ to: "/today" });
						},
						onError: (err) => toast.error(err.message),
					})
				}
			/>
		</div>
	);
}

/**
 * @param variant "rail" is the resizable desktop column. "drawer" is the same
 *   navigation rendered inside the mobile drawer: full width, always expanded,
 *   and without the collapse affordance, which has no meaning there.
 */
export function Sidebar({ variant = "rail" }: { variant?: "rail" | "drawer" }) {
	const ui = useUi();
	const { data: projects = [] } = useProjects();
	const { reorderProjects } = useProjectMutations();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const instructionsId = useId();
	const [announcement, setAnnouncement] = useState("");
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, {
			activationConstraint: { delay: 150, tolerance: 5 },
		}),
	);

	const now = new Date();
	// Matches what the Today view actually shows: the day's plan plus anything
	// left over from an earlier day. A badge counting due-today instead would
	// disagree with the view it links to.
	const { data: committedTasks = [] } = useTasks({
		status: "open",
		scheduledTo: endOfDay(now).toISOString(),
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
	const { data: recurringTasks = [] } = useTasks({
		status: "open",
		recurring: true,
	});
	const { data: deletedTasks = [] } = useDeletedTasks();
	const { data: dueReminders = [] } = useDueReminders();

	const overdue = pastTasks.filter((t) => isOverdueTask(t, now));
	const overdueCount = overdue.length;
	// Overdue tasks already in the plan are counted by committedTasks.
	const unplannedOverdueCount = overdue.filter(
		(t) => t.scheduledAt === null,
	).length;
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

	const visibleProjects = projects.filter((p) => !p.isInbox);

	const isDrawer = variant === "drawer";

	// Collapsed strip with expand button
	if (!isDrawer && ui.sidebarCollapsed) {
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

	if (!isDrawer && !ui.sidebarVisible) return null;

	const iconClass = "h-4 w-4 shrink-0";
	return (
		<aside
			style={isDrawer ? undefined : { width: ui.sidebarWidth }}
			className={cn(
				"flex flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-5",
				isDrawer
					? "h-full w-full"
					: "desktop-sidebar shrink-0 border-r border-border bg-sidebar",
			)}
		>
			{!isDrawer && (
				<div className="mb-1 flex justify-end px-1">
					<button
						type="button"
						aria-label="Collapse sidebar"
						onClick={() => ui.toggleSidebarCollapsed()}
						className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface"
					>
						<ChevronLeft className="size-4" />
					</button>
				</div>
			)}
			<NavLink
				to="/today"
				icon={<Sun className={iconClass} />}
				label="Today"
				count={committedTasks.length + unplannedOverdueCount}
				active={pathname === "/today" || pathname === "/"}
				isDrawer={isDrawer}
			/>
			<NavLink
				to="/inbox"
				icon={<Inbox className={iconClass} />}
				label="Inbox"
				count={inboxCount}
				active={pathname === "/inbox"}
				isDrawer={isDrawer}
			/>
			<NavLink
				to="/planning"
				icon={<CalendarDays className={iconClass} />}
				label="Planning"
				active={pathname === "/planning"}
				isDrawer={isDrawer}
			/>
			<NavLink
				to="/completed"
				icon={<CheckCircle2 className={iconClass} />}
				label="Completed"
				active={pathname === "/completed"}
				isDrawer={isDrawer}
			/>
			<details
				className="mt-1 text-muted"
				open={
					!["/", "/today", "/inbox", "/planning", "/completed"].includes(
						pathname,
					) && !pathname.startsWith("/projects")
				}
			>
				<summary className="min-h-11 cursor-pointer rounded-xl px-3 py-3 text-xs hover:bg-surface">
					More views
				</summary>
				<NavLink
					to="/calendar"
					icon={<CalendarClock className={iconClass} />}
					label="Calendar"
					active={pathname === "/calendar"}
					isDrawer={isDrawer}
				/>
				<NavLink
					to="/recurring"
					icon={<RefreshCw className={iconClass} />}
					label="Recurring"
					count={recurringTasks.length}
					active={pathname === "/recurring"}
					isDrawer={isDrawer}
				/>
				<NavLink
					to="/overdue"
					icon={<Flag className={iconClass} />}
					label="Overdue"
					count={overdueCount}
					active={pathname === "/overdue"}
					isDrawer={isDrawer}
				/>
				<NavLink
					to="/priority"
					icon={<Star className={iconClass} />}
					label="By Priority"
					active={pathname === "/priority"}
					isDrawer={isDrawer}
				/>
				<NavLink
					to="/logbook"
					icon={<BookOpen className={iconClass} />}
					label="Logbook"
					active={pathname === "/logbook"}
					isDrawer={isDrawer}
				/>
				<NavLink
					to="/deleted"
					icon={<Trash2 className={iconClass} />}
					label="Deleted"
					count={deletedTasks.length}
					active={pathname === "/deleted"}
					isDrawer={isDrawer}
				/>
				<NavLink
					to="/reminders"
					icon={<Bell className={iconClass} />}
					label="Reminders"
					count={dueReminders.length}
					alert
					active={pathname === "/reminders"}
					isDrawer={isDrawer}
				/>
				<NavLink
					to="/someday"
					icon={<Moon className={iconClass} />}
					label="Someday"
					count={somedayTasks.length}
					active={pathname === "/someday"}
					isDrawer={isDrawer}
				/>
			</details>
			<Separator className="my-4 opacity-50" />
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
			<p id={instructionsId} className="sr-only">
				Drag the grip to reorder projects, or focus it and press the up and down
				arrow keys.
			</p>
			<div className="sr-only" aria-live="polite">
				{announcement}
			</div>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={({ active, over }) => {
					if (!over || active.id === over.id || reorderProjects.isPending)
						return;
					reorderProjects.mutate(
						reorderProjectIds(
							visibleProjects,
							Number(active.id),
							Number(over.id),
						),
						{
							onError: (err) => toast.error(err.message),
							onSuccess: () => setAnnouncement("Project order saved"),
						},
					);
				}}
			>
				<SortableContext
					items={visibleProjects.map((p) => p.id)}
					strategy={verticalListSortingStrategy}
				>
					{visibleProjects.map((project) => (
						<ProjectNavLink
							key={project.id}
							project={project}
							count={projectCounts.get(project.id) ?? 0}
							active={pathname === `/projects/${project.id}`}
							disabled={reorderProjects.isPending}
							instructionsId={instructionsId}
							onMove={(direction) => {
								const at = visibleProjects.findIndex(
									(p) => p.id === project.id,
								);
								const target = visibleProjects[at + direction];
								if (!target || reorderProjects.isPending) return;
								reorderProjects.mutate(
									reorderProjectIds(visibleProjects, project.id, target.id),
									{
										onSuccess: () =>
											setAnnouncement(
												`${project.name} moved to position ${at + direction + 1} of ${visibleProjects.length}`,
											),
										onError: (err) => toast.error(err.message),
									},
								);
							}}
						/>
					))}
				</SortableContext>
			</DndContext>
			<div className="mt-auto">
				<Separator className="my-2" />
				<NavLink
					to="/settings"
					icon={<Settings className={iconClass} />}
					label="Settings"
					active={pathname === "/settings"}
					isDrawer={isDrawer}
				/>
			</div>
		</aside>
	);
}
