import { Box, Text, useStdout } from "ink";
import type React from "react";

import {
	getModalFields,
	type ModalField,
	type ModalMode,
} from "./modal-field-defs";

type CreateProjectModalProps = {
	mode?: ModalMode;
	activeFieldIndex: number;
	modalValues: Record<string, string>;
	inputCursorOffset: number;
	validationError: string | null;
};

const LABEL_WIDTH = 20;

const DISCOVERY_KEYS = new Set([
	"jiraDiscovery",
	"jiraDiscoveryStatus",
	"confluenceUrl",
]);
const INLINE_STATUS_KEYS = new Set([
	"jiraDiscoveryStatus",
	"jiraDeliveryStatus",
	"jiraDocsStatus",
	"jiraReleaseNoteStatus",
]);
const DELIVERY_KEYS = new Set([
	"jiraDelivery",
	"jiraDeliveryStatus",
	"jiraDocsUrl",
	"jiraDocsStatus",
	"jiraReleaseNoteUrl",
	"jiraReleaseNoteStatus",
	"teamsReleaseNoteUrl",
]);

function sectionOf(key: string): "discovery" | "delivery" | null {
	if (DISCOVERY_KEYS.has(key)) return "discovery";
	if (DELIVERY_KEYS.has(key)) return "delivery";
	return null;
}

function shortLabel(label: string): string {
	if (label.startsWith("Discovery: ")) return label.slice("Discovery: ".length);
	if (label.startsWith("Delivery: ")) return label.slice("Delivery: ".length);
	return label;
}

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
	todo: { label: "Todo", color: "yellow" },
	in_progress: { label: "In Progress", color: "cyan" },
	done: { label: "Done", color: "green" },
};

function renderActiveTextValue(
	value: string,
	cursorOffset: number,
): React.ReactElement {
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

const STATUS_OPTIONS = [
	{ label: "—", value: "" },
	{ label: "Todo", value: "todo" },
	{ label: "In Progress", value: "in_progress" },
	{ label: "Done", value: "done" },
];

function renderFieldValue(
	field: ModalField,
	value: string,
	isActive: boolean,
	cursorOffset: number,
): React.ReactElement {
	if (field.type === "enum" && INLINE_STATUS_KEYS.has(field.key)) {
		if (isActive) {
			return (
				<Box gap={1}>
					{STATUS_OPTIONS.map((opt) => {
						const isSel = value === opt.value;
						const color = STATUS_DISPLAY[opt.value]?.color ?? "cyan";
						return (
							<Text
								key={opt.value}
								bold={isSel}
								color={isSel ? color : undefined}
								dimColor={!isSel}
							>
								{isSel ? `[${opt.label}]` : opt.label}
							</Text>
						);
					})}
				</Box>
			);
		}
		const status = STATUS_DISPLAY[value];
		if (status) {
			return (
				<Text bold color={status.color}>
					{status.label}
				</Text>
			);
		}
		return <Text dimColor>—</Text>;
	}
	if (field.type === "enum") {
		if (isActive) {
			return (
				<Text color="cyan" dimColor>
					↵ pick
				</Text>
			);
		}
		const status = STATUS_DISPLAY[value];
		if (status) {
			return (
				<Text bold color={status.color}>
					{status.label}
				</Text>
			);
		}
		return <Text dimColor={!value}>{value || "—"}</Text>;
	}
	if (isActive) {
		return renderActiveTextValue(value, cursorOffset);
	}
	return <Text dimColor={!value}>{value || "—"}</Text>;
}

export const CreateProjectModal = ({
	mode = "createProjectModal",
	activeFieldIndex,
	modalValues,
	inputCursorOffset,
	validationError,
}: CreateProjectModalProps) => {
	const { stdout } = useStdout();
	const terminalWidth = stdout?.columns ?? 120;
	const terminalHeight = stdout?.rows ?? 24;
	const width = Math.min(72, terminalWidth - 4);
	const title = mode === "editProjectModal" ? "Edit Project" : "New Project";
	const fields = getModalFields(mode);

	let lastSection: string | null = "none";

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
					const section = sectionOf(field.key);
					const showSectionHeader = section !== null && section !== lastSection;
					if (section !== null) lastSection = section;

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
									<Text
										color={isActive ? "greenBright" : "gray"}
										bold={isActive}
									>
										{field.label}
									</Text>
								</Box>
							</Box>
						);
					}

					const inSection = section !== null;
					const label = inSection ? shortLabel(field.label) : field.label;

					return (
						<Box key={field.key} flexDirection="column">
							{showSectionHeader && (
								<Box marginTop={1}>
									<Text bold color="magentaBright">
										{section === "discovery" ? "Discovery" : "Delivery"}
									</Text>
								</Box>
							)}
							<Box>
								<Box width={2}>
									<Text color={isActive ? "cyan" : undefined}>
										{isActive ? "❯" : " "}
									</Text>
								</Box>
								{inSection && <Text dimColor>{"  "}</Text>}
								<Box width={LABEL_WIDTH}>
									<Text color={isActive ? "cyan" : undefined} bold={isActive}>
										{label}
									</Text>
								</Box>
								<Box flexGrow={1}>
									{renderFieldValue(field, value, isActive, inputCursorOffset)}
								</Box>
								{field.hint && !isActive && <Text dimColor> {field.hint}</Text>}
							</Box>
						</Box>
					);
				})}

				{validationError && (
					<Box marginTop={1}>
						<Text color="red">⚠ {validationError}</Text>
					</Box>
				)}

				<Box marginTop={1}>
					<Text dimColor>
						j/k navigate · Enter advance · h/l or ◀▶ cycle status · E calendar ·
						Esc cancel
					</Text>
				</Box>
			</Box>
		</Box>
	);
};
