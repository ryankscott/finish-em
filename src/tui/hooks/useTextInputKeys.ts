import { useInput } from "ink";
import { useEffectEvent } from "react";

import { applyTextEdit } from "../apply-text-edit";
import type { InputMode } from "./useInputBar";

const STATUS_INPUT_MODES: InputMode[] = [
	"editProjectJiraDiscoveryStatus",
	"editProjectJiraDeliveryStatus",
	"editProjectJiraDocsStatus",
	"editProjectJiraReleaseNoteStatus",
];
const STATUS_CYCLE = ["", "todo", "in_progress", "done"];

const DATE_TEXT_INPUT_MODES: InputMode[] = [
	"editDueDate",
	"editScheduledDate",
	"editProjectStartDate",
	"editProjectEndDate",
];

const DATE_MODE_TO_CALENDAR_MODE: Partial<Record<InputMode, InputMode>> = {
	editDueDate: "calendarPickerDueDate",
	editScheduledDate: "calendarPickerScheduledDate",
	editProjectStartDate: "calendarPickerProjectStartDate",
	editProjectEndDate: "calendarPickerProjectEndDate",
};

type UseTextInputKeysParams = {
	isActive: boolean;
	inputMode: InputMode;
	inputValueRef: React.MutableRefObject<string>;
	inputCursorRef: React.MutableRefObject<number>;
	autocompleteNextValue: string | null;
	setInputValue: (value: string) => void;
	setInputCursorOffset: (offset: number) => void;
	closeInput: () => void;
	submitInput: () => Promise<void>;
	openCalendarPicker: (
		calendarMode: InputMode,
		existingIsoDate?: string,
	) => void;
	// Modal routing params
	isModalMode: boolean;
	isModalTextActive: boolean;
	modalActiveFieldKeyRef: React.MutableRefObject<string>;
	modalValuesRef: React.MutableRefObject<Record<string, string>>;
	setModalValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	// Global search navigation
	onSearchNavigate?: (delta: 1 | -1) => void;
	onSearchSelect?: () => void;
};

export function useTextInputKeys({
	isActive,
	inputMode,
	inputValueRef,
	inputCursorRef,
	autocompleteNextValue,
	setInputValue,
	setInputCursorOffset,
	closeInput,
	submitInput,
	openCalendarPicker,
	isModalMode,
	isModalTextActive,
	modalActiveFieldKeyRef,
	modalValuesRef,
	setModalValues,
	onSearchNavigate,
	onSearchSelect,
}: UseTextInputKeysParams) {
	const handleInput = useEffectEvent(
		(input: string, key: Parameters<Parameters<typeof useInput>[0]>[1]) => {
			// In modal mode: Esc, Enter, Tab, E are always handled by useMainKeys.
			// When isModalTextActive, we also handle character input below.
			if (isModalMode) {
				if (key.escape || key.tab || input === "E") return;
				if (key.return) {
					// Notes field: insert newline instead of advancing to next field
					if (isModalTextActive && modalActiveFieldKeyRef.current === "notes") {
						const currentValue = modalValuesRef.current["notes"] ?? "";
						const currentCursor = inputCursorRef.current;
						const next = currentValue.slice(0, currentCursor) + "\n" + currentValue.slice(currentCursor);
						setModalValues((prev) => ({ ...prev, notes: next }));
						setInputCursorOffset(currentCursor + 1);
					}
					return;
				}
				if (!isModalTextActive) return; // Submit row etc — no character input
				const fieldKey = modalActiveFieldKeyRef.current;
				const currentValue = modalValuesRef.current[fieldKey] ?? "";
				const currentCursor = inputCursorRef.current;
				const result = applyTextEdit(
					input,
					{
						backspace: key.backspace,
						delete: key.delete,
						leftArrow: key.leftArrow,
						rightArrow: key.rightArrow,
					},
					currentValue,
					currentCursor,
				);
				if (result) {
					setModalValues((prev) => ({ ...prev, [fieldKey]: result.value }));
					setInputCursorOffset(result.cursor);
				}
				return;
			}

			// Global search: intercept Up/Down for result navigation and Enter for selection
			if (inputMode === "globalSearch") {
				if (key.upArrow)   { onSearchNavigate?.(-1); return; }
				if (key.downArrow) { onSearchNavigate?.(1);  return; }
				if (key.return)    { onSearchSelect?.();     return; }
			}

			if (key.tab && autocompleteNextValue !== null) {
				setInputValue(autocompleteNextValue);
				setInputCursorOffset(autocompleteNextValue.length);
				return;
			}
			if (key.escape) {
				closeInput();
				return;
			}
			if (key.return) {
				void submitInput();
				return;
			}
			// h/l and left/right cycle through values in status input modes
			if (STATUS_INPUT_MODES.includes(inputMode)) {
				if (key.rightArrow || input === "l") {
					const cur = inputValueRef.current;
					const idx = STATUS_CYCLE.indexOf(cur);
					const next = STATUS_CYCLE[(idx === -1 ? 0 : idx + 1) % STATUS_CYCLE.length];
					setInputValue(next);
					setInputCursorOffset(next.length);
					return;
				}
				if (key.leftArrow || input === "h") {
					const cur = inputValueRef.current;
					const idx = STATUS_CYCLE.indexOf(cur);
					const safeIdx = idx === -1 ? 0 : idx;
					const prev = STATUS_CYCLE[(safeIdx - 1 + STATUS_CYCLE.length) % STATUS_CYCLE.length];
					setInputValue(prev);
					setInputCursorOffset(prev.length);
					return;
				}
			}

			// E opens the calendar picker when in a date text-input mode
			if (input === "E" && DATE_TEXT_INPUT_MODES.includes(inputMode)) {
				const calendarMode = DATE_MODE_TO_CALENDAR_MODE[inputMode];
				if (calendarMode) {
					openCalendarPicker(calendarMode, inputValueRef.current || undefined);
				}
				return;
			}
			const result = applyTextEdit(
				input,
				{
					backspace: key.backspace,
					delete: key.delete,
					leftArrow: key.leftArrow,
					rightArrow: key.rightArrow,
				},
				inputValueRef.current,
				inputCursorRef.current,
			);
			if (result) {
				setInputValue(result.value);
				setInputCursorOffset(result.cursor);
			}
		},
	);

	useInput(
		(input, key) => {
			handleInput(input, key);
		},
		{ isActive },
	);
}
