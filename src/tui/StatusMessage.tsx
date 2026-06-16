import { Box, Text } from "ink";

export type StatusMessageTone = "info" | "success" | "warning" | "error";

type StatusMessageProps = {
	tone?: StatusMessageTone;
	message: string;
};

const toneStyles: Record<
	StatusMessageTone,
	{ label: string; color: "blue" | "green" | "yellow" | "red" }
> = {
	info: { label: "INFO", color: "blue" },
	success: { label: "OK", color: "green" },
	warning: { label: "WARN", color: "yellow" },
	error: { label: "ERR", color: "red" },
};

export const StatusMessage = ({
	tone = "info",
	message,
}: StatusMessageProps) => {
	const style = toneStyles[tone];

	return (
		<Box>
			<Text color={style.color} bold>
				[{style.label}]
			</Text>
			<Text> {message}</Text>
		</Box>
	);
};
