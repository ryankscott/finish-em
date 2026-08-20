import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

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

// Six hours of real focus rather than eight hours at a desk. Meetings come out
// of this before tasks get any of it.
const MIN_WORKDAY_MINUTES = 60;
const MAX_WORKDAY_MINUTES = 720;
const DEFAULT_WORKDAY = 360;

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
	planDayOpen: boolean;
	setPlanDayOpen: (open: boolean) => void;
	closeDayOpen: boolean;
	setCloseDayOpen: (open: boolean) => void;

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

	/** Minutes of task time a day can hold before meetings are subtracted. */
	workdayMinutes: number;
	setWorkdayMinutes: (minutes: number) => void;
};

const UiContext = createContext<UiState | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
	const [quickAdd, setQuickAdd] = useState<QuickAddOptions | null>(null);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [projectDialog, setProjectDialog] = useState<ProjectDialogState | null>(
		null,
	);
	const [helpOpen, setHelpOpen] = useState(false);
	const [planDayOpen, setPlanDayOpen] = useState(false);
	const [closeDayOpen, setCloseDayOpen] = useState(false);
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
	const [workdayMinutes, setWorkdayMinutesRaw] = useState(() =>
		readStoredNumber("workdayMinutes", DEFAULT_WORKDAY),
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

	useEffect(() => {
		localStorage.setItem("workdayMinutes", String(workdayMinutes));
	}, [workdayMinutes]);

	const setSidebarWidth = useCallback((width: number) => {
		setSidebarWidthRaw(
			Math.min(
				MAX_SIDEBAR_WIDTH,
				Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)),
			),
		);
	}, []);

	const setDailyTarget = useCallback((target: number) => {
		setDailyTargetRaw(
			Math.min(
				MAX_DAILY_TARGET,
				Math.max(MIN_DAILY_TARGET, Math.round(target)),
			),
		);
	}, []);

	const setWorkdayMinutes = useCallback((minutes: number) => {
		setWorkdayMinutesRaw(
			Math.min(
				MAX_WORKDAY_MINUTES,
				Math.max(MIN_WORKDAY_MINUTES, Math.round(minutes)),
			),
		);
	}, []);

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
			planDayOpen,
			setPlanDayOpen,
			closeDayOpen,
			setCloseDayOpen,
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
			workdayMinutes,
			setWorkdayMinutes,
		}),
		[
			quickAdd,
			editingTask,
			projectDialog,
			helpOpen,
			planDayOpen,
			closeDayOpen,
			paletteOpen,
			sidebarVisible,
			sidebarWidth,
			sidebarCollapsed,
			search,
			theme,
			dailyTarget,
			setDailyTarget,
			workdayMinutes,
			setWorkdayMinutes,
			setSidebarWidth,
		],
	);

	return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
	const context = useContext(UiContext);
	if (!context) throw new Error("useUi requires UiProvider");
	return context;
}
