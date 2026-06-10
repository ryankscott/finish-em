import { Box, Text } from "ink";

const STATUS_CYCLING_MODES = new Set([
	"editProjectJiraDiscoveryStatus",
	"editProjectJiraDeliveryStatus",
	"editProjectJiraDocsStatus",
	"editProjectJiraReleaseNoteStatus",
]);

const STATUS_CYCLING_LABELS: Partial<Record<string, string>> = {
	editProjectJiraDiscoveryStatus: "Discovery Jira status",
	editProjectJiraDeliveryStatus: "Delivery epic status",
	editProjectJiraDocsStatus: "Docs Jira status",
	editProjectJiraReleaseNoteStatus: "Release Note status",
};

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
	todo: { label: "Todo", color: "yellow" },
	in_progress: { label: "In Progress", color: "cyan" },
	done: { label: "Done", color: "green" },
};

const STATUS_OPTIONS = [
	{ label: "—", value: "" },
	{ label: "Todo", value: "todo" },
	{ label: "In Progress", value: "in_progress" },
	{ label: "Done", value: "done" },
];

import type { InputMode } from "./hooks/useInputBar";

const AUTOCOMPLETE_TOKEN_PATTERN = /^([a-z_]+:)$/i;

function renderAutocompleteHint(hint: string) {
	return hint.split(/([a-z_]+:)/gi).map((segment, index) => {
		if (!segment) return null;
		if (AUTOCOMPLETE_TOKEN_PATTERN.test(segment)) {
			return (
				<Text key={`token-${index}`} color="magentaBright">
					{segment}
				</Text>
			);
		}
		return (
			<Text key={`text-${index}`} dimColor>
				{segment}
			</Text>
		);
	});
}

const INPUT_MODE_LABELS: Partial<Record<InputMode, string>> = {
	editSetting: "Edit setting: ",
	quickAdd: "Quick add: ",
	createSubtask: "Subtask title: ",
	createProject: "New project (tokens optional): ",
	editProject: "Edit project: ",
	addReminder: "Reminder (ISO): ",
	editTask: "Edit task: ",
	addGoal: "New goal: ",
	globalSearch: "Search: ",
	editDueDate: "Due date (today/tomorrow/YYYY-MM-DD/clear): ",
	editScheduledDate: "Scheduled date (today/tomorrow/YYYY-MM-DD/clear): ",
	editReminder: "Reminder (today/tomorrow/ISO datetime): ",
	editBlockedReason: "Blocked reason (blank to unblock): ",
	editNotes: "Notes / description: ",
	editGoalTitle: "Edit goal title: ",
	editProjectName: "Project name: ",
	editProjectEmoji: "Project emoji: ",
	editProjectDescription: "Project description: ",
	editProjectStartDate: "Start date (today/tomorrow/YYYY-MM-DD/clear): ",
	editProjectEndDate: "End date (today/tomorrow/YYYY-MM-DD/clear): ",
	editProjectJiraDiscovery: "Jira Product Discovery URL (or clear): ",
	editProjectJiraDelivery: "Jira Delivery URL (or clear): ",
	editProjectConfluence: "Confluence URL (or clear): ",
};

type InputBarProps = {
	inputMode: InputMode;
	inputValue: string;
	inputCursorOffset: number;
	autocomplete: { hint: string; nextValue: string } | null;
};

export const InputBar = ({
	inputMode,
	inputValue,
	inputCursorOffset,
	autocomplete,
}: InputBarProps) => {
	if (STATUS_CYCLING_MODES.has(inputMode)) {
		const fieldLabel = STATUS_CYCLING_LABELS[inputMode] ?? "Status";
		return (
			<Box paddingX={1} gap={1}>
				<Text color="magentaBright" bold>{fieldLabel}:</Text>
				{STATUS_OPTIONS.map((opt) => {
					const isSel = inputValue === opt.value;
					const color = STATUS_DISPLAY[opt.value]?.color ?? "cyan";
					return (
						<Text key={opt.value} bold={isSel} color={isSel ? color : undefined} dimColor={!isSel}>
							{isSel ? `[${opt.label}]` : opt.label}
						</Text>
					);
				})}
				<Text dimColor>  h/l or ◀▶ cycle · Enter confirm · Esc cancel</Text>
			</Box>
		);
	}

	const label = INPUT_MODE_LABELS[inputMode] ?? "";

	return (
		<Box paddingX={1}>
			<Text color="magentaBright" bold>
				{label}
			</Text>
			<Box>
				<Text>
					{inputValue.slice(0, inputCursorOffset)}
					<Text inverse>{inputValue[inputCursorOffset] ?? " "}</Text>
					{inputValue.slice(inputCursorOffset + 1)}
				</Text>
			</Box>
			{autocomplete ? (
				<Box>
					<Text dimColor> ↳ </Text>
					{renderAutocompleteHint(autocomplete.hint)}
				</Box>
			) : null}
		</Box>
	);
};
