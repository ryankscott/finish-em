import { useCallback, useEffect, useMemo, useState } from "react"
import { addDays, endOfDay, format, startOfDay, startOfWeek } from "date-fns"
import { Box, Text, useInput } from "ink"
import type { Key } from "ink"
import TextInput from "ink-text-input"

import type { Goal, Project, Reminder, Task } from "../server/types"
import type { createApi } from "./api"

type View = "inbox" | "today" | "upcoming" | "completed" | "project"
type InputMode =
	| "none"
	| "quickAdd"
	| "createProject"
	| "addReminder"
	| "editTitle"
	| "addGoal"
	| "selectProjectByName"
	| "editGoalTitle"
type GoalPeriodType = "daily" | "weekly"

type ApiClient = ReturnType<typeof createApi>

type AppProps = {
	api: ApiClient
	onQuit: () => void
}

const formatTaskLine = (task: Task): string => {
	const status = task.status === "completed" ? "✓" : "○"
	const due = task.dueAt ? ` · due ${task.dueAt}` : ""
	return `${status} ${task.title}${due}`
}

export const App = ({ api, onQuit }: AppProps) => {
	const [view, setView] = useState<View>("inbox")
	const [projects, setProjects] = useState<Project[]>([])
	const [tasks, setTasks] = useState<Task[]>([])
	const [reminders, setReminders] = useState<Reminder[]>([])
	const [goals, setGoals] = useState<Goal[]>([])
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [selectedGoalIndex, setSelectedGoalIndex] = useState(0)
	const [loading, setLoading] = useState(false)
	const [statusText, setStatusText] = useState("Ready")
	const [errorText, setErrorText] = useState<string | null>(null)
	const [inputMode, setInputMode] = useState<InputMode>("none")
	const [inputValue, setInputValue] = useState("")
	const [activeProjectIndex, setActiveProjectIndex] = useState(0)
	const [goalPeriodType, setGoalPeriodType] = useState<GoalPeriodType>("daily")

	const inboxProject = useMemo(
		() => projects.find((project) => project.isInbox) ?? null,
		[projects],
	)

	const selectedTask = tasks[selectedIndex] ?? null
	const selectedReminder = reminders[0] ?? null
	const activeProject = projects[activeProjectIndex] ?? null
	const selectedGoal = goals[selectedGoalIndex] ?? null

	const getGoalPeriodStart = useCallback((periodType: GoalPeriodType) => {
		const now = new Date()
		if (periodType === "daily") {
			return format(startOfDay(now), "yyyy-MM-dd")
		}
		return format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd")
	}, [])

	const loadData = useCallback(async () => {
		setLoading(true)
		setErrorText(null)
		try {
			const loadedProjects = await api.listProjects()
			setProjects(loadedProjects)
			const resolvedInbox = loadedProjects.find((project) => project.isInbox)
			const resolvedActiveProject = loadedProjects[Math.min(activeProjectIndex, Math.max(loadedProjects.length - 1, 0))] ?? null

			const now = new Date()
			const todayStart = startOfDay(now).toISOString()
			const todayEnd = endOfDay(now).toISOString()
			const upcomingStart = startOfDay(addDays(now, 1)).toISOString()
			const periodStart = getGoalPeriodStart(goalPeriodType)

			if (view === "inbox") {
				if (!resolvedInbox) {
					setTasks([])
					setStatusText("Inbox project not found")
					return
				}
				setTasks(await api.listTasks({ projectId: resolvedInbox.id, status: "open" }))
				setStatusText("Loaded inbox tasks")
			} else if (view === "today") {
				setTasks(await api.listTasks({ status: "open", from: todayStart, to: todayEnd }))
				setStatusText("Loaded today tasks")
			} else if (view === "upcoming") {
				setTasks(await api.listTasks({ status: "open", from: upcomingStart }))
				setStatusText("Loaded upcoming tasks")
			} else if (view === "project") {
				if (!resolvedActiveProject) {
					setTasks([])
					setStatusText("No project available")
				} else {
					setTasks(await api.listTasks({ status: "open", projectId: resolvedActiveProject.id }))
					setStatusText(`Loaded project tasks: ${resolvedActiveProject.name}`)
				}
			} else {
				setTasks(await api.listTasks({ status: "completed" }))
				setStatusText("Loaded completed tasks")
			}

			setGoals(await api.listGoals({ periodType: goalPeriodType, periodStart }))
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			setErrorText(message)
			setStatusText("Failed to load data")
		} finally {
			setLoading(false)
		}
	}, [activeProjectIndex, api, getGoalPeriodStart, goalPeriodType, view])

	useEffect(() => {
		void loadData()
	}, [loadData])

	useEffect(() => {
		setSelectedIndex((current) => {
			if (tasks.length === 0) {
				return 0
			}
			return Math.min(current, tasks.length - 1)
		})
	}, [tasks])

	useEffect(() => {
		setSelectedGoalIndex((current) => {
			if (goals.length === 0) {
				return 0
			}
			return Math.min(current, goals.length - 1)
		})
	}, [goals])

	useEffect(() => {
		const loadReminders = async () => {
			if (!selectedTask) {
				setReminders([])
				return
			}

			try {
				setReminders(await api.listTaskReminders(selectedTask.id))
			} catch {
				setReminders([])
			}
		}

		void loadReminders()
	}, [api, selectedTask])

	const closeInput = useCallback(() => {
		setInputMode("none")
		setInputValue("")
	}, [])

	const findProjectIndexByName = useCallback((name: string): number => {
		const lowered = name.trim().toLowerCase()
		if (lowered.length === 0) {
			return -1
		}

		const exact = projects.findIndex((project) => project.name.toLowerCase() === lowered)
		if (exact >= 0) {
			return exact
		}

		return projects.findIndex((project) => project.name.toLowerCase().includes(lowered))
	}, [projects])

	const submitInput = useCallback(async () => {
		const value = inputValue.trim()
		if (value.length === 0) {
			closeInput()
			return
		}

		setLoading(true)
		setErrorText(null)
		try {
			if (inputMode === "quickAdd") {
				await api.createQuickAdd(value)
				setStatusText("Created task from quick-add")
			} else if (inputMode === "createProject") {
				await api.createProject({ name: value })
				setStatusText("Created project")
			} else if (inputMode === "addReminder") {
				if (!selectedTask) {
					setStatusText("No task selected")
				} else {
					await api.createReminder(selectedTask.id, { remindAt: value })
					setStatusText("Created reminder")
				}
			} else if (inputMode === "editTitle") {
				if (!selectedTask) {
					setStatusText("No task selected")
				} else {
					await api.updateTask(selectedTask.id, { title: value })
					setStatusText("Updated task title")
				}
			} else if (inputMode === "addGoal") {
				await api.createGoal({
					periodType: goalPeriodType,
					periodStart: getGoalPeriodStart(goalPeriodType),
					title: value,
				})
				setStatusText("Created goal")
			} else if (inputMode === "selectProjectByName") {
				const nextIndex = findProjectIndexByName(value)
				if (nextIndex < 0) {
					throw new Error("No matching project found")
				}
				setActiveProjectIndex(nextIndex)
				setView("project")
				setStatusText(`Selected project: ${projects[nextIndex]?.name ?? "(unknown)"}`)
			} else if (inputMode === "editGoalTitle") {
				if (!selectedGoal) {
					setStatusText("No goal selected")
				} else {
					await api.updateGoal(selectedGoal.id, { title: value })
					setStatusText("Updated goal title")
				}
			}
			closeInput()
			await loadData()
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			setErrorText(message)
			setStatusText("Input action failed")
		} finally {
			setLoading(false)
		}
	}, [
		api,
		closeInput,
		findProjectIndexByName,
		getGoalPeriodStart,
		goalPeriodType,
		inputMode,
		inputValue,
		loadData,
		projects,
		selectedGoal,
		selectedTask,
	])

	const toggleSelectedTask = useCallback(async () => {
		if (!selectedTask) {
			setStatusText("No task selected")
			return
		}

		setLoading(true)
		setErrorText(null)
		try {
			if (selectedTask.status === "completed") {
				await api.uncompleteTask(selectedTask.id)
				setStatusText("Task reopened")
			} else {
				await api.completeTask(selectedTask.id)
				setStatusText("Task completed")
			}
			await loadData()
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			setErrorText(message)
			setStatusText("Toggle failed")
		} finally {
			setLoading(false)
		}
	}, [api, loadData, selectedTask])

	useInput((input: string, key: Key) => {
		if (inputMode !== "none") {
			if (key.escape) {
				closeInput()
			}
			if (key.return) {
				void submitInput()
			}
			return
		}

		if (input === "q") {
			onQuit()
			return
		}

		if (input === "r") {
			void loadData()
			return
		}

		if (input === "1") {
			setView("inbox")
			return
		}

		if (input === "2") {
			setView("today")
			return
		}

		if (input === "3") {
			setView("upcoming")
			return
		}

		if (input === "4") {
			setView("completed")
			return
		}

		if (input === "5") {
			setView("project")
			return
		}

		if (input === "j" || key.downArrow) {
			setSelectedIndex((current) => Math.min(current + 1, Math.max(tasks.length - 1, 0)))
			return
		}

		if (input === "k" || key.upArrow) {
			setSelectedIndex((current) => Math.max(current - 1, 0))
			return
		}

		if (input === "x") {
			void toggleSelectedTask()
			return
		}

		if (input === "a") {
			setInputMode("quickAdd")
			setInputValue("")
			return
		}

		if (input === "p") {
			setInputMode("createProject")
			setInputValue("")
			return
		}

		if (input === "m") {
			setInputMode("addReminder")
			setInputValue("")
			return
		}

		if (input === "e") {
			if (!selectedTask) {
				setStatusText("No task selected")
				return
			}
			setInputMode("editTitle")
			setInputValue(selectedTask.title)
			return
		}

		if (input === "d") {
			if (!selectedTask) {
				setStatusText("No task selected")
				return
			}

			void (async () => {
				setLoading(true)
				setErrorText(null)
				try {
					await api.deleteTask(selectedTask.id)
					setStatusText("Deleted task")
					await loadData()
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error)
					setErrorText(message)
					setStatusText("Delete failed")
				} finally {
					setLoading(false)
				}
			})()
			return
		}

		if (input === "z") {
			if (!selectedReminder) {
				setStatusText("No reminder to delete")
				return
			}

			void (async () => {
				setLoading(true)
				setErrorText(null)
				try {
					await api.deleteReminder(selectedReminder.id)
					setStatusText("Deleted latest reminder")
					if (selectedTask) {
						setReminders(await api.listTaskReminders(selectedTask.id))
					}
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error)
					setErrorText(message)
					setStatusText("Reminder delete failed")
				} finally {
					setLoading(false)
				}
			})()
		}

		if (input === "g") {
			setInputMode("addGoal")
			setInputValue("")
			return
		}

		if (input === "o") {
			setInputMode("selectProjectByName")
			setInputValue("")
			return
		}

		if (input === "t") {
			if (!selectedGoal) {
				setStatusText("No goal selected")
				return
			}

			void (async () => {
				setLoading(true)
				setErrorText(null)
				try {
					await api.updateGoal(selectedGoal.id, { done: !selectedGoal.done })
					setStatusText("Toggled goal")
					await loadData()
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error)
					setErrorText(message)
					setStatusText("Goal toggle failed")
				} finally {
					setLoading(false)
				}
			})()
			return
		}

		if (input === "y") {
			if (!selectedGoal) {
				setStatusText("No goal selected")
				return
			}

			void (async () => {
				setLoading(true)
				setErrorText(null)
				try {
					await api.deleteGoal(selectedGoal.id)
					setStatusText("Deleted goal")
					await loadData()
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error)
					setErrorText(message)
					setStatusText("Goal delete failed")
				} finally {
					setLoading(false)
				}
			})()
			return
		}

		if (input === "u") {
			if (!selectedGoal) {
				setStatusText("No goal selected")
				return
			}
			setInputMode("editGoalTitle")
			setInputValue(selectedGoal.title)
			return
		}

		if (input === "n") {
			setSelectedGoalIndex((current) => Math.min(current + 1, Math.max(goals.length - 1, 0)))
			return
		}

		if (input === "b") {
			setSelectedGoalIndex((current) => Math.max(current - 1, 0))
			return
		}

		if (input === "w") {
			setGoalPeriodType((current) => (current === "daily" ? "weekly" : "daily"))
			return
		}

		if (key.leftArrow || input === "[") {
			setActiveProjectIndex((current) => Math.max(current - 1, 0))
			return
		}

		if (key.rightArrow || input === "]") {
			setActiveProjectIndex((current) => Math.min(current + 1, Math.max(projects.length - 1, 0)))
		}
	})

	const viewLabel = view === "inbox"
		? "Inbox"
		: view === "today"
			? "Today"
			: view === "upcoming"
				? "Upcoming"
				: view === "completed"
					? "Completed"
					: "Project"

	return (
		<Box flexDirection="column">
			<Text>Finish-Em TUI · View: {viewLabel}</Text>
			<Text>
				Keys: q quit · r refresh · 1/2/3/4/5 switch view · j/k move tasks · [/] project prev/next · o select project by name · x toggle task · a quick-add · p create project · m reminder · e edit task · d delete task · z delete reminder · g add goal · u edit goal title · t toggle goal · y delete goal · n/b goal next/prev · w daily/weekly goals · esc cancel
			</Text>
			<Text>Status: {loading ? "Loading..." : statusText}</Text>
			{errorText ? <Text color="red">Error: {errorText}</Text> : null}
			<Text>Inbox project: {inboxProject ? `${inboxProject.name} (#${inboxProject.id})` : "(none)"}</Text>
			<Text>Active project: {activeProject ? `${activeProject.name} (#${activeProject.id})` : "(none)"}</Text>
			<Text>Goals period: {goalPeriodType} ({getGoalPeriodStart(goalPeriodType)})</Text>
			<Box marginTop={1} flexDirection="column">
				<Text>Tasks</Text>
				{tasks.length === 0 ? (
					<Text color="yellow">No tasks</Text>
				) : (
					tasks.map((task, index) => (
						<Text key={task.id} color={index === selectedIndex ? "cyan" : undefined}>
							{index === selectedIndex ? "> " : "  "}
							{formatTaskLine(task)}
						</Text>
					))
				)}
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text>Selected task details</Text>
				{selectedTask ? (
					<>
						<Text>ID: {selectedTask.id}</Text>
						<Text>Title: {selectedTask.title}</Text>
						<Text>Status: {selectedTask.status}</Text>
						<Text>Project ID: {selectedTask.projectId}</Text>
						<Text>Due: {selectedTask.dueAt ?? "(none)"}</Text>
						<Text>Notes: {selectedTask.notes || "(none)"}</Text>
					</>
				) : (
					<Text>(none selected)</Text>
				)}
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text>Goals</Text>
				{goals.length === 0 ? (
					<Text color="yellow">No goals</Text>
				) : (
					goals.map((goal, index) => (
						<Text key={goal.id} color={index === selectedGoalIndex ? "green" : undefined}>
							{index === selectedGoalIndex ? "> " : "  "}
							{goal.done ? "✓" : "○"} {goal.title}
						</Text>
					))
				)}
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Text>Selected task reminders ({reminders.length})</Text>
				{reminders.length === 0 ? (
					<Text>(none)</Text>
				) : (
					reminders.slice(0, 3).map((reminder) => (
						<Text key={reminder.id}>• #{reminder.id} at {reminder.remindAt} · {reminder.status}</Text>
					))
				)}
			</Box>

			{inputMode !== "none" ? (
				<Box marginTop={1} flexDirection="column">
					<Text>
						{inputMode === "quickAdd" && "Quick-add text:"}
						{inputMode === "createProject" && "New project name:"}
						{inputMode === "addReminder" && "Reminder datetime (ISO):"}
						{inputMode === "editTitle" && "Updated task title:"}
						{inputMode === "addGoal" && `New ${goalPeriodType} goal title:`}
						{inputMode === "selectProjectByName" && "Project name (exact or partial):"}
						{inputMode === "editGoalTitle" && "Updated goal title:"}
					</Text>
					<TextInput value={inputValue} onChange={setInputValue} />
				</Box>
			) : null}
		</Box>
	)
}
