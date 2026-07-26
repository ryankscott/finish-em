/**
 * HTTP API for finish-em. Thin OpenAPI-documented wrappers over the repo
 * layer in src/server/repos — all business logic stays in the repos.
 *
 * Runtime-agnostic: nothing here imports bun:sqlite, D1, or node builtins. The
 * caller supplies a `resolveDb` that turns a request into a Db, so the same app
 * serves the local Bun server (bun:sqlite) and the deployed Worker (D1).
 */

import { swaggerUI } from "@hono/swagger-ui";
import type { z } from "@hono/zod-openapi";
import { createRoute, OpenAPIHono, type RouteConfig } from "@hono/zod-openapi";
import type { Context } from "hono";

import type { Db } from "@/server/db/types";
import * as goalRepo from "@/server/repos/goals";
import * as projectRepo from "@/server/repos/projects";
import * as reminderRepo from "@/server/repos/reminders";
import * as settingsRepo from "@/server/repos/settings";
import * as completionLogRepo from "@/server/repos/task-completion-log";
import * as taskRepo from "@/server/repos/tasks";
import {
	fetchAndSyncCalendar,
	listCalendarEvents,
} from "@/server/services/calendar";
import {
	clearedSessionCookie,
	createAuthMiddleware,
	sessionCookie,
	sha256Hex,
} from "./auth";

import {
	calendarEventSchema,
	calendarQuerySchema,
	calendarRefreshResultSchema,
	completionLogSchema,
	emptySchema,
	errorSchema,
	goalCreateSchema,
	goalQuerySchema,
	goalSchema,
	goalUpdateSchema,
	healthSchema,
	idParamSchema,
	linkEventSchema,
	loginSchema,
	projectCreateSchema,
	projectReorderSchema,
	projectSchema,
	projectUpdateSchema,
	reminderCreateSchema,
	reminderSchema,
	reminderWithTitleSchema,
	sessionSchema,
	settingsSchema,
	settingsUpdateSchema,
	taskCreateSchema,
	taskQuerySchema,
	taskSchema,
	taskUpdateSchema,
} from "./schemas";

class NotFoundError extends Error {}

function jsonResponse(schema: z.ZodTypeAny, description: string) {
	return {
		200: {
			content: { "application/json": { schema } },
			description,
		},
		400: {
			content: { "application/json": { schema: errorSchema } },
			description: "Invalid request",
		},
		401: {
			content: { "application/json": { schema: errorSchema } },
			description: "Authentication required",
		},
		404: {
			content: { "application/json": { schema: errorSchema } },
			description: "Not found",
		},
	} satisfies RouteConfig["responses"];
}

export type AppEnv = { Variables: { db: Db } };

export type AppOptions = {
	/**
	 * Turns a request into a Db. Local dev passes `() => getDb()` (bun:sqlite);
	 * the Worker passes `(c) => createD1Db(c.env.DB)`.
	 */
	resolveDb: (c: Context<AppEnv>) => Db;
	/**
	 * The shared password. Returning undefined leaves the API open, which is what
	 * local dev and the test suite rely on.
	 */
	getSecret?: (c: Context<AppEnv>) => string | undefined;
};

