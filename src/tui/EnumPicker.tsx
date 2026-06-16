import { Box, Text } from "ink";

export type EnumPickerItem = {
	label: string;
	value: string;
};

type EnumPickerProps = {
	title: string;
	items: EnumPickerItem[];
	selectedIndex: number;
};

export const EnumPicker = ({
	title,
	items,
	selectedIndex,
}: EnumPickerProps) => {
	if (items.length === 0) return null;

	return (
		<Box paddingX={1} flexDirection="column">
			<Box marginBottom={0}>
				<Text color="magentaBright" bold>
					{title}
				</Text>
				<Text dimColor> j/k choose Enter select Esc cancel</Text>
			</Box>
			{items.map((item, i) => {
				const isSelected = i === selectedIndex;
				return (
					<Box key={`${i}-${item.value}`}>
						<Box width={2}>
							<Text color={isSelected ? "cyan" : undefined}>
								{isSelected ? "❯" : " "}
							</Text>
						</Box>
						<Text color={isSelected ? "cyan" : undefined} bold={isSelected}>
							{item.label}
						</Text>
					</Box>
				);
			})}
		</Box>
	);
};
