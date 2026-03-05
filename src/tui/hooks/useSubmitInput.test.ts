import { describe, expect, it, mock, beforeEach } from "bun:test";

import type { Goal, Project, Task } from "../../server/types";

// Test the pure routing logic of the new submit handlers.
// We test the decision logic without rendering hooks by extracting the
// pure determination of which API call to make.

const MOCK_TASK: Task = {
	id: 1,
	projectId: 1,
	parentTaskId: null,
	title: "Test task",
	notes: "",
	priority: 3,
	scheduledAt: null,
	dueAt: null,
	dueTimezone: null,
	recurrencePreset: null,
	recurrenceRRule: null,
	status: "open",
	completedAt: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

const MOCK_GOAL: Goal = {
	id: 10,
	periodType: "daily",
	periodStart: "2026-03-04",
	title: "Write tests",
	done: false,
	createdAt: "2026-03-04T00:00:00.000Z",
	updatedAt: "2026-03-04T00:00:00.000Z",
};

const MOCK_PROJECTS: Project[] = [
	{
		id: 1,
		name: "Inbox",
		emoji: null,
		description: "",
		startAt: null,
		endAt: null,
		color: "#666",
		isInbox: true,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
	},
	{
		id: 2,
		name: "Work",
		emoji: "💼",
		description: "",
		startAt: null,
		endAt: null,
		color: "#3b82f6",
		isInbox: false,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
	},
];

// Simulate the routing logic from useSubmitInput for the new modes
type UpdateTaskArgs = Parameters<(id: number, patch: Record<string, unknown>) => void>;
type UpdateProjectArgs = Parameters<(id: number, patch: Record<string, unknown>) => void>;
type UpdateGoalArgs = Parameters<(id: number, patch: Record<string, unknown>) => void>;

function resolveTaskUpdateForMode(
	mode: string,
	value: string,
	task: Task | null,
): { field: string; patch: Record<string, unknown> } | { error: string } {
	if (!task) return { error: "No task selected" };
	const trimmed = value.trim();

	if (mode === "editTask") {
		return { field: "title", patch: { title: trimmed } };
	}
	if (mode === "editNotes") {
		return { field: "notes", patch: { notes: trimmed } };
	}
	if (mode === "editPriority" || (mode === "enumPicker" && /* target */ true)) {
		const priority = Number(trimmed);
		if (priority >= 1 && priority <= 4) {
			return { field: "priority", patch: { priority } };
		}
		return { error: "Invalid priority" };
	}
	return { error: "Unknown mode" };
}

describe("useSubmitInput routing — editTask", () => {
	it("patches only title when in editTask mode (plain text)", () => {
		const result = resolveTaskUpdateForMode("editTask", "New task title", MOCK_TASK);
		expect(result).toEqual({ field: "title", patch: { title: "New task title" } });
	});

	it("trims whitespace for editTask title", () => {
		const result = resolveTaskUpdateForMode("editTask", "  trimmed title  ", MOCK_TASK);
		expect(result).toEqual({ field: "title", patch: { title: "trimmed title" } });
	});

	it("returns error when no task in editTask mode", () => {
		const result = resolveTaskUpdateForMode("editTask", "Title", null);
		expect(result).toMatchObject({ error: "No task selected" });
	});
});

describe("useSubmitInput routing — editNotes", () => {
	it("patches notes on selected task", () => {
		const result = resolveTaskUpdateForMode("editNotes", "Some notes", MOCK_TASK);
		expect(result).toEqual({ field: "notes", patch: { notes: "Some notes" } });
	});

	it("trims whitespace", () => {
		const result = resolveTaskUpdateForMode("editNotes", "  trimmed  ", MOCK_TASK);
		expect(result).toEqual({ field: "notes", patch: { notes: "trimmed" } });
	});

	it("clears notes when value is empty string", () => {
		const result = resolveTaskUpdateForMode("editNotes", "", MOCK_TASK);
		expect(result).toEqual({ field: "notes", patch: { notes: "" } });
	});

	it("clears notes when value is only whitespace", () => {
		const result = resolveTaskUpdateForMode("editNotes", "   ", MOCK_TASK);
		expect(result).toEqual({ field: "notes", patch: { notes: "" } });
	});

	it("returns error when no task", () => {
		const result = resolveTaskUpdateForMode("editNotes", "notes", null);
		expect(result).toMatchObject({ error: "No task selected" });
	});
});

describe("useSubmitInput routing — priority enum", () => {
	it("maps P1 value to priority 1", () => {
		const result = resolveTaskUpdateForMode("editPriority", "1", MOCK_TASK);
		expect(result).toEqual({ field: "priority", patch: { priority: 1 } });
	});

	it("maps P4 value to priority 4", () => {
		const result = resolveTaskUpdateForMode("editPriority", "4", MOCK_TASK);
		expect(result).toEqual({ field: "priority", patch: { priority: 4 } });
	});
});

// Test recurrence preset routing
function resolveRecurrenceUpdate(
	value: string,
	task: Task | null,
): { patch: Record<string, unknown> } | { error: string } {
	if (!task) return { error: "No task selected" };
	const preset =
		value === "none" ? null : (value as "daily" | "weekly" | "monthly" | "yearly" | "every_weekday");
	return { patch: { recurrencePreset: preset, recurrenceRRule: null } };
}

describe("useSubmitInput routing — recurrence", () => {
	it("sets daily recurrence", () => {
		const result = resolveRecurrenceUpdate("daily", MOCK_TASK);
		expect(result).toEqual({ patch: { recurrencePreset: "daily", recurrenceRRule: null } });
	});

	it("clears recurrence for 'none'", () => {
		const result = resolveRecurrenceUpdate("none", MOCK_TASK);
		expect(result).toEqual({ patch: { recurrencePreset: null, recurrenceRRule: null } });
	});

	it("sets every_weekday preset", () => {
		const result = resolveRecurrenceUpdate("every_weekday", MOCK_TASK);
		expect(result).toEqual({ patch: { recurrencePreset: "every_weekday", recurrenceRRule: null } });
	});
});

// Test move project routing
function resolveMoveProject(
	value: string,
	task: Task | null,
): { patch: Record<string, unknown> } | { error: string } {
	if (!task) return { error: "No task selected" };
	const projectId = Number(value);
	if (projectId > 0) {
		return { patch: { projectId } };
	}
	return { error: "Invalid project id" };
}

describe("useSubmitInput routing — move project", () => {
	it("moves task to valid project id", () => {
		const result = resolveMoveProject("2", MOCK_TASK);
		expect(result).toEqual({ patch: { projectId: 2 } });
	});

	it("rejects invalid project id", () => {
		const result = resolveMoveProject("0", MOCK_TASK);
		expect(result).toMatchObject({ error: "Invalid project id" });
	});

	it("returns error when no task", () => {
		const result = resolveMoveProject("2", null);
		expect(result).toMatchObject({ error: "No task selected" });
	});
});

// Test goal title update routing
function resolveGoalTitleUpdate(
	value: string,
	goal: Goal | null,
): { patch: { title: string } } | { error: string } {
	if (!goal) return { error: "No goal selected" };
	return { patch: { title: value.trim() } };
}

describe("useSubmitInput routing — editGoalTitle", () => {
	it("updates goal title", () => {
		const result = resolveGoalTitleUpdate("New title", MOCK_GOAL);
		expect(result).toEqual({ patch: { title: "New title" } });
	});

	it("trims whitespace from title", () => {
		const result = resolveGoalTitleUpdate("  trimmed  ", MOCK_GOAL);
		expect(result).toEqual({ patch: { title: "trimmed" } });
	});

	it("returns error when no goal", () => {
		const result = resolveGoalTitleUpdate("Title", null);
		expect(result).toMatchObject({ error: "No goal selected" });
	});
});

// Test project field update routing
function resolveProjectFieldUpdate(
	mode: string,
	value: string,
	projectId: number | null,
): { patch: Record<string, unknown> } | { error: string } {
	if (!projectId) return { error: "No project selected" };
	const trimmed = value.trim();
	if (mode === "editProjectName") return { patch: { name: trimmed } };
	if (mode === "editProjectEmoji") return { patch: { emoji: trimmed || null } };
	if (mode === "editProjectDescription") return { patch: { description: trimmed } };
	if (mode === "editProjectJiraDiscovery") return { patch: { jiraDiscoveryUrl: trimmed || null } };
	if (mode === "editProjectJiraDelivery") return { patch: { jiraDeliveryUrl: trimmed || null } };
	if (mode === "editProjectConfluence") return { patch: { confluenceUrl: trimmed || null } };
	return { error: "Unknown mode" };
}

describe("useSubmitInput routing — project fields", () => {
	it("updates project name", () => {
		const result = resolveProjectFieldUpdate("editProjectName", "My Project", 1);
		expect(result).toEqual({ patch: { name: "My Project" } });
	});

	it("updates project emoji", () => {
		const result = resolveProjectFieldUpdate("editProjectEmoji", "🚀", 1);
		expect(result).toEqual({ patch: { emoji: "🚀" } });
	});

	it("clears emoji with empty string", () => {
		const result = resolveProjectFieldUpdate("editProjectEmoji", "", 1);
		expect(result).toEqual({ patch: { emoji: null } });
	});

	it("updates project description", () => {
		const result = resolveProjectFieldUpdate("editProjectDescription", "A great project", 1);
		expect(result).toEqual({ patch: { description: "A great project" } });
	});

	it("returns error when no project selected", () => {
		const result = resolveProjectFieldUpdate("editProjectName", "Name", null);
		expect(result).toMatchObject({ error: "No project selected" });
	});

	it("updates Jira Discovery URL", () => {
		const result = resolveProjectFieldUpdate(
			"editProjectJiraDiscovery",
			"https://jira.example.com/discovery/123",
			1,
		);
		expect(result).toEqual({
			patch: { jiraDiscoveryUrl: "https://jira.example.com/discovery/123" },
		});
	});

	it("clears Jira Discovery URL with empty string", () => {
		const result = resolveProjectFieldUpdate("editProjectJiraDiscovery", "", 1);
		expect(result).toEqual({ patch: { jiraDiscoveryUrl: null } });
	});

	it("updates Jira Delivery and Confluence URLs", () => {
		expect(
			resolveProjectFieldUpdate("editProjectJiraDelivery", "https://jira.example.com/board/1", 1),
		).toEqual({ patch: { jiraDeliveryUrl: "https://jira.example.com/board/1" } });
		expect(
			resolveProjectFieldUpdate("editProjectConfluence", "https://wiki.example.com/space/PRJ", 1),
		).toEqual({ patch: { confluenceUrl: "https://wiki.example.com/space/PRJ" } });
	});
});

// Mirrors Quick Add projectId fallback in useSubmitInput: parsed.input.projectId ?? activeProjectId ?? inboxId ?? 1
function resolveQuickAddProjectId(
	parsedProjectId: number | undefined,
	activeProjectId: number | null,
	projects: Project[],
): number {
	const inboxId = projects.find((p) => p.isInbox)?.id ?? 1;
	return parsedProjectId ?? activeProjectId ?? inboxId ?? 1;
}

describe("useSubmitInput — Quick Add project default", () => {
	it("uses selected project when input has no project token", () => {
		expect(
			resolveQuickAddProjectId(undefined, 2, MOCK_PROJECTS),
		).toBe(2);
	});

	it("explicit project in input wins over selected project", () => {
		expect(resolveQuickAddProjectId(1, 2, MOCK_PROJECTS)).toBe(1);
	});

	it("no project selected uses Inbox/default", () => {
		expect(
			resolveQuickAddProjectId(undefined, null, MOCK_PROJECTS),
		).toBe(1);
	});
});
