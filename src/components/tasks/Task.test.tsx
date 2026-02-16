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
	onEditingTitleChange: vi.fn(),
	onSaveEdit: vi.fn(),
	onCancelEdit: vi.fn(),
	onRefresh: vi.fn().mockResolvedValue(undefined),
	onOpenReminderModal: vi.fn(),
	onDeleteReminder: vi.fn().mockResolvedValue(undefined),
};

describe("PRIORITY_BADGE_CLASSES", () => {
	it("maps each priority to distinct badge class names", () => {
		expect(PRIORITY_BADGE_CLASSES[1]).toContain("bg-red-600");
		expect(PRIORITY_BADGE_CLASSES[2]).toContain("bg-amber-500");
		expect(PRIORITY_BADGE_CLASSES[3]).toContain("bg-blue-600");
		expect(PRIORITY_BADGE_CLASSES[4]).toContain("bg-slate-200");
	});
});

describe("Task", () => {
	it("renders priority badge with flag icon and P number", () => {
		render(<Task {...defaultProps} />);
		expect(screen.getByText("P2")).toBeInTheDocument();
		expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
	});

	it("renders priority selector with current priority selected", () => {
		render(<Task {...defaultProps} />);
		const select = screen.getByLabelText(/priority/i);
		expect(select).toHaveValue("2");
	});

	it("calls updateTask and onRefresh when priority is changed", async () => {
		const { api } = await import("@/lib/api-client");
		render(<Task {...defaultProps} />);
		const select = screen.getByLabelText(/priority/i);
		fireEvent.change(select, { target: { value: "1" } });
		await Promise.resolve();
		expect(api.updateTask).toHaveBeenCalledWith(1, { priority: 1 });
		expect(defaultProps.onRefresh).toHaveBeenCalled();
	});
});
