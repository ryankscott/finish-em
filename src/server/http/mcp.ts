/**
 * Remote MCP endpoint (Streamable HTTP, stateless JSON responses).
 *
 * Lets Claude mobile, Claude desktop, and Claude Code on other machines use
 * finish-em through a custom connector. Each tool maps onto an existing /api
 * route and calls it in-process, so validation, auth and the change-version
 * bump stay in one place.
 *
 * Auth is a long random secret in the URL path (/mcp/<secret>), because the
 * connector dialog accepts only a URL. It is separate from the UI password so
 * it can be rotated alone. With no secret configured the endpoint does not
 * exist.
 */

import { sha256Hex } from "./auth";

const PROTOCOL_VERSION = "2025-03-26";
const MIN_SECRET_LENGTH = 24;

export type ApiCall = (
	method: string,
	path: string,
	body?: unknown,
) => Promise<{ ok: boolean; status: number; body: unknown }>;

type Json = Record<string, unknown>;
type Tool = {
	name: string;
	description: string;
	inputSchema: Json;
	run: (args: Json, api: ApiCall) => ReturnType<ApiCall>;
};

const obj = (properties: Json, required: string[] = []): Json => ({
	type: "object",
	properties,
	required,
});

const id = { type: "integer", description: "Numeric id." };
const date = {
	type: "string",
	description: "ISO 8601 date or datetime, e.g. 2026-09-11.",
};
const taskFields = {
	title: { type: "string" },
	notes: { type: "string" },
	priority: {
		type: "integer",
		description: "1 Urgent, 2 High, 3 Medium, 4 Low.",
	},
	dueAt: { ...date, type: ["string", "null"] },
	scheduledAt: { ...date, type: ["string", "null"] },
	estimateMinutes: { type: ["integer", "null"] },
	someday: { type: "boolean" },
	parentTaskId: { type: ["integer", "null"] },
	recurrencePreset: {
		type: ["string", "null"],
		enum: ["daily", "weekly", "monthly", "yearly", "every_weekday", null],
	},
};

