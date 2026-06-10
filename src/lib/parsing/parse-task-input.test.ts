import { describe, expect, it } from "bun:test";

import type { Project } from "../../server/types";
import { parseTaskEditInput, serializeTaskToEditInput } from "./parse-task-input";

const makeProject = (id: number, name: string): Project => ({
	id,
	name,
	emoji: null,
	description: "",
	startAt: null,
	endAt: null,
	color: "#000",
	isInbox: false,
	jiraDiscoveryUrl: null,
	jiraDiscoveryStatus: null,
	jiraDeliveryStatus: null,
	jiraDeliveryUrl: null,
	confluenceUrl: null,
	jiraDocsUrl: null,
	jiraDocsStatus: null,
	jiraReleaseNoteUrl: null,
	jiraReleaseNoteStatus: null,
	teamsReleaseNoteUrl: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
});

const PROJECTS: Project[] = [
	makeProject(1, "Work"),
	makeProject(2, "Personal"),
	makeProject(3, "My Long Project"),
];

describe("parseTaskEditInput", () => {
	describe("title", () => {
		it("returns the full input as title when no tokens present", () => {
			const { patch, warnings } = parseTaskEditInput("Do the dishes", PROJECTS);
			expect(patch.title).toBe("Do the dishes");
			expect(warnings).toHaveLength(0);
		});

		it("returns title after stripping tokens", () => {
			const { patch } = parseTaskEditInput("Do the thing p1 due:today", PROJECTS);
			expect(patch.title).toBe("Do the thing");
		});

		it("does not set title when only tokens are present", () => {
			const { patch } = parseTaskEditInput("p1 due:today", PROJECTS);
			expect(patch.title).toBeUndefined();
		});
	});

	describe("priority", () => {
		it.each([
			["p1", 1],
			["p2", 2],
			["p3", 3],
			["p4", 4],
		])("parses %s → priority %i", (token, expected) => {
			const { patch } = parseTaskEditInput(`Buy milk ${token}`, PROJECTS);
			expect(patch.priority).toBe(expected);
		});

		it("is case-insensitive", () => {
			const { patch } = parseTaskEditInput("Buy milk P1", PROJECTS);
			expect(patch.priority).toBe(1);
		});

		it("parses priority: and prio: aliases", () => {
			expect(parseTaskEditInput("Buy milk priority:1", PROJECTS).patch.priority).toBe(1);
			expect(parseTaskEditInput("Buy milk prio:2", PROJECTS).patch.priority).toBe(2);
		});

		it("parses emoji priority marker", () => {
			const { patch } = parseTaskEditInput("Buy milk 🚩3", PROJECTS);
			expect(patch.priority).toBe(3);
			expect(patch.title).toBe("Buy milk");
		});
	});

	describe("recurs", () => {
		it.each([
			["daily", "daily"],
			["weekly", "weekly"],
			["monthly", "monthly"],
			["yearly", "yearly"],
			["every_weekday", "every_weekday"],
		])("parses recurs:%s", (preset, expected) => {
			const { patch } = parseTaskEditInput(`Standup recurs:${preset}`, PROJECTS);
			expect(patch.recurrencePreset).toBe(expected);
		});

		it("clears recurrence with recurs:none", () => {
			const { patch } = parseTaskEditInput("Standup recurs:none", PROJECTS);
			expect(patch.recurrencePreset).toBeNull();
			expect(patch.recurrenceRRule).toBeNull();
		});

		it("warns on unknown recurrence preset", () => {
			const { patch, warnings } = parseTaskEditInput("Standup recurs:fortnightly", PROJECTS);
			expect(patch.recurrencePreset).toBeUndefined();
			expect(warnings.some((w) => w.includes("fortnightly"))).toBe(true);
		});

		it("parses rec:/recurrence: aliases and emoji marker", () => {
			expect(parseTaskEditInput("Standup rec:weekly", PROJECTS).patch.recurrencePreset).toBe("weekly");
			expect(parseTaskEditInput("Standup recurrence:monthly", PROJECTS).patch.recurrencePreset).toBe("monthly");
			expect(parseTaskEditInput("Standup 🔁 daily", PROJECTS).patch.recurrencePreset).toBe("daily");
		});
	});

	describe("due", () => {
		it("parses due:today as 09:00 today", () => {
			const { patch } = parseTaskEditInput("Task due:today", PROJECTS);
			expect(patch.dueAt).toBeTruthy();
			const d = new Date(patch.dueAt!);
			const now = new Date();
			expect(d.getFullYear()).toBe(now.getFullYear());
			expect(d.getMonth()).toBe(now.getMonth());
			expect(d.getDate()).toBe(now.getDate());
			expect(d.getHours()).toBe(9);
		});

		it("parses due:tomorrow", () => {
			const { patch } = parseTaskEditInput("Task due:tomorrow", PROJECTS);
			const d = new Date(patch.dueAt!);
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			expect(d.getDate()).toBe(tomorrow.getDate());
		});

		it("parses due:friday as the next friday", () => {
			const { patch } = parseTaskEditInput("Task due:friday", PROJECTS);
			const d = new Date(patch.dueAt!);
			expect(d.getDay()).toBe(5); // 5 = Friday
		});

		it("parses due:2026-03-10 (YYYY-MM-DD)", () => {
			const { patch } = parseTaskEditInput("Task due:2026-03-10", PROJECTS);
			expect(patch.dueAt).toBeTruthy();
			const d = new Date(patch.dueAt!);
			expect(d.getFullYear()).toBe(2026);
			expect(d.getMonth()).toBe(2); // March = 2 (0-indexed)
			expect(d.getDate()).toBe(10);
		});

		it("parses due:18/02/26 (DD/MM/YY)", () => {
			const { patch } = parseTaskEditInput("Task due:18/02/26", PROJECTS);
			expect(patch.dueAt).toBeTruthy();
			const d = new Date(patch.dueAt!);
			expect(d.getFullYear()).toBe(2026);
			expect(d.getMonth()).toBe(1); // Feb = 1
			expect(d.getDate()).toBe(18);
		});

		it("sets dueTimezone when dueAt is set", () => {
			const { patch } = parseTaskEditInput("Task due:today", PROJECTS);
			expect(patch.dueTimezone).toBeTruthy();
		});

		it("clears due with due:none", () => {
			const { patch } = parseTaskEditInput("Task due:none", PROJECTS);
			expect(patch.dueAt).toBeNull();
		});

		it("warns on unrecognised due date", () => {
			const { warnings } = parseTaskEditInput("Task due:yesterday", PROJECTS);
			expect(warnings.some((w) => w.includes("yesterday"))).toBe(true);
		});

		it("parses due emoji marker", () => {
			const { patch } = parseTaskEditInput("Task ⏰ tomorrow", PROJECTS);
			expect(patch.dueAt).toBeTruthy();
		});
	});

	describe("scheduled", () => {
		it("parses scheduled:tomorrow", () => {
			const { patch } = parseTaskEditInput("Task scheduled:tomorrow", PROJECTS);
			const d = new Date(patch.scheduledAt!);
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			expect(d.getDate()).toBe(tomorrow.getDate());
		});

		it("clears scheduled with scheduled:none", () => {
			const { patch } = parseTaskEditInput("Task scheduled:none", PROJECTS);
			expect(patch.scheduledAt).toBeNull();
		});

		it("parses sch: alias and scheduled emoji marker", () => {
			expect(parseTaskEditInput("Task sch:tomorrow", PROJECTS).patch.scheduledAt).toBeTruthy();
			expect(parseTaskEditInput("Task 🗓 tomorrow", PROJECTS).patch.scheduledAt).toBeTruthy();
		});
	});

	describe("project", () => {
		it("resolves project by name (case-insensitive)", () => {
			const { patch, warnings } = parseTaskEditInput("Task project:work", PROJECTS);
			expect(patch.projectId).toBe(1);
			expect(warnings).toHaveLength(0);
		});

		it("resolves multi-word project name", () => {
			const { patch } = parseTaskEditInput("Task project:My Long Project", PROJECTS);
			expect(patch.projectId).toBe(3);
		});

		it("warns when project not found", () => {
			const { patch, warnings } = parseTaskEditInput("Task project:Unknown", PROJECTS);
			expect(patch.projectId).toBeUndefined();
			expect(warnings.some((w) => w.includes("Unknown"))).toBe(true);
		});

		it("parses proj: alias and project emoji marker", () => {
			expect(parseTaskEditInput("Task proj:work", PROJECTS).patch.projectId).toBe(1);
			expect(parseTaskEditInput("Task 📁 My Long Project", PROJECTS).patch.projectId).toBe(3);
		});
	});

	describe("combined tokens", () => {
		it("parses all tokens together", () => {
			const input = "Do the thing project:Work due:today scheduled:tomorrow recurs:daily p1";
			const { patch, warnings } = parseTaskEditInput(input, PROJECTS);
			expect(warnings).toHaveLength(0);
			expect(patch.title).toBe("Do the thing");
			expect(patch.priority).toBe(1);
			expect(patch.projectId).toBe(1);
			expect(patch.dueAt).toBeTruthy();
			expect(patch.scheduledAt).toBeTruthy();
			expect(patch.recurrencePreset).toBe("daily");
		});

		it("preserves title when tokens appear mid-string", () => {
			const { patch } = parseTaskEditInput("Buy groceries p2 due:tomorrow", PROJECTS);
			expect(patch.title).toBe("Buy groceries");
			expect(patch.priority).toBe(2);
		});
	});

	describe("parent", () => {
		it("parses parent:123", () => {
			const { patch, warnings } = parseTaskEditInput(
				"Task parent:123",
				PROJECTS,
			);
			expect(warnings).toHaveLength(0);
			expect(patch.parentTaskId).toBe(123);
		});

		it("parses parent:none", () => {
			const { patch } = parseTaskEditInput("Task parent:none", PROJECTS);
			expect(patch.parentTaskId).toBeNull();
		});

		it("warns on invalid parent value", () => {
			const { warnings } = parseTaskEditInput("Task parent:abc", PROJECTS);
			expect(warnings.some((w) => w.includes("parent"))).toBe(true);
		});

		it("parses notes: token (rest of line)", () => {
			const { patch } = parseTaskEditInput("Title notes: Some notes with [link](https://x.com)", PROJECTS);
			expect(patch.title).toBe("Title");
			expect(patch.notes).toBe("Some notes with [link](https://x.com)");
		});

		it("parses notes: when notes contain spaces and links", () => {
			const { patch } = parseTaskEditInput("Ship it notes: See https://example.com and [Spec](https://spec.com)", PROJECTS);
			expect(patch.title).toBe("Ship it");
			expect(patch.notes).toBe("See https://example.com and [Spec](https://spec.com)");
		});
	});
});

