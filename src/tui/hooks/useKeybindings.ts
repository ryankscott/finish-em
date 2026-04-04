import { useEffect, useRef } from "react";

import type { Goal, Project, Reminder, Task } from "../../server/types";
import type { EnumPickerItem } from "../EnumPicker";
import type { ColumnTaskRow, DayColumn, ViewMode } from "../UpcomingPanel";
import type { SettingsRow } from "../SettingsPanel";
import type { SidebarItem } from "../Sidebar";
import type { InputMode } from "./useInputBar";
import type { FocusArea, View } from "./useNavigation";
import { useMainKeys } from "./useMainKeys";
import { useTextInputKeys } from "./useTextInputKeys";

type UseKeybindingsParams = {
	showDashboard: boolean;
	setShowDashboard: (show: boolean) => void;
	isTextInputMode: boolean;
	inputValueRef: React.MutableRefObject<string>;
	inputCursorRef: React.MutableRefObject<number>;
	autocompleteNextValue: string | null;
	setInputValue: (value: string) => void;
	setInputCursorOffset: (offset: number) => void;
	closeInput: () => void;
	openModalWithValues: (mode: InputMode, values: Record<string, string>, taskId?: number) => void;
	submitInput: () => Promise<void>;
	openCalendarPicker: (calendarMode: InputMode, existingIsoDate?: string) => void;
	calendarCursorDate: Date;
	setCalendarCursorDate: React.Dispatch<React.SetStateAction<Date>>;
	calendarVisibleMonth: Date;
	setCalendarVisibleMonth: React.Dispatch<React.SetStateAction<Date>>;
	inputValue: string;
	showHelp: boolean;
	setShowHelp: (show: boolean) => void;
	inputMode: InputMode;
	setInputMode: (mode: InputMode) => void;
	linkPickerLinks: { url: string; displayLabel: string }[] | null;
	setLinkPickerLinks: (links: { url: string; displayLabel: string }[] | null) => void;
	linkPickerIndex: number;
	setLinkPickerIndex: React.Dispatch<React.SetStateAction<number>>;
	pickerIndex: number;
	setPickerIndex: React.Dispatch<React.SetStateAction<number>>;
	enumPickerIndex: number;
	setEnumPickerIndex: React.Dispatch<React.SetStateAction<number>>;
	enumPickerItems: EnumPickerItem[];
	setEnumPickerItems: (items: EnumPickerItem[]) => void;
	enumPickerTitle: string;
	setEnumPickerTitle: (title: string) => void;
	enumPickerTargetMode: string | null;
	setEnumPickerTargetMode: (mode: string | null) => void;
	// Modal create state
	isModalMode: boolean;
	isModalTextActive: boolean;
	modalFieldIndex: number;
	setModalFieldIndex: React.Dispatch<React.SetStateAction<number>>;
	modalValues: Record<string, string>;
	setModalValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	modalValuesRef: React.MutableRefObject<Record<string, string>>;
	modalActiveFieldKeyRef: React.MutableRefObject<string>;
	setValidationError: (err: string | null) => void;
	view: View;
	focusArea: FocusArea;
	setFocusArea: React.Dispatch<React.SetStateAction<FocusArea>>;
	sidebarVisible: boolean;
	setSidebarVisible: React.Dispatch<React.SetStateAction<boolean>>;
	sidebarItems: SidebarItem[];
	sidebarIndex: number;
	setSidebarIndex: React.Dispatch<React.SetStateAction<number>>;
	applySidebarSelection: (item: SidebarItem) => void;
	settingsRows: SettingsRow[];
	setSettingsIndex: React.Dispatch<React.SetStateAction<number>>;
	selectedSettingsRow: SettingsRow | null;
	setEditingSettingField: (field: "timezone" | null) => void;
	columns: DayColumn[];
	setColumnIndex: React.Dispatch<React.SetStateAction<number>>;
	currentColumnRows: ColumnTaskRow[];
	taskRows: { task: Task }[];
	setTaskIndex: React.Dispatch<React.SetStateAction<number>>;
	goals: Goal[];
	goalIndex: number;
	setGoalIndex: React.Dispatch<React.SetStateAction<number>>;
	viewMode: ViewMode;
	setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
	setAnchorDate: React.Dispatch<React.SetStateAction<Date>>;
	selectedTask: Task | null;
	selectedTaskHasSubtasks: boolean;
	expandedTaskId: number | null;
	setExpandedTaskId: (id: number | null) => void;
	activeProjectId: number | null;
	activeProject: Project | null;
	projects: Project[];
	projectMap: Record<number, Project>;
	selectedReminder: Reminder | null;
	setStatusText: (text: string) => void;
	loadData: () => Promise<void>;
	toggleSelectedTask: () => Promise<void>;
	deleteSelectedTask: () => Promise<void>;
	undeleteSelectedTask: () => Promise<void>;
	deleteActiveProject: () => Promise<void>;
	deleteSelectedReminder: (reminder: Reminder) => Promise<void>;
	toggleSelectedGoal: () => Promise<void>;
	deleteSelectedGoal: () => Promise<void>;
	onQuit: () => void;
};

