import { describe, expect, it } from "bun:test";

// Test the extended input bar mode flag logic including picker modes.
// Mirrors the logic in useInputBar.ts without rendering the hook.

type InputMode =
	| "none"
	| "quickAdd"
	| "linkPicker"
	| "taskEditPicker"
	| "projectEditPicker"
	| "enumPicker"
	| "editDueDate"
	| "editScheduledDate"
	| "editRecurrence"
	| "editPriority"
	| "editMoveProject"
	| "editReminder"
	| "editNotes"
	| "editGoalTitle"
	| "editProjectName"
	| "editProjectEmoji"
	| "editProjectDescription"
	| "editProjectStartDate"
	| "editProjectEndDate"
	| "editProjectJiraDiscovery"
	| "editProjectJiraDelivery"
	| "editProjectConfluence"
	| "addGoal"
	| "editTask"
	| "createSubtask"
	| "createProject"
	| "editProject"
	| "addReminder"
	| "editSetting"
	| "calendarPickerDueDate"
	| "calendarPickerScheduledDate"
	| "calendarPickerProjectStartDate"
	| "calendarPickerProjectEndDate";

const PICKER_MODES: InputMode[] = [
	"taskEditPicker",
	"projectEditPicker",
	"enumPicker",
	"calendarPickerDueDate",
	"calendarPickerScheduledDate",
	"calendarPickerProjectStartDate",
	"calendarPickerProjectEndDate",
];
const ENUM_PICKER_MODES: InputMode[] = [
	"editRecurrence",
	"editPriority",
	"editMoveProject",
	"enumPicker",
];

function computeFlags(mode: InputMode) {
	const isPickerMode = PICKER_MODES.includes(mode);
	const isEnumPickerMode = ENUM_PICKER_MODES.includes(mode);
	const isTextInputMode =
		mode !== "none" &&
		mode !== "linkPicker" &&
		!isPickerMode &&
		!isEnumPickerMode;
	const isInputMode = mode !== "none";
	const isBottomBarMode =
		isInputMode && mode !== "linkPicker" && !isPickerMode && !isEnumPickerMode;
	const isLinkPickerMode = mode === "linkPicker";
	return {
		isTextInputMode,
		isInputMode,
		isBottomBarMode,
		isLinkPickerMode,
		isPickerMode,
		isEnumPickerMode,
	};
}

describe("picker mode flags", () => {
	it("taskEditPicker shows as picker mode, not text input", () => {
		const flags = computeFlags("taskEditPicker");
		expect(flags.isPickerMode).toBe(true);
		expect(flags.isTextInputMode).toBe(false);
		expect(flags.isBottomBarMode).toBe(false);
		expect(flags.isInputMode).toBe(true);
	});

	it("projectEditPicker shows as picker mode", () => {
		const flags = computeFlags("projectEditPicker");
		expect(flags.isPickerMode).toBe(true);
		expect(flags.isEnumPickerMode).toBe(false);
		expect(flags.isTextInputMode).toBe(false);
	});

	it("enumPicker shows as both picker and enum picker mode", () => {
		const flags = computeFlags("enumPicker");
		expect(flags.isPickerMode).toBe(true);
		expect(flags.isEnumPickerMode).toBe(true);
		expect(flags.isTextInputMode).toBe(false);
	});

	it("editRecurrence is enum picker but not general picker", () => {
		const flags = computeFlags("editRecurrence");
		expect(flags.isEnumPickerMode).toBe(true);
		expect(flags.isPickerMode).toBe(false);
		expect(flags.isTextInputMode).toBe(false);
		expect(flags.isBottomBarMode).toBe(false);
	});

	it("editPriority is enum picker mode", () => {
		const flags = computeFlags("editPriority");
		expect(flags.isEnumPickerMode).toBe(true);
		expect(flags.isTextInputMode).toBe(false);
	});

	it("editMoveProject is enum picker mode", () => {
		const flags = computeFlags("editMoveProject");
		expect(flags.isEnumPickerMode).toBe(true);
		expect(flags.isTextInputMode).toBe(false);
	});

	it("editDueDate is text input mode", () => {
		const flags = computeFlags("editDueDate");
		expect(flags.isTextInputMode).toBe(true);
		expect(flags.isBottomBarMode).toBe(true);
		expect(flags.isPickerMode).toBe(false);
		expect(flags.isEnumPickerMode).toBe(false);
	});

	it("editNotes is text input mode", () => {
		const flags = computeFlags("editNotes");
		expect(flags.isTextInputMode).toBe(true);
		expect(flags.isBottomBarMode).toBe(true);
	});

	it("editGoalTitle is text input mode", () => {
		const flags = computeFlags("editGoalTitle");
		expect(flags.isTextInputMode).toBe(true);
		expect(flags.isBottomBarMode).toBe(true);
	});

	it("editProjectName is text input mode", () => {
		const flags = computeFlags("editProjectName");
		expect(flags.isTextInputMode).toBe(true);
		expect(flags.isBottomBarMode).toBe(true);
	});

	it("none mode — all flags false", () => {
		const flags = computeFlags("none");
		expect(flags.isTextInputMode).toBe(false);
		expect(flags.isInputMode).toBe(false);
		expect(flags.isPickerMode).toBe(false);
		expect(flags.isEnumPickerMode).toBe(false);
	});

	it("calendarPickerDueDate is picker mode, not text input", () => {
		const flags = computeFlags("calendarPickerDueDate");
		expect(flags.isPickerMode).toBe(true);
		expect(flags.isTextInputMode).toBe(false);
		expect(flags.isBottomBarMode).toBe(false);
		expect(flags.isEnumPickerMode).toBe(false);
		expect(flags.isInputMode).toBe(true);
	});

	it("calendarPickerScheduledDate is picker mode, not text input", () => {
		const flags = computeFlags("calendarPickerScheduledDate");
		expect(flags.isPickerMode).toBe(true);
		expect(flags.isTextInputMode).toBe(false);
		expect(flags.isBottomBarMode).toBe(false);
	});

	it("calendarPickerProjectStartDate is picker mode, not text input", () => {
		const flags = computeFlags("calendarPickerProjectStartDate");
		expect(flags.isPickerMode).toBe(true);
		expect(flags.isTextInputMode).toBe(false);
		expect(flags.isBottomBarMode).toBe(false);
	});

	it("calendarPickerProjectEndDate is picker mode, not text input", () => {
		const flags = computeFlags("calendarPickerProjectEndDate");
		expect(flags.isPickerMode).toBe(true);
		expect(flags.isTextInputMode).toBe(false);
		expect(flags.isBottomBarMode).toBe(false);
	});
});
