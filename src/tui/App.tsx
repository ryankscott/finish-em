import {
	addDays,
	endOfDay,
	format,
	parseISO,
	startOfDay,
	startOfWeek,
} from "date-fns";
import type { Key } from "ink";
import { Box, Text, useInput, useStdout } from "ink";
import TextInput from "ink-text-input";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { AppSettings, AssistantMessage, Goal, Project, Reminder, Task } from "../server/types";
import {
	getMainPaneTerminalWidth,
	toggleAssistantVisibility,
} from "./assistant-layout";
import { AssistantPanel } from "./AssistantPanel";
import { parseAssistantSettingsCommand } from "./assistant-commands";
import type { createApi } from "./api";
import {
	parseTaskEditInput,
	serializeTaskToEditInput,
} from "./parse-task-input";
import { getProjectCreateAutocomplete, getTaskCreateAutocomplete } from "./input-autocomplete";
import { openUrl } from "../lib/open-url";
import { normalizeBareUrlsInText, toDisplaySegments } from "../lib/task-links";
import {
	parseProjectCreateInput,
	serializeProjectToEditInput,
} from "./parse-project-input";
import { parseTaskCreateInput } from "./parse-task-create-input";
import { Dashboard } from "./Dashboard";
import { HelpModal } from "./HelpModal";
import { buildSettingsRows, SettingsPanel } from "./SettingsPanel";
import type { SidebarItem } from "./Sidebar";
import { buildSidebarItems, Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import type { StatusMessageTone } from "./StatusMessage";
import { buildTaskPanelRows, TaskPanel } from "./TaskPanel";
import { ToastStack, type ToastMessage } from "./ToastStack";
import type { DayColumn, ViewMode } from "./UpcomingPanel";
import {
	buildColumns,
	buildColumnTaskRows,
	columnStartDate,
	dateKey,
	daysToShow,
	UpcomingPanel,
} from "./UpcomingPanel";

type View = "inbox" | "today" | "upcoming" | "completed" | "project" | "settings";
type FocusArea = "sidebar" | "tasks" | "assistant";
type InputMode =
	| "none"
	| "quickAdd"
	| "createSubtask"
	| "createProject"
	| "editProject"
	| "addReminder"
	| "editTask"
	| "editSetting"
	| "addGoal"
	| "assistantChat"
	| "linkPicker";

type ApiClient = ReturnType<typeof createApi>;

type AppProps = {
	api: ApiClient;
	onQuit: () => void;
};

const SIDEBAR_WIDTH = 28;
const AUTOCOMPLETE_TOKEN_PATTERN = /^([a-z_]+:)$/i;
const TOAST_TTL_MS = 5000;
const MAX_TOASTS = 4;

export function shouldStartProjectEdit(input: string, view: View, activeProjectId: number | null) {
	return input === "e" && view === "project" && activeProjectId !== null;
}

function renderAutocompleteHint(hint: string) {
	return hint.split(/([a-z_]+:)/gi).map((segment, index) => {
		if (!segment) return null;
		if (AUTOCOMPLETE_TOKEN_PATTERN.test(segment)) {
			return (
				<Text key={`token-${index}`} color="magentaBright">
					{segment}
				</Text>
			);
		}
		return (
			<Text key={`text-${index}`} dimColor>
				{segment}
			</Text>
		);
	});
}

export const App = ({ api, onQuit }: AppProps) => {
	const { stdout } = useStdout();
	const terminalHeight = stdout?.rows ?? 24;
	const terminalWidth = stdout?.columns ?? 120;

	const [view, setView] = useState<View>("today");
	const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
	const [projects, setProjects] = useState<Project[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [reminders, setReminders] = useState<Reminder[]>([]);
	const [taskIndex, setTaskIndex] = useState(0);
	const [columnIndex, setColumnIndex] = useState(0);
	const [sidebarIndex, setSidebarIndex] = useState(0);
	const [focusArea, setFocusArea] = useState<FocusArea>("sidebar");
	const [loading, setLoading] = useState(false);
	const [statusText, setStatusText] = useState("Ready");
	const [errorText, setErrorText] = useState<string | null>(null);
	const [toasts, setToasts] = useState<(ToastMessage & { expiresAt: number })[]>([]);
	const [inputMode, setInputMode] = useState<InputMode>("none");
	const [inputValue, setInputValue] = useState("");
	const [inputResetVersion, setInputResetVersion] = useState(0);
	const [viewMode, setViewMode] = useState<ViewMode>("work-week");
	const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));
	const [showDashboard, setShowDashboard] = useState(true);
	const [showHelp, setShowHelp] = useState(false);
	const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
	const [showAssistant, setShowAssistant] = useState(false);
	const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
	const [isAssistantThinking, setIsAssistantThinking] = useState(false);
	const [settings, setSettings] = useState<AppSettings | null>(null);
	const [settingsIndex, setSettingsIndex] = useState(0);
	const [editingSettingField, setEditingSettingField] = useState<
		"timezone" | "aiProvider" | "aiBaseUrl" | "aiModel" | "aiApiKey" | null
	>(null);
	const [linkPickerLinks, setLinkPickerLinks] = useState<
		{ url: string; displayLabel: string }[] | null
	>(null);
	const [linkPickerIndex, setLinkPickerIndex] = useState(0);

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
	const currentColumnRows = useMemo(
		() => buildColumnTaskRows(columns[columnIndex]?.tasks ?? []),
		[columns, columnIndex],
	);

	// Derive the effective "selected task" — from columns when in upcoming view
	const selectedTask = useMemo(() => {
		if (view === "upcoming") {
			return currentColumnRows[taskIndex]?.task ?? null;
		}
		return taskRows[taskIndex]?.task ?? null;
	}, [view, currentColumnRows, taskIndex, taskRows]);

	const selectedReminder = reminders[0] ?? null;
	const settingsRows = useMemo(() => buildSettingsRows(settings), [settings]);
	const selectedSettingsRow = settingsRows[settingsIndex] ?? settingsRows[0] ?? null;
	const cycleProvider = useCallback((provider: "gemini" | "openai" | "lmstudio") => {
		if (provider === "gemini") return "openai";
		if (provider === "openai") return "lmstudio";
		return "gemini";
	}, []);
	const inputAutocomplete = useMemo(() => {
		if (inputMode === "createProject" || inputMode === "editProject") {
			return getProjectCreateAutocomplete(inputValue);
		}
		if (inputMode === "quickAdd") {
			return getTaskCreateAutocomplete(inputValue, projects);
		}
		return null;
	}, [inputMode, inputValue, projects]);

	const pushToast = useCallback((text: string, tone: StatusMessageTone = "info") => {
		const now = Date.now();
		const toast: ToastMessage & { expiresAt: number } = {
			id: now + Math.floor(Math.random() * 1000),
			text,
			tone,
			expiresAt: now + TOAST_TTL_MS,
		};
		setToasts((current) => [...current, toast].slice(-MAX_TOASTS));
	}, []);

	const canDockAssistant = terminalWidth >= 150;
	const isAssistantOverlay = showAssistant && !canDockAssistant;
	const mainPaneTerminalWidth = getMainPaneTerminalWidth({
		terminalWidth,
		showAssistant,
		canDockAssistant,
	});
	const contentPaneTerminalWidth = Math.max(mainPaneTerminalWidth - SIDEBAR_WIDTH, 40);

	const goalPeriodType =
		viewMode === "day" ? ("daily" as const) : ("weekly" as const);
	const goalPeriodStart = useMemo(() => {
		if (viewMode === "day") return dateKey(anchorDate);
		return dateKey(startOfWeek(anchorDate, { weekStartsOn: 1 }));
	}, [viewMode, anchorDate]);

	const viewLabel = useMemo(() => {
		if (view === "project") {
			const proj = projects.find((p) => p.id === activeProjectId);
			if (!proj) return "Project";
			return proj.emoji ? `${proj.emoji} ${proj.name}` : proj.name;
		}
		return view === "inbox"
			? "Inbox"
			: view === "today"
				? "Today"
				: view === "upcoming"
					? "Upcoming"
					: "Completed";
	}, [view, projects, activeProjectId]);
	const activeProject = useMemo(
		() => projects.find((p) => p.id === activeProjectId) ?? null,
		[projects, activeProjectId],
	);

	const applySidebarSelection = useCallback((item: SidebarItem) => {
		if (item.type === "nav") {
			setView(item.view);
			setActiveProjectId(null);
		} else {
			setView("project");
			setActiveProjectId(item.project.id);
		}
		setTaskIndex(0);
	}, []);

	const loadData = useCallback(async () => {
		setLoading(true);
		setErrorText(null);
		try {
			setSettings(await api.getSettings());
			const loadedProjects = await api.listProjects();
			setProjects(loadedProjects);
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
			if (settingsRows.length === 0) {
				return 0;
			}
			return Math.min(current, settingsRows.length - 1);
		});
	}, [settingsRows.length]);

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

	useEffect(() => {
		const timer = setInterval(() => {
			const now = Date.now();
			setToasts((current) =>
				current.filter((toast) => toast.expiresAt > now),
			);
		}, 400);
		return () => clearInterval(timer);
	}, []);

	const closeInput = useCallback(() => {
		setInputMode("none");
		setInputValue("");
	}, []);

	const submitInput = useCallback(async () => {
		const value = inputValue.trim();
		if (value.length === 0) {
			closeInput();
			return;
		}

		setLoading(true);
		setErrorText(null);
		try {
			if (inputMode === "assistantChat") {
				setInputValue("");
				const command = parseAssistantSettingsCommand(value);
				if (command) {
					if (command.type === "set_provider") {
						await api.updateSettings({ aiProvider: command.value });
						setStatusText(`Assistant provider set to ${command.value}`);
					} else if (command.type === "set_key") {
						await api.updateSettings({ aiApiKey: command.value });
						setStatusText("Assistant API key updated");
					} else if (command.type === "set_base") {
						await api.updateSettings({ aiBaseUrl: command.value });
						setStatusText("Assistant base URL updated");
					} else if (command.type === "set_model") {
						await api.updateSettings({ aiModel: command.value });
						setStatusText("Assistant model updated");
					} else {
						await api.updateSettings({ clearAiApiKey: true });
						setStatusText("Assistant API key cleared");
					}
				} else {
					const nowIso = new Date().toISOString();
					const optimisticUserMessageId = -Date.now();
					const optimisticUserMessage: AssistantMessage = {
						id: optimisticUserMessageId,
						surface: "tui",
						role: "user",
						content: value,
						actions: [],
						createdAt: nowIso,
						updatedAt: nowIso,
					};
					setAssistantMessages((current) => [...current, optimisticUserMessage]);

					setIsAssistantThinking(true);
					try {
						await api.sendAssistantChat({
							surface: "tui",
							message: value,
						});
					} catch (error) {
						setAssistantMessages((current) =>
							current.filter((message) => message.id !== optimisticUserMessageId),
						);
						throw error;
					} finally {
						setIsAssistantThinking(false);
					}
					setStatusText("Assistant replied");
				}
				await loadAssistant();
			} else if (inputMode === "editSetting") {
				if (!editingSettingField) {
					setStatusText("No setting selected");
				} else if (editingSettingField === "timezone") {
					await api.updateSettings({ timezone: value });
					setStatusText("Timezone updated");
				} else if (editingSettingField === "aiBaseUrl") {
					await api.updateSettings({ aiBaseUrl: value });
					setStatusText("Assistant base URL updated");
				} else if (editingSettingField === "aiModel") {
					await api.updateSettings({ aiModel: value });
					setStatusText("Assistant model updated");
				} else if (editingSettingField === "aiApiKey") {
					await api.updateSettings({ aiApiKey: value });
					setStatusText("Assistant API key updated");
				}
				setSettings(await api.getSettings());
				setEditingSettingField(null);
			} else if (inputMode === "quickAdd") {
				const parsed = parseTaskCreateInput(value, projects);
				if (parsed.usedTokens) {
					if (parsed.errors.length > 0) {
						setStatusText(`Task not created: ${parsed.errors.join("; ")}`);
					} else {
						const title = normalizeBareUrlsInText(String(parsed.input.title));
						const notes =
							parsed.input.notes != null
								? normalizeBareUrlsInText(parsed.input.notes)
								: undefined;
						await api.createTask({
							title,
							projectId:
								parsed.input.projectId ??
								(projects.find((project) => project.isInbox)?.id ?? 1),
							parentTaskId: parsed.input.parentTaskId,
							notes,
							priority: parsed.input.priority,
							scheduledAt: parsed.input.scheduledAt,
							dueAt: parsed.input.dueAt,
							dueTimezone: parsed.input.dueTimezone,
							recurrencePreset: parsed.input.recurrencePreset,
							recurrenceRRule: parsed.input.recurrenceRRule,
						});
						setStatusText(
							parsed.warnings.length > 0
								? `Task created (warnings: ${parsed.warnings.join("; ")})`
								: "Task created",
						);
					}
				} else {
					await api.createQuickAdd(value);
					setStatusText("Task created");
				}
			} else if (inputMode === "createSubtask") {
				if (!selectedTask) {
					setStatusText("No task selected");
				} else {
					await api.createTask({
						projectId: selectedTask.projectId,
						parentTaskId: selectedTask.id,
						title: normalizeBareUrlsInText(value),
					});
					setStatusText("Subtask created");
				}
			} else if (inputMode === "createProject") {
				const parsed = parseProjectCreateInput(value);
				if (parsed.errors.length > 0) {
					setStatusText(`Project not created: ${parsed.errors.join("; ")}`);
				} else {
					await api.createProject({
						name: String(parsed.input.name),
						emoji: parsed.input.emoji ?? undefined,
						description: parsed.input.description,
						startAt: parsed.input.startAt,
						endAt: parsed.input.endAt,
						color: parsed.input.color,
						isInbox: parsed.input.isInbox,
					});
					setStatusText(
						parsed.warnings.length > 0
							? `Project created (warnings: ${parsed.warnings.join("; ")})`
							: "Project created",
						);
				}
			} else if (inputMode === "editProject") {
				if (!activeProjectId) {
					setStatusText("No project selected");
				} else {
					const parsed = parseProjectCreateInput(value);
					if (parsed.errors.length > 0) {
						setStatusText(`Project not updated: ${parsed.errors.join("; ")}`);
					} else {
						const patch = {
							name: parsed.input.name,
							emoji: parsed.input.emoji ?? undefined,
							description: parsed.input.description,
							startAt: parsed.input.startAt,
							endAt: parsed.input.endAt,
						};
						await api.updateProject(activeProjectId, patch);
						setStatusText(
							parsed.warnings.length > 0
								? `Project updated (warnings: ${parsed.warnings.join("; ")})`
								: "Project updated",
						);
					}
				}
			} else if (inputMode === "addReminder") {
				if (!selectedTask) {
					setStatusText("No task selected");
				} else {
					const reminder = await api.createReminder(selectedTask.id, { remindAt: value });
					const reminderTime = (() => {
						try {
							return format(parseISO(reminder.remindAt), "MMM d, h:mm a");
						} catch {
							return reminder.remindAt;
						}
					})();
					setStatusText("Reminder created");
					pushToast(`Reminder set for ${reminderTime}`, "success");
				}
			} else if (inputMode === "editTask") {
				if (!selectedTask) {
					setStatusText("No task selected");
				} else {
					const { patch, warnings } = parseTaskEditInput(value, projects);
					if (Object.keys(patch).length === 0) {
						setStatusText("Nothing to update");
					} else {
						const normalizedPatch = {
							...patch,
							...(patch.title != null && {
								title: normalizeBareUrlsInText(patch.title),
							}),
							...(patch.notes != null && {
								notes: normalizeBareUrlsInText(patch.notes),
							}),
						};
						await api.updateTask(selectedTask.id, normalizedPatch);
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
			if (inputMode !== "assistantChat") {
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
		editingSettingField,
		goalPeriodStart,
		goalPeriodType,
		inputMode,
		inputValue,
		loadData,
		loadAssistant,
		activeProjectId,
		projects,
		selectedTask,
		activeProject,
		pushToast,
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

	useInput((input: string, key: Key) => {
		if (showHelp) {
			if (key.escape || input === "?") setShowHelp(false);
			return;
		}

		if (inputMode === "linkPicker") {
			if (key.escape) {
				setInputMode("none");
				setLinkPickerLinks(null);
				setStatusText("Ready");
				return;
			}
			const links = linkPickerLinks ?? [];
			if (key.return && links.length > 0) {
				const chosen = links[linkPickerIndex];
				if (chosen) {
					openUrl(chosen.url);
					setStatusText("Opened link");
				}
				setInputMode("none");
				setLinkPickerLinks(null);
				return;
			}
			if (input === "j" || key.downArrow) {
				setLinkPickerIndex((i) => {
					const next = (i + 1) % links.length;
					setStatusText(
						`Open link (${next + 1}/${links.length}): ${links[next].displayLabel}  j/k  Enter=open Esc=cancel`,
					);
					return next;
				});
				return;
			}
			if (input === "k" || key.upArrow) {
				setLinkPickerIndex((i) => {
					const next = (i - 1 + links.length) % links.length;
					setStatusText(
						`Open link (${next + 1}/${links.length}): ${links[next].displayLabel}  j/k  Enter=open Esc=cancel`,
					);
					return next;
				});
				return;
			}
			const num = Number(input);
			if (input.length === 1 && num >= 1 && num <= links.length) {
				const idx = num - 1;
				setLinkPickerIndex(idx);
				setStatusText(
					`Open link (${num}/${links.length}): ${links[idx].displayLabel}  j/k  Enter=open Esc=cancel`,
				);
				return;
			}
			return;
		}

		if (inputMode !== "none") {
			if (key.tab && inputAutocomplete) {
				setInputValue(inputAutocomplete.nextValue);
				setInputResetVersion((current) => current + 1);
				return;
			}
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

		if (input === "\\") {
			const nextState = toggleAssistantVisibility({
				showAssistant,
				canDockAssistant,
				focusArea,
			});
			setShowAssistant(nextState.showAssistant);
			setFocusArea(nextState.focusArea);
			return;
		}

		if (input === "r") {
			void loadData();
			return;
		}

		if (input === "C") {
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
				if (input === "x" && selectedSettingsRow?.field === "aiApiKey") {
					void (async () => {
						setLoading(true);
						setErrorText(null);
						try {
							await api.updateSettings({ clearAiApiKey: true });
							setSettings(await api.getSettings());
							setStatusText("Assistant API key cleared");
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
				if ((input === " " || input === "e" || key.return) && selectedSettingsRow?.field === "aiProvider") {
					void (async () => {
						setLoading(true);
						setErrorText(null);
						try {
							const currentProvider = settings?.aiProvider ?? "gemini";
							const nextProvider = cycleProvider(currentProvider);
							await api.updateSettings({ aiProvider: nextProvider });
							setSettings(await api.getSettings());
							setStatusText(`Assistant provider set to ${nextProvider}`);
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
				if (input === "e" || key.return) {
					if (!selectedSettingsRow) {
						return;
					}
					setEditingSettingField(selectedSettingsRow.field);
					setInputMode("editSetting");
					setInputValue(
						selectedSettingsRow.field === "aiApiKey"
							? ""
							: selectedSettingsRow.value,
					);
					return;
				}
			}

			if (view === "upcoming") {
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

		if (input === "a" || input === "c") {
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
			if (shouldStartProjectEdit(input, view, activeProjectId)) {
				if (!activeProject) {
					setStatusText("No project selected");
					return;
				}
				setInputMode("editProject");
				setInputValue(
					serializeProjectToEditInput({
						name: activeProject.name,
						emoji: activeProject.emoji,
						description: activeProject.description,
						startAt: activeProject.startAt,
						endAt: activeProject.endAt,
					}),
				);
				return;
			}
			if (!selectedTask) return;
			const projectName = projectMap[selectedTask.projectId]?.name;
			const initialValue = serializeTaskToEditInput(selectedTask.title, {
				projectName,
				parentTaskId: selectedTask.parentTaskId,
				priority: selectedTask.priority,
				dueAt: selectedTask.dueAt,
				scheduledAt: selectedTask.scheduledAt,
				recurrencePreset: selectedTask.recurrencePreset,
				notes: selectedTask.notes ?? undefined,
			});
			setInputMode("editTask");
			setInputValue(initialValue);
			return;
		}

		if (input === " ") {
			if (!selectedTask) return;
			setExpandedTaskId(expandedTaskId === selectedTask.id ? null : selectedTask.id);
			return;
		}

		if (input === "D") {
			if (view === "project" && activeProject && !activeProject.isInbox) {
				void (async () => {
					setLoading(true);
					setErrorText(null);
					try {
						await api.deleteProject(activeProject.id);
						setStatusText("Project deleted");
						setView("inbox");
						setActiveProjectId(null);
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

		if (input === "o") {
			if (!selectedTask) return;
			const titleSegments = toDisplaySegments(selectedTask.title);
			const notesSegments = toDisplaySegments(selectedTask.notes ?? "");
			const links: { url: string; displayLabel: string }[] = [];
			for (const s of [...titleSegments, ...notesSegments]) {
				if (s.type === "link") links.push({ url: s.url, displayLabel: s.displayLabel });
			}
			if (links.length === 0) {
				setStatusText("No link in task");
			} else if (links.length === 1) {
				openUrl(links[0].url);
				setStatusText("Opened link");
			} else {
				setLinkPickerLinks(links);
				setLinkPickerIndex(0);
				setInputMode("linkPicker");
				setStatusText(`Open link (1/${links.length}): ${links[0].displayLabel}  j/k  Enter=open Esc=cancel`);
			}
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
					pushToast("Reminder deleted", "info");
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

	const visibleToasts = useMemo(
		() => toasts.map(({ id, text, tone }) => ({ id, text, tone })),
		[toasts],
	);

	const isInputMode = inputMode !== "none";
	const isBottomBarMode =
		isInputMode && inputMode !== "assistantChat" && inputMode !== "linkPicker";
	const isLinkPickerMode = inputMode === "linkPicker";

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
			<Box flexDirection="row" flexGrow={1}>
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
						isChatMode={inputMode === "assistantChat"}
						chatInput={inputValue}
						onChatInputChange={setInputValue}
						isThinking={isAssistantThinking}
					/>
				) : (
					<>
						{view === "settings" ? (
							<SettingsPanel
								settings={settings}
								rows={settingsRows}
								selectedIndex={settingsIndex}
								focused={focusArea === "tasks"}
							/>
						) : view === "upcoming" ? (
							<UpcomingPanel
								columns={columns}
								goals={goals}
								projectMap={projectMap}
								viewMode={viewMode}
								anchorDate={anchorDate}
								focused={focusArea === "tasks"}
								selectedColumnIndex={columnIndex}
								selectedTaskIndex={taskIndex}
								terminalWidth={contentPaneTerminalWidth}
							/>
						) : (
							<TaskPanel
								rows={taskRows}
								projectMap={projectMap}
								viewLabel={viewLabel}
								focused={focusArea === "tasks"}
								selectedIndex={taskIndex}
								expandedTaskId={expandedTaskId}
								activeProject={view === "project" ? activeProject : null}
							/>
						)}
						{showAssistant && canDockAssistant && (
							<AssistantPanel
								focused={focusArea === "assistant"}
								messages={assistantMessages}
								isChatMode={inputMode === "assistantChat"}
								chatInput={inputValue}
								onChatInputChange={setInputValue}
								isThinking={isAssistantThinking}
							/>
						)}
					</>
				)}
			</Box>

			{isLinkPickerMode && linkPickerLinks && linkPickerLinks.length > 0 && (
				<Box paddingX={1} flexDirection="column">
					<Text color="magentaBright" bold>
						Open link ({linkPickerIndex + 1}/{linkPickerLinks.length}):
					</Text>
					<Box>
						{linkPickerLinks.map((link, i) => (
							<Text
								key={`${i}-${link.url}`}
								color={i === linkPickerIndex ? "cyan" : undefined}
								bold={i === linkPickerIndex}
							>
								{i > 0 ? "  " : ""}
								{i + 1}. [{link.displayLabel}]
							</Text>
						))}
						<Text dimColor>  j/k choose  Enter open  Esc cancel</Text>
					</Box>
				</Box>
			)}
			{isBottomBarMode && (
				<Box paddingX={1}>
					<Text color="magentaBright" bold>
						{inputMode === "editSetting" && "Edit setting: "}
						{inputMode === "quickAdd" && "Quick add: "}
						{inputMode === "createSubtask" && "Subtask title: "}
						{inputMode === "createProject" && "New project (tokens optional): "}
						{inputMode === "editProject" && "Edit project: "}
						{inputMode === "addReminder" && "Reminder (ISO): "}
						{inputMode === "editTask" && "Edit task: "}
						{inputMode === "addGoal" && "New goal: "}
					</Text>
					<TextInput
						key={`input-${inputResetVersion}`}
						value={inputValue}
						onChange={setInputValue}
					/>
					{inputAutocomplete ? (
						<Box>
							<Text dimColor>  ↳ </Text>
							{renderAutocompleteHint(inputAutocomplete.hint)}
						</Box>
					) : null}
				</Box>
			)}

			<StatusBar
				isInputMode={isInputMode}
				statusText={loading ? "Loading..." : statusText}
				errorText={errorText}
				terminalWidth={terminalWidth}
			/>
			<ToastStack toasts={visibleToasts} />
			{showHelp && (
				<HelpModal
					terminalWidth={stdout?.columns ?? 120}
					terminalHeight={terminalHeight}
				/>
			)}
		</Box>
	);
};
