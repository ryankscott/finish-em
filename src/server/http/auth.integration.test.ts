import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getDb, resetDbForTests } from "@/server/db/client";
import { createApp } from "@/server/http/app";
import { sha256Hex } from "@/server/http/auth";

const dbPath = path.join(os.tmpdir(), `finish-em-auth-${Date.now()}.db`);
const SECRET = "correct horse battery staple";

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

afterEach(() => {
	cleanDb();
});

const openApp = () => createApp({ resolveDb: () => getDb() });
const guardedApp = () =>
	createApp({ resolveDb: () => getDb(), getSecret: () => SECRET });

describe("auth: no secret configured", () => {
	it("leaves the API open", async () => {
		const res = await openApp().request("/api/tasks");
		expect(res.status).toBe(200);
	});

	it("still answers login so the UI is not stuck", async () => {
		const res = await openApp().request("/api/login", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ password: "anything" }),
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ authenticated: true });
	});
});

describe("auth: secret configured", () => {
	it("rejects an unauthenticated API request", async () => {
		const res = await guardedApp().request("/api/tasks");
		expect(res.status).toBe(401);
	});

	it("rejects a wrong bearer token", async () => {
		const res = await guardedApp().request("/api/tasks", {
			headers: { authorization: "Bearer not-the-token" },
		});
		expect(res.status).toBe(401);
	});

	it("accepts a correct bearer token", async () => {
		const token = await sha256Hex(SECRET);
		const res = await guardedApp().request("/api/tasks", {
			headers: { authorization: `Bearer ${token}` },
		});
		expect(res.status).toBe(200);
	});

	it("accepts a correct session cookie", async () => {
		const token = await sha256Hex(SECRET);
		const res = await guardedApp().request("/api/tasks", {
			headers: { cookie: `fe_session=${token}` },
		});
		expect(res.status).toBe(200);
	});

	it("login with the right password sets an HttpOnly cookie that then works", async () => {
		const app = guardedApp();
		const login = await app.request("/api/login", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ password: SECRET }),
		});
		expect(login.status).toBe(200);

		const setCookie = login.headers.get("set-cookie") ?? "";
		expect(setCookie).toContain("fe_session=");
		expect(setCookie).toContain("HttpOnly");
		expect(setCookie).toContain("SameSite=Lax");

		const cookie = setCookie.split(";")[0];
		const after = await app.request("/api/tasks", { headers: { cookie } });
		expect(after.status).toBe(200);
	});

	it("login with the wrong password is rejected and sets no cookie", async () => {
		const res = await guardedApp().request("/api/login", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ password: "wrong" }),
		});
		expect(res.status).toBe(401);
		expect(res.headers.get("set-cookie")).toBeNull();
	});

	it("exempts /api/health", async () => {
		const res = await guardedApp().request("/api/health");
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
	});

	it("does NOT exempt the API docs or the OpenAPI document", async () => {
		// On loopback an open explorer was harmless. On the public internet it
		// publishes the whole API surface, so both must sit behind the gate.
		expect((await guardedApp().request("/api/docs")).status).toBe(401);
		expect((await guardedApp().request("/api/openapi.json")).status).toBe(401);
	});

	it("lets non-API paths through so the login screen can load", async () => {
		// No SPA handler is mounted in tests, so a 404 from the router is the
		// correct outcome; the point is that it is not a 401.
		const res = await guardedApp().request("/index.html");
		expect(res.status).not.toBe(401);
	});

	it("logout clears the cookie", async () => {
		const res = await guardedApp().request("/api/logout", { method: "POST" });
		expect(res.status).toBe(200);
		expect(res.headers.get("set-cookie")).toContain("Max-Age=0");
	});
});
