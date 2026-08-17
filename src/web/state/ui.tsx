import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { Project, Task } from "@/server/types";

export type QuickAddOptions = {
	parentTask?: Task;
	projectId?: number;
};

export type ProjectDialogState =
	| { mode: "create" }
	| { mode: "edit"; project: Project };

declare global {
	interface Window {
		// Present only inside the macOS WKWebView shell (desktop/FinishEmApp.swift).
		webkit?: {
			messageHandlers?: {
				appearance?: { postMessage: (message: string) => void };
			};
		};
	}
}

const MIN_SIDEBAR_WIDTH = 160;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 240;

const MIN_DAILY_TARGET = 1;
const MAX_DAILY_TARGET = 100;
const DEFAULT_DAILY_TARGET = 10;

function readStoredNumber(key: string, fallback: number): number {
	try {
		const stored = localStorage.getItem(key);
		if (stored) {
			const parsed = Number.parseInt(stored, 10);
			if (!Number.isNaN(parsed)) return parsed;
		}
	} catch {
		// localStorage unavailable
	}
	return fallback;
}

function readStoredBool(key: string, fallback: boolean): boolean {
	try {
		const stored = localStorage.getItem(key);
		if (stored === "true") return true;
		if (stored === "false") return false;
	} catch {
		// localStorage unavailable
	}
	return fallback;
}

type UiState = {
	quickAdd: QuickAddOptions | null;
	openQuickAdd: (options?: QuickAddOptions) => void;
	closeQuickAdd: () => void;

	editingTask: Task | null;
	openTaskEditor: (task: Task) => void;
	closeTaskEditor: () => void;

	projectDialog: ProjectDialogState | null;
	openProjectDialog: (state: ProjectDialogState) => void;
	closeProjectDialog: () => void;

	helpOpen: boolean;
	setHelpOpen: (open: boolean) => void;

	paletteOpen: boolean;
	setPaletteOpen: (open: boolean) => void;

	sidebarVisible: boolean;
	toggleSidebar: () => void;

	sidebarWidth: number;
	setSidebarWidth: (width: number) => void;

	sidebarCollapsed: boolean;
	toggleSidebarCollapsed: () => void;

	search: string;
	setSearch: (value: string) => void;

	theme: "dark" | "light";
	toggleTheme: () => void;

	dailyTarget: number;
	setDailyTarget: (target: number) => void;
};

const UiContext = createContext<UiState | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
	const [quickAdd, setQuickAdd] = useState<QuickAddOptions | null>(null);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [projectDialog, setProjectDialog] = useState<ProjectDialogState | null>(
		null,
	);
	const [helpOpen, setHelpOpen] = useState(false);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [sidebarVisible, setSidebarVisible] = useState(true);
	const [search, setSearch] = useState("");
	// "system" means: track the OS appearance live. An explicit toggle pins the
	// theme; only a pinned theme is persisted, so an app that has never been
	// toggled keeps following the OS instead of freezing on whatever the OS
	// happened to be the first time it ran.
	const [themeMode, setThemeMode] = useState<"system" | "dark" | "light">(
		() => {
			const stored = localStorage.getItem("theme");
			return stored === "light" || stored === "dark" ? stored : "system";
		},
	);
	const [systemTheme, setSystemTheme] = useState<"dark" | "light">(() =>
		window.matchMedia("(prefers-color-scheme: light)").matches
			? "light"
			: "dark",
	);
	const theme = themeMode === "system" ? systemTheme : themeMode;

	useEffect(() => {
		const query = window.matchMedia("(prefers-color-scheme: light)");
		const onChange = (e: MediaQueryListEvent) =>
			setSystemTheme(e.matches ? "light" : "dark");
		query.addEventListener("change", onChange);
		return () => query.removeEventListener("change", onChange);
	}, []);
	const [sidebarWidth, setSidebarWidthRaw] = useState(() =>
		readStoredNumber("sidebarWidth", DEFAULT_SIDEBAR_WIDTH),
	);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
		readStoredBool("sidebarCollapsed", false),
	);
	const [dailyTarget, setDailyTargetRaw] = useState(() =>
		readStoredNumber("dailyTarget", DEFAULT_DAILY_TARGET),
	);

	useEffect(() => {
		// index.html ships with class="dark" as the pre-hydration default so
		// there's no flash of light theme; once React is up this effect owns
		// both classes so an explicit choice of either theme can't leave the
		// other stuck on, which is what happens if only "light" is toggled.
		document.documentElement.classList.toggle("dark", theme === "dark");
		document.documentElement.classList.toggle("light", theme === "light");
		if (themeMode === "system") localStorage.removeItem("theme");
		else localStorage.setItem("theme", themeMode);
		// The native desktop shell draws its own titlebar, which stays on the OS
		// appearance unless we tell it which way the web UI went.
		window.webkit?.messageHandlers?.appearance?.postMessage(theme);
	}, [theme, themeMode]);

	useEffect(() => {
		localStorage.setItem("sidebarWidth", String(sidebarWidth));
	}, [sidebarWidth]);

	useEffect(() => {
		localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
	}, [sidebarCollapsed]);

	useEffect(() => {
		localStorage.setItem("dailyTarget", String(dailyTarget));
	}, [dailyTarget]);

	const setSidebarWidth = (width: number) => {
		setSidebarWidthRaw(
			Math.min(
				MAX_SIDEBAR_WIDTH,
				Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)),
			),
		);
	};

	const setDailyTarget = (target: number) => {
		setDailyTargetRaw(
			Math.min(
				MAX_DAILY_TARGET,
				Math.max(MIN_DAILY_TARGET, Math.round(target)),
			),
		);
	};

	const value = useMemo<UiState>(
		() => ({
			quickAdd,
			openQuickAdd: (options = {}) => setQuickAdd(options),
			closeQuickAdd: () => setQuickAdd(null),
			editingTask,
			openTaskEditor: setEditingTask,
			closeTaskEditor: () => setEditingTask(null),
			projectDialog,
			openProjectDialog: setProjectDialog,
			closeProjectDialog: () => setProjectDialog(null),
			helpOpen,
			setHelpOpen,
			paletteOpen,
			setPaletteOpen,
			sidebarVisible,
			toggleSidebar: () => setSidebarVisible((v) => !v),
			sidebarWidth,
			setSidebarWidth,
			sidebarCollapsed,
			toggleSidebarCollapsed: () => setSidebarCollapsed((v) => !v),
			search,
			setSearch,
			theme,
			toggleTheme: () => setThemeMode(theme === "dark" ? "light" : "dark"),
			dailyTarget,
			setDailyTarget,
		}),
		[
			quickAdd,
			editingTask,
			projectDialog,
			helpOpen,
			paletteOpen,
			sidebarVisible,
			sidebarWidth,
			sidebarCollapsed,
			search,
			theme,
			dailyTarget,
		],
	);

	return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
	const context = useContext(UiContext);
	if (!context) throw new Error("useUi requires UiProvider");
	return context;
}
