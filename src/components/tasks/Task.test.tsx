import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Task, PRIORITY_BADGE_CLASSES } from "./Task";
import type { Priority } from "@/server/types";

vi.mock("@/lib/api-client", () => ({
	api: {
		updateTask: vi.fn().mockResolvedValue({}),
	},
}));

const defaultTask = {
	id: 1,
	projectId: 1,
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
	it("renders priority badge with P number", () => {
		render(<Task {...defaultProps} />);
		expect(screen.getByText("P2")).toBeInTheDocument();
		expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
	});

	it("keeps controls disabled in view mode except completion", () => {
		render(<Task {...defaultProps} />);
		expect(screen.getByLabelText(/priority/i)).toBeDisabled();
		expect(screen.getByLabelText(/add reminder/i)).toBeDisabled();
		expect(screen.getByLabelText(/toggle complete/i)).not.toBeDisabled();
	});

	it("shows 'Add description' button when task has no description", () => {
		render(<Task {...defaultProps} />);
		expect(screen.getByText("Add description")).toBeInTheDocument();
	});

	it("allows description editing in edit mode", () => {
		render(<Task {...defaultProps} isEditing={true} editingTitle="Test task" />);
		const addButton = screen.getByText("Add description");
		expect(addButton).not.toBeDisabled();
		fireEvent.click(addButton);
		expect(screen.getByPlaceholderText("Add a description...")).toBeInTheDocument();
	});

	it("shows description section when task has a description", () => {
		const taskWithDescription = {
			...defaultTask,
			notes: "This is a test description",
		};
		render(<Task {...defaultProps} task={taskWithDescription} />);
		expect(screen.getByText("Description")).toBeInTheDocument();
	});

	it("expands description section when clicking the header", () => {
		const taskWithDescription = {
			...defaultTask,
			notes: "This is a test description",
		};
		render(<Task {...defaultProps} task={taskWithDescription} />);
		const descriptionHeader = screen.getByText("Description");
		fireEvent.click(descriptionHeader);
		expect(screen.getByText("This is a test description")).toBeInTheDocument();
	});

	it("does not enter description edit in view mode", () => {
		render(<Task {...defaultProps} />);
		const addButton = screen.getByText("Add description");
		expect(addButton).toBeDisabled();
		fireEvent.click(addButton);
		expect(
			screen.queryByPlaceholderText("Add a description..."),
		).not.toBeInTheDocument();
	});

	it("saves description when clicking Save button", async () => {
		const { api } = await import("@/lib/api-client");
		render(<Task {...defaultProps} isEditing={true} editingTitle="Test task" />);
		const addButton = screen.getByText("Add description");
		fireEvent.click(addButton);

		const textarea = screen.getByPlaceholderText("Add a description...");
		fireEvent.change(textarea, { target: { value: "New description" } });

		const saveButton = screen.getByText("Save");
		fireEvent.click(saveButton);

		await Promise.resolve();
		expect(api.updateTask).toHaveBeenCalledWith(1, { notes: "New description" });
		expect(defaultProps.onRefresh).toHaveBeenCalled();
	});

	it("cancels description editing when clicking Cancel button", () => {
		render(<Task {...defaultProps} isEditing={true} editingTitle="Test task" />);
		const addButton = screen.getByText("Add description");
		fireEvent.click(addButton);

		const textarea = screen.getByPlaceholderText("Add a description...");
		fireEvent.change(textarea, { target: { value: "New description" } });

		const cancelButton = screen.getByText("Cancel");
		fireEvent.click(cancelButton);

		expect(screen.queryByPlaceholderText("Add a description...")).not.toBeInTheDocument();
	});
});
