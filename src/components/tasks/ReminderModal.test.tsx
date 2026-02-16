import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReminderModal } from "./ReminderModal";

describe("ReminderModal", () => {
	it("renders the modal when open", () => {
		render(
			<ReminderModal
				isOpen={true}
				onClose={vi.fn()}
				onAddReminder={vi.fn()}
				dueAt={null}
			/>,
		);

		expect(screen.getByText("Reminders")).toBeInTheDocument();
		expect(screen.getByText("Date & time")).toBeInTheDocument();
		expect(screen.getByText("Before task")).toBeInTheDocument();
	});

	it("does not render when closed", () => {
		render(
			<ReminderModal
				isOpen={false}
				onClose={vi.fn()}
				onAddReminder={vi.fn()}
				dueAt={null}
			/>,
		);

		expect(screen.queryByText("Reminders")).not.toBeInTheDocument();
	});

	it("shows error when submitting empty time", async () => {
		const onAddReminder = vi.fn();

		render(
			<ReminderModal
				isOpen={true}
				onClose={vi.fn()}
				onAddReminder={onAddReminder}
				dueAt={null}
			/>,
		);

		const button = screen.getByRole("button", { name: /add reminder/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(screen.getByText("Please enter a time")).toBeInTheDocument();
		});

		expect(onAddReminder).not.toHaveBeenCalled();
	});

	it("shows error for invalid time format", async () => {
		const onAddReminder = vi.fn();

		render(
			<ReminderModal
				isOpen={true}
				onClose={vi.fn()}
				onAddReminder={onAddReminder}
				dueAt={null}
			/>,
		);

		const input = screen.getByPlaceholderText("16:00");
		fireEvent.change(input, { target: { value: "invalid time" } });

		const button = screen.getByRole("button", { name: /add reminder/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(
				screen.getByText(/invalid time format/i),
			).toBeInTheDocument();
		});

		expect(onAddReminder).not.toHaveBeenCalled();
	});

	it("calls onAddReminder with parsed time for simple time input", async () => {
		const onAddReminder = vi.fn().mockResolvedValue(undefined);
		const onClose = vi.fn();

		render(
			<ReminderModal
				isOpen={true}
				onClose={onClose}
				onAddReminder={onAddReminder}
				dueAt={null}
			/>,
		);

		const input = screen.getByPlaceholderText("16:00");
		fireEvent.change(input, { target: { value: "9am" } });

		const button = screen.getByRole("button", { name: /add reminder/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(onAddReminder).toHaveBeenCalledWith(
				expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
			);
		});

		expect(onClose).toHaveBeenCalled();
	});

	it("calls onAddReminder with parsed time for 24-hour format", async () => {
		const onAddReminder = vi.fn().mockResolvedValue(undefined);

		render(
			<ReminderModal
				isOpen={true}
				onClose={vi.fn()}
				onAddReminder={onAddReminder}
				dueAt={null}
			/>,
		);

		const input = screen.getByPlaceholderText("16:00");
		fireEvent.change(input, { target: { value: "18:30" } });

		const button = screen.getByRole("button", { name: /add reminder/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(onAddReminder).toHaveBeenCalledWith(
				expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
			);
		});
	});

	it("supports Enter key to submit", async () => {
		const onAddReminder = vi.fn().mockResolvedValue(undefined);

		render(
			<ReminderModal
				isOpen={true}
				onClose={vi.fn()}
				onAddReminder={onAddReminder}
				dueAt={null}
			/>,
		);

		const input = screen.getByPlaceholderText("16:00");
		fireEvent.change(input, { target: { value: "10am" } });
		fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

		await waitFor(() => {
			expect(onAddReminder).toHaveBeenCalled();
		});
	});

	it("handles API errors gracefully", async () => {
		const onAddReminder = vi
			.fn()
			.mockRejectedValue(new Error("Network error"));

		render(
			<ReminderModal
				isOpen={true}
				onClose={vi.fn()}
				onAddReminder={onAddReminder}
				dueAt={null}
			/>,
		);

		const input = screen.getByPlaceholderText("16:00");
		fireEvent.change(input, { target: { value: "9am" } });

		const button = screen.getByRole("button", { name: /add reminder/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(screen.getByText("Network error")).toBeInTheDocument();
		});
	});

	it("disables submit button while submitting", async () => {
		let resolvePromise: () => void;
		const onAddReminder = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolvePromise = resolve;
				}),
		);

		render(
			<ReminderModal
				isOpen={true}
				onClose={vi.fn()}
				onAddReminder={onAddReminder}
				dueAt={null}
			/>,
		);

		const input = screen.getByPlaceholderText("16:00");
		fireEvent.change(input, { target: { value: "9am" } });

		const button = screen.getByRole("button", { name: /add reminder/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /adding/i }),
			).toBeDisabled();
		});

		// Resolve the promise
		resolvePromise!();
	});

	it("disables 'Before task' tab when task has no due date", () => {
		render(
			<ReminderModal
				isOpen={true}
				onClose={vi.fn()}
				onAddReminder={vi.fn()}
				dueAt={null}
			/>,
		);

		const beforeTaskTab = screen.getByText("Before task");
		expect(beforeTaskTab.closest("button")).toBeDisabled();
	});

	it("disables 'Before task' tab when due date has no time", () => {
		render(
			<ReminderModal
				isOpen={true}
				onClose={vi.fn()}
				onAddReminder={vi.fn()}
				dueAt="2026-02-20T00:00:00.000Z"
			/>,
		);

		const beforeTaskTab = screen.getByText("Before task");
		expect(beforeTaskTab.closest("button")).toBeDisabled();
	});

	it("enables 'Before task' tab when due date has specific time", () => {
		render(
			<ReminderModal
				isOpen={true}
				onClose={vi.fn()}
				onAddReminder={vi.fn()}
				dueAt="2026-02-20T14:30:00.000Z"
			/>,
		);

		const beforeTaskTab = screen.getByText("Before task");
		expect(beforeTaskTab.closest("button")).not.toBeDisabled();
	});
});