export function useKeybindings({
	showDashboard,
	setShowDashboard,
	isTextInputMode,
	inputValueRef,
	inputCursorRef,
	autocompleteNextValue,
	setInputValue,
	setInputCursorOffset,
	closeInput,
	openModalWithValues,
	submitInput,
	openCalendarPicker,
	calendarCursorDate,
	setCalendarCursorDate,
	calendarVisibleMonth,
	setCalendarVisibleMonth,
	inputValue,
	showHelp,
	setShowHelp,
	inputMode,
	setInputMode,
	linkPickerLinks,
	setLinkPickerLinks,
	linkPickerIndex,
	setLinkPickerIndex,
	pickerIndex,
	setPickerIndex,
	enumPickerIndex,
	setEnumPickerIndex,
	enumPickerItems,
	setEnumPickerItems,
	enumPickerTitle,
	setEnumPickerTitle,
	enumPickerTargetMode,
	setEnumPickerTargetMode,
	isModalMode,
	isModalTextActive,
	modalFieldIndex,
	setModalFieldIndex,
	modalValues: _modalValues,
	setModalValues,
	modalValuesRef,
	modalActiveFieldKeyRef,
	setValidationError,
	view,
	focusArea,
	setFocusArea,
	sidebarVisible,
	setSidebarVisible,
	sidebarItems,
	sidebarIndex,
	setSidebarIndex,
	applySidebarSelection,
	settingsRows,
	setSettingsIndex,
	selectedSettingsRow,
	setEditingSettingField,
	columns,
	setColumnIndex,
	currentColumnRows,
	taskRows,
	setTaskIndex,
	goals,
	goalIndex,
	setGoalIndex,
	viewMode,
	setViewMode,
	setAnchorDate,
	selectedTask,
	selectedTaskHasSubtasks,
	expandedTaskId,
	setExpandedTaskId,
	activeProjectId,
	activeProject,
	projects,
	projectMap,
	selectedReminder,
	setStatusText,
	loadData,
	toggleSelectedTask,
	deleteSelectedTask,
	undeleteSelectedTask,
	deleteActiveProject,
	deleteSelectedReminder,
	toggleSelectedGoal,
	deleteSelectedGoal,
	onQuit,
}: UseKeybindingsParams) {
	// Sync cursor to end of input when entering text mode (including modal text fields)
	const prevWasTextInputModeRef = useRef(false);
	useEffect(() => {
		if ((isTextInputMode || isModalTextActive) && !prevWasTextInputModeRef.current) {
			setInputCursorOffset(inputValue.length);
		}
		prevWasTextInputModeRef.current = isTextInputMode || isModalTextActive;
	}, [isTextInputMode, isModalTextActive, inputValue.length, setInputCursorOffset]);

	useTextInputKeys({
		isActive: isTextInputMode || isModalTextActive,
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
	});

	useMainKeys({
		isActive: isModalMode || !isTextInputMode,
		showDashboard,
		setShowDashboard,
		showHelp,
		setShowHelp,
		inputMode,
		setInputMode,
		linkPickerLinks,
		setLinkPickerLinks,
		linkPickerIndex,
		setLinkPickerIndex,
		pickerIndex,
		setPickerIndex,
		enumPickerIndex,
		setEnumPickerIndex,
		enumPickerItems,
		setEnumPickerItems,
		enumPickerTitle,
		setEnumPickerTitle,
		enumPickerTargetMode,
		setEnumPickerTargetMode,
		isModalMode,
		isModalTextActive,
		modalFieldIndex,
		setModalFieldIndex,
		modalValuesRef,
		setValidationError,
		closeInput,
		openModalWithValues,
		openCalendarPicker,
		calendarCursorDate,
		setCalendarCursorDate,
		calendarVisibleMonth,
		setCalendarVisibleMonth,
		view,
		focusArea,
		setFocusArea,
		sidebarVisible,
		setSidebarVisible,
		sidebarItems,
		sidebarIndex,
		setSidebarIndex,
		applySidebarSelection,
		settingsRows,
		setSettingsIndex,
		selectedSettingsRow,
		setEditingSettingField,
		columns,
		setColumnIndex,
		currentColumnRows,
		taskRows,
		setTaskIndex,
		goals,
		goalIndex,
		setGoalIndex,
		viewMode,
		setViewMode,
		setAnchorDate,
		selectedTask,
		selectedTaskHasSubtasks,
		expandedTaskId,
		setExpandedTaskId,
		activeProjectId,
		activeProject,
		projects,
		projectMap,
		selectedReminder,
		setStatusText,
		setInputValue,
		loadData,
		toggleSelectedTask,
		deleteSelectedTask,
		undeleteSelectedTask,
		deleteActiveProject,
		deleteSelectedReminder,
		toggleSelectedGoal,
		deleteSelectedGoal,
		submitInput,
		onQuit,
	});
}
