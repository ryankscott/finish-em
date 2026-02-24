import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateObject } from "ai";
import {
	compareDesc,
	endOfDay,
	endOfWeek,
	format,
	isValid,
	isWithinInterval,
	parseISO,
	startOfDay,
	startOfWeek,
	subDays,
} from "date-fns";
import { parseDate } from "chrono-node";
import { z } from "zod/v3";

import {
	clearAssistantMessages,
	createAssistantMessage,
	listAssistantMessages,
	updateAssistantMessageActions,
} from "@/server/repos/assistant";
import { listGoals } from "@/server/repos/goals";
import {
	createProject,
	getInboxProjectId,
	listProjects,
	updateProject,
} from "@/server/repos/projects";
import { getSettings, getSettingsSecrets } from "@/server/repos/settings";
import {
	completeTask,
	createTask,
	getTask,
	listTasks,
	uncompleteTask,
	updateTask,
} from "@/server/repos/tasks";

import type {
	AssistantAction,
	AssistantActionOutcome,
	AssistantActionType,
	AssistantChatResponse,
	AssistantMessage,
	AiProvider,
	AssistantSurface,
	RecurrencePreset,
} from "@/server/types";

const DEFAULT_LMSTUDIO_BASE_URL = "http://localhost:1234/v1";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_LMSTUDIO_MODEL = "gpt-4o-mini";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const assistantActionLabelSchema = z.string().min(1).max(140);
const assistantIdSchema = z.coerce.number().int().positive();

const createTaskActionSchema = z.object({
	type: z.literal("create_task"),
	label: assistantActionLabelSchema,
	payload: z
		.object({
			title: z.string().min(1),
			projectId: assistantIdSchema.optional(),
			parentTaskId: assistantIdSchema.nullable().optional(),
			notes: z.string().optional(),
			priority: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
			scheduledAt: z.string().nullable().optional(),
			dueAt: z.string().nullable().optional(),
			dueTimezone: z.string().nullable().optional(),
			recurrencePreset: z
				.union([
					z.literal("daily"),
					z.literal("weekly"),
					z.literal("monthly"),
					z.literal("yearly"),
					z.literal("every_weekday"),
					z.null(),
				])
				.optional(),
			recurrenceRRule: z.string().nullable().optional(),
		}),
});

const updateTaskActionSchema = z.object({
	type: z.literal("update_task"),
	label: assistantActionLabelSchema,
	payload: z.object({
		taskId: assistantIdSchema,
		title: z.string().optional(),
		notes: z.string().optional(),
		projectId: assistantIdSchema.nullable().optional(),
		parentTaskId: assistantIdSchema.nullable().optional(),
		priority: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
		scheduledAt: z.string().nullable().optional(),
		dueAt: z.string().nullable().optional(),
		dueTimezone: z.string().nullable().optional(),
		recurrencePreset: z
			.union([
				z.literal("daily"),
				z.literal("weekly"),
				z.literal("monthly"),
				z.literal("yearly"),
				z.literal("every_weekday"),
				z.null(),
			])
			.optional(),
		recurrenceRRule: z.string().nullable().optional(),
	}),
});

const setTaskDueDateActionSchema = z.object({
	type: z.literal("set_task_due_date"),
	label: assistantActionLabelSchema,
	payload: z.object({
		taskId: assistantIdSchema,
		dueAt: z.string().nullable(),
		dueTimezone: z.string().nullable().optional(),
		scheduledAt: z.string().nullable().optional(),
	}),
});

const completeTaskActionSchema = z.object({
	type: z.literal("complete_task"),
	label: assistantActionLabelSchema,
	payload: z.object({
		taskId: assistantIdSchema,
	}),
});

const uncompleteTaskActionSchema = z.object({
	type: z.literal("uncomplete_task"),
	label: assistantActionLabelSchema,
	payload: z.object({
		taskId: assistantIdSchema,
	}),
});

const createProjectActionSchema = z.object({
	type: z.literal("create_project"),
	label: assistantActionLabelSchema,
	payload: z.object({
		name: z.string().min(1),
		emoji: z.string().optional(),
		description: z.string().optional(),
		startAt: z.string().nullable().optional(),
		endAt: z.string().nullable().optional(),
		color: z.string().optional(),
		isInbox: z.boolean().optional(),
	}),
});