export function createApp({ resolveDb, getSecret }: AppOptions) {
	const app = new OpenAPIHono<AppEnv>({
		defaultHook: (result, c) => {
			if (!result.success) {
				return c.json({ error: result.error.message }, 400);
			}
		},
	});

	app.onError((err, c) => {
		if (err instanceof NotFoundError) {
			return c.json({ error: err.message }, 404);
		}
		return c.json({ error: err.message }, 400);
	});

	app.use("*", async (c, next) => {
		c.set("db", resolveDb(c));
		await next();
	});

	app.use(
		"*",
		createAuthMiddleware((c) => getSecret?.(c as Context<AppEnv>)),
	);

	// Health check. Exempt from auth and deliberately does not touch the
	// database, so it reports "the Worker is up" rather than "D1 is reachable".
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/health",
			responses: jsonResponse(healthSchema, "Service is up"),
		}),
		(c) => c.json({ ok: true } as const, 200),
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/login",
			request: {
				body: { content: { "application/json": { schema: loginSchema } } },
			},
			responses: jsonResponse(sessionSchema, "Logged in"),
		}),
		async (c) => {
			const secret = getSecret?.(c);
			if (!secret) {
				// No secret configured: the API is already open, so report success
				// rather than leaving the login screen stuck on a failing request.
				return c.json({ authenticated: true }, 200);
			}

			const { password } = c.req.valid("json");
			const token = await sha256Hex(secret);
			if ((await sha256Hex(password)) !== token) {
				return c.json({ error: "Invalid password" }, 401);
			}

			const secure = new URL(c.req.url).protocol === "https:";
			c.header("Set-Cookie", sessionCookie(token, secure));
			return c.json({ authenticated: true }, 200);
		},
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/logout",
			responses: jsonResponse(sessionSchema, "Logged out"),
		}),
		(c) => {
			c.header("Set-Cookie", clearedSessionCookie());
			return c.json({ authenticated: false }, 200);
		},
	);

	// Reaching this at all means the auth middleware let the request through.
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/session",
			responses: jsonResponse(sessionSchema, "Session state"),
		}),
		(c) => c.json({ authenticated: true }, 200),
	);

	// Settings
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/settings",
			responses: jsonResponse(settingsSchema, "App settings"),
		}),
		async (c) => c.json(await settingsRepo.getSettings(c.get("db")), 200),
	);

	app.openapi(
		createRoute({
			method: "patch",
			path: "/api/settings",
			request: {
				body: {
					content: { "application/json": { schema: settingsUpdateSchema } },
				},
			},
			responses: jsonResponse(settingsSchema, "Updated settings"),
		}),
		async (c) =>
			c.json(
				await settingsRepo.updateSettings(c.get("db"), c.req.valid("json")),
				200,
			),
	);

	// Calendar (read-only ICS integration)
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/calendar/events",
			request: { query: calendarQuerySchema },
			responses: jsonResponse(
				calendarEventSchema.array(),
				"Cached calendar events in range",
			),
		}),
		async (c) =>
			c.json(await listCalendarEvents(c.get("db"), c.req.valid("query")), 200),
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/calendar/refresh",
			responses: jsonResponse(
				calendarRefreshResultSchema,
				"Refreshed calendar from ICS feed",
			),
		}),
		async (c) => c.json(await fetchAndSyncCalendar(c.get("db")), 200),
	);

	// Projects
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/projects",
			responses: jsonResponse(projectSchema.array(), "All projects"),
		}),
		async (c) => c.json(await projectRepo.listProjects(c.get("db")), 200),
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/projects",
			request: {
				body: {
					content: { "application/json": { schema: projectCreateSchema } },
				},
			},
			responses: jsonResponse(projectSchema, "Created project"),
		}),
		async (c) =>
			c.json(
				await projectRepo.createProject(c.get("db"), c.req.valid("json")),
				200,
			),
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/projects/reorder",
			request: {
				body: {
					content: { "application/json": { schema: projectReorderSchema } },
				},
			},
			responses: jsonResponse(projectSchema.array(), "Reordered projects"),
		}),
		async (c) => {
			const { projectIds } = c.req.valid("json");
			return c.json(
				await projectRepo.reorderProjects(c.get("db"), projectIds),
				200,
			);
		},
	);

	app.openapi(
		createRoute({
			method: "patch",
			path: "/api/projects/{id}",
			request: {
				params: idParamSchema,
				body: {
					content: { "application/json": { schema: projectUpdateSchema } },
				},
			},
			responses: jsonResponse(projectSchema, "Updated project"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			const project = await projectRepo.updateProject(
				c.get("db"),
				id,
				c.req.valid("json"),
			);
			if (!project) throw new NotFoundError(`Project ${id} not found`);
			return c.json(project, 200);
		},
	);

	app.openapi(
		createRoute({
			method: "delete",
			path: "/api/projects/{id}",
			request: { params: idParamSchema },
			responses: jsonResponse(emptySchema, "Deleted"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			const ok = await projectRepo.deleteProject(c.get("db"), id);
			if (!ok) {
				throw new NotFoundError(
					`Project ${id} not found or cannot delete inbox`,
				);
			}
			return c.json({}, 200);
		},
	);

	// Tasks
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/tasks",
			request: { query: taskQuerySchema },
			responses: jsonResponse(taskSchema.array(), "Tasks matching the query"),
		}),
		async (c) =>
			c.json(await taskRepo.listTasks(c.get("db"), c.req.valid("query")), 200),
	);

	app.openapi(
		createRoute({
			method: "get",
			path: "/api/tasks/deleted",
			responses: jsonResponse(taskSchema.array(), "Soft-deleted tasks"),
		}),
		async (c) => c.json(await taskRepo.listDeletedTasks(c.get("db")), 200),
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/tasks",
			request: {
				body: { content: { "application/json": { schema: taskCreateSchema } } },
			},
			responses: jsonResponse(taskSchema, "Created task"),
		}),
		async (c) =>
			c.json(await taskRepo.createTask(c.get("db"), c.req.valid("json")), 200),
	);

	app.openapi(
		createRoute({
			method: "patch",
			path: "/api/tasks/{id}",
			request: {
				params: idParamSchema,
				body: { content: { "application/json": { schema: taskUpdateSchema } } },
			},
			responses: jsonResponse(taskSchema, "Updated task"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			const task = await taskRepo.updateTask(
				c.get("db"),
				id,
				c.req.valid("json"),
			);
			if (!task) throw new NotFoundError(`Task ${id} not found`);
			return c.json(task, 200);
		},
	);

	app.openapi(
		createRoute({
			method: "delete",
			path: "/api/tasks/{id}",
			request: { params: idParamSchema },
			responses: jsonResponse(emptySchema, "Deleted"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			await taskRepo.deleteTask(c.get("db"), id);
			return c.json({}, 200);
		},
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/tasks/{id}/complete",
			request: { params: idParamSchema },
			responses: jsonResponse(taskSchema, "Completed task"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			const result = await taskRepo.completeTask(c.get("db"), id);
			if (!result.task) throw new NotFoundError(`Task ${id} not found`);
			return c.json(result.task, 200);
		},
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/tasks/{id}/uncomplete",
			request: { params: idParamSchema },
			responses: jsonResponse(taskSchema, "Uncompleted task"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			const task = await taskRepo.uncompleteTask(c.get("db"), id);
			if (!task) throw new NotFoundError(`Task ${id} not found`);
			return c.json(task, 200);
		},
	);

	const taskAction = (
		path: string,
		action: (db: Db, id: number) => ReturnType<typeof taskRepo.uncompleteTask>,
	) => {
		app.openapi(
			createRoute({
				method: "post",
				path,
				request: { params: idParamSchema },
				responses: jsonResponse(taskSchema, "Updated task"),
			}),
			async (c) => {
				const { id } = c.req.valid("param");
				const task = await action(c.get("db"), id);
				if (!task) throw new NotFoundError(`Task ${id} not found`);
				return c.json(task, 200);
			},
		);
	};

	taskAction("/api/tasks/{id}/undelete", (db, id) =>
		taskRepo.undeleteTask(db, id),
	);

	app.openapi(
		createRoute({
			method: "get",
			path: "/api/tasks/{id}/completion-history",
			request: { params: idParamSchema },
			responses: jsonResponse(
				completionLogSchema.array(),
				"Task completion history",
			),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			return c.json(
				await completionLogRepo.getCompletionHistory(c.get("db"), id),
				200,
			);
		},
	);

	app.openapi(
		createRoute({
			method: "get",
			path: "/api/completions",
			request: { query: calendarQuerySchema },
			responses: jsonResponse(
				completionLogSchema.array(),
				"Completions in a date range",
			),
		}),
		async (c) => {
			const { from, to } = c.req.valid("query");
			return c.json(
				await completionLogRepo.listCompletions(c.get("db"), from, to),
				200,
			);
		},
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/tasks/{id}/link-event",
			request: {
				params: idParamSchema,
				body: { content: { "application/json": { schema: linkEventSchema } } },
			},
			responses: jsonResponse(taskSchema, "Task linked to calendar event"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			const { eventUid } = c.req.valid("json");
			const task = await taskRepo.linkTaskToEvent(c.get("db"), id, eventUid);
			if (!task) throw new NotFoundError(`Task ${id} not found`);
			return c.json(task, 200);
		},
	);

	// Goals
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/goals",
			request: { query: goalQuerySchema },
			responses: jsonResponse(goalSchema.array(), "Goals matching the query"),
		}),
		async (c) =>
			c.json(await goalRepo.listGoals(c.get("db"), c.req.valid("query")), 200),
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/goals",
			request: {
				body: { content: { "application/json": { schema: goalCreateSchema } } },
			},
			responses: jsonResponse(goalSchema, "Created goal"),
		}),
		async (c) =>
			c.json(await goalRepo.createGoal(c.get("db"), c.req.valid("json")), 200),
	);

	app.openapi(
		createRoute({
			method: "patch",
			path: "/api/goals/{id}",
			request: {
				params: idParamSchema,
				body: { content: { "application/json": { schema: goalUpdateSchema } } },
			},
			responses: jsonResponse(goalSchema, "Updated goal"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			const goal = await goalRepo.updateGoal(
				c.get("db"),
				id,
				c.req.valid("json"),
			);
			if (!goal) throw new NotFoundError(`Goal ${id} not found`);
			return c.json(goal, 200);
		},
	);

	app.openapi(
		createRoute({
			method: "delete",
			path: "/api/goals/{id}",
			request: { params: idParamSchema },
			responses: jsonResponse(emptySchema, "Deleted"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			await goalRepo.deleteGoal(c.get("db"), id);
			return c.json({}, 200);
		},
	);

	// Reminders
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/reminders",
			responses: jsonResponse(
				reminderWithTitleSchema.array(),
				"All reminders with task titles",
			),
		}),
		async (c) =>
			c.json(await reminderRepo.listAllRemindersWithTitles(c.get("db")), 200),
	);

	app.openapi(
		createRoute({
			method: "get",
			path: "/api/reminders/due",
			responses: jsonResponse(
				reminderWithTitleSchema.array(),
				"Due reminders with task titles",
			),
		}),
		async (c) =>
			c.json(await reminderRepo.listDueRemindersWithTitles(c.get("db")), 200),
	);

	app.openapi(
		createRoute({
			method: "get",
			path: "/api/tasks/{id}/reminders",
			request: { params: idParamSchema },
			responses: jsonResponse(reminderSchema.array(), "Reminders for a task"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			return c.json(await reminderRepo.listTaskReminders(c.get("db"), id), 200);
		},
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/tasks/{id}/reminders",
			request: {
				params: idParamSchema,
				body: {
					content: { "application/json": { schema: reminderCreateSchema } },
				},
			},
			responses: jsonResponse(reminderSchema, "Created reminder"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			const reminder = await reminderRepo.createReminder(c.get("db"), {
				taskId: id,
				...c.req.valid("json"),
			});
			return c.json(reminder, 200);
		},
	);

	app.openapi(
		createRoute({
			method: "delete",
			path: "/api/reminders/{id}",
			request: { params: idParamSchema },
			responses: jsonResponse(emptySchema, "Deleted"),
		}),
		async (c) => {
			const { id } = c.req.valid("param");
			await reminderRepo.deleteReminder(c.get("db"), id);
			return c.json({}, 200);
		},
	);

	app.doc31("/api/openapi.json", {
		openapi: "3.1.0",
		info: {
			title: "finish-em API",
			version: "1.0.0",
			description:
				"Local HTTP API for the finish-em todo app. Wraps the same repository layer used by the TUI and CLI.",
		},
	});

	app.get("/api/docs", swaggerUI({ url: "/api/openapi.json" }));

	return app;
}
