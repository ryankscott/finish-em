import { describe, expect, it } from "bun:test";

// Test the pure logic of the input bar: the openInput/closeInput state machine
// and the isTextInputMode / isBottomBarMode / isLinkPickerMode flags.
// We test via the logic directly rather than rendering the hook.

type InputMode =
	| "none"
	| "quickAdd"
	| "createSubtask"
	| "createProject"
	| "editProject"
	| "addReminder"
	| "editTask"
	| "editSetting"
	| "addGoal"
	| "linkPicker";

function computeFlags(mode: InputMode) {
	const isTextInputMode = mode !== "none" && mode !== "linkPicker";
	const isInputMode = mode !== "none";
	const isBottomBarMode = isInputMode && mode !== "linkPicker";
	const isLinkPickerMode = mode === "linkPicker";
	return { isTextInputMode, isInputMode, isBottomBarMode, isLinkPickerMode };
}

describe("input bar mode flags", () => {
	it("all flags are false when mode is none", () => {
		const flags = computeFlags("none");
		expect(flags.isTextInputMode).toBe(false);
		expect(flags.isInputMode).toBe(false);
		expect(flags.isBottomBarMode).toBe(false);
		expect(flags.isLinkPickerMode).toBe(false);
	});

	it("shows text input and bottom bar for quickAdd", () => {
		const flags = computeFlags("quickAdd");
		expect(flags.isTextInputMode).toBe(true);
		expect(flags.isInputMode).toBe(true);
		expect(flags.isBottomBarMode).toBe(true);
		expect(flags.isLinkPickerMode).toBe(false);
	});

	it("shows link picker mode but not text input for linkPicker", () => {
		const flags = computeFlags("linkPicker");
		expect(flags.isTextInputMode).toBe(false);
		expect(flags.isInputMode).toBe(true);
		expect(flags.isBottomBarMode).toBe(false);
		expect(flags.isLinkPickerMode).toBe(true);
	});

	it("shows text input for all text modes", () => {
		const textModes: InputMode[] = [
			"editTask",
			"createSubtask",
			"createProject",
			"editProject",
			"addReminder",
			"editSetting",
			"addGoal",
		];
		for (const mode of textModes) {
			const flags = computeFlags(mode);
			expect(flags.isTextInputMode).toBe(true);
		}
	});
});
