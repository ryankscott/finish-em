import { Box, Text, useStdout } from "ink";

import { PROJECT_CREATE_FIELDS } from "./modal-field-defs";

type CreateProjectModalProps = {
	activeFieldIndex: number;
	modalValues: Record<string, string>;
	inputCursorOffset: number;
	validationError: string | null;
};

const LABEL_WIDTH = 16;

function renderActiveTextValue(value: string, cursorOffset: number): React.ReactElement {
	const before = value.slice(0, cursorOffset);
	const cursor = value[cursorOffset] ?? " ";
	const after = value.slice(cursorOffset + 1);
	return (
		<Text color="cyan">
			{before}
			<Text inverse>{cursor}</Text>
			{after}
		</Text>
	);
}

export const CreateProjectModal = ({
	activeFieldIndex,
	modalValues,
	inputCursorOffset,
	validationError,
}: CreateProjectModalProps) => {
	const { stdout } = useStdout();
	const terminalWidth = stdout?.columns ?? 120;
	const terminalHeight = stdout?.rows ?? 24;
	const width = Math.min(68, terminalWidth - 4);

	return (
		<Box
			backgroundColor="black"
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
						New Project
					</Text>
					<Text dimColor>Esc to cancel</Text>
				</Box>

				{PROJECT_CREATE_FIELDS.map((field, i) => {
					const isActive = i === activeFieldIndex;
					const value = modalValues[field.key] ?? "";

					if (field.type === "submit") {
						return (
							<Box key={field.key} marginTop={1}>
								<Box width={2}>
									<Text color={isActive ? "greenBright" : undefined}>
										{isActive ? "❯" : " "}
									</Text>
								</Box>
								<Box
									borderStyle="round"
									borderColor={isActive ? "greenBright" : "gray"}
									paddingX={1}
								>
									<Text color={isActive ? "greenBright" : "gray"} bold={isActive}>
										{field.label}
									</Text>
								</Box>
							</Box>
						);
					}

					return (
						<Box key={field.key}>
							<Box width={2}>
								<Text color={isActive ? "cyan" : undefined}>
									{isActive ? "❯" : " "}
								</Text>
							</Box>
							<Box width={LABEL_WIDTH}>
								<Text color={isActive ? "cyan" : undefined} bold={isActive}>
									{field.label}
								</Text>
							</Box>
							<Box flexGrow={1}>
								{isActive ? (
									renderActiveTextValue(value, inputCursorOffset)
								) : (
									<Text dimColor={!value}>{value || "—"}</Text>
								)}
							</Box>
							{field.hint && !isActive && (
								<Text dimColor>  {field.hint}</Text>
							)}
						</Box>
					);
				})}

				{validationError && (
					<Box marginTop={1}>
						<Text color="red">⚠ {validationError}</Text>
					</Box>
				)}

				<Box marginTop={1}>
					<Text dimColor>j/k navigate · Enter confirm/advance · E calendar on dates · Esc cancel</Text>
				</Box>
			</Box>
		</Box>
	);
};
