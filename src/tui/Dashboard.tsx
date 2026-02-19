import { format } from "date-fns";
import { Box, Text, useInput } from "ink";

// Figlet-style ASCII art for "Finish Em"
const LOGO = `
 ███████╗██╗███╗   ██╗██╗███████╗██╗  ██╗    ███████╗███╗   ███╗
 ██╔════╝██║████╗  ██║██║██╔════╝██║  ██║    ██╔════╝████╗ ████║
 █████╗  ██║██╔██╗ ██║██║███████╗███████║    █████╗  ██╔████╔██║
 ██╔══╝  ██║██║╚██╗██║██║╚════██║██╔══██║    ██╔══╝  ██║╚██╔╝██║
 ██║     ██║██║ ╚████║██║███████║██║  ██║    ███████╗██║ ╚═╝ ██║
 ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚═╝  ╚═╝    ╚══════╝╚═╝     ╚═╝
`.trimEnd();

const TAGLINE = "Your tasks. Finished.";

const TIPS = [
	"Press ? for help",
	"Press a to quick-add a task",
	"Press Tab to switch focus",
	"Press q to quit",
	"Press r to refresh",
	"Press x to complete a task",
	"Press e to edit a task",
];

type DashboardProps = {
	onDismiss: () => void;
	terminalWidth: number;
	terminalHeight: number;
};

export const Dashboard = ({
	onDismiss,
	terminalWidth,
	terminalHeight,
}: DashboardProps) => {
	useInput((input, key) => {
		if (
			key.return ||
			key.escape ||
			input === "q" ||
			input === " " ||
			input.length > 0
		) {
			onDismiss();
		}
	});

	const dateStr = format(new Date(), "EEEE, dd MMM yyyy");
	const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];

	return (
		<Box
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			width={terminalWidth}
			height={terminalHeight}
		>
			{/* Logo */}
			<Box flexDirection="column" alignItems="center" marginBottom={1}>
				{LOGO.split("\n").map((line, i) => (
					<Text key={i} color="magentaBright" bold>
						{line}
					</Text>
				))}
			</Box>

			{/* Tagline */}
			<Box marginBottom={2}>
				<Text color="gray" italic>
					{TAGLINE}
				</Text>
			</Box>

			{/* Date */}
			<Box marginBottom={1}>
				<Text color="cyanBright">{dateStr}</Text>
			</Box>

			{/* Tip */}
			<Box marginBottom={3}>
				<Text dimColor>Tip: {randomTip}</Text>
			</Box>

			{/* Prompt */}
			<Box>
				<Text color="magentaBright" bold>
					Press any key to continue
				</Text>
			</Box>
		</Box>
	);
};
