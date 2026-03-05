import { describe, expect, it } from "bun:test";

import { shouldStartProjectEdit } from "./useMainKeys";

// The navigation hook uses React so we test its pure helper functions.
// shouldStartProjectEdit was moved from App.tsx to useMainKeys.ts.
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
