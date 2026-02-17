import { useState } from "react";
import { format, addDays, nextMonday, nextSaturday, parseISO, isValid, set, isSaturday } from "date-fns";
import { Calendar as CalendarIcon, Sun, Home, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RepeatPicker } from "./RepeatPicker";
import { CustomRepeatModal } from "./CustomRepeatModal";
import type { RecurrencePreset } from "@/server/types";

interface TaskDatePickerProps {
	value: string | null;
	onChange: (value: string | null) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	showRepeat?: boolean;
	currentPreset?: RecurrencePreset;
	currentRRule?: string | null;
	onRecurrenceChange?: (preset: RecurrencePreset, rrule: string | null) => void;
  icon?: React.ReactNode;
}

function isoStringToDate(value: string | null): Date | undefined {
	if (!value) {
		return undefined;
	}

	const date = parseISO(value);
	if (!isValid(date)) {
		return undefined;
	}

	return date;
}

function dateToIsoString(value: Date | undefined, time?: { hour: number; minute: number }): string | null {
	if (!value) {
		return null;
	}

	const t = time ?? { hour: 9, minute: 0 };
	return set(value, { hours: t.hour, minutes: t.minute, seconds: 0, milliseconds: 0 }).toISOString();
}

function parseSimpleDate(input: string): Date | null {
	const lower = input.toLowerCase().trim();
	const now = new Date();

	if (lower === "today") {
		return now;
	}

	if (lower === "tomorrow") {
		return addDays(now, 1);
	}

	const parsed = parseISO(input);
	if (isValid(parsed)) {
		return parsed;
	}

	return null;
}

function getNextWeekMonday(): Date {
	return nextMonday(new Date());
}

function getThisWeekendSaturday(): Date {
	const now = new Date();
	if (isSaturday(now)) {
		return now;
	}
	return nextSaturday(now);
}

export function TaskDatePicker({
	value,
	onChange,
	placeholder = "Pick a date",
	className,
	disabled = false,
	showRepeat = false,
	currentPreset = null,
	currentRRule = null,
	onRecurrenceChange,
  icon,
}: TaskDatePickerProps) {
	const selectedDate = isoStringToDate(value);
	const [inputValue, setInputValue] = useState("");
	const [customModalOpen, setCustomModalOpen] = useState(false);
	const [timePickerOpen, setTimePickerOpen] = useState(false);

	// Extract time from current value
	const currentTime = value ? parseISO(value) : null;
	const [hour, setHour] = useState(currentTime?.getHours() ?? 9);
	const [minute, setMinute] = useState(currentTime?.getMinutes() ?? 0);

	const handleDateSelect = (date: Date | undefined) => {
		void onChange(dateToIsoString(date, { hour, minute }));
		setInputValue("");
	};

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			const parsed = parseSimpleDate(inputValue);
			if (parsed) {
				handleDateSelect(parsed);
			}
		}
	};

	const handleQuickSelect = (date: Date) => {
		handleDateSelect(date);
	};

	const handleTimeChange = () => {
		if (selectedDate) {
			void onChange(dateToIsoString(selectedDate, { hour, minute }));
		}
		setTimePickerOpen(false);
	};

	const today = new Date();
	const tomorrow = addDays(today, 1);
	const thisWeekend = getThisWeekendSaturday();
	const nextWeek = getNextWeekMonday();

	const formatDayAbbr = (date: Date) => format(date, "EEE");
	const formatDateShort = (date: Date) => format(date, "MMM d");

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						disabled={disabled}
						data-empty={!selectedDate}
						className={cn(
							"justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
							className ?? "w-70",
						)}
					>
					{icon ?? <CalendarIcon className="mr-2 h-4 w-4" />}
						{selectedDate ? format(selectedDate, "dd MMM") : <span>{placeholder}</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<div className="flex flex-col">
						{/* Text input */}
						<div className="p-3 border-b">
							<Input
								placeholder="Type a date"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyDown={handleInputKeyDown}
								className="h-9"
							/>
						</div>

						{/* Quick select options */}
						<div className="flex flex-col p-2 border-b gap-1">
							<Button
								type="button"
								variant="ghost"
								onClick={() => handleQuickSelect(today)}
								className="h-auto w-full flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors"
							>
								<div className="flex items-center gap-3">
									<CalendarIcon className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">Today</span>
								</div>
								<span className="text-sm text-muted-foreground">{formatDayAbbr(today)}</span>
							</Button>
							<Button
								type="button"
								variant="ghost"
								onClick={() => handleQuickSelect(tomorrow)}
								className="h-auto w-full flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors"
							>
								<div className="flex items-center gap-3">
									<Sun className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">Tomorrow</span>
								</div>
								<span className="text-sm text-muted-foreground">{formatDayAbbr(tomorrow)}</span>
							</Button>
							<Button
								type="button"
								variant="ghost"
								onClick={() => handleQuickSelect(thisWeekend)}
								className="h-auto w-full flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors"
							>
								<div className="flex items-center gap-3">
									<Home className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">This weekend</span>
								</div>
								<span className="text-sm text-muted-foreground">{formatDayAbbr(thisWeekend)}</span>
							</Button>
							<Button
								type="button"
								variant="ghost"
								onClick={() => handleQuickSelect(nextWeek)}
								className="h-auto w-full flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors"
							>
								<div className="flex items-center gap-3">
									<ArrowRight className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">Next week</span>
								</div>
								<span className="text-sm text-muted-foreground">
									{formatDayAbbr(nextWeek)} {formatDateShort(nextWeek)}
								</span>
							</Button>
						</div>

						{/* Calendar */}
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={handleDateSelect}
							initialFocus
						/>

						{/* Bottom actions */}
						<div className="flex items-center gap-2 p-2 border-t">
							<Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
								<PopoverTrigger asChild>
									<Button variant="ghost" size="sm" className="gap-2">
										<Clock className="h-4 w-4" />
										Time
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-3" align="start">
									<div className="space-y-2">
										<div className="text-sm font-medium">Set time</div>
										<div className="flex gap-2">
											<Input
												type="number"
												min="0"
												max="23"
												value={hour}
												onChange={(e) => setHour(Number.parseInt(e.target.value) || 0)}
												className="w-16"
												placeholder="HH"
											/>
											<span className="flex items-center">:</span>
											<Input
												type="number"
												min="0"
												max="59"
												value={minute}
												onChange={(e) => setMinute(Number.parseInt(e.target.value) || 0)}
												className="w-16"
												placeholder="MM"
											/>
										</div>
										<Button size="sm" onClick={handleTimeChange} className="w-full">
											Set
										</Button>
									</div>
								</PopoverContent>
							</Popover>

							{showRepeat && onRecurrenceChange && (
								<RepeatPicker
									selectedDate={selectedDate ?? null}
									currentPreset={currentPreset}
									currentRRule={currentRRule}
									onPresetChange={onRecurrenceChange}
									onCustomClick={() => setCustomModalOpen(true)}
								/>
							)}
						</div>
					</div>
				</PopoverContent>
			</Popover>

			{showRepeat && onRecurrenceChange && (
				<CustomRepeatModal
					open={customModalOpen}
					onOpenChange={setCustomModalOpen}
					onSave={(rrule) => {
						onRecurrenceChange(null, rrule);
					}}
				/>
			)}
		</>
	);
}
