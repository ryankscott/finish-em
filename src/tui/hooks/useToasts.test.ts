import { describe, expect, it } from "bun:test";

import {
	MAX_TOASTS,
	TOAST_TTL_MS,
	addToast,
	pruneExpiredToasts,
	toastsToVisible,
	type ToastWithExpiry,
} from "./useToasts";

describe("addToast", () => {
	it("appends a toast with id, text, tone, and expiresAt", () => {
		const now = 1000;
		const state = addToast([], "Hello", "info", now, 42);
		expect(state).toHaveLength(1);
		expect(state[0]).toEqual({
			id: 42,
			text: "Hello",
			tone: "info",
			expiresAt: now + TOAST_TTL_MS,
		});
	});

	it("defaults to info tone when given success", () => {
		const state = addToast([], "Done", "success", 0, 1);
		expect(state[0]?.tone).toBe("success");
	});

	it("caps at MAX_TOASTS (drops oldest)", () => {
		const now = 0;
		let state: ToastWithExpiry[] = [];
		for (let i = 0; i < MAX_TOASTS + 2; i++) {
			state = addToast(state, `Toast ${i}`, "info", now + i, i);
		}
		expect(state).toHaveLength(MAX_TOASTS);
		expect(state[0]?.text).toBe(`Toast 2`);
		expect(state[3]?.text).toBe(`Toast 5`);
	});
});

describe("pruneExpiredToasts", () => {
	it("removes toasts with expiresAt <= now", () => {
		const now = 5000;
		const state: ToastWithExpiry[] = [
			{ id: 1, text: "a", tone: "info", expiresAt: 4000 },
			{ id: 2, text: "b", tone: "info", expiresAt: 6000 },
		];
		const pruned = pruneExpiredToasts(state, now);
		expect(pruned).toHaveLength(1);
		expect(pruned[0]?.id).toBe(2);
	});

	it("keeps all toasts when none expired", () => {
		const now = 0;
		const state: ToastWithExpiry[] = [
			{ id: 1, text: "a", tone: "info", expiresAt: 5000 },
		];
		expect(pruneExpiredToasts(state, now)).toHaveLength(1);
	});

	it("returns empty when all expired", () => {
		const now = 10000;
		const state: ToastWithExpiry[] = [
			{ id: 1, text: "a", tone: "info", expiresAt: 1000 },
		];
		expect(pruneExpiredToasts(state, now)).toHaveLength(0);
	});
});

describe("toastsToVisible", () => {
	it("strips expiresAt and returns id, text, tone", () => {
		const toasts: ToastWithExpiry[] = [
			{ id: 1, text: "Hi", tone: "success", expiresAt: 5000 },
		];
		expect(toastsToVisible(toasts)).toEqual([
			{ id: 1, text: "Hi", tone: "success" },
		]);
	});

	it("returns empty array for empty input", () => {
		expect(toastsToVisible([])).toEqual([]);
	});
});
