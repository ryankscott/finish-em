import { Box, Text } from "ink";

export type TaskEditField = {
	key: string;
	label: string;
	hint: string;
};

export const TASK_EDIT_FIELDS: TaskEditField[] = [
	{ key: "project", label: "Move to project", hint: "select from list" },
	{ key: "due", label: "Due date", hint: "today / tomorrow / YYYY-MM-DD / clear  (E for calendar)" },
	{ key: "scheduled", label: "Scheduled date", hint: "today / tomorrow / YYYY-MM-DD / clear  (E for calendar)" },
	{ key: "recurrence", label: "Recurring", hint: "select from list" },
	{ key: "reminder", label: "Reminder", hint: "today / tomorrow / ISO datetime" },
	{ key: "priority", label: "Priority", hint: "select from list" },
	{ key: "notes", label: "Notes / description", hint: "free text" },
];

type TaskEditPickerProps = {
	selectedIndex: number;
};

export const TaskEditPicker = ({ selectedIndex }: TaskEditPickerProps) => {
	return (
		<Box paddingX={1} flexDirection="column">
			<Box marginBottom={0}>
				<Text color="magentaBright" bold>
					Edit task field:
				</Text>
				<Text dimColor> j/k choose  Enter select  Esc cancel</Text>
			</Box>
			{TASK_EDIT_FIELDS.map((field, i) => {
				const isSelected = i === selectedIndex;
				return (
					<Box key={field.key}>
						<Box width={2}>
							<Text color={isSelected ? "cyan" : undefined}>
								{isSelected ? "❯" : " "}
							</Text>
						</Box>
						<Text
							color={isSelected ? "cyan" : undefined}
							bold={isSelected}
						>
							{field.label}
						</Text>
						<Text dimColor>  {field.hint}</Text>
					</Box>
				);
			})}
		</Box>
	);
};
