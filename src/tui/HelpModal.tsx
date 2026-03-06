import { Box, Text } from "ink";

type ShortcutRow = {
	keys: string;
	action: string;
	section?: string;
};

const SHORTCUTS: ShortcutRow[] = [
	{
		keys: "Tab",
		action: "Cycle focus: sidebar → tasks → goals (upcoming)",
		section: "Navigation",
	},
	{ keys: "j / ↓", action: "Move down" },
	{ keys: "k / ↑", action: "Move up" },
	{ keys: "Enter", action: "Select sidebar item" },
	{
		keys: "x",
		action: "Complete selected task (or reopen if already completed)",
		section: "Tasks",
	},
	{ keys: "Space", action: "Expand/collapse subtasks" },
	{ keys: "a", action: "Quick add task" },
	{ keys: "s", action: "Create subtask under selected task" },
	{
		keys: "e",
		action: "Edit task title / project name / goal title (depending on focus)",
	},
	{ keys: "c", action: "Edit task notes / description" },
	{
		keys: "o",
		action: "Open link (task links, or project links in project view; if multiple: j/k or 1–9, Enter open)",
	},
	{ keys: "d", action: "Delete selected task (soft-delete, recoverable)" },
	{ keys: "u", action: "Restore deleted task (Deleted view only)" },
	{ keys: "n", action: "Add reminder to selected task" },
	{ keys: "z", action: "Delete reminder from selected task" },
	{
		keys: "E",
		action: "Open field picker (task: due, project, priority, notes · project: name, emoji, dates)",
		section: "Field picker",
	},
	{
		keys: "E (date field)",
		action: "Open calendar picker while editing due / scheduled / project date fields",
	},
	{ keys: "Shift+s", action: "Open settings view", section: "Settings" },
	{ keys: "e / Enter", action: "Edit selected setting" },
	{ keys: "p", action: "Create new project", section: "Projects" },
	{ keys: "e", action: "Edit project name" },
	{ keys: "D", action: "Delete project (in project view, non-inbox)" },
	{ keys: "h / ←", action: "Previous column", section: "Upcoming" },
	{ keys: "l / →", action: "Next column" },
	{ keys: "[ / ]", action: "Previous / next week" },
	{ keys: "t", action: "Jump to today" },
	{ keys: "v", action: "Cycle view mode (day / work week / week)" },
	{ keys: "g", action: "Add a goal" },
	{ keys: "Tab (goals)", action: "Focus goals panel · j/k select · x toggle · e edit title · Del delete", section: "Goals" },
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
			backgroundColor={"black"}
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
