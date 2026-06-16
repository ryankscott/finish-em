/**
 * HTTP API for finish-em. Thin OpenAPI-documented wrappers over the repo
 * layer in src/server/repos — all business logic stays in the repos so the
 * TUI/CLI (direct API) and this server behave identically.
 */

import { swaggerUI } from "@hono/swagger-ui";
import type { z } from "@hono/zod-openapi";
import { createRoute, OpenAPIHono, type RouteConfig } from "@hono/zod-openapi";

import * as goalRepo from "@/server/repos/goals";
import * as projectRepo from "@/server/repos/projects";
import * as reminderRepo from "@/server/repos/reminders";
import * as settingsRepo from "@/server/repos/settings";
import * as taskRepo from "@/server/repos/tasks";
import { getSyncService } from "@/server/sync/sync-service";

import {
	emptySchema,
	errorSchema,
	goalCreateSchema,
	goalQuerySchema,
	goalSchema,
	goalUpdateSchema,
	idParamSchema,
	projectCreateSchema,
	projectSchema,
	projectUpdateSchema,
	reminderCreateSchema,
	reminderSchema,
	reminderWithTitleSchema,
	settingsSchema,
	settingsUpdateSchema,
	syncResultSchema,
	syncStatusSchema,
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
		404: {
			content: { "application/json": { schema: errorSchema } },
			description: "Not found",
		},
	} satisfies RouteConfig["responses"];
}

export function createApp() {
	const app = new OpenAPIHono({
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

	// Settings
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/settings",
			responses: jsonResponse(settingsSchema, "App settings"),
		}),
		(c) => c.json(settingsRepo.getSettings(), 200),
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
		(c) => c.json(settingsRepo.updateSettings(c.req.valid("json")), 200),
	);

	// Projects
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/projects",
			responses: jsonResponse(projectSchema.array(), "All projects"),
		}),
		(c) => c.json(projectRepo.listProjects(), 200),
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
		(c) => c.json(projectRepo.createProject(c.req.valid("json")), 200),
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
		(c) => {
			const { id } = c.req.valid("param");
			const project = projectRepo.updateProject(id, c.req.valid("json"));
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
		(c) => {
			const { id } = c.req.valid("param");
			const ok = projectRepo.deleteProject(id);
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
		(c) => c.json(taskRepo.listTasks(c.req.valid("query")), 200),
	);

	app.openapi(
		createRoute({
			method: "get",
			path: "/api/tasks/deleted",
			responses: jsonResponse(taskSchema.array(), "Soft-deleted tasks"),
		}),
		(c) => c.json(taskRepo.listDeletedTasks(), 200),
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
		(c) => c.json(taskRepo.createTask(c.req.valid("json")), 200),
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
		(c) => {
			const { id } = c.req.valid("param");
			const task = taskRepo.updateTask(id, c.req.valid("json"));
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
		(c) => {
			const { id } = c.req.valid("param");
			taskRepo.deleteTask(id);
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
		(c) => {
			const { id } = c.req.valid("param");
			const result = taskRepo.completeTask(id);
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
		(c) => {
			const { id } = c.req.valid("param");
			const task = taskRepo.uncompleteTask(id);
			if (!task) throw new NotFoundError(`Task ${id} not found`);
			return c.json(task, 200);
		},
	);

	const taskAction = (
		path: string,
		action: (id: number) => ReturnType<typeof taskRepo.uncompleteTask>,
	) => {
		app.openapi(
			createRoute({
				method: "post",
				path,
				request: { params: idParamSchema },
				responses: jsonResponse(taskSchema, "Updated task"),
			}),
			(c) => {
				const { id } = c.req.valid("param");
				const task = action(id);
				if (!task) throw new NotFoundError(`Task ${id} not found`);
				return c.json(task, 200);
			},
		);
	};

	taskAction("/api/tasks/{id}/undelete", (id) => taskRepo.undeleteTask(id));

	// Goals
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/goals",
			request: { query: goalQuerySchema },
			responses: jsonResponse(goalSchema.array(), "Goals matching the query"),
		}),
		(c) => c.json(goalRepo.listGoals(c.req.valid("query")), 200),
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
		(c) => c.json(goalRepo.createGoal(c.req.valid("json")), 200),
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
		(c) => {
			const { id } = c.req.valid("param");
			const goal = goalRepo.updateGoal(id, c.req.valid("json"));
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
		(c) => {
			const { id } = c.req.valid("param");
			goalRepo.deleteGoal(id);
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
		(c) => c.json(reminderRepo.listAllRemindersWithTitles(), 200),
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
		(c) => c.json(reminderRepo.listDueRemindersWithTitles(), 200),
	);

	app.openapi(
		createRoute({
			method: "get",
			path: "/api/tasks/{id}/reminders",
			request: { params: idParamSchema },
			responses: jsonResponse(reminderSchema.array(), "Reminders for a task"),
		}),
		(c) => {
			const { id } = c.req.valid("param");
			return c.json(reminderRepo.listTaskReminders(id), 200);
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
		(c) => {
			const { id } = c.req.valid("param");
			const reminder = reminderRepo.createReminder({
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
		(c) => {
			const { id } = c.req.valid("param");
			reminderRepo.deleteReminder(id);
			return c.json({}, 200);
		},
	);

	// Sync (iCloud)
	app.openapi(
		createRoute({
			method: "get",
			path: "/api/sync",
			responses: jsonResponse(syncStatusSchema, "Sync status"),
		}),
		(c) => c.json(getSyncService().getStatus(), 200),
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/sync/enable",
			responses: jsonResponse(syncStatusSchema, "Sync enabled"),
		}),
		async (c) => {
			const sync = getSyncService();
			sync.enable();
			sync.startAutoSync();
			await sync.syncNow().catch(() => {});
			return c.json(sync.getStatus(), 200);
		},
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/sync/disable",
			responses: jsonResponse(syncStatusSchema, "Sync disabled"),
		}),
		(c) => {
			const sync = getSyncService();
			sync.disable();
			return c.json(sync.getStatus(), 200);
		},
	);

	app.openapi(
		createRoute({
			method: "post",
			path: "/api/sync/now",
			responses: jsonResponse(syncResultSchema, "Sync result"),
		}),
		async (c) => c.json(await getSyncService().syncNow(), 200),
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
