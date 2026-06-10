import { format, getDay, getDaysInMonth, startOfMonth } from "date-fns";
import { Box, Text } from "ink";

const WEEKDAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type CalendarPickerProps = {
	cursorDate: Date;
	visibleMonth: Date;
};

export const CalendarPicker = ({
	cursorDate,
	visibleMonth,
}: CalendarPickerProps) => {
	const monthLabel = format(visibleMonth, "MMMM yyyy");
	const firstDayOfWeek = getDay(startOfMonth(visibleMonth)); // 0=Sun
	const daysInMonth = getDaysInMonth(visibleMonth);

	// Build a flat array of cells: nulls for leading/trailing padding, day numbers for real days
	const cells: (number | null)[] = [
		...Array.from({ length: firstDayOfWeek }, () => null),
		...Array.from({ length: daysInMonth }, (_, i) => i + 1),
	];
	// Pad to complete last row
	while (cells.length % 7 !== 0) cells.push(null);

	const rows: (number | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) {
		rows.push(cells.slice(i, i + 7));
	}

	const cursorYear = cursorDate.getFullYear();
	const cursorMonth = cursorDate.getMonth();
	const cursorDay = cursorDate.getDate();
	const monthYear = visibleMonth.getFullYear();
	const monthMonth = visibleMonth.getMonth();

	return (
		<Box paddingX={1} flexDirection="column">
			<Box marginBottom={0}>
				<Text color="magentaBright" bold>
					Pick a date:{" "}
				</Text>
				<Text dimColor>
					arrows move [/] month Enter select c clear Esc cancel
				</Text>
			</Box>

			{/* Month header */}
			<Box justifyContent="center" marginY={0}>
				<Text bold color="cyan">
					{monthLabel}
				</Text>
			</Box>

			{/* Weekday header */}
			<Box>
				{WEEKDAY_HEADERS.map((h) => (
					<Box key={h} width={4}>
						<Text dimColor bold>
							{h}
						</Text>
					</Box>
				))}
			</Box>

			{/* Day rows */}
			{rows.map((row, rowIdx) => (
				<Box key={`row-${rowIdx}`}>
					{row.map((day, colIdx) => {
						if (day === null) {
							return (
								<Box key={`empty-${rowIdx}-${colIdx}`} width={4}>
									<Text> </Text>
								</Box>
							);
						}
						const isCursor =
							cursorYear === monthYear &&
							cursorMonth === monthMonth &&
							cursorDay === day;
						return (
							<Box key={`day-${rowIdx}-${colIdx}`} width={4}>
								<Text
									inverse={isCursor}
									bold={isCursor}
									color={isCursor ? "cyan" : undefined}
								>
									{String(day).padStart(2, " ")}
								</Text>
							</Box>
						);
					})}
				</Box>
			))}
		</Box>
	);
};
