import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import type { Priority } from "@/server/types";
import { PRIORITY_BADGE_CLASSES, Task } from "./Task";

vi.mock("@/lib/api-client", () => ({
	api: {
		updateTask: vi.fn().mockResolvedValue({}),
	},
}));

const defaultTask = {
	id: 1,
	projectId: 1,
	parentTaskId: null,
	title: "Test task",
	notes: "",
	priority: 2 as Priority,
	scheduledAt: null,
	dueAt: null,
	dueTimezone: null,
	recurrencePreset: null,
	recurrenceRRule: null,
	status: "open" as const,
	completedAt: null,
	createdAt: "2025-01-01T00:00:00Z",
	updatedAt: "2025-01-01T00:00:00Z",
};

const defaultProps = {
	task: defaultTask,
	isSelected: false,
	isEditing: false,
	editingTitle: "",
	taskReminders: [],
	onMouseEnter: vi.fn(),
	onCompleteToggle: vi.fn().mockResolvedValue(undefined),
	onEnterEditMode: vi.fn(),
	onExitEditMode: vi.fn(),
	onEditingTitleChange: vi.fn(),
	onSaveEdit: vi.fn(),
	onCancelEdit: vi.fn(),
	onRefresh: vi.fn().mockResolvedValue(undefined),
	onOpenReminderModal: vi.fn(),
	onDeleteReminder: vi.fn().mockResolvedValue(undefined),
	depth: 0 as const,
	parentOptions: [],
	disableParentSelection: false,
	onOpenSubtaskModal: vi.fn(),
};

describe("PRIORITY_BADGE_CLASSES", () => {
	it("maps each priority to distinct badge class names", () => {
		expect(PRIORITY_BADGE_CLASSES[1]).toContain("red-600");
		expect(PRIORITY_BADGE_CLASSES[2]).toContain("amber-500");
		expect(PRIORITY_BADGE_CLASSES[3]).toContain("blue-600");
		expect(PRIORITY_BADGE_CLASSES[4]).toContain("slate-200");
	});
});

describe("Task", () => {
	it("renders subtask context when parent title is provided", () => {
		render(
			<Task
				{...defaultProps}
				task={{ ...defaultTask, parentTaskId: 12 }}
				parentTitle="Parent task"
			/>,
		);

		expect(screen.getByText("Subtask of Parent task")).toBeTruthy();
	});

	it("renders parent selector in edit mode", () => {
		render(
			<Task
				{...defaultProps}
				isEditing={true}
				editingTitle="Test task"
				parentOptions={[{ id: 7, title: "Parent #7" }]}
			/>,
		);

		expect(screen.getByLabelText(/Parent task/i)).toBeTruthy();
		expect(screen.getByRole("button", { name: /Subtask/i })).toBeTruthy();
	});

	it("disables parent selector when task has subtasks", () => {
		render(
			<Task
				{...defaultProps}
				isEditing={true}
				editingTitle="Test task"
				disableParentSelection={true}
			/>,
		);

		expect(
			screen.getByLabelText(/Parent task/i).getAttribute("data-disabled"),
		).not.toBeNull();
	});
});
