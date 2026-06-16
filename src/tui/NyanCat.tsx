import { Box, Text } from "ink";

const MILESTONE = 10;

const RAINBOW_COLORS = [
	"red",
	"#FF7F00",
	"yellow",
	"green",
	"#4169E1",
	"#8B00FF",
] as const;

type NyanCatProps = {
	completedToday: number;
	width: number;
};

export const NyanCat = ({ completedToday, width }: NyanCatProps) => {
	const barWidth = Math.max(width - 2, 10);
	const fillPercent = Math.min(completedToday / MILESTONE, 1);
	const filledCells = Math.round(fillPercent * barWidth);
	const emptyCells = barWidth - filledCells;

	const label =
		completedToday === 0
			? "Complete a task to summon the cat"
			: completedToday === 1
				? "1 task done today"
				: `${completedToday} tasks done today`;

	// Build rainbow trail
	const rainbowChars: Array<{ char: string; color: string }> = [];
	for (let i = 0; i < filledCells; i++) {
		const color = RAINBOW_COLORS[i % RAINBOW_COLORS.length];
		rainbowChars.push({ char: "━", color });
	}

	return (
		<Box flexDirection="row" paddingX={1}>
			<Text dimColor>[</Text>
			{rainbowChars.map((rc, i) => (
				<Text key={i} color={rc.color}>
					{rc.char}
				</Text>
			))}
			{completedToday > 0 && <Text>{"=^..^="}</Text>}
			<Text dimColor>{"░".repeat(emptyCells)}</Text>
			<Text dimColor>]</Text>
			<Text dimColor> {label}</Text>
		</Box>
	);
};
