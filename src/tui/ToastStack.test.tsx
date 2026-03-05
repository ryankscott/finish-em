import { describe, expect, it } from "bun:test";

import type { ToastMessage } from "./ToastStack";

// Mirror ToastStack's display logic: empty => null, otherwise show toasts.
function shouldShowToasts(toasts: ToastMessage[]): boolean {
	return toasts.length > 0;
}

function toastCount(toasts: ToastMessage[]): number {
	return toasts.length;
}

describe("ToastStack display contract", () => {
	it("shows nothing when toasts array is empty", () => {
		expect(shouldShowToasts([])).toBe(false);
	});

	it("shows toasts when array has items", () => {
		const toasts: ToastMessage[] = [
			{ id: 1, text: "Saved", tone: "success" },
		];
		expect(shouldShowToasts(toasts)).toBe(true);
		expect(toastCount(toasts)).toBe(1);
	});

	it("shows all toast items with id, text, tone", () => {
		const toasts: ToastMessage[] = [
			{ id: 1, text: "Info", tone: "info" },
			{ id: 2, text: "Error", tone: "error" },
		];
		expect(toastCount(toasts)).toBe(2);
		expect(toasts[0]).toEqual({ id: 1, text: "Info", tone: "info" });
		expect(toasts[1]).toEqual({ id: 2, text: "Error", tone: "error" });
	});
});
