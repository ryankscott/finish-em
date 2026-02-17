"use client";

import * as React from "react";
import { format, parseISO, isValid, set } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
	value: string | null;
	onChange: (value: string | null) => void | Promise<void>;
	placeholder?: string;
	className?: string;
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

function dateToIsoString(value: Date | undefined): string | null {
	if (!value) {
		return null;
	}

	return set(value, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString();
}

export function DatePicker({
	value,
	onChange,
	placeholder = "Pick a date",
	className,
}: DatePickerProps) {
	const selectedDate = React.useMemo(() => isoStringToDate(value), [value]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					data-empty={!selectedDate}
					className={`data-[empty=true]:text-muted-foreground justify-start text-left font-normal ${className ?? "w-70"}`}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{selectedDate ? (
						format(selectedDate, "PPP")
					) : (
						<span>{placeholder}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={selectedDate}
					onSelect={(date) => {
						void onChange(dateToIsoString(date));
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