describe("serializeTaskToEditInput", () => {
	it("returns just the title when no extras", () => {
		expect(serializeTaskToEditInput("Do the thing", {})).toBe("Do the thing");
	});

	it("appends project name", () => {
		expect(serializeTaskToEditInput("Task", { projectName: "Work" })).toBe("Task 📁 Work");
	});

	it("appends parent task id", () => {
		expect(serializeTaskToEditInput("Task", { parentTaskId: 42 })).toBe(
			"Task parent:42",
		);
	});

	it("omits priority 4 (default)", () => {
		expect(serializeTaskToEditInput("Task", { priority: 4 })).toBe("Task");
	});

	it("appends emoji priority markers", () => {
		expect(serializeTaskToEditInput("Task", { priority: 1 })).toContain("🚩1");
		expect(serializeTaskToEditInput("Task", { priority: 2 })).toContain("🚩2");
		expect(serializeTaskToEditInput("Task", { priority: 3 })).toContain("🚩3");
	});

	it("appends due date as YYYY-MM-DD", () => {
		const result = serializeTaskToEditInput("Task", { dueAt: "2026-03-10T09:00:00.000Z" });
		expect(result).toContain("⏰ 2026-03-10");
	});

	it("appends scheduled date as YYYY-MM-DD", () => {
		const result = serializeTaskToEditInput("Task", { scheduledAt: "2026-03-10T09:00:00.000Z" });
		expect(result).toContain("🗓 2026-03-10");
	});

	it("appends recurrence preset", () => {
		const result = serializeTaskToEditInput("Task", { recurrencePreset: "weekly" });
		expect(result).toContain("🔁 weekly");
	});

	it("omits null recurrencePreset", () => {
		const result = serializeTaskToEditInput("Task", { recurrencePreset: null });
		expect(result).not.toContain("🔁");
	});

	it("appends notes when provided", () => {
		const result = serializeTaskToEditInput("Task", { notes: "Some notes with link https://x.com" });
		expect(result).toBe("Task notes:Some notes with link https://x.com");
	});

	it("omits empty notes", () => {
		const result = serializeTaskToEditInput("Task", { notes: "" });
		expect(result).toBe("Task");
	});
});