const updateProjectActionSchema = z.object({
	type: z.literal("update_project"),
	label: assistantActionLabelSchema,
	payload: z.object({
		projectId: assistantIdSchema,
		name: z.string().optional(),
		emoji: z.string().nullable().optional(),
		description: z.string().optional(),
		startAt: z.string().nullable().optional(),
		endAt: z.string().nullable().optional(),
		color: z.string().optional(),
		isInbox: z.boolean().optional(),
	}),
});

const supportedAssistantActionSchema = z.discriminatedUnion("type", [
	createTaskActionSchema,
	updateTaskActionSchema,
	setTaskDueDateActionSchema,
	completeTaskActionSchema,
	uncompleteTaskActionSchema,
	createProjectActionSchema,
	updateProjectActionSchema,
]);

const assistantActionSchema = z.object({
	type: z.enum([
		"create_task",
		"update_task",
		"set_task_due_date",
		"complete_task",
		"uncomplete_task",
		"create_project",
		"update_project",
	]),
	label: assistantActionLabelSchema,
	payload: z.record(z.any()).optional(),
});

const assistantResponseSchema = z.object({
	reply: z.string().min(1),
	proposedActions: z.array(assistantActionSchema).max(5).optional(),
});

function isAssistantSurface(value: string): value is AssistantSurface {
	return value === "ui" || value === "tui";
}

function resolveSurface(input: string): AssistantSurface {
	if (!isAssistantSurface(input)) {
		throw new Error("Invalid assistant surface");
	}
	return input;
}

function normalizeBaseUrl(value: string | null | undefined, fallback: string): string {
	if (!value || value.trim().length === 0) {
		return fallback;
	}
	return value.trim();
}

function normalizeModel(value: string | null | undefined, fallback: string): string {
	if (!value || value.trim().length === 0) {
		return fallback;
	}
	return value.trim();
}

function defaultBaseUrlForProvider(provider: AiProvider): string {
	if (provider === "lmstudio") {
		return DEFAULT_LMSTUDIO_BASE_URL;
	}
	if (provider === "openai") {
		return DEFAULT_OPENAI_BASE_URL;
	}
	return DEFAULT_GEMINI_BASE_URL;
}

function defaultModelForProvider(provider: AiProvider): string {
	if (provider === "lmstudio") {
		return DEFAULT_LMSTUDIO_MODEL;
	}
	if (provider === "openai") {
		return DEFAULT_OPENAI_MODEL;
	}
	return DEFAULT_GEMINI_MODEL;
}

function envBaseUrlForProvider(provider: AiProvider): string | undefined {
	if (provider === "lmstudio") {
		return process.env.LMSTUDIO_BASE_URL;
	}
	if (provider === "openai") {
		return process.env.OPENAI_BASE_URL;
	}
	return process.env.GEMINI_BASE_URL;
}

function envModelForProvider(provider: AiProvider): string | undefined {
	if (provider === "lmstudio") {
		return process.env.LMSTUDIO_MODEL;
	}
	if (provider === "openai") {
		return process.env.OPENAI_MODEL;
	}
	return process.env.GEMINI_MODEL;
}

function envApiKeyForProvider(provider: AiProvider): string | undefined {
	if (provider === "openai") {
		return process.env.OPENAI_API_KEY;
	}
	if (provider === "gemini") {
		return process.env.GEMINI_API_KEY;
	}
	return undefined;
}

