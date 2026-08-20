import { describe, expect, it } from "bun:test";

import type { Project } from "../../server/types";
import { parseTaskCreateInput } from "./parse-task-create-input";

const makeProject = (id: number, name: string): Project => ({
	id,
	name,
	emoji: null,
	description: "",
	startAt: null,
	endAt: null,
	color: "#000000",
	isInbox: id === 1,
	sortOrder: 0,
	resources: [],
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
});

const PROJECTS = [makeProject(1, "Inbox"), makeProject(2, "Work")];

describe("parseTaskCreateInput", () => {
	it("supports plain-text fallback as title", () => {
		const result = parseTaskCreateInput("Ship docs", PROJECTS);
		expect(result.usedTokens).toBe(false);
		expect(result.input.title).toBe("Ship docs");
	});

	it("parses tokenized task metadata", () => {
		const result = parseTaskCreateInput(
			"title:Ship docs project:Work priority:1 due:today scheduled:tomorrow notes:Publish docs recurs:weekly parent:3",
			PROJECTS,
		);
		expect(result.usedTokens).toBe(true);
		expect(result.errors).toHaveLength(0);
		expect(result.input.title).toBe("Ship docs");
		expect(result.input.projectId).toBe(2);
		expect(result.input.priority).toBe(1);
		expect(result.input.notes).toBe("Publish docs");
		expect(result.input.recurrencePreset).toBe("weekly");
		expect(result.input.parentTaskId).toBe(3);
		expect(result.input.dueAt).toBeTruthy();
		expect(result.input.scheduledAt).toBeTruthy();
	});

	it("requires title in tokenized mode", () => {
		const result = parseTaskCreateInput("project:Work due:today", PROJECTS);
		expect(result.usedTokens).toBe(true);
		expect(
			result.errors.some((error) => error.includes("title is required")),
		).toBe(true);
	});

	it("reports invalid tokenized values", () => {
		const result = parseTaskCreateInput(
			"title:Task priority:9 due:yesterday parent:abc",
			PROJECTS,
		);
		expect(result.errors.some((error) => error.includes("priority"))).toBe(
			true,
		);
		expect(result.errors.some((error) => error.includes("due date"))).toBe(
			true,
		);
		expect(result.errors.some((error) => error.includes("parent"))).toBe(true);
	});

	it("parses emoji and alias tokens consistently with edit mode", () => {
		const result = parseTaskCreateInput(
			"Ship docs 📁 Work 🚩1 ⏰ today 🗓 tomorrow 🔁 weekly",
			PROJECTS,
		);
		expect(result.usedTokens).toBe(true);
		expect(result.errors).toHaveLength(0);
		expect(result.input.title).toBe("Ship docs");
		expect(result.input.projectId).toBe(2);
		expect(result.input.priority).toBe(1);
		expect(result.input.dueAt).toBeTruthy();
		expect(result.input.scheduledAt).toBeTruthy();
		expect(result.input.recurrencePreset).toBe("weekly");
	});

	it("parses proj:/prio:/sch:/rec: aliases", () => {
		const result = parseTaskCreateInput(
			"title:Ship docs proj:Work prio:2 sch:tomorrow rec:daily",
			PROJECTS,
		);
		expect(result.errors).toHaveLength(0);
		expect(result.input.projectId).toBe(2);
		expect(result.input.priority).toBe(2);
		expect(result.input.scheduledAt).toBeTruthy();
		expect(result.input.recurrencePreset).toBe("daily");
	});

	it("keeps URLs intact and does not read them as tokens", () => {
		const url =
			"https://idexx.atlassian.net/wiki/spaces/IV/pages/6755942577/Adoption+vello-practice-web+pages+and+routes";
		const result = parseTaskCreateInput(
			`Review this page around authz (${url}) p2 due:today`,
			PROJECTS,
		);
		expect(result.warnings).toHaveLength(0);
		expect(result.errors).toHaveLength(0);
		expect(result.input.title).toBe(`Review this page around authz (${url})`);
		expect(result.input.priority).toBe(2);
		expect(result.input.dueAt).toBeTruthy();
	});

	it("keeps a URL-only title untouched", () => {
		const result = parseTaskCreateInput(
			"https://example.com/p1/due:today notes:check it",
			PROJECTS,
		);
		expect(result.warnings).toHaveLength(0);
		expect(result.input.title).toBe("https://example.com/p1/due:today");
		expect(result.input.notes).toBe("check it");
		expect(result.input.priority).toBeUndefined();
		expect(result.input.dueAt).toBeUndefined();
	});

	it("does not treat an email address as a token", () => {
		const result = parseTaskCreateInput(
			"Email ryan@example.com about docs p1",
			PROJECTS,
		);
		expect(result.warnings).toHaveLength(0);
		expect(result.input.title).toBe("Email ryan@example.com about docs");
		expect(result.input.priority).toBe(1);
	});

	describe("estimates", () => {
		it("reads an estimate and strips it from the title", () => {
			const result = parseTaskCreateInput("Write the spec est:90m", PROJECTS);
			expect(result.input.estimateMinutes).toBe(90);
			expect(result.input.title).toBe("Write the spec");
			expect(result.errors).toEqual([]);
		});

		it("accepts the hour forms", () => {
			expect(
				parseTaskCreateInput("Write est:1h30", PROJECTS).input.estimateMinutes,
			).toBe(90);
			expect(
				parseTaskCreateInput("Write estimate:2h", PROJECTS).input
					.estimateMinutes,
			).toBe(120);
		});

		it("errors rather than mangling an unreadable estimate", () => {
			const result = parseTaskCreateInput("Write the spec est:soon", PROJECTS);
			expect(result.errors).toContain(
				"estimate must be a duration like 45m, 1h or 1h30",
			);
			expect(result.input.estimateMinutes).toBeUndefined();
		});

		it("does not swallow the token that follows it", () => {
			const result = parseTaskCreateInput(
				"Write the spec est:45m due:today project:Work",
				PROJECTS,
			);
			expect(result.input.estimateMinutes).toBe(45);
			expect(result.input.projectId).toBe(2);
			expect(result.input.dueAt).not.toBeUndefined();
			expect(result.input.title).toBe("Write the spec");
		});

		it("is not consumed by a preceding multi-word token", () => {
			const result = parseTaskCreateInput(
				"Ship it project:Work est:1h",
				PROJECTS,
			);
			expect(result.input.projectId).toBe(2);
			expect(result.input.estimateMinutes).toBe(60);
			expect(result.input.title).toBe("Ship it");
		});

		it("does not warn about est: as an unknown token", () => {
			const result = parseTaskCreateInput("Write est:45m", PROJECTS);
			expect(result.warnings).toEqual([]);
		});

		it("leaves the estimate unset when no token is present", () => {
			const result = parseTaskCreateInput("Write the spec due:today", PROJECTS);
			expect(result.input.estimateMinutes).toBeUndefined();
		});
	});
});
