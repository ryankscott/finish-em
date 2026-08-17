import { useQueryClient } from "@tanstack/react-query";
import {
	Outlet,
	useNavigate,
	useRouter,
	useRouterState,
} from "@tanstack/react-router";
import { ChevronLeft, Moon, Search, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";

import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { cn } from "../lib/cn";
import { useHotkeyScope } from "../lib/hotkeys";
import { useUndo } from "../lib/undo";
import { useIsMobile } from "../lib/use-is-mobile";
import { useUi } from "../state/ui";
import { CommandPalette } from "./CommandPalette";
import { HelpDialog } from "./HelpDialog";
import { MOBILE_NAV_PATHS, MobileNav } from "./MobileNav";
import { ProjectDialog } from "./ProjectDialog";
import { QuickAdd } from "./QuickAdd";
import { ReminderWatcher } from "./ReminderWatcher";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { TaskEditDialog } from "./TaskEditDialog";

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
			className="w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-accent active:bg-accent"
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

	// Anything that isn't a bottom-nav destination is a detail route the user
	// needs a way out of.
	const canGoBack = !MOBILE_NAV_PATHS.includes(pathname) && pathname !== "/";

	// Close the drawer on navigation, so tapping a link doesn't leave it covering
	// the view it just navigated to.
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
			"shift+a": () => ui.openQuickAdd(),
			"shift+p": () => ui.openProjectDialog({ mode: "create" }),
			"/": () => searchRef.current?.focus(),
			"?": () => ui.setHelpOpen(!ui.helpOpen),
			"mod+k": () => ui.setPaletteOpen(!ui.paletteOpen),
			"mod+z": () => void undoLast(),
			u: () => void undoLast(),
			"\\": () => ui.toggleSidebar(),
			r: () => queryClient.invalidateQueries(),
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
		<div className="flex h-full">
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
				<header className="flex items-center gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
					{/* Standalone PWAs have no browser back button or edge-swipe, so a
					    detail route without this is a dead end. */}
					{isMobile && canGoBack ? (
						<button
							type="button"
							aria-label="Back"
							onClick={() => router.history.back()}
							className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center text-muted hover:text-foreground"
						>
							<ChevronLeft className="h-5 w-5" />
						</button>
					) : null}
					<Search className="h-4 w-4 shrink-0 text-muted" />
					<input
						ref={searchRef}
						value={ui.search}
						placeholder={isMobile ? "Search" : "Search tasks ( / )"}
						className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted/60 md:w-64 md:flex-none"
						onChange={(e) => {
							ui.setSearch(e.target.value);
							if (pathname !== "/search") navigate({ to: "/search" });
						}}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								ui.setSearch("");
								e.currentTarget.blur();
								navigate({ to: "/today" });
							}
						}}
					/>
					{isMobile ? null : (
						<span className="ml-auto text-xs text-muted">? for shortcuts</span>
					)}
					<button
						type="button"
						aria-label="Toggle theme"
						onClick={() => ui.toggleTheme()}
						className={cn(
							"shrink-0 text-muted hover:text-foreground",
							isMobile && "flex h-11 w-11 items-center justify-center",
						)}
					>
						{ui.theme === "dark" ? (
							<Sun className="h-4 w-4" />
						) : (
							<Moon className="h-4 w-4" />
						)}
					</button>
				</header>
				<Separator />
				<main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
					<Outlet />
				</main>
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
			<TaskEditDialog />
			<ProjectDialog />
			{isMobile ? null : <HelpDialog />}
			<CommandPalette />
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
