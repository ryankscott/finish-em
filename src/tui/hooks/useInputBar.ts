import { useCallback, useMemo, useRef, useState } from "react";

import type { Project } from "../../server/types";
import {
	getProjectCreateAutocomplete,
	getTaskCreateAutocomplete,
} from "../input-autocomplete";

export type InputMode =
	| "none"
	| "quickAdd"
	| "createSubtask"
	| "createProject"
	| "editProject"
	| "addReminder"
	| "editTask"
	| "editSetting"
	| "addGoal"
	| "linkPicker"
	// Task field edit modes
	| "taskEditPicker"
	| "editDueDate"
	| "editScheduledDate"
	| "editRecurrence"
	| "editPriority"
	| "editMoveProject"
	| "editReminder"
	| "editNotes"
	// Project field edit modes
	| "projectEditPicker"
	| "editProjectName"
	| "editProjectEmoji"
	| "editProjectDescription"
	| "editProjectStartDate"
	| "editProjectEndDate"
	| "editProjectJiraDiscovery"
	| "editProjectJiraDelivery"
	| "editProjectConfluence"
	// Goal edit modes
	| "editGoalTitle"
	// Generic enum picker
	| "enumPicker"
	// Calendar date picker modes (one per date field)
	| "calendarPickerDueDate"
	| "calendarPickerScheduledDate"
	| "calendarPickerProjectStartDate"
	| "calendarPickerProjectEndDate";

type UseInputBarParams = {
	projects: Project[];
};

type UseInputBarResult = {
	inputMode: InputMode;
	inputValue: string;
	setInputValue: (value: string) => void;
	inputCursorOffset: number;
	setInputCursorOffset: (offset: number) => void;
	inputValueRef: React.MutableRefObject<string>;
	inputCursorRef: React.MutableRefObject<number>;
	editingSettingField: "timezone" | null;
	setEditingSettingField: (field: "timezone" | null) => void;
	linkPickerLinks: { url: string; displayLabel: string }[] | null;
	setLinkPickerLinks: (links: { url: string; displayLabel: string }[] | null) => void;
	linkPickerIndex: number;
	setLinkPickerIndex: React.Dispatch<React.SetStateAction<number>>;
	pickerIndex: number;
	setPickerIndex: React.Dispatch<React.SetStateAction<number>>;
	enumPickerIndex: number;
	setEnumPickerIndex: React.Dispatch<React.SetStateAction<number>>;
	enumPickerTargetMode: InputMode | null;
	setEnumPickerTargetMode: (mode: InputMode | null) => void;
	openInput: (mode: InputMode, initialValue?: string) => void;
	closeInput: () => void;
	inputAutocomplete: ReturnType<typeof getTaskCreateAutocomplete> | null;
	isTextInputMode: boolean;
	isInputMode: boolean;
	isBottomBarMode: boolean;
	isLinkPickerMode: boolean;
	isPickerMode: boolean;
	isEnumPickerMode: boolean;
};

export function useInputBar({ projects }: UseInputBarParams): UseInputBarResult {
	const [inputMode, setInputMode] = useState<InputMode>("none");
	const [inputValue, setInputValue] = useState("");
	const [inputCursorOffset, setInputCursorOffset] = useState(0);
	const [editingSettingField, setEditingSettingField] = useState<"timezone" | null>(null);
	const [linkPickerLinks, setLinkPickerLinks] = useState<
		{ url: string; displayLabel: string }[] | null
	>(null);
	const [linkPickerIndex, setLinkPickerIndex] = useState(0);
	const [pickerIndex, setPickerIndex] = useState(0);
	const [enumPickerIndex, setEnumPickerIndex] = useState(0);
	const [enumPickerTargetMode, setEnumPickerTargetMode] = useState<InputMode | null>(null);

	const inputValueRef = useRef(inputValue);
	const inputCursorRef = useRef(inputCursorOffset);
	inputValueRef.current = inputValue;
	inputCursorRef.current = inputCursorOffset;

	const openInput = useCallback((mode: InputMode, initialValue = "") => {
		setInputMode(mode);
		setInputValue(initialValue);
		setPickerIndex(0);
		setEnumPickerIndex(0);
	}, []);

	const closeInput = useCallback(() => {
		setInputMode("none");
		setInputValue("");
	}, []);

	const inputAutocomplete = useMemo(() => {
		if (inputMode === "createProject" || inputMode === "editProject") {
			return getProjectCreateAutocomplete(inputValue);
		}
		if (inputMode === "quickAdd") {
			return getTaskCreateAutocomplete(inputValue, projects);
		}
		return null;
	}, [inputMode, inputValue, projects]);

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

	const isPickerMode = PICKER_MODES.includes(inputMode);
	const isEnumPickerMode = ENUM_PICKER_MODES.includes(inputMode);
	const isTextInputMode =
		inputMode !== "none" &&
		inputMode !== "linkPicker" &&
		!isPickerMode &&
		!isEnumPickerMode;
	const isInputMode = inputMode !== "none";
	const isBottomBarMode = isInputMode && inputMode !== "linkPicker" && !isPickerMode && !isEnumPickerMode;
	const isLinkPickerMode = inputMode === "linkPicker";

	return {
		inputMode,
		inputValue,
		setInputValue,
		inputCursorOffset,
		setInputCursorOffset,
		inputValueRef,
		inputCursorRef,
		editingSettingField,
		setEditingSettingField,
		linkPickerLinks,
		setLinkPickerLinks,
		linkPickerIndex,
		setLinkPickerIndex,
		pickerIndex,
		setPickerIndex,
		enumPickerIndex,
		setEnumPickerIndex,
		enumPickerTargetMode,
		setEnumPickerTargetMode,
		openInput,
		closeInput,
		inputAutocomplete,
		isTextInputMode,
		isInputMode,
		isBottomBarMode,
		isLinkPickerMode,
		isPickerMode,
		isEnumPickerMode,
	};
}
