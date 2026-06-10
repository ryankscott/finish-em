import { Box, Text } from "ink";

export type ProjectEditField = {
	key: string;
	label: string;
	hint: string;
};

export const PROJECT_EDIT_FIELDS: ProjectEditField[] = [
	{ key: "name", label: "Name", hint: "free text" },
	{ key: "emoji", label: "Emoji", hint: "single emoji character" },
	{ key: "description", label: "Description", hint: "free text" },
	{
		key: "startDate",
		label: "Start date",
		hint: "today / tomorrow / YYYY-MM-DD / clear  (E for calendar)",
	},
	{
		key: "endDate",
		label: "End date",
		hint: "today / tomorrow / YYYY-MM-DD / clear  (E for calendar)",
	},
	{ key: "jiraDiscovery", label: "Discovery: Jira URL", hint: "URL or clear" },
	{
		key: "jiraDiscoveryStatus",
		label: "Discovery: Jira Status",
		hint: "h/l or ← → cycle",
	},
	{ key: "confluence", label: "Discovery: PRD URL", hint: "URL or clear" },
	{ key: "jiraDelivery", label: "Delivery: Epic URL", hint: "URL or clear" },
	{
		key: "jiraDeliveryStatus",
		label: "Delivery: Epic Status",
		hint: "h/l or ← → cycle",
	},
	{ key: "jiraDocs", label: "Delivery: Docs URL", hint: "URL or clear" },
	{
		key: "jiraDocsStatus",
		label: "Delivery: Docs Status",
		hint: "h/l or ← → cycle",
	},
	{
		key: "jiraReleaseNote",
		label: "Delivery: Release Note URL",
		hint: "URL or clear",
	},
	{
		key: "jiraReleaseNoteStatus",
		label: "Delivery: Release Note Status",
		hint: "h/l or ← → cycle",
	},
	{
		key: "teamsReleaseNote",
		label: "Delivery: Teams URL",
		hint: "URL or clear",
	},
];

type ProjectEditPickerProps = {
	selectedIndex: number;
	projectName: string;
};

export const ProjectEditPicker = ({
	selectedIndex,
	projectName,
}: ProjectEditPickerProps) => {
	return (
		<Box paddingX={1} flexDirection="column">
			<Box marginBottom={0}>
				<Text color="magentaBright" bold>
					Edit project:{" "}
				</Text>
				<Text bold>{projectName}</Text>
				<Text dimColor> j/k choose Enter select Esc cancel</Text>
			</Box>
			{PROJECT_EDIT_FIELDS.map((field, i) => {
				const isSelected = i === selectedIndex;
				return (
					<Box key={field.key}>
						<Box width={2}>
							<Text color={isSelected ? "cyan" : undefined}>
								{isSelected ? "❯" : " "}
							</Text>
						</Box>
						<Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
							{field.label}
						</Text>
						<Text dimColor> {field.hint}</Text>
					</Box>
				);
			})}
		</Box>
	);
};
