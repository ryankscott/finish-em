import { createContext, useContext, useMemo, useState } from "react";

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
		}),
		[
			quickAdd,
			editingTask,
			projectDialog,
			helpOpen,
			paletteOpen,
			sidebarVisible,
			search,
		],
	);

	return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
	const context = useContext(UiContext);
	if (!context) throw new Error("useUi requires UiProvider");
	return context;
}
