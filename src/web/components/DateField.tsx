import { addDays, addWeeks, format, isSameDay, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/web/lib/cn";
import { parseDateInput } from "../lib/date-field";
import { useIsMobile } from "../lib/use-is-mobile";

interface DateFieldProps {
	compact?: boolean;
	value: string;
	onChange: (value: string) => void;
	dateOnly?: boolean;
	allowNone?: boolean;
	"aria-label"?: string;
}

export function resolveDateOnly(raw: string): string | undefined {
	const text = raw.trim();
	if (!text) return "";
	const parsed = parseDateInput(text);
	if (parsed === null) return "";
	if (parsed === undefined) return undefined;
	return format(parseISO(parsed), "yyyy-MM-dd");
}

/** Keep date phrases and existing time components intact until the user saves. */
export function DateField({
	compact = false,
	value,
	onChange,
	dateOnly = false,
	allowNone = true,
	"aria-label": ariaLabel = "Date",
}: DateFieldProps) {
	const isMobile = useIsMobile();
	const inputId = useId();
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(value);
	const [error, setError] = useState("");
	const parse = (text: string) => {
		const resolved = parseDateInput(text.trim());
		return resolved ? parseISO(resolved) : undefined;
	};
	const selected = parse(draft);
	const current = parse(value);
	const label = current
		? isSameDay(current, new Date())
			? "Today"
			: format(current, "d MMM yyyy")
		: "No date";
	const changeOpen = (next: boolean) => {
		if (next) {
			setDraft(value);
			setError("");
		}
		setOpen(next);
	};
	const save = () => {
		const resolved = resolveDateOnly(draft);
		if (resolved === undefined || (!resolved && !allowNone)) {
			setError("Choose a date or enter something like tomorrow.");
			return;
		}
		onChange(dateOnly || !resolved ? resolved : draft.trim());
		setOpen(false);
	};
	const trigger = (
		<button
			type="button"
			onClick={isMobile ? () => changeOpen(true) : undefined}
			aria-label={`${ariaLabel}: ${label}`}
			aria-haspopup="dialog"
			aria-expanded={open}
			className={cn(
				"flex min-h-11 w-full items-center gap-2 rounded-lg px-1 text-left text-sm hover:bg-accent-soft",
				current ? "text-accent" : "text-muted",
				compact &&
					"relative min-h-7 px-0 text-[11px] before:absolute before:inset-x-0 before:-inset-y-2",
			)}
		>
			{compact && <CalendarIcon className="size-3.5 shrink-0" />}
			<span className="min-w-0 truncate">{label}</span>
		</button>
	);
	const picker = (
		// biome-ignore lint/a11y/noStaticElementInteractions: keep calendar navigation keys inside the picker instead of the task-list hotkey scope.
		<div
			onKeyDown={(e) => {
				if (e.key !== "Escape") e.stopPropagation();
			}}
			className="flex w-full min-w-0 flex-col gap-3 p-4"
		>
			<div className="grid grid-cols-3 gap-2">
				{[
					{ label: "Today", date: new Date() },
					{ label: "Tomorrow", date: addDays(new Date(), 1) },
					{ label: "Next week", date: addWeeks(new Date(), 1) },
				].map((preset) => (
					<button
						key={preset.label}
						type="button"
						onClick={() => {
							setDraft(format(preset.date, "yyyy-MM-dd"));
							setError("");
						}}
						aria-pressed={!!selected && isSameDay(selected, preset.date)}
						className="min-h-11 rounded-xl border border-border bg-background px-1 text-xs aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:text-accent"
					>
						{preset.label}
					</button>
				))}
			</div>
			<Calendar
				mode="single"
				selected={selected}
				defaultMonth={selected}
				onSelect={(date) => {
					if (date) {
						setDraft(format(date, "yyyy-MM-dd"));
						setError("");
					}
				}}
			/>
			<label htmlFor={inputId} className="text-xs text-muted">
				Or type a date{!dateOnly && " and time"}
			</label>
			<Input
				id={inputId}
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						e.stopPropagation();
						save();
					}
				}}
				placeholder={
					dateOnly ? "Tomorrow or 2026-10-26" : "Tomorrow or 2026-10-26 14:00"
				}
				className="h-11 text-base"
			/>
			{error && (
				<p role="alert" className="text-xs text-p1">
					{error}
				</p>
			)}
			<div className="flex items-center justify-between gap-3">
				{allowNone ? (
					<button
						type="button"
						onClick={() => {
							setDraft("");
							setError("");
						}}
						className="min-h-11 px-1 text-xs text-muted"
					>
						Remove date
					</button>
				) : (
					<span />
				)}
				<Button type="button" onClick={save}>
					Save date
				</Button>
			</div>
		</div>
	);
	return isMobile ? (
		<>
			<div>{trigger}</div>
			<Sheet open={open} onOpenChange={changeOpen}>
				<SheetContent
					onEscapeKeyDown={(e) => e.stopPropagation()}
					side="bottom"
					showClose={false}
					className="max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-surface-raised p-0 pb-safe"
					aria-describedby={undefined}
				>
					<div className="flex items-center justify-between px-4 pt-4">
						<SheetTitle>{ariaLabel}</SheetTitle>
						<button
							type="button"
							onClick={() => changeOpen(false)}
							className="min-h-11 px-2 text-sm text-muted"
						>
							Cancel
						</button>
					</div>
					{picker}
				</SheetContent>
			</Sheet>
		</>
	) : (
		<Popover open={open} onOpenChange={changeOpen}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>
			<PopoverContent
				onEscapeKeyDown={(e) => e.stopPropagation()}
				align="end"
				className="w-[min(350px,calc(100vw-2rem))] rounded-2xl bg-surface-raised p-0"
				aria-label={ariaLabel}
			>
				{picker}
			</PopoverContent>
		</Popover>
	);
}
