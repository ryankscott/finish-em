import { useQueryClient } from "@tanstack/react-query";
import {
	Outlet,
	useNavigate,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";
import { format } from "date-fns";
import {
	ChevronLeft,
	Moon,
	MoreHorizontal,
	Plus,
	Search,
	Sun,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { cn } from "../lib/cn";
import { useHotkeyScope } from "../lib/hotkeys";
import { useUndo } from "../lib/undo";
import { useIsMobile } from "../lib/use-is-mobile";
import { useUi } from "../state/ui";
import { ChangeWatcher } from "./ChangeWatcher";
import { CloseDayDialog } from "./CloseDayDialog";
import { CommandPalette } from "./CommandPalette";
import { HelpDialog } from "./HelpDialog";
import { MissedRemindersBanner } from "./MissedReminders";
import { MOBILE_NAV_PATHS, MobileNav } from "./MobileNav";
import { PlanDayDialog } from "./PlanDayDialog";
import { ProjectDialog } from "./ProjectDialog";
import { QuickAdd } from "./QuickAdd";
import { ReminderWatcher } from "./ReminderWatcher";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { TaskEditDialog } from "./TaskEditDialog";
import { WeeklyGoalsBanner } from "./WeeklyGoalsBanner";

const VIEW_KEYS = [
	"/today",
	"/inbox",
	"/planning",
	"/overdue",
	"/priority",
	"/completed",
	"/deleted",
];

function ResizeHandle() {
	const ui = useUi();
	const handleRef = useRef<HTMLDivElement>(null);
	const startXRef = useRef(0);
	const startWidthRef = useRef(0);

	useEffect(() => {
		const el = handleRef.current;
		if (!el) return;

		const onMouseDown = (e: MouseEvent) => {
			e.preventDefault();
			startXRef.current = e.clientX;
			startWidthRef.current = ui.sidebarWidth;
			document.body.style.userSelect = "none";
			document.body.style.cursor = "col-resize";

			const onMouseMove = (e: MouseEvent) => {
				const delta = e.clientX - startXRef.current;
				ui.setSidebarWidth(startWidthRef.current + delta);
			};

			const onMouseUp = () => {
				document.body.style.userSelect = "";
				document.body.style.cursor = "";
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
			};

			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		};

		el.addEventListener("mousedown", onMouseDown);
		return () => el.removeEventListener("mousedown", onMouseDown);
	}, [ui]);

	return (
		<div
			ref={handleRef}
			className="sidebar-resize w-px shrink-0 cursor-col-resize bg-border/50 transition-colors hover:bg-accent active:bg-accent"
		/>
	);
}

export function AppShell() {
	const ui = useUi();
	const navigate = useNavigate();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { undoLast } = useUndo();
	const searchRef = useRef<HTMLInputElement>(null);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isMobile = useIsMobile();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	useEffect(() => {
		if (searchOpen) searchRef.current?.focus();
	}, [searchOpen]);

	// Anything that isn't a bottom-nav destination is a detail route the user
	// needs a way out of.
	const canGoBack = !MOBILE_NAV_PATHS.includes(pathname) && pathname !== "/";

	// Close the drawer on navigation, so tapping a link doesn't leave it covering
	// the view it just navigated to.
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not a value the effect reads
	useEffect(() => {
		setDrawerOpen(false);
	}, [pathname]);

	// Hotkeys are meaningless on a touch device, and leaving the listeners
	// attached means an external keyboard types into scopes with no visible
	// affordance for them.
	const hotkeysEnabled = !isMobile;

	useHotkeyScope(
		{
			a: () => ui.openQuickAdd(),
			p: () => ui.setPlanDayOpen(true),
			w: () => ui.setCloseDayOpen(true),
			"shift+a": () => ui.openQuickAdd(),
			"shift+p": () => ui.openProjectDialog({ mode: "create" }),
			"/": () => setSearchOpen(true),
			"?": () => ui.setHelpOpen(!ui.helpOpen),
			"mod+k": () => ui.setPaletteOpen(!ui.paletteOpen),
			"mod+z": () => void undoLast(),
			u: () => void undoLast(),
			"\\": () => ui.toggleSidebar(),
			r: () => void queryClient.invalidateQueries(),
			...Object.fromEntries(
				VIEW_KEYS.map((to, index) => [
					String(index + 1),
					() => navigate({ to }),
				]),
			),
		},
		{ enabled: hotkeysEnabled },
	);

	// mod+k must also work while typing in inputs
	useHotkeyScope(
		{
			"mod+k": () => ui.setPaletteOpen(!ui.paletteOpen),
		},
		{ allowInInput: true, enabled: hotkeysEnabled },
	);

	return (
		<div className={cn("flex h-full", ui.editingTask && "has-task-editor")}>
			{isMobile ? null : (
				<>
					<Sidebar />
					{ui.sidebarVisible && !ui.sidebarCollapsed && <ResizeHandle />}
				</>
			)}
			<div className="flex min-w-0 flex-1 flex-col">
				{/* pt is max(), not pt-safe: pt-safe sets padding-top to the safe-area
				    inset outright, which is 0 everywhere except iOS and so leaves the
				    search row jammed against the top of the window. */}
				<header className="flex min-h-[72px] shrink-0 items-center gap-2 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 md:gap-3 md:px-7">
					{isMobile && canGoBack && (
						<button
							type="button"
							aria-label="Back"
							onClick={() => router.history.back()}
							className="flex size-11 shrink-0 items-center justify-center text-muted"
						>
							<ChevronLeft className="size-5" />
						</button>
					)}
					{searchOpen ? (
						<>
							<Search className="size-4 shrink-0 text-muted" />
							<input
								ref={searchRef}
								value={ui.search}
								aria-label="Search tasks"
								placeholder="Search tasks"
								className="min-w-0 flex-1 bg-transparent text-base outline-none md:text-sm"
								onChange={(e) => {
									ui.setSearch(e.target.value);
									if (pathname !== "/search") navigate({ to: "/search" });
								}}
								onKeyDown={(e) => {
									if (e.key === "Escape") {
										ui.setSearch("");
										setSearchOpen(false);
										navigate({ to: "/today" });
									}
								}}
							/>
							<button
								type="button"
								aria-label="Close search"
								onClick={() => {
									setSearchOpen(false);
									ui.setSearch("");
									if (pathname === "/search") navigate({ to: "/today" });
								}}
								className="flex size-11 items-center justify-center text-muted"
							>
								<X className="size-4" />
							</button>
						</>
					) : (
						<>
							<span className="min-w-0 flex-1 truncate text-xs text-muted">
								{isMobile ? (
									<span>{format(new Date(), "EEEE, d MMMM")}</span>
								) : (
									<>
										My workspace <span className="px-2 opacity-50">/</span>{" "}
										{pathname.startsWith("/projects")
											? "Project"
											: (pathname.split("/")[1] || "today").replace(/^./, (c) =>
													c.toUpperCase(),
												)}
									</>
								)}
							</span>
							{!isMobile && (
								<Button
									onClick={() => ui.openQuickAdd()}
									className="h-[42px] text-xs"
								>
									<Plus className="size-4" />
									New task
								</Button>
							)}
							<button
								type="button"
								aria-label="Search tasks"
								onClick={() => setSearchOpen(true)}
								className="flex size-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-surface"
							>
								<Search className="size-[18px]" />
							</button>
							<Popover>
								<PopoverTrigger asChild>
									<button
										type="button"
										aria-label="Day actions"
										className="flex size-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-surface"
									>
										<MoreHorizontal className="size-[18px]" />
									</button>
								</PopoverTrigger>
								<PopoverContent
									align="end"
									className="w-48 rounded-2xl bg-surface-raised p-2"
								>
									<div className="flex flex-col">
										<button
											type="button"
											onClick={() => ui.setPlanDayOpen(true)}
											className="min-h-11 rounded-lg px-3 text-left text-sm hover:bg-surface"
										>
											Plan day
										</button>
										<button
											type="button"
											onClick={() => ui.setCloseDayOpen(true)}
											className="min-h-11 rounded-lg px-3 text-left text-sm hover:bg-surface"
										>
											Close day
										</button>
										<button
											type="button"
											onClick={() => ui.toggleTheme()}
											className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm hover:bg-surface"
										>
											{ui.theme === "dark" ? (
												<Sun className="size-4" />
											) : (
												<Moon className="size-4" />
											)}
											Switch to {ui.theme === "dark" ? "light" : "dark"}
										</button>
										{!isMobile && (
											<button
												type="button"
												onClick={() => ui.setHelpOpen(true)}
												className="min-h-11 rounded-lg px-3 text-left text-sm hover:bg-surface"
											>
												Keyboard shortcuts
											</button>
										)}
									</div>
								</PopoverContent>
							</Popover>
						</>
					)}
				</header>
				{!["/", "/today", "/planning"].includes(pathname) && (
					<div className="workspace-page !pt-0 !pb-3">
						<WeeklyGoalsBanner />
					</div>
				)}
				<MissedRemindersBanner />
				<div className="flex min-h-0 flex-1">
					<main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain">
						<Outlet />
					</main>
					<TaskEditDialog />
				</div>
				{isMobile ? null : (
					<>
						<Separator />
						<StatusBar />
					</>
				)}
				{isMobile ? (
					<MobileNav
						pathname={pathname}
						onOpenMenu={() => setDrawerOpen(true)}
						onQuickAdd={() => ui.openQuickAdd()}
					/>
				) : null}
			</div>

			{isMobile ? (
				<Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
					<SheetContent
						side="left"
						showClose={false}
						className="h-dvh rounded-none p-0 pt-safe pb-safe"
						aria-describedby={undefined}
					>
						<SheetTitle className="sr-only">Navigation</SheetTitle>
						<Sidebar variant="drawer" />
					</SheetContent>
				</Sheet>
			) : null}

			<QuickAdd />
			<PlanDayDialog />
			<CloseDayDialog />
			<ProjectDialog />
			{isMobile ? null : <HelpDialog />}
			<CommandPalette />
			<ChangeWatcher />
			<ReminderWatcher />
			<Toaster
				theme={ui.theme}
				position={isMobile ? "top-center" : "bottom-right"}
				mobileOffset={{
					top: "max(4.5rem, calc(env(safe-area-inset-top) + 4rem))",
				}}
			/>
		</div>
	);
}
