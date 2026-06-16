import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { Project, Task } from "@/server/types";

export type QuickAddOptions = {
	parentTask?: Task;
	projectId?: number;
};

export type ProjectDialogState =
	| { mode: "create" }
	| { mode: "edit"; project: Project };

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

	search: string;
	setSearch: (value: string) => void;

	theme: "dark" | "light";
	toggleTheme: () => void;
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
	const [theme, setTheme] = useState<"dark" | "light">(() => {
		const stored = localStorage.getItem("theme");
		if (stored === "light" || stored === "dark") return stored;
		return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
	});

	useEffect(() => {
		document.documentElement.classList.toggle("light", theme === "light");
		localStorage.setItem("theme", theme);
	}, [theme]);

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
			search,
			setSearch,
			theme,
			toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
		}),
		[
			quickAdd,
			editingTask,
			projectDialog,
			helpOpen,
			paletteOpen,
			sidebarVisible,
			search,
			theme,
		],
	);

	return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
	const context = useContext(UiContext);
	if (!context) throw new Error("useUi requires UiProvider");
	return context;
}
