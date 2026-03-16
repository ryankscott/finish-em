import { useCallback, useMemo, useRef, useState } from "react";

import type { Project } from "../../server/types";
import {
	getModalFields,
	MODAL_MODES,
	type ModalField,
	type ModalMode,
} from "../modal-field-defs";

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
	// Full-form create modals
	| "createTaskModal"
	| "createProjectModal"
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
	enumPickerTargetMode: string | null;
	setEnumPickerTargetMode: (mode: string | null) => void;
	openInput: (mode: InputMode, initialValue?: string) => void;
	closeInput: () => void;
	inputAutocomplete: { hint: string; nextValue: string } | null;
	isTextInputMode: boolean;
	isInputMode: boolean;
	isBottomBarMode: boolean;
	isLinkPickerMode: boolean;
	isPickerMode: boolean;
	isEnumPickerMode: boolean;
	// Modal create state
	isModalMode: boolean;
	modalFieldIndex: number;
	setModalFieldIndex: React.Dispatch<React.SetStateAction<number>>;
	modalValues: Record<string, string>;
	setModalValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	modalValuesRef: React.MutableRefObject<Record<string, string>>;
	modalActiveFieldKeyRef: React.MutableRefObject<string>;
	activeModalField: ModalField | undefined;
	isModalTextActive: boolean;
	validationError: string | null;
	setValidationError: (err: string | null) => void;
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
	const [enumPickerTargetMode, setEnumPickerTargetMode] = useState<string | null>(null);

	// Modal create state
	const [modalFieldIndex, setModalFieldIndex] = useState(0);
	const [modalValues, setModalValues] = useState<Record<string, string>>({});
	const [validationError, setValidationError] = useState<string | null>(null);

	const inputValueRef = useRef(inputValue);
	const inputCursorRef = useRef(inputCursorOffset);
	inputValueRef.current = inputValue;
	inputCursorRef.current = inputCursorOffset;

	const modalValuesRef = useRef(modalValues);
	modalValuesRef.current = modalValues;
	const modalActiveFieldKeyRef = useRef("");

	const isModalMode = (MODAL_MODES as readonly string[]).includes(inputMode);

	const activeModalField = isModalMode
		? getModalFields(inputMode as ModalMode)[modalFieldIndex]
		: undefined;

	modalActiveFieldKeyRef.current = activeModalField?.key ?? "";

	const isModalTextActive =
		isModalMode &&
		(activeModalField?.type === "text" || activeModalField?.type === "date");

	const openInput = useCallback((mode: InputMode, initialValue = "") => {
		setInputMode(mode);
		setInputValue(initialValue);
		setPickerIndex(0);
		setEnumPickerIndex(0);
		setModalFieldIndex(0);
		setModalValues({});
		setValidationError(null);
	}, []);

	const closeInput = useCallback(() => {
		setInputMode("none");
		setInputValue("");
		setModalFieldIndex(0);
		setModalValues({});
		setValidationError(null);
	}, []);

	const inputAutocomplete = null;

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
		isModalMode,
		modalFieldIndex,
		setModalFieldIndex,
		modalValues,
		setModalValues,
		modalValuesRef,
		modalActiveFieldKeyRef,
		activeModalField,
		isModalTextActive,
		validationError,
		setValidationError,
	};
}
