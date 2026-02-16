import { useState } from "react";
import { format } from "date-fns";
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
	showRepeat?: boolean;
	currentPreset?: RecurrencePreset;
	currentRRule?: string | null;
	onRecurrenceChange?: (preset: RecurrencePreset, rrule: string | null) => void;
}

function isoStringToDate(value: string | null): Date | undefined {
	if (!value) {
		return undefined;
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return undefined;
	}

	return date;
}

function dateToIsoString(value: Date | undefined, time?: { hour: number; minute: number }): string | null {
	if (!value) {
		return null;
	}

	const date = new Date(value);
	if (time) {
		date.setHours(time.hour, time.minute, 0, 0);
	} else {
		date.setHours(9, 0, 0, 0);
	}
	return date.toISOString();
}

function parseSimpleDate(input: string): Date | null {
	const lower = input.toLowerCase().trim();
	const now = new Date();

	if (lower === "today") {
		return now;
	}

	if (lower === "tomorrow") {
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow;
	}

	// Try to parse as a date
	const parsed = new Date(input);
	if (!Number.isNaN(parsed.getTime())) {
		return parsed;
	}

	return null;
}

function getNextWeekMonday(): Date {
	const now = new Date();
	const dayOfWeek = now.getDay();
	const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
	const nextMonday = new Date(now);
	nextMonday.setDate(now.getDate() + daysUntilNextMonday);
	return nextMonday;
}

function getThisWeekendSaturday(): Date {
	const now = new Date();
	const dayOfWeek = now.getDay();
	const daysUntilSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
	const saturday = new Date(now);
	saturday.setDate(now.getDate() + daysUntilSaturday);
	return saturday;
}

export function TaskDatePicker({
	value,
	onChange,
	placeholder = "Pick a date",
	className,
	showRepeat = false,
	currentPreset = null,
	currentRRule = null,
	onRecurrenceChange,
}: TaskDatePickerProps) {
	const selectedDate = isoStringToDate(value);
	const [inputValue, setInputValue] = useState("");
	const [customModalOpen, setCustomModalOpen] = useState(false);
	const [timePickerOpen, setTimePickerOpen] = useState(false);

	// Extract time from current value
	const currentTime = value ? new Date(value) : null;
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
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);
	const thisWeekend = getThisWeekendSaturday();
	const nextWeek = getNextWeekMonday();

	const formatDayAbbr = (date: Date) => {
		return date.toLocaleDateString("en-US", { weekday: "short" });
	};

	const formatDateShort = (date: Date) => {
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						data-empty={!selectedDate}
						className={cn(
							"justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
							className ?? "w-70",
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
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
							<button
								type="button"
								onClick={() => handleQuickSelect(today)}
								className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors"
							>
								<div className="flex items-center gap-3">
									<CalendarIcon className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">Today</span>
								</div>
								<span className="text-sm text-muted-foreground">{formatDayAbbr(today)}</span>
							</button>
							<button
								type="button"
								onClick={() => handleQuickSelect(tomorrow)}
								className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors"
							>
								<div className="flex items-center gap-3">
									<Sun className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">Tomorrow</span>
								</div>
								<span className="text-sm text-muted-foreground">{formatDayAbbr(tomorrow)}</span>
							</button>
							<button
								type="button"
								onClick={() => handleQuickSelect(thisWeekend)}
								className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors"
							>
								<div className="flex items-center gap-3">
									<Home className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">This weekend</span>
								</div>
								<span className="text-sm text-muted-foreground">{formatDayAbbr(thisWeekend)}</span>
							</button>
							<button
								type="button"
								onClick={() => handleQuickSelect(nextWeek)}
								className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors"
							>
								<div className="flex items-center gap-3">
									<ArrowRight className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">Next week</span>
								</div>
								<span className="text-sm text-muted-foreground">
									{formatDayAbbr(nextWeek)} {formatDateShort(nextWeek)}
								</span>
							</button>
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
