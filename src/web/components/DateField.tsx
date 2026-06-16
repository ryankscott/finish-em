import { format, isSameDay, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { parseDatePhrase } from "@/lib/parsing/parse-task-input";
import { cn } from "@/web/lib/cn";

type Preset = {
	label: string;
	value: string;
};

const PRESETS: Preset[] = [
	{ label: "Today", value: "today" },
	{ label: "Tomorrow", value: "tomorrow" },
	{ label: "Next week", value: "next week" },
	{ label: "Monday", value: "monday" },
	{ label: "None", value: "none" },
];

const chipClass =
	"rounded-full border border-border px-2.5 py-0.5 text-[11px] leading-tight text-muted transition-colors hover:border-accent/50 hover:text-foreground cursor-pointer select-none";

const activeChipClass =
	"rounded-full border border-accent/60 bg-accent/10 px-2.5 py-0.5 text-[11px] leading-tight text-accent cursor-pointer select-none";

interface DateFieldProps {
	value: string;
	onChange: (value: string) => void;
}

export function DateField({ value, onChange }: DateFieldProps) {
	const [open, setOpen] = useState(false);
	const trimmed = value.trim().toLowerCase();

	// Resolve a preset value to an ISO date string (or null for "none")
	const resolvePreset = (presetValue: string): string | null => {
		const parsed = parseDatePhrase(presetValue);
		if (parsed === null) return null;
		if (parsed === undefined) return presetValue;
		return format(parseISO(parsed), "yyyy-MM-dd");
	};

	const isPresetActive = (presetValue: string) => {
		const resolved = resolvePreset(presetValue);
		if (resolved === null) return trimmed === "none" || trimmed === "";
		const currentDate = (() => {
			const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})$/);
			if (isoMatch) {
				const d = new Date(`${isoMatch[1]}T00:00:00`);
				if (!Number.isNaN(d.getTime())) return d;
			}
			const parsed = parseDatePhrase(trimmed);
			if (parsed && parsed !== undefined) {
				return parseISO(parsed);
			}
			return null;
		})();
		if (!currentDate) return false;
		return isSameDay(currentDate, parseISO(`${resolved}T00:00:00`));
	};

	// Try to parse the current value as a Date for the calendar selection
	const selectedDate = (() => {
		const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})$/);
		if (isoMatch) {
			const d = new Date(`${isoMatch[1]}T00:00:00`);
			if (!Number.isNaN(d.getTime())) return d;
		}
		const parsed = parseDatePhrase(trimmed);
		if (parsed && parsed !== undefined) {
			return parseISO(parsed);
		}
		return undefined;
	})();

	const handleCalendarSelect = (date: Date | undefined) => {
		if (date) {
			onChange(format(date, "yyyy-MM-dd"));
		} else {
			onChange("none");
		}
		setOpen(false);
	};

	const handlePresetClick = (presetValue: string) => {
		const resolved = resolvePreset(presetValue);
		onChange(resolved ?? "");
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="relative">
				<Input value={value} onChange={(e) => onChange(e.target.value)} />
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className={cn(
								"absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted hover:text-accent",
							)}
							title="Pick a date"
						>
							<CalendarIcon className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="end">
						<Calendar
							mode="single"
							selected={selectedDate}
							onSelect={handleCalendarSelect}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>
			<div className="flex flex-wrap items-center gap-1.5">
				{PRESETS.map((preset) => (
					<button
						key={preset.value}
						type="button"
						onClick={() => handlePresetClick(preset.value)}
						className={
							isPresetActive(preset.value) ? activeChipClass : chipClass
						}
					>
						{preset.label}
					</button>
				))}
			</div>
		</div>
	);
}
