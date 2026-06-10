import { format, isPast, parseISO } from "date-fns";
import { Box, Text } from "ink";
import type { Reminder } from "../server/types";

type ReminderWithTitle = Reminder & { taskTitle: string };

function formatReminderTime(r: ReminderWithTitle): string {
	const target = r.snoozedUntil ?? r.remindAt;
	try {
		return format(parseISO(target), "MMM d, h:mm a");
	} catch {
		return target;
	}
}

type RemindersPanelProps = {
	reminders: ReminderWithTitle[];
	selectedIndex: number;
	focused: boolean;
	terminalWidth?: number;
	terminalHeight?: number;
};

export const RemindersPanel = ({
	reminders,
	selectedIndex,
	focused,
	terminalWidth = 120,
	terminalHeight,
}: RemindersPanelProps) => {
	const borderColor = focused ? "magentaBright" : "gray";

	const availableHeight = terminalHeight
		? Math.max(4, terminalHeight - 5)
		: Infinity;
	const scrollStart = Math.max(
		0,
		selectedIndex - Math.floor(availableHeight / 2),
	);
	const visibleReminders =
		availableHeight === Infinity
			? reminders
			: reminders.slice(scrollStart, scrollStart + availableHeight);

	const timeWidth = 18;
	const titleWidth = Math.max(10, terminalWidth - timeWidth - 10);

	return (
		<Box
			flexDirection="column"
			flexGrow={1}
			borderStyle="round"
			borderColor={borderColor}
			paddingX={1}
		>
			<Box marginBottom={1}>
				<Text bold color="magentaBright">
					Reminders
				</Text>
			</Box>

			{reminders.length === 0 ? (
				<Text dimColor>No upcoming reminders</Text>
			) : (
				visibleReminders.map((r, localIdx) => {
					const absoluteIdx = scrollStart + localIdx;
					const isSelected = absoluteIdx === selectedIndex;
					const isDue = isPast(parseISO(r.snoozedUntil ?? r.remindAt));
					const timeStr = formatReminderTime(r);
					const titleColor =
						isSelected && focused
							? "cyan"
							: isSelected
								? "blueBright"
								: undefined;

					return (
						<Box key={r.id}>
							<Box width={2}>
								<Text color={isSelected && focused ? "cyan" : undefined}>
									{isSelected ? "❯" : " "}
								</Text>
							</Box>
							<Box width={timeWidth}>
								<Text
									color={
										isDue ? "red" : isSelected && focused ? "cyan" : undefined
									}
									bold={isSelected && focused}
								>
									{timeStr}
								</Text>
							</Box>
							<Box width={titleWidth}>
								<Text color={titleColor} bold={isSelected && focused}>
									{r.taskTitle.length > titleWidth
										? r.taskTitle.slice(0, titleWidth - 1) + "…"
										: r.taskTitle}
								</Text>
							</Box>
						</Box>
					);
				})
			)}
		</Box>
	);
};