function parseOptionalIso(value: unknown): Date | null {
	if (typeof value !== "string" || value.trim().length === 0) {
		return null;
	}
	try {
		const parsed = parseISO(value);
		if (!isValid(parsed)) {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

function buildTaskSnapshot() {
	const now = new Date();
	const tasks = listTasks();
	const projects = listProjects();
	const projectNames = new Map(
		projects.map((project) => [project.id, project.name]),
	);
	const goals = listGoals();

	const todayStart = startOfDay(now);
	const todayEnd = endOfDay(now);
	const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
	const last7DaysStart = subDays(now, 7);
	const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
	const lastWeekStart = subDays(currentWeekStart, 7);
	const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });

	const completedTasks = tasks.filter(
		(task) => task.status === "completed" && parseOptionalIso(task.completedAt),
	);

	const completedTodayCount = completedTasks.filter((task) => {
		const completedAt = parseOptionalIso(task.completedAt);
		if (!completedAt) return false;
		return isWithinInterval(completedAt, { start: todayStart, end: todayEnd });
	}).length;

	const completedLast7DaysCount = completedTasks.filter((task) => {
		const completedAt = parseOptionalIso(task.completedAt);
		if (!completedAt) return false;
		return isWithinInterval(completedAt, { start: last7DaysStart, end: now });
	}).length;

	const completedLastWeekCount = completedTasks.filter((task) => {
		const completedAt = parseOptionalIso(task.completedAt);
		if (!completedAt) return false;
		return isWithinInterval(completedAt, {
			start: lastWeekStart,
			end: lastWeekEnd,
		});
	}).length;

	const openTasks = tasks.filter((task) => task.status === "open");

	const overdueTasks = openTasks.filter((task) => {
		const dueAt = parseOptionalIso(task.dueAt);
		return dueAt ? dueAt < todayStart : false;
	});

	const todayTasks = openTasks.filter((task) => {
		const dueAt = parseOptionalIso(task.dueAt);
		if (!dueAt) return false;
		return isWithinInterval(dueAt, { start: todayStart, end: todayEnd });
	});

	const thisWeekTasks = openTasks.filter((task) => {
		const dueAt = parseOptionalIso(task.dueAt);
		if (!dueAt) return false;
		return isWithinInterval(dueAt, { start: todayStart, end: weekEnd });
	});

	const mapTask = (task: (typeof tasks)[number]) => ({
		id: task.id,
		title: task.title,
		notes: task.notes || null,
		status: task.status,
		projectId: task.projectId,
		projectName: projectNames.get(task.projectId) ?? null,
		priority: task.priority,
		scheduledAt: task.scheduledAt,
		dueAt: task.dueAt,
		completedAt: task.completedAt,
		updatedAt: task.updatedAt,
		parentTaskId: task.parentTaskId,
		recurrencePreset: task.recurrencePreset,
	});

	const recentCompleted = completedTasks
		.map((task) => ({
			...task,
			completedAtDate: parseOptionalIso(task.completedAt),
		}))
		.sort((a, b) =>
			compareDesc(
				a.completedAtDate ?? new Date(0),
				b.completedAtDate ?? new Date(0),
			),
		)
		.slice(0, 10)
		.map(mapTask);

	return {
		summary: {
			nowIso: now.toISOString(),
			completedTodayCount,
			completedLast7DaysCount,
			completedLastWeekCount,
			lastWeekRange: `${format(lastWeekStart, "yyyy-MM-dd")} to ${format(lastWeekEnd, "yyyy-MM-dd")}`,
			openCount: openTasks.length,
			overdueCount: overdueTasks.length,
			totalTasks: tasks.length,
			goalCount: goals.length,
		},
		overdueTasks: overdueTasks.map(mapTask),
		todayTasks: todayTasks.map(mapTask),
		thisWeekTasks: thisWeekTasks.map(mapTask),
		allOpenTasks: openTasks.map(mapTask),
		recentlyCompletedTasks: recentCompleted,
		projects: projects.map((project) => ({
			id: project.id,
			name: project.name,
			isInbox: project.isInbox,
			description: project.description || null,
		})),
	};
}

function generateActionId(): string {
	try {
		return crypto.randomUUID();
	} catch {
		return `action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	}
}

function normalizeProposedActions(
	value:
		| Array<{
				type: AssistantActionType;
				label: string;
				payload?: Record<string, unknown>;
		  }>
		| null
		| undefined,
): AssistantAction[] {
	if (!value) {
		return [];
	}

	return value.map((action) => ({
		id: generateActionId(),
		type: action.type,
		label: action.label.trim(),
		status: "pending",
		payload: action.payload ?? {},
		resultMessage: null,
		outcome: null,
	}));
}

async function generateAssistantReply(input: {
	provider: AiProvider;
	baseUrl: string;
	model: string;
	apiKey: string | null;
	userMessage: string;
	conversation: AssistantMessage[];
}): Promise<{ reply: string; actions: AssistantAction[] }> {
	if ((input.provider === "gemini" || input.provider === "openai") && !input.apiKey) {
		return {
			reply: `API key missing for ${input.provider === "gemini" ? "Gemini" : "OpenAI"}. Add a key in Assistant settings to use this provider.`,
			actions: [],
		};
	}

	const context = buildTaskSnapshot();
	const conversationContext = input.conversation
		.slice(-16)
		.map((message) => `${message.role.toUpperCase()}: ${message.content}`)
		.join("\n");

	const modelInstance =
		input.provider === "lmstudio"
			? createOpenAICompatible({
					name: "lmstudio",
					baseURL: input.baseUrl,
					supportsStructuredOutputs: true,
				})(
					input.model,
				)
			: input.provider === "openai"
				? createOpenAI({
						apiKey: input.apiKey ?? "",
					})(input.model)
				: createGoogleGenerativeAI({
						apiKey: input.apiKey ?? "",
					})(input.model);

	try {
		const result = await generateObject({
			model: modelInstance,
			output: "object",
			schema: assistantResponseSchema,
			temperature: 0.2,
			system: [
				`You are the personal task management assistant for Finish Em, a productivity app.`,
				`Today is ${format(new Date(), "EEEE, MMMM d, yyyy")} (${context.summary.nowIso}).`,
				"",
				"## Your role",
				"Help the user manage their tasks and projects. Be direct, concise, and actionable.",
				"Reference specific task titles and IDs when discussing tasks. Never invent tasks that are not in the provided context.",
				"Proactively surface important information: overdue tasks, tasks due today, high-priority items.",
				"",
				"## Data model",
				"Tasks have: id, title, notes, status (open/completed), projectId, projectName, priority (1=highest, 2=high, 3=medium, 4=low), dueAt, scheduledAt, completedAt, parentTaskId, recurrencePreset.",
				"Projects group tasks. The inbox project (isInbox=true) is the default destination for new tasks.",
				"Goals are separate from tasks — they are weekly or daily intentions.",
				"",
				"## Available actions",
				"You may propose up to 5 actions. Proposed actions are executed automatically, so only include actions that should happen now:",
				"- create_task: payload must include title. Optional: projectId, parentTaskId, notes, priority, dueAt (ISO 8601), scheduledAt (ISO 8601), dueTimezone, recurrencePreset (daily/weekly/monthly/yearly/every_weekday), recurrenceRRule.",
				"- update_task: payload must include taskId. Optional: any task fields to change.",
				"- set_task_due_date: payload must include taskId and dueAt (ISO 8601 or null to clear). Optional: dueTimezone, scheduledAt.",
				"- complete_task: payload must include taskId.",
				"- uncomplete_task: payload must include taskId.",
				"- create_project: payload must include name. Optional: emoji, description, startAt (ISO 8601), endAt (ISO 8601), color (hex), isInbox.",
				"- update_project: payload must include projectId. Optional: name, color, emoji, description, startAt, endAt, isInbox.",
				"",
				"## Response instructions",
				'Return a concise reply addressing the user. Avoid filler phrases like "Of course!" or "Certainly!".',
				"When proposing actions, include a clear human-readable label for each.",
				"Only propose actions if they are clearly appropriate — do not pad responses with unnecessary actions.",
				"",
				"## Conversation history",
				conversationContext || "(no prior conversation)",
				"",
				"## Current task context (JSON)",
				JSON.stringify(context, null, 2),
			].join("\n"),
			prompt: input.userMessage,
		});

		const parsed = assistantResponseSchema.parse(result.object);
		return {
			reply: parsed.reply,
			actions: normalizeProposedActions(parsed.proposedActions),
		};
	} catch (error) {
		console.error("Failed to generate assistant reply:", error);
		return {
			reply: [
				`I can still help with your tasks.`,
				`Completed today: ${context.summary.completedTodayCount}.`,
				`Completed in the last 7 days: ${context.summary.completedLast7DaysCount}.`,
				`Completed last week (${context.summary.lastWeekRange}): ${context.summary.completedLastWeekCount}.`,
				`Open tasks: ${context.summary.openCount}, overdue: ${context.summary.overdueCount}.`,
			].join(" "),
			actions: [],
		};
	}
}

function asOptionalRecurrencePreset(
	value: unknown,
): RecurrencePreset | undefined {
	if (value === undefined) {
		return undefined;
	}
	if (value === null) {
		return null;
	}
	if (
		value === "daily" ||
		value === "weekly" ||
		value === "monthly" ||
		value === "yearly" ||
		value === "every_weekday"
	) {
		return value;
	}
	throw new Error("Invalid recurrence preset");
}

type SupportedAssistantAction = z.infer<typeof supportedAssistantActionSchema>;

class AssistantActionExecutionError extends Error {
	code: string;

	constructor(code: string, message: string) {
		super(message);
		this.code = code;
	}
}

function asOptionalIsoDate(
	value: string | null | undefined,
	field: string,
): string | null | undefined {
	if (value === undefined) {
		return undefined;
	}
	if (value === null) {
		return null;
	}
	const parsed = parseISO(value);
	if (!isValid(parsed)) {
		const naturalLanguageParsed = parseDate(value, new Date());
		if (!naturalLanguageParsed || !isValid(naturalLanguageParsed)) {
			throw new AssistantActionExecutionError(
				"INVALID_DATE",
				`${field} must be a valid date/time string`,
			);
		}
		return naturalLanguageParsed.toISOString();
	}
	return parsed.toISOString();
}

function normalizeSetTaskDueDatePayload(
	action: AssistantAction,
): Record<string, unknown> {
	const payload =
		action.payload && typeof action.payload === "object"
			? (action.payload as Record<string, unknown>)
			: {};

	const normalized: Record<string, unknown> = {
		taskId: payload.taskId ?? payload.task_id ?? payload.id,
		dueAt:
			payload.dueAt ?? payload.due_at ?? payload.dueDate ?? payload.due_date ?? payload.date,
		dueTimezone:
			payload.dueTimezone ?? payload.due_timezone ?? payload.timezone,
		scheduledAt:
			payload.scheduledAt ?? payload.scheduled_at ?? payload.startAt ?? payload.start_at,
	};

	if (normalized.taskId === undefined || normalized.taskId === null) {
		const idMatch = action.label.match(/\(#(\d+)\)/);
		if (idMatch?.[1]) {
			normalized.taskId = Number(idMatch[1]);
		}
	}

	if (normalized.taskId === undefined || normalized.taskId === null) {
		const titleMatch = action.label.match(/["'“”‘’]([^"'“”‘’]+)["'“”‘’]/);
		if (titleMatch?.[1]) {
			const title = titleMatch[1].trim().toLowerCase();
			const matchedTask = listTasks().find(
				(task) => task.title.trim().toLowerCase() === title,
			);
			if (matchedTask) {
				normalized.taskId = matchedTask.id;
			}
		}
	}

	if (normalized.dueAt === undefined) {
		const toMatch = action.label.match(/\bto\s+(.+)$/i);
		const toValue = toMatch?.[1]?.trim();
		if (toValue) {
			if (/^(clear|remove|none|null)$/i.test(toValue)) {
				normalized.dueAt = null;
			} else {
				normalized.dueAt = toValue;
			}
		}
	}

	return normalized;
}

function parseSupportedAssistantAction(action: AssistantAction): SupportedAssistantAction {
	const normalizedPayload =
		action.type === "set_task_due_date"
			? normalizeSetTaskDueDatePayload(action)
			: action.payload;

	const parsed = supportedAssistantActionSchema.safeParse({
		type: action.type,
		label: action.label,
		payload: normalizedPayload,
	});

	if (!parsed.success) {
		throw new AssistantActionExecutionError(
			"UNSUPPORTED_ACTION",
			`Unsupported or invalid action payload for \"${action.type}\"`,
		);
	}

	return parsed.data;
}

