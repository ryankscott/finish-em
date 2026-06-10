import { describe, expect, it } from "bun:test";

import type { Project, Task } from "../../server/types";
import {
	getEKeyEditOutcome,
	getSidebarToggleOutcome,
	shouldStartProjectEdit,
} from "./useMainKeys";

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

const MOCK_PROJECT: Project = {
	id: 42,
	name: "Work",
	emoji: "💼",
	description: "",
	startAt: null,
	endAt: null,
	color: "#3b82f6",
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
};

describe("getEKeyEditOutcome", () => {
	it("returns editTask with task title when task selected and focus not on project edit", () => {
		const result = getEKeyEditOutcome("today", "tasks", null, null, MOCK_TASK);
		expect(result).toEqual({ mode: "editTask", initialValue: "Test task" });
	});

	it("returns editProjectName with project name when project view, sidebar focused, and project selected", () => {
		const result = getEKeyEditOutcome(
			"project",
			"sidebar",
			42,
			MOCK_PROJECT,
			MOCK_TASK,
		);
		expect(result).toEqual({ mode: "editProjectName", initialValue: "Work" });
	});

	it("does not return projectEditPicker or taskEditPicker for lowercase e", () => {
		const taskOutcome = getEKeyEditOutcome(
			"today",
			"tasks",
			null,
			null,
			MOCK_TASK,
		);
		expect(taskOutcome?.mode).toBe("editTask");
		expect(taskOutcome?.mode).not.toBe("taskEditPicker");

		const projectOutcome = getEKeyEditOutcome(
			"project",
			"sidebar",
			42,
			MOCK_PROJECT,
			null,
		);
		expect(projectOutcome?.mode).toBe("editProjectName");
		expect(projectOutcome?.mode).not.toBe("projectEditPicker");
	});

	it("returns null when no task and no project edit context", () => {
		expect(getEKeyEditOutcome("today", "tasks", null, null, null)).toBeNull();
		// project view but focus on tasks (not sidebar) and no selected task → null
		expect(
			getEKeyEditOutcome("project", "tasks", 42, MOCK_PROJECT, null),
		).toBeNull();
	});

	it("prefers project name edit when in project view with sidebar focus and active project", () => {
		const result = getEKeyEditOutcome(
			"project",
			"sidebar",
			42,
			MOCK_PROJECT,
			MOCK_TASK,
		);
		expect(result).toEqual({ mode: "editProjectName", initialValue: "Work" });
	});
});

describe("shouldStartProjectEdit", () => {
	it("returns true for edit key in project view with active project and sidebar focused", () => {
		expect(shouldStartProjectEdit("e", "project", 42, "sidebar")).toBe(true);
	});
	it("returns false outside project view", () => {
		expect(shouldStartProjectEdit("e", "today", 42, "sidebar")).toBe(false);
	});
	it("returns false when no active project is selected", () => {
		expect(shouldStartProjectEdit("e", "project", null, "sidebar")).toBe(false);
	});
	it("returns false for non-edit keys", () => {
		expect(shouldStartProjectEdit("x", "project", 42, "sidebar")).toBe(false);
	});
	it("returns false when focus is not on sidebar", () => {
		expect(shouldStartProjectEdit("e", "project", 42, "tasks")).toBe(false);
	});
});

describe("getSidebarToggleOutcome", () => {
	it("toggles visibility and moves focus to tasks when collapsing from sidebar", () => {
		expect(getSidebarToggleOutcome(true, "sidebar")).toEqual({
			nextVisible: false,
			moveFocusToTasks: true,
		});
	});
	it("toggles visibility and does not move focus when collapsing from tasks", () => {
		expect(getSidebarToggleOutcome(true, "tasks")).toEqual({
			nextVisible: false,
			moveFocusToTasks: false,
		});
	});
	it("toggles visibility and does not move focus when expanding", () => {
		expect(getSidebarToggleOutcome(false, "tasks")).toEqual({
			nextVisible: true,
			moveFocusToTasks: false,
		});
	});
	it("when focus is goals and collapsing, does not move focus to tasks", () => {
		expect(getSidebarToggleOutcome(true, "goals")).toEqual({
			nextVisible: false,
			moveFocusToTasks: false,
		});
	});
});
