import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { resetDbForTests } from "@/server/db/client";
import { runCli } from "@/tui/cli";
import { createDirectApi } from "@/tui/direct-api";

let dbPath = "";

beforeEach(() => {
	dbPath = path.join(os.tmpdir(), `finish-em-cli-test-${randomUUID()}.db`);
	process.env.TODO_DB_PATH = dbPath;
	resetDbForTests();
	if (fs.existsSync(dbPath)) {
		fs.unlinkSync(dbPath);
	}
});

afterEach(() => {
	resetDbForTests();
	if (fs.existsSync(dbPath)) {
		fs.unlinkSync(dbPath);
	}
});

const runWithCapture = async (args: string[]) => {
	let stdout = "";
	let stderr = "";

	const result = await runCli(args, {
		api: createDirectApi(),
		io: {
			stdout: {
				write: (value: string) => {
					stdout += value;
				},
			},
			stderr: {
				write: (value: string) => {
					stderr += value;
				},
			},
		},
	});

	return { result, stdout, stderr };
};

describe("runCli integration", () => {
	it("prints root help and task help", async () => {
		const root = await runWithCapture(["--help"]);
		expect(root.result.handled).toBe(true);
		expect(root.result.exitCode).toBe(0);
		expect(root.stdout).toContain("finish-em [command] [subcommand] [flags]");
		expect(root.stdout).toContain("task");

		const taskHelp = await runWithCapture(["task", "--help"]);
		expect(taskHelp.result.exitCode).toBe(0);
		expect(taskHelp.stdout).toContain("finish-em task <subcommand> [flags]");
		expect(taskHelp.stdout).toContain("list");
	});

	it("supports human-readable and --json output for task list", async () => {
		const api = createDirectApi();
		const inbox = (await api.listProjects()).find((project) => project.isInbox);
		expect(inbox).toBeDefined();
		await api.createTask({
			title: "CLI output test",
			projectId: inbox!.id,
			priority: 2,
		});

		const human = await runWithCapture(["task", "list"]);
		expect(human.result.exitCode).toBe(0);
		expect(human.stdout).toContain("CLI output test");
		expect(human.stdout).toContain("open p2");

		const json = await runWithCapture(["task", "list", "--json"]);
		expect(json.result.exitCode).toBe(0);
		const parsed = JSON.parse(json.stdout) as Array<{ title: string }>;
		expect(parsed.some((task) => task.title === "CLI output test")).toBe(true);
	});

	it("returns JSON errors when --json is used on failures", async () => {
		const result = await runWithCapture(["task", "update", "99999", "--json"]);
		expect(result.result.handled).toBe(true);
		expect(result.result.exitCode).toBe(1);
		const parsed = JSON.parse(result.stderr) as { error: string };
		expect(parsed.error).toContain("not found");
	});

	it("preserves project deletion semantics through CLI", async () => {
		const api = createDirectApi();
		const inbox = (await api.listProjects()).find((project) => project.isInbox);
		expect(inbox).toBeDefined();

		const createdProject = await api.createProject({
			name: "CLI Delete",
			color: "#ef4444",
		});
		await api.createTask({
			title: "Task in deleted project",
			projectId: createdProject.id,
		});

		const deleted = await runWithCapture([
			"project",
			"delete",
			String(createdProject.id),
			"--json",
		]);
		expect(deleted.result.exitCode).toBe(0);

		const projects = await api.listProjects();
		expect(
			projects.find((project) => project.id === createdProject.id),
		).toBeUndefined();
		const inboxTasks = await api.listTasks({ projectId: inbox!.id });
		expect(
			inboxTasks.some((task) => task.title === "Task in deleted project"),
		).toBe(true);

		const failInbox = await runWithCapture([
			"project",
			"delete",
			String(inbox!.id),
		]);
		expect(failInbox.result.exitCode).toBe(1);
	});

});