function buildActionOutcome(input: {
	action: AssistantAction;
	status: AssistantActionOutcome["status"];
	message: string;
	errorCode?: string | null;
	targetEntity?: "task" | "project" | null;
	targetId?: number | null;
}): AssistantActionOutcome {
	return {
		actionId: input.action.id,
		type: input.action.type,
		targetEntity: input.targetEntity ?? null,
		targetId: input.targetId ?? null,
		status: input.status,
		message: input.message,
		errorCode: input.errorCode ?? null,
	};
}

type AssistantActionExecutionSummary = {
	status: "success" | "failure" | "partial_success";
	total: number;
	success: number;
	failure: number;
	message: string;
};

function executeAssistantAction(action: AssistantAction): AssistantActionOutcome {
	const supported = parseSupportedAssistantAction(action);

	if (supported.type === "create_task") {
		const payload = supported.payload;
		const projectId = payload.projectId ?? getInboxProjectId();
		const created = createTask({
			projectId,
			parentTaskId: payload.parentTaskId,
			title: payload.title.trim(),
			notes: payload.notes?.trim(),
			priority: payload.priority,
			scheduledAt: asOptionalIsoDate(payload.scheduledAt, "scheduledAt"),
			dueAt: asOptionalIsoDate(payload.dueAt, "dueAt"),
			dueTimezone: payload.dueTimezone,
			recurrencePreset: payload.recurrencePreset,
			recurrenceRRule: payload.recurrenceRRule,
		});
		return buildActionOutcome({
			action,
			status: "success",
			targetEntity: "task",
			targetId: created.id,
			message: `Created task \"${created.title}\" (#${created.id}).`,
		});
	}

	if (supported.type === "update_task") {
		const payload = supported.payload;
		const existing = getTask(payload.taskId);
		if (!existing) {
			throw new AssistantActionExecutionError(
				"TASK_NOT_FOUND",
				`Task ${payload.taskId} not found`,
			);
		}

		const patch: Record<string, unknown> = {};
		if (typeof payload.title === "string") {
			patch.title = payload.title.trim();
		}
		if (typeof payload.notes === "string") {
			patch.notes = payload.notes;
		}
		if (payload.projectId !== undefined) {
			patch.projectId = payload.projectId;
		}
		if (payload.parentTaskId !== undefined) {
			patch.parentTaskId = payload.parentTaskId;
		}
		if (payload.priority !== undefined) {
			patch.priority = payload.priority;
		}
		if (payload.scheduledAt !== undefined) {
			patch.scheduledAt = asOptionalIsoDate(payload.scheduledAt, "scheduledAt");
		}
		if (payload.dueAt !== undefined) {
			patch.dueAt = asOptionalIsoDate(payload.dueAt, "dueAt");
		}
		if (payload.dueTimezone !== undefined) {
			patch.dueTimezone = payload.dueTimezone;
		}
		if (payload.recurrencePreset !== undefined) {
			patch.recurrencePreset = asOptionalRecurrencePreset(
				payload.recurrencePreset,
			);
		}
		if (payload.recurrenceRRule !== undefined) {
			patch.recurrenceRRule = payload.recurrenceRRule;
		}

		if (Object.keys(patch).length === 0) {
			throw new AssistantActionExecutionError(
				"NO_UPDATE_FIELDS",
				"No update fields were provided",
			);
		}

		const updated = updateTask(payload.taskId, patch as Parameters<typeof updateTask>[1]);
		if (!updated) {
			throw new AssistantActionExecutionError(
				"TASK_NOT_FOUND",
				`Task ${payload.taskId} not found`,
			);
		}

		return buildActionOutcome({
			action,
			status: "success",
			targetEntity: "task",
			targetId: updated.id,
			message: `Updated task \"${updated.title}\" (#${updated.id}).`,
		});
	}

	if (supported.type === "set_task_due_date") {
		const payload = supported.payload;
		const existing = getTask(payload.taskId);
		if (!existing) {
			throw new AssistantActionExecutionError(
				"TASK_NOT_FOUND",
				`Task ${payload.taskId} not found`,
			);
		}

		const updated = updateTask(payload.taskId, {
			dueAt: asOptionalIsoDate(payload.dueAt, "dueAt"),
			dueTimezone: payload.dueTimezone,
			scheduledAt: asOptionalIsoDate(payload.scheduledAt, "scheduledAt"),
		});
		if (!updated) {
			throw new AssistantActionExecutionError(
				"TASK_NOT_FOUND",
				`Task ${payload.taskId} not found`,
			);
		}

		return buildActionOutcome({
			action,
			status: "success",
			targetEntity: "task",
			targetId: updated.id,
			message: `Updated due date for task \"${updated.title}\" (#${updated.id}).`,
		});
	}

	if (supported.type === "complete_task") {
		const result = completeTask(supported.payload.taskId);
		if (!result.task) {
			throw new AssistantActionExecutionError(
				"TASK_NOT_FOUND",
				`Task ${supported.payload.taskId} not found`,
			);
		}
		return buildActionOutcome({
			action,
			status: "success",
			targetEntity: "task",
			targetId: result.task.id,
			message: `Completed task \"${result.task.title}\" (#${result.task.id}).`,
		});
	}

	if (supported.type === "uncomplete_task") {
		const task = uncompleteTask(supported.payload.taskId);
		if (!task) {
			throw new AssistantActionExecutionError(
				"TASK_NOT_FOUND",
				`Task ${supported.payload.taskId} not found`,
			);
		}
		return buildActionOutcome({
			action,
			status: "success",
			targetEntity: "task",
			targetId: task.id,
			message: `Reopened task \"${task.title}\" (#${task.id}).`,
		});
	}

	if (supported.type === "create_project") {
		const created = createProject({
			name: supported.payload.name.trim(),
			emoji:
				typeof supported.payload.emoji === "string" &&
				supported.payload.emoji.trim().length > 0
					? supported.payload.emoji.trim()
					: null,
			description:
				typeof supported.payload.description === "string"
					? supported.payload.description.trim()
					: undefined,
			startAt: asOptionalIsoDate(supported.payload.startAt, "startAt"),
			endAt: asOptionalIsoDate(supported.payload.endAt, "endAt"),
			color:
				typeof supported.payload.color === "string" &&
				supported.payload.color.trim().length > 0
					? supported.payload.color.trim()
					: undefined,
			isInbox: supported.payload.isInbox,
		});
		return buildActionOutcome({
			action,
			status: "success",
			targetEntity: "project",
			targetId: created.id,
			message: `Created project \"${created.name}\" (#${created.id}).`,
		});
	}

	if (supported.type === "update_project") {
		const payload = supported.payload;
		const updated = updateProject(payload.projectId, {
			name: payload.name,
			emoji: payload.emoji,
			description: payload.description,
			startAt: asOptionalIsoDate(payload.startAt, "startAt"),
			endAt: asOptionalIsoDate(payload.endAt, "endAt"),
			color: payload.color,
			isInbox: payload.isInbox,
		});
		if (!updated) {
			throw new AssistantActionExecutionError(
				"PROJECT_NOT_FOUND",
				`Project ${payload.projectId} not found`,
			);
		}
		return buildActionOutcome({
			action,
			status: "success",
			targetEntity: "project",
			targetId: updated.id,
			message: `Updated project \"${updated.name}\" (#${updated.id}).`,
		});
	}

	const exhaustiveCheck: never = supported;
	throw new AssistantActionExecutionError(
		"UNSUPPORTED_ACTION",
		`Unsupported action type: ${String(exhaustiveCheck)}`,
	);
}

