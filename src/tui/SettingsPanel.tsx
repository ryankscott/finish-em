import { format, parseISO } from "date-fns";
import { Box, Text } from "ink";

import type { AppSettings } from "../server/types";

const DEFAULT_LMSTUDIO_BASE_URL = "http://localhost:1234/v1";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL_BY_PROVIDER = {
	gemini: "gemini-2.5-flash",
	openai: "gpt-4o-mini",
	lmstudio: "gpt-4o-mini",
} as const;

export type SettingsField =
	| "timezone"
	| "aiProvider"
	| "aiBaseUrl"
	| "aiModel"
	| "aiApiKey";

export type SettingsRow = {
	field: SettingsField;
	label: string;
	value: string;
	hint: string;
};

export const buildSettingsRows = (
	settings: AppSettings | null,
): SettingsRow[] => {
	const provider = settings?.aiProvider ?? "gemini";
	const providerLabel =
		provider === "gemini"
			? "Gemini"
			: provider === "openai"
				? "OpenAI"
				: "LM Studio (local)";
	const defaultBaseUrl =
		provider === "lmstudio"
			? DEFAULT_LMSTUDIO_BASE_URL
			: provider === "openai"
				? DEFAULT_OPENAI_BASE_URL
				: DEFAULT_GEMINI_BASE_URL;
	const baseUrl = settings?.aiBaseUrl ?? defaultBaseUrl;
	const model = settings?.aiModel ?? DEFAULT_MODEL_BY_PROVIDER[provider];
	const keyStatus =
		provider === "lmstudio"
			? "Not required"
			: settings?.hasAiApiKey
				? (settings.aiApiKeyMasked ?? "Configured")
				: "Not configured";

	return [
		{
			field: "timezone",
			label: "Timezone",
			value: settings?.timezone ?? "Loading...",
			hint: "Press Enter or e to edit",
		},
		{
			field: "aiProvider",
			label: "Assistant provider",
			value: providerLabel,
			hint: "Use /provider gemini|openai|lmstudio",
		},
		{
			field: "aiBaseUrl",
			label: "Assistant base URL",
			value: baseUrl,
			hint: "Press Enter or e to edit; empty clears",
		},
		{
			field: "aiModel",
			label: "Assistant model",
			value: model,
			hint: "Press Enter or e to edit; empty clears",
		},
		{
			field: "aiApiKey",
			label: "Assistant API key",
			value: keyStatus,
			hint: "Press Enter or e to set; x clears",
		},
	];
};

type SettingsPanelProps = {
	settings: AppSettings | null;
	rows: SettingsRow[];
	selectedIndex: number;
	focused: boolean;
};

export const SettingsPanel = ({
	settings,
	rows,
	selectedIndex,
	focused,
}: SettingsPanelProps) => {
	const borderColor = focused ? "magentaBright" : "gray";
	const selectedRow = rows[selectedIndex] ?? rows[0];
	const updatedAtLabel = (() => {
		if (!settings) {
			return "Loading settings...";
		}
		try {
			return `Updated ${format(parseISO(settings.updatedAt), "MMM dd, yyyy HH:mm")}`;
		} catch {
			return `Updated ${settings.updatedAt}`;
		}
	})();

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
					Settings
				</Text>
			</Box>

			{rows.map((row, index) => {
				const isSelected = index === selectedIndex;
				const labelColor =
					isSelected && focused
						? "cyan"
						: isSelected
							? "blueBright"
							: undefined;
				const valueColor = isSelected && focused ? "cyan" : undefined;

				return (
					<Box key={row.field} flexDirection="column" marginBottom={1}>
						<Text bold={isSelected && focused} color={labelColor}>
							{isSelected ? "❯ " : "  "}
							{row.label}
						</Text>
						<Box paddingLeft={3}>
							<Text color={valueColor}>{row.value}</Text>
						</Box>
					</Box>
				);
			})}

			<Box marginTop={1} flexDirection="column">
				<Text dimColor>{selectedRow?.hint ?? "Press Enter or e to edit"}</Text>
				<Text dimColor>{updatedAtLabel}</Text>
			</Box>
		</Box>
	);
};
