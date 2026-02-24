import { format } from "date-fns";
import { Box, Text } from "ink";

type StatusBarProps = {
	isInputMode: boolean;
	statusText: string;
	errorText: string | null;
	terminalWidth: number;
};

export const StatusBar = ({
	statusText,
	errorText,
	terminalWidth,
}: StatusBarProps) => {
	const dateStr = format(new Date(), "MMM dd");
	const leftText = errorText ?? statusText;
	const rawLine = ` ${leftText}`;
	const minWidth = Math.max(terminalWidth, dateStr.length + 3);
	const spaceForLeft = Math.max(minWidth - dateStr.length - 1, 1);
	const clippedLeft = rawLine.length > spaceForLeft
		? `${rawLine.slice(0, Math.max(spaceForLeft - 1, 0))}…`
		: rawLine;
	const line = `${clippedLeft.padEnd(spaceForLeft, " ")}${dateStr}`;

	return (
		<Box>
			<Text color="black" backgroundColor="magentaBright">
				{line}
			</Text>
		</Box>
	);
};
