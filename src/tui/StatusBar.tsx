import { differenceInMinutes, format } from "date-fns";
import { Box, Text } from "ink";

import type { StatusMessageTone } from "./StatusMessage";
import type { ToastMessage } from "./ToastStack";

type SyncState = {
	syncing: boolean;
	lastSyncAt: string | null;
	error: string | null;
};

type StatusBarProps = {
	isInputMode: boolean;
	statusText: string;
	errorText: string | null;
	terminalWidth: number;
	syncEnabled?: boolean;
	syncState?: SyncState;
	activeToast?: ToastMessage | null;
};

const TONE_PREFIX: Record<StatusMessageTone, string> = {
	info: "ℹ",
	success: "✓",
	warning: "!",
	error: "✗",
};

function buildSyncIndicator(syncEnabled: boolean, syncState: SyncState): string {
	if (!syncEnabled) return "";
	if (syncState.error) return " ⚡sync";
	if (syncState.syncing) return " ↻";
	if (syncState.lastSyncAt) {
		const mins = differenceInMinutes(new Date(), new Date(syncState.lastSyncAt));
		const timeStr = mins < 1 ? "now" : mins < 60 ? `${mins}m` : format(new Date(syncState.lastSyncAt), "HH:mm");
		return ` ↑↓ ${timeStr}`;
	}
	return " ↑↓";
}

export const StatusBar = ({
	statusText,
	errorText,
	terminalWidth,
	syncEnabled = false,
	syncState = { syncing: false, lastSyncAt: null, error: null },
	activeToast = null,
}: StatusBarProps) => {
	const dateStr = format(new Date(), "MMM dd");
	const syncIndicator = buildSyncIndicator(syncEnabled, syncState);
	const rightText = `${syncIndicator} ${dateStr}`;
	const leftText = activeToast
		? `${TONE_PREFIX[activeToast.tone]} ${activeToast.text}`
		: (errorText ?? statusText);
	const rawLine = ` ${leftText}`;
	const minWidth = Math.max(terminalWidth, rightText.length + 3);
	const spaceForLeft = Math.max(minWidth - rightText.length, 1);
	const clippedLeft = rawLine.length > spaceForLeft
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
