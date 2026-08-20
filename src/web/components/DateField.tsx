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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { parseDatePhrase } from "@/lib/parsing/parse-task-input";
import { cn } from "@/web/lib/cn";
import { useIsMobile } from "../lib/use-is-mobile";

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

// Mobile presets are tap targets, not inline chips: 44px minimum, not the
// desktop pill sized for a mouse pointer.
const mobileChipClass =
	"min-h-11 flex-1 rounded-md border border-border px-2 text-sm text-muted";

const mobileActiveChipClass =
	"min-h-11 flex-1 rounded-md border border-accent/60 bg-accent/10 px-2 text-sm text-accent";

interface DateFieldProps {
	value: string;
	onChange: (value: string) => void;
}

export function DateField({ value, onChange }: DateFieldProps) {
	const isMobile = useIsMobile();
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

	const presets = (
		<div
			className={cn("flex gap-1.5", isMobile ? "" : "flex-wrap items-center")}
		>
			{PRESETS.map((preset) => (
				<button
					key={preset.value}
					type="button"
					onClick={() => handlePresetClick(preset.value)}
					className={
						isMobile
							? isPresetActive(preset.value)
								? mobileActiveChipClass
								: mobileChipClass
							: isPresetActive(preset.value)
								? activeChipClass
								: chipClass
					}
				>
					{preset.label}
				</button>
			))}
		</div>
	);

	return (
		<div className="flex flex-col gap-2">
			<div className="relative">
				<Input
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={isMobile ? "h-11 text-base" : undefined}
				/>
				{isMobile ? (
					<>
						<button
							type="button"
							aria-label="Pick a date"
							onClick={() => setOpen(true)}
							className="absolute top-1/2 right-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted hover:text-accent"
						>
							<CalendarIcon className="h-4 w-4" />
						</button>
						<Sheet open={open} onOpenChange={setOpen}>
							<SheetContent
								side="bottom"
								showClose={false}
								className="flex max-h-none flex-col rounded-t-xl p-0"
								aria-describedby={undefined}
							>
								<div className="flex items-center justify-between px-4 pt-4 pb-1">
									<SheetTitle>Pick a date</SheetTitle>
									<button
										type="button"
										onClick={() => setOpen(false)}
										className="min-h-9 px-2 text-sm text-muted"
									>
										Cancel
									</button>
								</div>
								<div className="flex justify-center px-2 pb-2">
									<Calendar
										mode="single"
										selected={selectedDate}
										onSelect={handleCalendarSelect}
									/>
								</div>
								<div className="flex gap-1.5 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
									{presets}
								</div>
							</SheetContent>
						</Sheet>
					</>
				) : (
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
							/>
						</PopoverContent>
					</Popover>
				)}
			</div>
			{isMobile ? null : presets}
		</div>
	);
}
