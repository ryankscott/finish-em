import { useQueryClient } from "@tanstack/react-query";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Moon, Search, Sun } from "lucide-react";
import { useEffect, useRef } from "react";
import { Toaster } from "sonner";

import { Separator } from "@/components/ui/separator";

import { useHotkeyScope } from "../lib/hotkeys";
import { useUndo } from "../lib/undo";
import { useUi } from "../state/ui";
import { CommandPalette } from "./CommandPalette";
import { HelpDialog } from "./HelpDialog";
import { ProjectDialog } from "./ProjectDialog";
import { QuickAdd } from "./QuickAdd";
import { ReminderWatcher } from "./ReminderWatcher";
import { Sidebar } from "./Sidebar";
import { TaskEditDialog } from "./TaskEditDialog";

const VIEW_KEYS = [
	"/today",
	"/inbox",
	"/upcoming",
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
	const queryClient = useQueryClient();
	const { undoLast } = useUndo();
	const searchRef = useRef<HTMLInputElement>(null);
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	useHotkeyScope({
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
			VIEW_KEYS.map((to, index) => [String(index + 1), () => navigate({ to })]),
		),
	});

	// mod+k must also work while typing in inputs
	useHotkeyScope(
		{
			"mod+k": () => ui.setPaletteOpen(!ui.paletteOpen),
		},
		{ allowInInput: true },
	);

	return (
		<div className="flex h-full">
			<Sidebar />
			{ui.sidebarVisible && !ui.sidebarCollapsed && <ResizeHandle />}
			<div className="flex min-w-0 flex-1 flex-col">
				<header className="flex items-center gap-2 px-4 py-2">
					<Search className="h-4 w-4 text-muted" />
					<input
						ref={searchRef}
						value={ui.search}
						placeholder="Search tasks ( / )"
						className="w-64 bg-transparent text-sm outline-none placeholder:text-muted/60"
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
					<span className="ml-auto text-xs text-muted">? for shortcuts</span>
					<button
						type="button"
						aria-label="Toggle theme"
						onClick={() => ui.toggleTheme()}
						className="text-muted hover:text-foreground"
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
			</div>
			<QuickAdd />
			<TaskEditDialog />
			<ProjectDialog />
			<HelpDialog />
			<CommandPalette />
			<ReminderWatcher />
			<Toaster theme={ui.theme} position="bottom-right" />
		</div>
	);
}
