import { Box, Text, useStdout } from "ink";

import { toDisplaySegments } from "../lib/task-links";
import { getModalFields, type ModalMode } from "./modal-field-defs";

type CreateTaskModalProps = {
	mode?: ModalMode;
	activeFieldIndex: number;
	modalValues: Record<string, string>;
	inputCursorOffset: number;
	validationError: string | null;
	projectLabels: Record<string, string>;
};

const LABEL_WIDTH = 14;

function renderFieldValue(
	fieldKey: string,
	value: string,
	isActive: boolean,
	cursorOffset: number,
	projectLabels: Record<string, string>,
): React.ReactElement {
	if (fieldKey === "priority" && value) {
		const labels: Record<string, string> = {
			"1": "P1 – Urgent",
			"2": "P2 – High",
			"3": "P3 – Normal",
			"4": "P4 – Low",
		};
		return <Text color={isActive ? "cyan" : undefined}>{labels[value] ?? value}</Text>;
	}
	if (fieldKey === "project" && value) {
		const label = projectLabels[value];
		return <Text color={isActive ? "cyan" : undefined}>{label ?? value}</Text>;
	}
	if (fieldKey === "recurrence" && value && value !== "none") {
		const labels: Record<string, string> = {
			daily: "Daily",
			weekly: "Weekly",
			monthly: "Monthly",
			yearly: "Yearly",
			every_weekday: "Every weekday",
		};
		return <Text color={isActive ? "cyan" : undefined}>{labels[value] ?? value}</Text>;
	}

	if (!isActive) {
		if (fieldKey === "title" && value) {
			const segments = toDisplaySegments(value);
			const hasLinks = segments.some((s) => s.type === "link");
			if (hasLinks) {
				return (
					<Text>
						{segments.map((seg, i) =>
							seg.type === "text" ? (
								<Text key={i}>{seg.text}</Text>
							) : (
								<Text key={i} color="blue" bold>
									[{seg.displayLabel}]
								</Text>
							),
						)}
					</Text>
				);
			}
		}
		return <Text dimColor={!value}>{value || "—"}</Text>;
	}

	// Active text field: render with cursor
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

export const CreateTaskModal = ({
	mode = "createTaskModal",
	activeFieldIndex,
	modalValues,
	inputCursorOffset,
	validationError,
	projectLabels,
}: CreateTaskModalProps) => {
	const { stdout } = useStdout();
	const terminalWidth = stdout?.columns ?? 120;
	const terminalHeight = stdout?.rows ?? 24;
	const width = Math.min(68, terminalWidth - 4);
	const fields = getModalFields(mode);
	const title = mode === "editTaskModal" ? "Edit Task" : "New Task";

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
						{title}
					</Text>
					<Text dimColor>Esc to cancel</Text>
				</Box>

				{fields.map((field, i) => {
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
								{renderFieldValue(field.key, value, isActive, inputCursorOffset, projectLabels)}
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
