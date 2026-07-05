import { format } from "date-fns";
import { Box, Text } from "ink";

import type { StatusMessageTone } from "./StatusMessage";
import type { ToastMessage } from "./ToastStack";

type StatusBarProps = {
	isInputMode: boolean;
	statusText: string;
	errorText: string | null;
	terminalWidth: number;
	activeToast?: ToastMessage | null;
};

const TONE_PREFIX: Record<StatusMessageTone, string> = {
	info: "ℹ",
	success: "✓",
	warning: "!",
	error: "✗",
};

export const StatusBar = ({
	statusText,
	errorText,
	terminalWidth,
	activeToast = null,
}: StatusBarProps) => {
	const dateStr = format(new Date(), "MMM dd");
	const rightText = `${dateStr}`;
	const leftText = activeToast
		? `${TONE_PREFIX[activeToast.tone]} ${activeToast.text}`
		: (errorText ?? statusText);
	const rawLine = ` ${leftText}`;
	const minWidth = Math.max(terminalWidth, rightText.length + 3);
	const spaceForLeft = Math.max(minWidth - rightText.length, 1);
	const clippedLeft =
		rawLine.length > spaceForLeft
			? `${rawLine.slice(0, Math.max(spaceForLeft - 1, 0))}…`
			: rawLine;
	const line = `${clippedLeft.padEnd(spaceForLeft, " ")}${rightText}`;

	return (
		<Box>
			<Text color="black" backgroundColor="magentaBright">
				{line}
			</Text>
		</Box>
	);
};
