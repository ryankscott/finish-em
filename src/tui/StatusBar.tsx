import { format } from "date-fns";
import { Box, Text } from "ink";

type StatusBarProps = {
	isInputMode: boolean;
	statusText: string;
	errorText: string | null;
};

export const StatusBar = ({
	statusText,
	errorText,
}: StatusBarProps) => {
	const dateStr = format(new Date(), "MMM dd");

	return (
		<Box flexDirection="row" justifyContent="space-between">
			<Box>
				{errorText ? (
					<Text color="red"> {errorText}</Text>
				) : (
					<Text dimColor> {statusText}</Text>
				)}
			</Box>
			<Box>
				<Text dimColor>{dateStr}</Text>
			</Box>
		</Box>
	);
};
