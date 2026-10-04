import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getDb, resetDbForTests } from "@/server/db/client";
import { createApp } from "@/server/http/app";
import { type ApiCall, handleMcpRequest } from "@/server/http/mcp";

const dbPath = path.join(os.tmpdir(), `finish-em-mcp-${Date.now()}.db`);
const SECRET = "a-long-random-mcp-secret-0123456789";

function cleanDb() {
	resetDbForTests();
	for (const suffix of ["", "-wal", "-shm"]) {
		const file = `${dbPath}${suffix}`;
		if (fs.existsSync(file)) fs.unlinkSync(file);
	}
}

beforeEach(() => {
	process.env.TODO_DB_PATH = dbPath;
	cleanDb();
});
afterEach(cleanDb);

const app = () => createApp({ resolveDb: () => getDb() });

const api: ApiCall = async (method, p, body) => {
	const res = await app().request(p, {
		method,
		headers: body ? { "content-type": "application/json" } : {},
		body: body ? JSON.stringify(body) : undefined,
	});
	return { ok: res.ok, status: res.status, body: await res.json() };
};

const rpc = (
	urlSecret: string,
	body: unknown,
	secret: string | null = SECRET,
) =>
	handleMcpRequest(
		new Request(`https://x.test/mcp/${urlSecret}`, {
			method: "POST",
			body: JSON.stringify(body),
		}),
		secret ?? undefined,
		api,
	);

describe("mcp endpoint", () => {
	it("ignores non-mcp paths", async () => {
		const res = await handleMcpRequest(
			new Request("https://x.test/api/tasks"),
			SECRET,
			api,
		);
		expect(res).toBeNull();
	});

	it("returns 404 for a wrong secret or when unconfigured", async () => {
		const msg = { jsonrpc: "2.0", id: 1, method: "ping" };
		expect((await rpc("wrong", msg))?.status).toBe(404);
		expect((await rpc(SECRET, msg, null))?.status).toBe(404);
		expect((await rpc("short", msg, "short"))?.status).toBe(404);
	});

	it("rejects GET with 405", async () => {
		const res = await handleMcpRequest(
			new Request(`https://x.test/mcp/${SECRET}`),
			SECRET,
			api,
		);
		expect(res?.status).toBe(405);
	});

	it("initializes and lists tools", async () => {
		const init = await (
			await rpc(SECRET, { jsonrpc: "2.0", id: 1, method: "initialize" })
		)?.json();
		expect(init.result.serverInfo.name).toBe("finish-em");

		const list = await (
			await rpc(SECRET, { jsonrpc: "2.0", id: 2, method: "tools/list" })
		)?.json();
		const names = list.result.tools.map((t: { name: string }) => t.name);
		expect(names).toContain("create_task");
		expect(names).toContain("complete_task");
	});

	it("acknowledges notifications with 202", async () => {
		const res = await rpc(SECRET, {
			jsonrpc: "2.0",
			method: "notifications/initialized",
		});
		expect(res?.status).toBe(202);
	});

	it("creates, lists and completes a task through tools/call", async () => {
		const call = async (name: string, args: unknown) => {
			const res = await rpc(SECRET, {
				jsonrpc: "2.0",
				id: 1,
				method: "tools/call",
				params: { name, arguments: args },
			});
			const json = await res?.json();
			return {
				isError: json.result.isError as boolean,
				data: JSON.parse(json.result.content[0].text),
			};
		};

		const projects = await call("list_projects", {});
		const inbox = projects.data.find((p: { isInbox: boolean }) => p.isInbox);

		const created = await call("create_task", {
			projectId: inbox.id,
			title: "From phone",
			priority: 2,
		});
		expect(created.isError).toBe(false);
		expect(created.data.title).toBe("From phone");

		const open = await call("list_tasks", { status: "open" });
		expect(open.data.map((t: { title: string }) => t.title)).toContain(
			"From phone",
		);

		const done = await call("complete_task", { id: created.data.id });
		expect(done.isError).toBe(false);

		const bad = await call("complete_task", { id: 999999 });
		expect(bad.isError).toBe(true);
	});
});
