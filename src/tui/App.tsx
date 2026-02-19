import {
	addDays,
	endOfDay,
	format,
	isToday,
	parseISO,
	startOfDay,
	startOfWeek,
} from "date-fns";
import type { Key } from "ink";
import { Box, Text, useInput, useStdout } from "ink";
import TextInput from "ink-text-input";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
	AppSettings,
	AssistantMessage,
	Goal,
	Project,
	Reminder,
	Task,
} from "../server/types";
import { AssistantPanel, listPendingAssistantActions } from "./AssistantPanel";
import type { createApi } from "./api";
import { parseAssistantSettingsCommand } from "./assistant-commands";
import { Dashboard } from "./Dashboard";
import { HelpModal } from "./HelpModal";
import { NyanCat } from "./NyanCat";
import {
	parseTaskEditInput,
	serializeTaskToEditInput,
} from "./parse-task-input";
import {
	buildSettingsRows,
	type SettingsField,
	SettingsPanel,
} from "./SettingsPanel";
import type { SidebarItem } from "./Sidebar";
import { buildSidebarItems, Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { buildTaskPanelRows, TaskPanel } from "./TaskPanel";
import type { DayColumn, ViewMode } from "./UpcomingPanel";
import {
	buildColumns,
	buildColumnTaskRows,
	columnStartDate,
	dateKey,
	daysToShow,
	UpcomingPanel,
} from "./UpcomingPanel";

type View =
	| "inbox"
	| "today"
	| "upcoming"
	| "completed"
	| "project"
	| "settings";
type FocusArea = "sidebar" | "tasks" | "assistant";
type InputMode =
	| "none"
	| "quickAdd"
	| "createSubtask"
	| "createProject"
	| "addReminder"
	| "editTask"
	| "addGoal"
	| "assistantChat"
	| "setTimezone"
	| "setAiBaseUrl"
	| "setAiModel"
	| "setAiApiKey";

type ApiClient = ReturnType<typeof createApi>;

type AppProps = {
	api: ApiClient;
	onQuit: () => void;
};

const SIDEBAR_WIDTH = 28;

export const App = ({ api, onQuit }: AppProps) => {
	const { stdout } = useStdout();
	const terminalHeight = stdout?.rows ?? 24;
	const terminalWidth = stdout?.columns ?? 120;

	const [view, setView] = useState<View>("today");
	const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [projects, setProjects] = useState<Project[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [reminders, setReminders] = useState<Reminder[]>([]);
	const [taskIndex, setTaskIndex] = useState(0);
	const [settingsIndex, setSettingsIndex] = useState(0);
	const [columnIndex, setColumnIndex] = useState(0);
	const [sidebarIndex, setSidebarIndex] = useState(0);
	const [focusArea, setFocusArea] = useState<FocusArea>("sidebar");
	const [loading, setLoading] = useState(false);
	const [statusText, setStatusText] = useState("Ready");
	const [errorText, setErrorText] = useState<string | null>(null);
	const [inputMode, setInputMode] = useState<InputMode>("none");
	const [inputValue, setInputValue] = useState("");
	const [viewMode, setViewMode] = useState<ViewMode>("work-week");
	const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));
	const [showDashboard, setShowDashboard] = useState(true);
	const [showHelp, setShowHelp] = useState(false);
	const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
	const [showAssistant, setShowAssistant] = useState(
		() => terminalWidth >= 150,
	);
	const [assistantMessages, setAssistantMessages] = useState<
		AssistantMessage[]
	>([]);
	const [assistantActionIndex, setAssistantActionIndex] = useState(0);
	const [isAssistantThinking, setIsAssistantThinking] = useState(false);
	const [completedToday, setCompletedToday] = useState(0);

	const sidebarItems = useMemo(() => buildSidebarItems(projects), [projects]);

	const projectMap = useMemo(() => {
		const map: Record<number, Project> = {};
		for (const p of projects) map[p.id] = p;
		return map;
	}, [projects]);

	const columns = useMemo<DayColumn[]>(() => {
		if (view !== "upcoming") return [];
		return buildColumns(tasks, anchorDate, viewMode);
	}, [view, tasks, anchorDate, viewMode]);

	const taskRows = useMemo(() => buildTaskPanelRows(tasks), [tasks]);
	const settingsRows = useMemo(() => buildSettingsRows(settings), [settings]);
	const currentColumnRows = useMemo(
		() => buildColumnTaskRows(columns[columnIndex]?.tasks ?? []),
		[columns, columnIndex],
	);
	const selectedSettingsField = useMemo<SettingsField>(
		() => settingsRows[settingsIndex]?.field ?? "timezone",
		[settingsIndex, settingsRows],
	);

	// Derive the effective "selected task" — from columns when in upcoming view
	const selectedTask = useMemo(() => {
		if (view === "upcoming") {
			return currentColumnRows[taskIndex]?.task ?? null;
		}
		return taskRows[taskIndex]?.task ?? null;
	}, [view, currentColumnRows, taskIndex, taskRows]);

	const selectedReminder = reminders[0] ?? null;
	const pendingAssistantActions = useMemo(
		() => listPendingAssistantActions(assistantMessages),
		[assistantMessages],
	);

	const canDockAssistant = terminalWidth >= 150;
	const isAssistantOverlay = showAssistant && !canDockAssistant;

	const goalPeriodType =
		viewMode === "day" ? ("daily" as const) : ("weekly" as const);
	const goalPeriodStart = useMemo(() => {
		if (viewMode === "day") return dateKey(anchorDate);
		return dateKey(startOfWeek(anchorDate, { weekStartsOn: 1 }));
	}, [viewMode, anchorDate]);

	const viewLabel = useMemo(() => {
		if (view === "project") {
			const proj = projects.find((p) => p.id === activeProjectId);
			return proj?.name ?? "Project";
		}
		if (view === "settings") {
			return "Settings";
		}
		return view === "inbox"
			? "Inbox"
			: view === "today"
				? "Today"
				: view === "upcoming"
					? "Upcoming"
					: "Completed";
	}, [view, projects, activeProjectId]);

	const applySidebarSelection = useCallback((item: SidebarItem) => {
		if (item.type === "nav") {
			setView(item.view);
			setActiveProjectId(null);
		} else {
			setView("project");
			setActiveProjectId(item.project.id);
		}
		setTaskIndex(0);
		setSettingsIndex(0);
	}, []);

	const loadData = useCallback(async () => {
		setLoading(true);
		setErrorText(null);
		try {
			const [loadedProjects, loadedSettings] = await Promise.all([
				api.listProjects(),
				api.getSettings(),
			]);
			setProjects(loadedProjects);
			setSettings(loadedSettings);
			const resolvedInbox = loadedProjects.find((project) => project.isInbox);

			const now = new Date();
			const todayStart = startOfDay(now).toISOString();
			const todayEnd = endOfDay(now).toISOString();

			if (view === "settings") {
				setTasks([]);
				setStatusText("Settings");
			} else if (view === "inbox") {
				if (!resolvedInbox) {
					setTasks([]);
					setStatusText("Inbox project not found");
					return;
				}
				setTasks(
					await api.listTasks({ projectId: resolvedInbox.id, status: "open" }),
				);
				setStatusText("Inbox");
			} else if (view === "today") {
				setTasks(
					await api.listTasks({
						status: "open",
						from: todayStart,
						to: todayEnd,
					}),
				);
				setStatusText("Today");
			} else if (view === "upcoming") {
				const colStart = columnStartDate(anchorDate, viewMode);
				const count = daysToShow(viewMode);
				const rangeEnd = addDays(colStart, count - 1);
				const [taskData, overdueData, goalData] = await Promise.all([
					api.listTasks({
						status: "open",
						from: startOfDay(colStart).toISOString(),
						to: endOfDay(rangeEnd).toISOString(),
					}),
					api.listTasks({
						status: "open",
						to: startOfDay(colStart).toISOString(),
					}),
					api.listGoals({
						periodType: goalPeriodType,
						periodStart: goalPeriodStart,
					}),
				]);
				const overdueFiltered = overdueData.filter(
					(t) => t.dueAt && parseISO(t.dueAt) < startOfDay(colStart),
				);
				setTasks([...overdueFiltered, ...taskData]);
				setGoals(goalData);
				setStatusText(
					`Upcoming · ${format(colStart, "d MMM")} – ${format(rangeEnd, "d MMM")}`,
				);
			} else if (view === "project") {
				if (!activeProjectId) {
					setTasks([]);
					setStatusText("No project selected");
				} else {
					const proj = loadedProjects.find((p) => p.id === activeProjectId);
					setTasks(
						await api.listTasks({ status: "open", projectId: activeProjectId }),
					);
					setStatusText(proj?.name ?? "Project");
				}
			} else {
				setTasks(await api.listTasks({ status: "completed" }));
				setStatusText("Completed");
			}
			// Fetch completed-today count for NyanCat
			const completedTasks = await api.listTasks({ status: "completed" });
			setCompletedToday(
				completedTasks.filter(
					(t) => t.completedAt && isToday(parseISO(t.completedAt)),
				).length,
			);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
			setStatusText("Failed to load");
		} finally {
			setLoading(false);
		}
	}, [
		activeProjectId,
		api,
		view,
		anchorDate,
		viewMode,
		goalPeriodType,
		goalPeriodStart,
	]);

	const loadAssistant = useCallback(async () => {
		try {
			const state = await api.getAssistantState("tui");
			setAssistantMessages(state.messages);
		} catch {
			// Assistant is non-critical — silently ignore load errors
		}
	}, [api]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	useEffect(() => {
		void loadAssistant();
	}, [loadAssistant]);

	useEffect(() => {
		setTaskIndex((current) => {
			if (view === "upcoming") {
				if (currentColumnRows.length === 0) return 0;
				return Math.min(current, currentColumnRows.length - 1);
			}
			if (taskRows.length === 0) return 0;
			return Math.min(current, taskRows.length - 1);
		});
	}, [view, currentColumnRows.length, taskRows.length]);

	useEffect(() => {
		setSettingsIndex((current) => {
			if (settingsRows.length === 0) return 0;
			return Math.min(current, settingsRows.length - 1);
		});
	}, [settingsRows.length]);

	useEffect(() => {
		setAssistantActionIndex((current) => {
			if (pendingAssistantActions.length === 0) {
				return 0;
			}
			return Math.min(current, pendingAssistantActions.length - 1);
		});
	}, [pendingAssistantActions.length]);

	useEffect(() => {
		if (!showAssistant && focusArea === "assistant") {
			setFocusArea("tasks");
		}
	}, [focusArea, showAssistant]);

	useEffect(() => {
		if (isAssistantOverlay && focusArea === "tasks") {
			setFocusArea("assistant");
		}
	}, [focusArea, isAssistantOverlay]);

	useEffect(() => {
		const loadReminders = async () => {
			if (!selectedTask) {
				setReminders([]);
				return;
			}
			try {
				setReminders(await api.listTaskReminders(selectedTask.id));
			} catch {
				setReminders([]);
			}
		};
		void loadReminders();
	}, [api, selectedTask]);

	const closeInput = useCallback(() => {
		setInputMode("none");
		setInputValue("");
	}, []);

	const updateSettingsPatch = useCallback(
		async (
			patch: Parameters<ApiClient["updateSettings"]>[0],
			successMessage: string,
		) => {
			setLoading(true);
			setErrorText(null);
			try {
				const updatedSettings = await api.updateSettings(patch);
				setSettings(updatedSettings);
				setStatusText(successMessage);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				setErrorText(message);
			} finally {
				setLoading(false);
			}
		},
		[api],
	);

	const editSelectedSetting = useCallback(() => {
		switch (selectedSettingsField) {
			case "timezone":
				setInputMode("setTimezone");
				setInputValue(settings?.timezone ?? "");
				return;
			case "aiProvider":
				void updateSettingsPatch(
					{
						aiProvider:
							(settings?.aiProvider ?? "lmstudio") === "lmstudio"
								? "openai"
								: "lmstudio",
					},
					"Assistant provider updated",
				);
				return;
			case "aiBaseUrl":
				setInputMode("setAiBaseUrl");
				setInputValue(settings?.aiBaseUrl ?? "");
				return;
			case "aiModel":
				setInputMode("setAiModel");
				setInputValue(settings?.aiModel ?? "");
				return;
			case "aiApiKey":
				setInputMode("setAiApiKey");
				setInputValue("");
				return;
		}
	}, [selectedSettingsField, settings, updateSettingsPatch]);

	const submitInput = useCallback(async () => {
		const value = inputValue.trim();
		const allowsEmptyValue =
			inputMode === "setAiBaseUrl" ||
			inputMode === "setAiModel" ||
			inputMode === "setAiApiKey";
		if (value.length === 0 && !allowsEmptyValue) {
			closeInput();
			return;
		}

		setLoading(true);
		setErrorText(null);
		try {
			if (inputMode === "setTimezone") {
				const updatedSettings = await api.updateSettings({ timezone: value });
				setSettings(updatedSettings);
				setStatusText("Timezone updated");
			} else if (inputMode === "setAiBaseUrl") {
				const updatedSettings = await api.updateSettings({
					aiBaseUrl: value.length > 0 ? value : null,
				});
				setSettings(updatedSettings);
				setStatusText(
					value.length > 0
						? "Assistant base URL updated"
						: "Assistant base URL cleared",
				);
			} else if (inputMode === "setAiModel") {
				const updatedSettings = await api.updateSettings({
					aiModel: value.length > 0 ? value : null,
				});
				setSettings(updatedSettings);
				setStatusText(
					value.length > 0
						? "Assistant model updated"
						: "Assistant model cleared",
				);
			} else if (inputMode === "setAiApiKey") {
				const updatedSettings =
					value.length > 0
						? await api.updateSettings({ aiApiKey: value })
						: await api.updateSettings({ clearAiApiKey: true });
				setSettings(updatedSettings);
				setStatusText(
					value.length > 0
						? "Assistant API key updated"
						: "Assistant API key cleared",
				);
			} else if (inputMode === "assistantChat") {
				const command = parseAssistantSettingsCommand(value);
				if (command) {
					if (command.type === "set_key") {
						const updatedSettings = await api.updateSettings({
							aiApiKey: command.value,
						});
						setSettings(updatedSettings);
						setStatusText("Assistant API key updated");
					} else if (command.type === "set_base") {
						const updatedSettings = await api.updateSettings({
							aiBaseUrl: command.value,
						});
						setSettings(updatedSettings);
						setStatusText("Assistant base URL updated");
					} else if (command.type === "set_model") {
						const updatedSettings = await api.updateSettings({
							aiModel: command.value,
						});
						setSettings(updatedSettings);
						setStatusText("Assistant model updated");
					} else {
						const updatedSettings = await api.updateSettings({
							clearAiApiKey: true,
						});
						setSettings(updatedSettings);
						setStatusText("Assistant API key cleared");
					}
				} else {
					setIsAssistantThinking(true);
					try {
						await api.sendAssistantChat({
							surface: "tui",
							message: value,
						});
						setStatusText("Assistant replied");
					} finally {
						setIsAssistantThinking(false);
						await loadAssistant();
					}
				}
			} else if (inputMode === "quickAdd") {
				await api.createQuickAdd(value);
				setStatusText("Task created");
			} else if (inputMode === "createSubtask") {
				if (!selectedTask) {
					setStatusText("No task selected");
				} else {
					await api.createTask({
						projectId: selectedTask.projectId,
						parentTaskId: selectedTask.id,
						title: value,
					});
					setStatusText("Subtask created");
				}
			} else if (inputMode === "createProject") {
				await api.createProject({ name: value });
				setStatusText("Project created");
			} else if (inputMode === "addReminder") {
				if (!selectedTask) {
					setStatusText("No task selected");
				} else {
					await api.createReminder(selectedTask.id, { remindAt: value });
					setStatusText("Reminder created");
				}
			} else if (inputMode === "editTask") {
				if (!selectedTask) {
					setStatusText("No task selected");
				} else {
					const { patch, warnings } = parseTaskEditInput(value, projects);
					if (Object.keys(patch).length === 0) {
						setStatusText("Nothing to update");
					} else {
						await api.updateTask(selectedTask.id, patch);
						setStatusText(
							warnings.length > 0
								? `Task updated (warnings: ${warnings.join("; ")})`
								: "Task updated",
						);
					}
				}
			} else if (inputMode === "addGoal") {
				await api.createGoal({
					periodType: goalPeriodType,
					periodStart: goalPeriodStart,
					title: value,
				});
				setStatusText("Goal created");
			}
			closeInput();
			const shouldReloadData =
				inputMode !== "assistantChat" &&
				inputMode !== "setTimezone" &&
				inputMode !== "setAiBaseUrl" &&
				inputMode !== "setAiModel" &&
				inputMode !== "setAiApiKey";
			if (shouldReloadData) {
				await loadData();
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [
		api,
		closeInput,
		goalPeriodStart,
		goalPeriodType,
		inputMode,
		inputValue,
		loadData,
		loadAssistant,
		projects,
		selectedTask,
	]);

	const toggleSelectedTask = useCallback(async () => {
		if (!selectedTask) return;
		setLoading(true);
		setErrorText(null);
		try {
			if (selectedTask.status === "completed") {
				await api.uncompleteTask(selectedTask.id);
				setStatusText("Task reopened");
			} else {
				await api.completeTask(selectedTask.id);
				setStatusText("Task completed");
			}
			await loadData();
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [api, loadData, selectedTask]);

	const clearAssistantChat = useCallback(async () => {
		setLoading(true);
		setErrorText(null);
		try {
			await api.clearAssistantMessages("tui");
			setAssistantMessages([]);
			setStatusText("Assistant chat cleared");
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setErrorText(message);
		} finally {
			setLoading(false);
		}
	}, [api]);

	const decideSelectedAssistantAction = useCallback(
		async (decision: "confirm" | "cancel") => {
			const selected = pendingAssistantActions[assistantActionIndex];
			if (!selected) {
				setStatusText("No pending assistant action selected");
				return;
			}
			setLoading(true);
			setErrorText(null);
			try {
				await api.decideAssistantAction({
					surface: "tui",
					messageId: selected.messageId,
					actionId: selected.actionId,
					decision,
				});
				await Promise.all([loadAssistant(), loadData()]);
				setStatusText(
					decision === "confirm"
						? "Assistant action confirmed"
						: "Assistant action cancelled",
				);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				setErrorText(message);
			} finally {
				setLoading(false);
			}
		},
		[
			api,
			assistantActionIndex,
			loadAssistant,
			loadData,
			pendingAssistantActions,
		],
	);

	useInput((input: string, key: Key) => {
		if (showHelp) {
			if (key.escape || input === "?") setShowHelp(false);
			return;
		}

		if (inputMode !== "none") {
			if (key.escape) closeInput();
			if (key.return) void submitInput();
			return;
		}

		if (input === "?") {
			setShowHelp(true);
			return;
		}

		if (input === "q") {
			onQuit();
			return;
		}

		if (key.ctrl && input === "j") {
			setShowAssistant((current) => {
				const next = !current;
				if (next && !canDockAssistant) {
					setFocusArea("assistant");
				}
				return next;
			});
			return;
		}

		if (key.tab) {
			const cycle: FocusArea[] = showAssistant
				? isAssistantOverlay
					? ["sidebar", "assistant"]
					: ["sidebar", "tasks", "assistant"]
				: ["sidebar", "tasks"];
			setFocusArea((current) => {
				const currentIndex = cycle.indexOf(current);
				const nextIndex = (currentIndex + 1) % cycle.length;
				return cycle[nextIndex] ?? "sidebar";
			});
			return;
		}

		if (input === "r") {
			void loadData();
			return;
		}

		if (input === "S") {
			setView("settings");
			setActiveProjectId(null);
			setFocusArea("tasks");
			const settingsNavIndex = sidebarItems.findIndex(
				(item) => item.type === "nav" && item.view === "settings",
			);
			if (settingsNavIndex >= 0) {
				setSidebarIndex(settingsNavIndex);
			}
			setSettingsIndex(0);
			return;
		}

		if (input === "c") {
			if (!showAssistant) {
				setShowAssistant(true);
			}
			setInputMode("assistantChat");
			setInputValue("");
			setFocusArea("assistant");
			return;
		}

		if (focusArea === "sidebar") {
			if (input === "j" || key.downArrow) {
				setSidebarIndex((c) =>
					Math.min(c + 1, Math.max(sidebarItems.length - 1, 0)),
				);
				return;
			}
			if (input === "k" || key.upArrow) {
				setSidebarIndex((c) => Math.max(c - 1, 0));
				return;
			}
			if (key.return) {
				const item = sidebarItems[sidebarIndex];
				if (item) applySidebarSelection(item);
				return;
			}
		}

		if (focusArea === "tasks") {
			if (view === "settings") {
				if (input === "j" || key.downArrow) {
					setSettingsIndex((current) =>
						Math.min(current + 1, Math.max(settingsRows.length - 1, 0)),
					);
					return;
				}
				if (input === "k" || key.upArrow) {
					setSettingsIndex((current) => Math.max(current - 1, 0));
					return;
				}
				if (key.return || input === "e") {
					editSelectedSetting();
					return;
				}
				if (input === " " && selectedSettingsField === "aiProvider") {
					editSelectedSetting();
					return;
				}
				if (input === "x" && selectedSettingsField === "aiApiKey") {
					void updateSettingsPatch(
						{ clearAiApiKey: true },
						"Assistant API key cleared",
					);
					return;
				}
			} else if (view === "upcoming") {
				// Column navigation (h/l or left/right)
				if (input === "h" || key.leftArrow) {
					setColumnIndex((c) => Math.max(c - 1, 0));
					setTaskIndex(0);
					return;
				}
				if (input === "l" || key.rightArrow) {
					setColumnIndex((c) =>
						Math.min(c + 1, Math.max(columns.length - 1, 0)),
					);
					setTaskIndex(0);
					return;
				}
				// Task navigation within column (j/k or up/down)
				const currentColTasks = currentColumnRows;
				if (input === "j" || key.downArrow) {
					setTaskIndex((c) =>
						Math.min(c + 1, Math.max(currentColTasks.length - 1, 0)),
					);
					return;
				}
				if (input === "k" || key.upArrow) {
					setTaskIndex((c) => Math.max(c - 1, 0));
					return;
				}
			} else {
				if (input === "j" || key.downArrow) {
					setTaskIndex((c) =>
						Math.min(c + 1, Math.max(taskRows.length - 1, 0)),
					);
					return;
				}
				if (input === "k" || key.upArrow) {
					setTaskIndex((c) => Math.max(c - 1, 0));
					return;
				}
			}
		}

		if (focusArea === "assistant") {
			if (input === "j" || key.downArrow) {
				setAssistantActionIndex((current) =>
					Math.min(
						current + 1,
						Math.max(pendingAssistantActions.length - 1, 0),
					),
				);
				return;
			}
			if (input === "k" || key.upArrow) {
				setAssistantActionIndex((current) => Math.max(current - 1, 0));
				return;
			}
			if (input === "y") {
				void decideSelectedAssistantAction("confirm");
				return;
			}
			if (input === "n") {
				void decideSelectedAssistantAction("cancel");
				return;
			}
			if (input === "X") {
				void clearAssistantChat();
				return;
			}
		}

		// Upcoming-specific global shortcuts
		if (view === "upcoming") {
			if (input === "[") {
				const step = viewMode === "day" ? 1 : 7;
				setAnchorDate((d) => addDays(d, -step));
				setColumnIndex(0);
				setTaskIndex(0);
				return;
			}
			if (input === "]") {
				const step = viewMode === "day" ? 1 : 7;
				setAnchorDate((d) => addDays(d, step));
				setColumnIndex(0);
				setTaskIndex(0);
				return;
			}
			if (input === "t") {
				setAnchorDate(startOfDay(new Date()));
				setColumnIndex(0);
				setTaskIndex(0);
				return;
			}
			if (input === "v") {
				setViewMode((m) =>
					m === "day" ? "work-week" : m === "work-week" ? "week" : "day",
				);
				setColumnIndex(0);
				setTaskIndex(0);
				return;
			}
			if (input === "g") {
				setInputMode("addGoal");
				setInputValue("");
				return;
			}
		}

		if (input === "x") {
			void toggleSelectedTask();
			return;
		}

		if (input === "a") {
			setInputMode("quickAdd");
			setInputValue("");
			return;
		}

		if (input === "s") {
			if (!selectedTask) {
				setStatusText("No task selected");
				return;
			}
			setInputMode("createSubtask");
			setInputValue("");
			return;
		}

		if (input === "p") {
			setInputMode("createProject");
			setInputValue("");
			return;
		}

		if (input === "m") {
			setInputMode("addReminder");
			setInputValue("");
			return;
		}

		if (input === "e") {
			if (!selectedTask) return;
			const projectName = projectMap[selectedTask.projectId]?.name;
			const initialValue = serializeTaskToEditInput(selectedTask.title, {
				projectName,
				parentTaskId: selectedTask.parentTaskId,
				priority: selectedTask.priority,
				dueAt: selectedTask.dueAt,
				scheduledAt: selectedTask.scheduledAt,
				recurrencePreset: selectedTask.recurrencePreset,
			});
			setInputMode("editTask");
			setInputValue(initialValue);
			return;
		}

		if (input === " ") {
			if (!selectedTask) return;
			setExpandedTaskId(
				expandedTaskId === selectedTask.id ? null : selectedTask.id,
			);
			return;
		}

		if (input === "d") {
			if (!selectedTask) return;
			void (async () => {
				setLoading(true);
				setErrorText(null);
				try {
					await api.deleteTask(selectedTask.id);
					setStatusText("Task deleted");
					await loadData();
				} catch (error) {
					const message =
						error instanceof Error ? error.message : String(error);
					setErrorText(message);
				} finally {
					setLoading(false);
				}
			})();
			return;
		}

		if (input === "z") {
			if (!selectedReminder) return;
			void (async () => {
				setLoading(true);
				setErrorText(null);
				try {
					await api.deleteReminder(selectedReminder.id);
					setStatusText("Reminder deleted");
					if (selectedTask) {
						setReminders(await api.listTaskReminders(selectedTask.id));
					}
				} catch (error) {
					const message =
						error instanceof Error ? error.message : String(error);
					setErrorText(message);
				} finally {
					setLoading(false);
				}
			})();
			return;
		}
	});

	const isInputMode = inputMode !== "none";
	const isBottomBarMode = isInputMode && inputMode !== "assistantChat";
	// Reserve rows for nyan cat (1) + status bar (1) + input bar (2 if active) + borders
	const mainPanelHeight = Math.max(
		terminalHeight - (isBottomBarMode ? 5 : 3),
		6,
	);

	if (showDashboard) {
		return (
			<Dashboard
				onDismiss={() => setShowDashboard(false)}
				terminalWidth={stdout?.columns ?? 120}
				terminalHeight={terminalHeight}
			/>
		);
	}

	return (
		<Box flexDirection="column" height={terminalHeight}>
			<Box flexDirection="row" height={mainPanelHeight}>
				<Sidebar
					items={sidebarItems}
					selectedIndex={sidebarIndex}
					focused={focusArea === "sidebar"}
					width={SIDEBAR_WIDTH}
				/>
				{isAssistantOverlay ? (
					<AssistantPanel
						focused={focusArea === "assistant"}
						messages={assistantMessages}
						selectedPendingIndex={assistantActionIndex}
						isChatMode={inputMode === "assistantChat"}
						chatInput={inputValue}
						onChatInputChange={setInputValue}
						isThinking={isAssistantThinking}
					/>
				) : (
					<>
						{view === "upcoming" ? (
							<UpcomingPanel
								columns={columns}
								goals={goals}
								projectMap={projectMap}
								viewMode={viewMode}
								anchorDate={anchorDate}
								focused={focusArea === "tasks"}
								selectedColumnIndex={columnIndex}
								selectedTaskIndex={taskIndex}
								terminalWidth={terminalWidth}
							/>
						) : view === "settings" ? (
							<SettingsPanel
								settings={settings}
								rows={settingsRows}
								selectedIndex={settingsIndex}
								focused={focusArea === "tasks"}
							/>
						) : (
							<TaskPanel
								rows={taskRows}
								projectMap={projectMap}
								viewLabel={viewLabel}
								focused={focusArea === "tasks"}
								selectedIndex={taskIndex}
								expandedTaskId={expandedTaskId}
							/>
						)}
						{showAssistant && canDockAssistant && (
							<AssistantPanel
								focused={focusArea === "assistant"}
								messages={assistantMessages}
								selectedPendingIndex={assistantActionIndex}
								isChatMode={inputMode === "assistantChat"}
								chatInput={inputValue}
								onChatInputChange={setInputValue}
								isThinking={isAssistantThinking}
							/>
						)}
					</>
				)}
			</Box>

			{isBottomBarMode && (
				<Box paddingX={1}>
					<Text color="magentaBright" bold>
						{inputMode === "quickAdd" && "Quick add: "}
						{inputMode === "createSubtask" && "Subtask title: "}
						{inputMode === "createProject" && "New project: "}
						{inputMode === "addReminder" && "Reminder (ISO): "}
						{inputMode === "editTask" && "Edit task: "}
						{inputMode === "addGoal" && "New goal: "}
						{inputMode === "setTimezone" && "Timezone: "}
						{inputMode === "setAiBaseUrl" &&
							"Assistant base URL (empty clears): "}
						{inputMode === "setAiModel" && "Assistant model (empty clears): "}
						{inputMode === "setAiApiKey" &&
							"Assistant API key (empty clears): "}
					</Text>
					<TextInput value={inputValue} onChange={setInputValue} />
				</Box>
			)}


			<StatusBar
				isInputMode={isInputMode}
				statusText={loading ? "Loading..." : statusText}
				errorText={errorText}
			/>
			{showHelp && (
				<HelpModal
					terminalWidth={stdout?.columns ?? 120}
					terminalHeight={terminalHeight}
				/>
			)}
		</Box>
	);
};
