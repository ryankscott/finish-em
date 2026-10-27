import { describe, expect, test } from "bun:test";

import {
	appendResult,
	buildDelegatePrompt,
	delegateUrl,
	MAX_URL_PROMPT,
	needsClipboard,
} from "./delegate";

const task = {
	id: 42,
	title: " Compare D1 and Turso pricing ",
	notes: "About 50k rows.",
	dueAt: "2026-11-02T09:00:00.000Z",
};

describe("buildDelegatePrompt", () => {
	test("includes the task context and the report-back instruction", () => {
		const prompt = buildDelegatePrompt({
			task,
			project: { name: "finish-em" },
			subtasks: [
				{ title: "Read D1 docs", status: "completed" },
				{ title: "Read Turso docs", status: "open" },
			],
		});
		expect(prompt).toContain("Task: Compare D1 and Turso pricing\n");
		expect(prompt).toContain("Project: finish-em");
		expect(prompt).toContain("Due: 2026-11-02");
		expect(prompt).toContain("Notes:\nAbout 50k rows.");
		expect(prompt).toContain("- [x] Read D1 docs\n- [ ] Read Turso docs");
		expect(prompt).toContain("call update_task for task 42");
		expect(prompt).toContain('set delegateStatus to "review"');
	});

	test("leaves out empty sections", () => {
		const prompt = buildDelegatePrompt({
			task: { ...task, notes: "  ", dueAt: null },
			project: null,
			subtasks: [],
		});
		expect(prompt).not.toContain("Notes:");
		expect(prompt).not.toContain("Due:");
		expect(prompt).not.toContain("Project:");
		expect(prompt).not.toContain("Subtasks:");
	});

	test("leads with the feedback when sending a task back", () => {
		const prompt = buildDelegatePrompt({
			task,
			project: null,
			subtasks: [],
			feedback: "Add Neon too.",
		});
		expect(prompt.startsWith("I reviewed your earlier result")).toBe(true);
		expect(prompt).toContain("Add Neon too.");
	});
});

describe("delegateUrl", () => {
	test("builds a prefilled link per agent", () => {
		expect(delegateUrl("claude-code", "a b")).toBe(
			"claude://claude.ai/code/new?q=a%20b",
		);
		expect(delegateUrl("claude", "a")).toBe("https://claude.ai/new?q=a");
		expect(delegateUrl("chatgpt", "a")).toBe("https://chatgpt.com/?q=a");
		expect(delegateUrl("codex", "a")).toBe("https://chatgpt.com/codex");
	});

	test("caps the prompt length in the URL", () => {
		const url = delegateUrl("claude", "x".repeat(MAX_URL_PROMPT + 50));
		expect(url.length).toBe("https://claude.ai/new?q=".length + MAX_URL_PROMPT);
	});
});

describe("needsClipboard", () => {
	test("is true for Codex and for prompts too long for a URL", () => {
		expect(needsClipboard("codex", "short")).toBe(true);
		expect(needsClipboard("claude", "short")).toBe(false);
		expect(needsClipboard("claude", "x".repeat(MAX_URL_PROMPT + 1))).toBe(true);
	});
});

describe("appendResult", () => {
	test("appends under a heading and ignores an empty result", () => {
		expect(appendResult("Old notes", "chatgpt", " Done. ")).toBe(
			"Old notes\n\nResult from ChatGPT:\nDone.",
		);
		expect(appendResult("", "codex", "Done.")).toBe(
			"Result from Codex:\nDone.",
		);
		expect(appendResult("Old", "claude", "  ")).toBe("Old");
	});
});
