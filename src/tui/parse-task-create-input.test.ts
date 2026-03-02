import { describe, expect, it } from "bun:test";

import type { Project } from "../server/types";
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
		expect(result.errors.some((error) => error.includes("title is required"))).toBe(true);
	});

	it("reports invalid tokenized values", () => {
		const result = parseTaskCreateInput("title:Task priority:9 due:yesterday parent:abc", PROJECTS);
		expect(result.errors.some((error) => error.includes("priority"))).toBe(true);
		expect(result.errors.some((error) => error.includes("due date"))).toBe(true);
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
});
