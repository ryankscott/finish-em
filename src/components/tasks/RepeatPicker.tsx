import { format } from "date-fns";
import { Repeat } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RecurrencePreset } from "@/server/types";

interface RepeatPickerProps {
	selectedDate: Date | null;
	currentPreset: RecurrencePreset;
	currentRRule: string | null;
	onPresetChange: (preset: RecurrencePreset, rrule: string | null) => void;
	onCustomClick: () => void;
}

function formatWeekday(date: Date): string {
	return format(date, "EEEE");
}

function formatMonthDay(date: Date): string {
	return format(date, "do");
}

function formatFullDate(date: Date): string {
	return format(date, "MMMM d");
}

export function RepeatPicker({
	selectedDate,
	currentPreset,
	currentRRule,
	onPresetChange,
	onCustomClick,
}: RepeatPickerProps) {
	const referenceDate = selectedDate ?? new Date();
	const weekday = formatWeekday(referenceDate);
	const monthDay = formatMonthDay(referenceDate);
	const fullDate = formatFullDate(referenceDate);

	const hasRepeat = currentPreset !== null || currentRRule !== null;

	const options = [
		{
			label: "Every day",
			preset: "daily" as RecurrencePreset,
			rrule: null,
		},
		{
			label: `Every week on ${weekday}`,
			preset: "weekly" as RecurrencePreset,
			rrule: null,
		},
		{
			label: "Every weekday (Mon-Fri)",
			preset: "every_weekday" as RecurrencePreset,
			rrule: null,
		},
		{
			label: `Every month on the ${monthDay}`,
			preset: "monthly" as RecurrencePreset,
			rrule: null,
		},
		{
			label: `Every year on ${fullDate}`,
			preset: "yearly" as RecurrencePreset,
			rrule: null,
		},
	];

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={cn(
						"justify-start gap-2",
						hasRepeat && "text-primary",
					)}
				>
					<Repeat className="h-4 w-4" />
					Repeat
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-64 p-1" align="start">
				<div className="flex flex-col">
					{options.map((option) => (
						<Button
							key={option.preset}
							type="button"
							variant="ghost"
							onClick={() => onPresetChange(option.preset, option.rrule)}
							className={cn(
								"h-auto justify-start px-3 py-2 text-left text-sm hover:bg-accent rounded-sm transition-colors",
								currentPreset === option.preset &&
									!currentRRule &&
									"bg-accent",
							)}
						>
							{option.label}
						</Button>
					))}
					<div className="h-px bg-border my-1" />
					<Button
						type="button"
						variant="ghost"
						onClick={onCustomClick}
						className="h-auto justify-start px-3 py-2 text-left text-sm hover:bg-accent rounded-sm transition-colors"
					>
						Custom...
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