function query(args: Json, keys: string[]): string {
	const params = new URLSearchParams();
	for (const key of keys) {
		const value = args[key];
		if (value !== undefined && value !== null) params.set(key, String(value));
	}
	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

function pick(args: Json, omit: string[]): Json {
	return Object.fromEntries(
		Object.entries(args).filter(([k]) => !omit.includes(k)),
	);
}

const TASK_QUERY_KEYS = [
	"projectId",
	"status",
	"from",
	"to",
	"scheduledFrom",
	"scheduledTo",
	"priority",
	"noDueDate",
	"someday",
	"recurring",
	"unplanned",
	"rootsOnly",
	"parentTaskId",
];

export const TOOLS: Tool[] = [
	{
		name: "list_projects",
		description:
			"List projects. The Inbox project has isInbox true; use it for one-off tasks.",
		inputSchema: obj({}),
		run: (_a, api) => api("GET", "/api/projects"),
	},
	{
		name: "create_project",
		description: "Create a project.",
		inputSchema: obj(
			{
				name: { type: "string" },
				emoji: { type: "string" },
				description: { type: "string" },
				color: { type: "string", description: "Hex color, e.g. #ef4444." },
			},
			["name"],
		),
		run: (a, api) => api("POST", "/api/projects", a),
	},
	{
		name: "list_tasks",
		description:
			"List tasks. Filter by project, status (open or completed), due window (from/to), priority and more.",
		inputSchema: obj({
			projectId: id,
			status: { type: "string", enum: ["open", "completed"] },
			from: date,
			to: date,
			scheduledFrom: date,
			scheduledTo: date,
			priority: { type: "integer" },
			noDueDate: { type: "boolean" },
			someday: { type: "boolean" },
			recurring: { type: "boolean" },
			unplanned: { type: "boolean" },
			rootsOnly: { type: "boolean" },
			parentTaskId: { type: "integer" },
		}),
		run: (a, api) => api("GET", `/api/tasks${query(a, TASK_QUERY_KEYS)}`),
	},
	{
		name: "create_task",
		description: "Create a task. projectId and title are required.",
		inputSchema: obj({ projectId: id, ...taskFields }, ["projectId", "title"]),
		run: (a, api) => api("POST", "/api/tasks", a),
	},
	{
		name: "update_task",
		description:
			"Update a task. Send only the fields to change; null clears a nullable field.",
		inputSchema: obj(
			{
				id,
				projectId: id,
				plannedStartAt: { type: ["string", "null"] },
				...taskFields,
			},
			["id"],
		),
		run: (a, api) => api("PATCH", `/api/tasks/${a.id}`, pick(a, ["id"])),
	},
	{
		name: "complete_task",
		description: "Mark a task done.",
		inputSchema: obj({ id }, ["id"]),
		run: (a, api) => api("POST", `/api/tasks/${a.id}/complete`),
	},
	{
		name: "reopen_task",
		description: "Mark a completed task open again.",
		inputSchema: obj({ id }, ["id"]),
		run: (a, api) => api("POST", `/api/tasks/${a.id}/uncomplete`),
	},
	{
		name: "delete_task",
		description:
			"Soft-delete a task. Prefer complete_task. Reverse with undelete_task.",
		inputSchema: obj({ id }, ["id"]),
		run: (a, api) => api("DELETE", `/api/tasks/${a.id}`),
	},
	{
		name: "undelete_task",
		description: "Restore a deleted task.",
		inputSchema: obj({ id }, ["id"]),
		run: (a, api) => api("POST", `/api/tasks/${a.id}/undelete`),
	},
	{
		name: "list_goals",
		description:
			"List goals for a period. Weekly goals use the Monday of the week as periodStart.",
		inputSchema: obj({
			periodType: { type: "string", enum: ["daily", "weekly"] },
			periodStart: date,
		}),
		run: (a, api) =>
			api("GET", `/api/goals${query(a, ["periodType", "periodStart"])}`),
	},
	{
		name: "create_goal",
		description: "Create a daily or weekly goal.",
		inputSchema: obj(
			{
				periodType: { type: "string", enum: ["daily", "weekly"] },
				periodStart: date,
				title: { type: "string" },
			},
			["periodType", "periodStart", "title"],
		),
		run: (a, api) => api("POST", "/api/goals", a),
	},
	{
		name: "update_goal",
		description: "Update a goal, for example set done to true.",
		inputSchema: obj(
			{ id, title: { type: "string" }, done: { type: "boolean" } },
			["id"],
		),
		run: (a, api) => api("PATCH", `/api/goals/${a.id}`, pick(a, ["id"])),
	},
	{
		name: "list_completions",
		description: "List tasks completed in a date range.",
		inputSchema: obj({ from: date, to: date }, ["from", "to"]),
		run: (a, api) => api("GET", `/api/completions${query(a, ["from", "to"])}`),
	},
	{
		name: "create_reminder",
		description: "Add a reminder to a task.",
		inputSchema: obj(
			{
				taskId: id,
				remindAt: { ...date, description: "ISO 8601 datetime in UTC." },
			},
			["taskId", "remindAt"],
		),
		run: (a, api) =>
			api("POST", `/api/tasks/${a.taskId}/reminders`, { remindAt: a.remindAt }),
	},
];

function rpcResult(rpcId: unknown, result: unknown) {
	return { jsonrpc: "2.0", id: rpcId, result };
}

function rpcError(rpcId: unknown, code: number, message: string) {
	return { jsonrpc: "2.0", id: rpcId ?? null, error: { code, message } };
}

async function handleMessage(msg: Json, api: ApiCall): Promise<unknown | null> {
	const rpcId = msg.id;
	const isNotification = rpcId === undefined;

	switch (msg.method) {
		case "initialize":
			return rpcResult(rpcId, {
				protocolVersion: PROTOCOL_VERSION,
				capabilities: { tools: {} },
				serverInfo: { name: "finish-em", version: "1.0.0" },
			});
		case "ping":
			return rpcResult(rpcId, {});
		case "tools/list":
			return rpcResult(rpcId, {
				tools: TOOLS.map(({ name, description, inputSchema }) => ({
					name,
					description,
					inputSchema,
				})),
			});
		case "tools/call": {
			const params = (msg.params ?? {}) as Json;
			const tool = TOOLS.find((t) => t.name === params.name);
			if (!tool) return rpcError(rpcId, -32602, `Unknown tool: ${params.name}`);
			const res = await tool.run((params.arguments ?? {}) as Json, api);
			return rpcResult(rpcId, {
				content: [{ type: "text", text: JSON.stringify(res.body) }],
				isError: !res.ok,
			});
		}
		default:
			return isNotification
				? null
				: rpcError(rpcId, -32601, `Method not found: ${msg.method}`);
	}
}

function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

/**
 * Returns a Response for /mcp/<secret> requests, or null for any other path so
 * the caller falls through to the normal app.
 */
export async function handleMcpRequest(
	request: Request,
	secret: string | undefined,
	api: ApiCall,
): Promise<Response | null> {
	const match = new URL(request.url).pathname.match(/^\/mcp\/([^/]+)\/?$/);
	if (!match) return null;

	const notFound = () => new Response("Not found", { status: 404 });
	if (!secret || secret.length < MIN_SECRET_LENGTH) return notFound();

	// Compare digests so the comparison is fixed-length whatever the input.
	const [given, expected] = await Promise.all([
		sha256Hex(decodeURIComponent(match[1] ?? "")),
		sha256Hex(secret),
	]);
	if (!timingSafeEqual(given, expected)) return notFound();

	if (request.method !== "POST") {
		return new Response("Method not allowed", {
			status: 405,
			headers: { Allow: "POST" },
		});
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return Response.json(rpcError(null, -32700, "Parse error"), {
			status: 400,
		});
	}

	const messages = Array.isArray(payload) ? payload : [payload];
	const replies: unknown[] = [];
	for (const message of messages) {
		if (typeof message !== "object" || message === null) {
			replies.push(rpcError(null, -32600, "Invalid request"));
			continue;
		}
		const reply = await handleMessage(message as Json, api);
		if (reply !== null) replies.push(reply);
	}

	if (replies.length === 0) return new Response(null, { status: 202 });
	return Response.json(Array.isArray(payload) ? replies : replies[0]);
}
