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
	return date.toLocaleDateString("en-US", { weekday: "long" });
}

function formatMonthDay(date: Date): string {
	const day = date.getDate();
	const suffix =
		day === 1 || day === 21 || day === 31
			? "st"
			: day === 2 || day === 22
				? "nd"
				: day === 3 || day === 23
					? "rd"
					: "th";
	return `${day}${suffix}`;
}

function formatFullDate(date: Date): string {
	return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
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
						<button
							key={option.preset}
							type="button"
							onClick={() => onPresetChange(option.preset, option.rrule)}
							className={cn(
								"px-3 py-2 text-left text-sm hover:bg-accent rounded-sm transition-colors",
								currentPreset === option.preset &&
									!currentRRule &&
									"bg-accent",
							)}
						>
							{option.label}
						</button>
					))}
					<div className="h-px bg-border my-1" />
					<button
						type="button"
						onClick={onCustomClick}
						className="px-3 py-2 text-left text-sm hover:bg-accent rounded-sm transition-colors"
					>
						Custom...
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
