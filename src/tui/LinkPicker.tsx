import { Box, Text } from "ink";

type Link = {
	url: string;
	displayLabel: string;
};

type LinkPickerProps = {
	links: Link[];
	selectedIndex: number;
};

export const LinkPicker = ({ links, selectedIndex }: LinkPickerProps) => {
	if (links.length === 0) return null;

	return (
		<Box paddingX={1} flexDirection="column">
			<Text color="magentaBright" bold>
				Open link ({selectedIndex + 1}/{links.length}):
			</Text>
			<Box>
				{links.map((link, i) => (
					<Text
						key={`${i}-${link.url}`}
						color={i === selectedIndex ? "cyan" : undefined}
						bold={i === selectedIndex}
					>
						{i > 0 ? "  " : ""}
						{i + 1}. [{link.displayLabel}]
					</Text>
				))}
				<Text dimColor> j/k choose Enter open Esc cancel</Text>
			</Box>
		</Box>
	);
};