function buildActionSummary(message: AssistantMessage): AssistantActionExecutionSummary {
	const total = message.actions.length;
	const success = message.actions.filter((action) => action.status === "executed").length;
	const failure = message.actions.filter((action) => action.status === "failed").length;

	let status: AssistantActionExecutionSummary["status"] = "success";
	if (failure > 0 && success > 0) {
		status = "partial_success";
	} else if (failure > 0) {
		status = "failure";
	}

	const messageText =
		status === "success"
			? `All actions executed successfully (${success}/${total}).`
			: status === "partial_success"
				? `Partial success: ${success} succeeded, ${failure} failed.`
				: `Action execution failed (${failure}/${total}).`;

	return {
		status,
		total,
		success,
		failure,
		message: messageText,
	};
}

function updateActionState(input: {
	message: AssistantMessage;
	actionId: string;
}): {
	message: AssistantMessage;
	outcome: AssistantActionOutcome;
	summary: AssistantActionExecutionSummary;
} {
	const actions = input.message.actions.map((action) => ({ ...action }));
	const index = actions.findIndex((action) => action.id === input.actionId);
	if (index === -1) {
		throw new Error("Action not found");
	}

	const selected = actions[index];
	if (selected.status !== "pending") {
		throw new Error("Action is no longer pending");
	}

	let outcome: AssistantActionOutcome;
	try {
		outcome = executeAssistantAction(selected);
		selected.status = outcome.status === "success" ? "executed" : "failed";
		selected.resultMessage = outcome.message;
		selected.outcome = outcome;
	} catch (error) {
		selected.status = "failed";
		const message =
			error instanceof Error ? error.message : "Failed to execute action";
		const errorCode =
			error instanceof AssistantActionExecutionError ? error.code : "ACTION_EXECUTION_FAILED";
		selected.resultMessage = message;
		outcome = buildActionOutcome({
			action: selected,
			status: "failure",
			message,
			errorCode,
		});
		selected.outcome = outcome;
	}

	const updated = updateAssistantMessageActions({
		messageId: input.message.id,
		actions,
	});
	if (!updated) {
		throw new Error("Failed to update assistant action state");
	}
	return {
		message: updated,
		outcome,
		summary: buildActionSummary(updated),
	};
}

