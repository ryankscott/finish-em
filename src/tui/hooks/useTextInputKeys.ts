import { useInput } from "ink";

import { applyTextEdit } from "../apply-text-edit";
import type { InputMode } from "./useInputBar";

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
	openCalendarPicker: (calendarMode: InputMode, existingIsoDate?: string) => void;
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
}: UseTextInputKeysParams) {
	useInput(
		(input, key) => {
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
		{ isActive },
	);
}
