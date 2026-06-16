import { Box, Text } from "ink";

export type TaskAction = {
	key: string;
	label: string;
};

export function getTaskActions(isCompleted: boolean): TaskAction[] {
	return [
		{ key: "edit", label: "Edit task" },
		{ key: "toggle", label: isCompleted ? "Mark incomplete" : "Mark complete" },
		{ key: "delete", label: "Delete task" },
	];
}

type TaskActionPickerProps = {
	selectedIndex: number;
	isCompleted: boolean;
};

export const TaskActionPicker = ({
	selectedIndex,
	isCompleted,
}: TaskActionPickerProps) => {
	const actions = getTaskActions(isCompleted);
	return (
		<Box paddingX={1} flexDirection="column">
			<Box marginBottom={0}>
				<Text color="magentaBright" bold>
					Task actions:
				</Text>
				<Text dimColor> j/k choose Enter select Esc cancel</Text>
			</Box>
			{actions.map((action, i) => {
				const isSelected = i === selectedIndex;
				return (
					<Box key={action.key}>
						<Box width={2}>
							<Text color={isSelected ? "cyan" : undefined}>
								{isSelected ? "❯" : " "}
							</Text>
						</Box>
						<Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
							{action.label}
						</Text>
					</Box>
				);
			})}
		</Box>
	);
};
