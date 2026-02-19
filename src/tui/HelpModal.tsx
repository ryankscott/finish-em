import { Box, Text } from "ink";

type ShortcutRow = {
	keys: string;
	action: string;
	section?: string;
};

const SHORTCUTS: ShortcutRow[] = [
	{
		keys: "Tab",
		action: "Switch focus between sidebar and tasks",
		section: "Navigation",
	},
	{ keys: "j / ↓", action: "Move down" },
	{ keys: "k / ↑", action: "Move up" },
	{ keys: "Enter", action: "Select sidebar item" },
	{ keys: "x", action: "Toggle task completion", section: "Tasks" },
	{ keys: "Space", action: "Expand/collapse task details" },
	{ keys: "a", action: "Quick add task" },
	{ keys: "c", action: "Chat with assistant" },
	{ keys: "y / n", action: "Confirm/cancel selected assistant action" },
	{ keys: "Shift+X", action: "Clear assistant chat history" },
	{ keys: "Ctrl+j", action: "Toggle assistant panel/overlay" },
	{ keys: "s", action: "Create subtask under selected task" },
	{
		keys: "e",
		action:
			"Edit selected task (title, project, parent, due, scheduled, recurs, priority)",
	},
	{ keys: "d", action: "Delete selected task" },
	{ keys: "m", action: "Add reminder to selected task" },
	{ keys: "z", action: "Delete reminder from selected task" },
	{ keys: "Shift+s", action: "Open settings view", section: "Settings" },
	{ keys: "e / Enter", action: "Edit selected setting" },
	{ keys: "Space", action: "Toggle assistant provider" },
	{ keys: "x", action: "Clear assistant API key (key row)" },
	{ keys: "p", action: "Create new project", section: "Projects" },
	{ keys: "h / ←", action: "Previous column", section: "Upcoming" },
	{ keys: "l / →", action: "Next column" },
	{ keys: "[ / ]", action: "Previous / next week" },
	{ keys: "t", action: "Jump to today" },
	{ keys: "v", action: "Cycle view mode (day / work week / week)" },
	{ keys: "g", action: "Add a goal" },
	{ keys: "r", action: "Refresh data", section: "General" },
	{ keys: "?", action: "Toggle this help" },
	{ keys: "q", action: "Quit" },
];

type HelpModalProps = {
	terminalWidth: number;
	terminalHeight: number;
};

export const HelpModal = ({
	terminalWidth,
	terminalHeight,
}: HelpModalProps) => {
	const width = Math.min(60, terminalWidth - 4);
	const keysColWidth = 12;

	return (
		<Box
			position="absolute"
			flexDirection="column"
			width={terminalWidth}
			height={terminalHeight}
			alignItems="center"
			justifyContent="center"
		>
			<Box
				flexDirection="column"
				width={width}
				borderStyle="round"
				borderColor="magentaBright"
				paddingX={2}
				paddingY={1}
			>
				<Box marginBottom={1} justifyContent="space-between">
					<Text bold color="magentaBright">
						Keyboard Shortcuts
					</Text>
					<Text dimColor>Esc or ? to close</Text>
				</Box>

				{SHORTCUTS.map((row, index) => (
					<Box
						key={`${row.section ?? "general"}-${row.keys}-${index}`}
						flexDirection="column"
					>
						{row.section && (
							<Box marginTop={1} marginBottom={0}>
								<Text bold color="yellow">
									{row.section}
								</Text>
							</Box>
						)}
						<Box>
							<Box width={keysColWidth}>
								<Text color="cyan" bold>
									{row.keys}
								</Text>
							</Box>
							<Box flexGrow={1}>
								<Text>{row.action}</Text>
							</Box>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
};