function executeAllPendingActions(message: AssistantMessage): AssistantMessage {
	let currentMessage = message;
	while (true) {
		const nextPendingAction = currentMessage.actions.find(
			(action) => action.status === "pending",
		);
		if (!nextPendingAction) {
			return currentMessage;
		}

		const result = updateActionState({
			message: currentMessage,
			actionId: nextPendingAction.id,
		});
		currentMessage = result.message;
	}
}

export function getAssistantState(surfaceInput: string) {
	const surface = resolveSurface(surfaceInput);
	return {
		settings: getSettings(),
		messages: listAssistantMessages({ surface }),
	};
}

export async function sendAssistantChat(input: {
	surfaceInput: string;
	message: string;
}): Promise<AssistantChatResponse> {
	const surface = resolveSurface(input.surfaceInput);
	const text = input.message.trim();
	if (text.length === 0) {
		throw new Error("Message is required");
	}

	const userMessage = createAssistantMessage({
		surface,
		role: "user",
		content: text,
		actions: [],
	});

	const settings = getSettings();
	const secrets = getSettingsSecrets();
	const provider = settings.aiProvider ?? "gemini";
	const defaultBaseUrl = defaultBaseUrlForProvider(provider);
	const defaultModel = defaultModelForProvider(provider);
	const baseUrl = normalizeBaseUrl(
		settings.aiBaseUrl ?? envBaseUrlForProvider(provider) ?? defaultBaseUrl,
		defaultBaseUrl,
	);
	const model = normalizeModel(
		settings.aiModel ?? envModelForProvider(provider) ?? defaultModel,
		defaultModel,
	);
	const apiKey = secrets.aiApiKey ?? envApiKeyForProvider(provider) ?? null;
	const conversation = listAssistantMessages({ surface });

	const generated = await generateAssistantReply({
		provider,
		baseUrl,
		model,
		apiKey,
		userMessage: text,
		conversation,
	});

	const assistantMessage = createAssistantMessage({
		surface,
		role: "assistant",
		content: generated.reply,
		actions: generated.actions,
	});

	let finalizedAssistantMessage = assistantMessage;
	if (assistantMessage.actions.some((action) => action.status === "pending")) {
		finalizedAssistantMessage = executeAllPendingActions(assistantMessage);
	}

	return {
		userMessage,
		assistantMessage: finalizedAssistantMessage,
	};
}

export function clearAssistantHistory(surfaceInput: string) {
	const surface = resolveSurface(surfaceInput);
	return {
		ok: true,
		deleted: clearAssistantMessages(surface),
	};
}
