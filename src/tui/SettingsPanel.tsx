import { format, parseISO } from "date-fns";
import { Box, Text } from "ink";

import type { AppSettings } from "../server/types";

export type SettingsField = "timezone";

export type SettingsRow = {
	field: SettingsField;
	label: string;
	value: string;
	hint: string;
};

export const buildSettingsRows = (
	settings: AppSettings | null,
): SettingsRow[] => {
	return [
		{
			field: "timezone",
			label: "Timezone",
			value: settings?.timezone ?? "Loading...",
			hint: "Press Enter or e to edit",
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
