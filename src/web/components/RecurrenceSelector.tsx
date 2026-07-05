import { format, isValid, parseISO } from "date-fns";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { RecurrencePreset } from "@/server/types";

type RecurrenceFreq = "none" | "daily" | "weekly" | "monthly" | "yearly";
type RecurrenceEndType = "none" | "count" | "until";

interface RecurrenceConfig {
	freq: RecurrenceFreq;
	interval: number;
	byDay: string[];
	endType: RecurrenceEndType;
	count: number;
	until: string;
}

export interface RecurrenceValue {
	preset: RecurrencePreset;
	rrule: string | null;
	startDate: string;
}

const DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;
const DAY_LABELS: Record<string, string> = {
	SU: "S",
	MO: "M",
	TU: "T",
	WE: "W",
	TH: "T",
	FR: "F",
	SA: "S",
};
const DAY_NAMES: Record<string, string> = {
	SU: "Sunday",
	MO: "Monday",
	TU: "Tuesday",
	WE: "Wednesday",
	TH: "Thursday",
	FR: "Friday",
	SA: "Saturday",
};

const UNIT_LABELS: Record<RecurrenceFreq, string> = {
	none: "",
	daily: "day(s)",
	weekly: "week(s)",
	monthly: "month(s)",
	yearly: "year(s)",
};

function defaultConfig(): RecurrenceConfig {
	return {
		freq: "none",
		interval: 1,
		byDay: [],
		endType: "none",
		count: 5,
		until: "",
	};
}

function todayIso(): string {
	return format(new Date(), "yyyy-MM-dd");
}

export function rruleToConfig(
	rrule: string | null,
	preset: RecurrencePreset | null,
): RecurrenceConfig {
	const base = defaultConfig();

	if (rrule) {
		const parts = rrule
			.trim()
			.toUpperCase()
			.split(";")
			.filter(Boolean);
		const data = new Map<string, string>();
		for (const part of parts) {
			const eq = part.indexOf("=");
			if (eq === -1) continue;
			data.set(part.slice(0, eq), part.slice(eq + 1));
		}

		const freq = data.get("FREQ");
		if (
			freq === "DAILY" ||
			freq === "WEEKLY" ||
			freq === "MONTHLY" ||
			freq === "YEARLY"
		) {
			base.freq = freq.toLowerCase() as RecurrenceFreq;
		} else {
			return base;
		}

		const intervalRaw = data.get("INTERVAL");
		if (intervalRaw) {
			const v = parseInt(intervalRaw, 10);
			if (v > 0) base.interval = v;
		}

		const byDayRaw = data.get("BYDAY");
		if (byDayRaw) {
			base.byDay = byDayRaw
				.split(",")
				.filter((d) => DAY_NAMES[d] !== undefined);
		}

		const countRaw = data.get("COUNT");
		if (countRaw) {
			const v = parseInt(countRaw, 10);
			if (v > 0) {
				base.count = v;
				base.endType = "count";
			}
		}

		const untilRaw = data.get("UNTIL");
		if (untilRaw) {
			let dateStr = "";
			if (/^\d{8}$/.test(untilRaw)) {
				dateStr = `${untilRaw.slice(0, 4)}-${untilRaw.slice(4, 6)}-${untilRaw.slice(6, 8)}`;
			} else if (/^\d{8}T/.test(untilRaw)) {
				dateStr = `${untilRaw.slice(0, 4)}-${untilRaw.slice(4, 6)}-${untilRaw.slice(6, 8)}`;
			}
			if (dateStr) {
				base.until = dateStr;
				base.endType = "until";
			}
		}

		return base;
	}

	if (preset) {
		switch (preset) {
			case "daily":
				return { ...base, freq: "daily", interval: 1 };
			case "weekly":
				return { ...base, freq: "weekly", interval: 1 };
			case "monthly":
				return { ...base, freq: "monthly", interval: 1 };
			case "yearly":
				return { ...base, freq: "yearly", interval: 1 };
			case "every_weekday":
				return {
					...base,
					freq: "weekly",
					interval: 1,
					byDay: ["MO", "TU", "WE", "TH", "FR"],
				};
		}
	}

	return base;
}

export function configToRRule(config: RecurrenceConfig): string | null {
	if (config.freq === "none") return null;

	const parts: string[] = [
		`FREQ=${config.freq.toUpperCase()}`,
		`INTERVAL=${config.interval}`,
	];

	if (config.freq === "weekly" && config.byDay.length > 0) {
		const ordered = DAY_CODES.filter((d) => config.byDay.includes(d));
		parts.push(`BYDAY=${ordered.join(",")}`);
	}

	if (config.endType === "count" && config.count > 0) {
		parts.push(`COUNT=${config.count}`);
	}

	if (config.endType === "until" && config.until) {
		parts.push(`UNTIL=${config.until.replace(/-/g, "")}`);
	}

	return parts.join(";");
}

export function configToPreset(config: RecurrenceConfig): RecurrencePreset {
	if (config.freq === "none" || config.endType !== "none" || config.interval !== 1) {
		return null;
	}

	if (config.freq === "daily") return "daily";
	if (config.freq === "monthly") return "monthly";
	if (config.freq === "yearly") return "yearly";

	if (config.freq === "weekly") {
		const sorted = [...config.byDay].sort();
		if (sorted.join(",") === "FR,MO,TH,TU,WE") return "every_weekday";
		if (config.byDay.length === 0) return "weekly";
	}

	return null;
}

export function configToSummary(
	config: RecurrenceConfig,
	startDate: string,
): string {
	if (config.freq === "none") return "No recurrence";

	let freqPhrase = "";
	const n = config.interval;

	if (config.freq === "daily") {
		freqPhrase = n === 1 ? "every day" : `every ${n} days`;
	} else if (config.freq === "weekly") {
		if (config.byDay.length > 0) {
			const names = DAY_CODES.filter((d) => config.byDay.includes(d)).map(
				(d) => DAY_NAMES[d],
			);
			if (names.length === 1) {
				freqPhrase = `every ${names[0]}`;
			} else {
				const last = names[names.length - 1];
				const rest = names.slice(0, -1);
				freqPhrase = `every ${rest.join(", ")} and ${last}`;
			}
			if (n > 1) freqPhrase = `every ${n} weeks on ${names.join(", ")}`;
		} else {
			freqPhrase = n === 1 ? "every week" : `every ${n} weeks`;
		}
	} else if (config.freq === "monthly") {
		freqPhrase = n === 1 ? "every month" : `every ${n} months`;
	} else if (config.freq === "yearly") {
		freqPhrase = n === 1 ? "every year" : `every ${n} years`;
	}

	let startStr = "today";
	if (startDate) {
		const parsed = parseISO(startDate);
		if (isValid(parsed)) {
			startStr = format(parsed, "EEEE, d MMMM yyyy");
		}
	}

	let endClause = "";
	if (config.endType === "count" && config.count > 0) {
		endClause = `, ending after ${config.count} occurrence${config.count !== 1 ? "s" : ""}`;
	} else if (config.endType === "until" && config.until) {
		const parsed = parseISO(config.until);
		if (isValid(parsed)) {
			endClause = `, ending on ${format(parsed, "d MMMM yyyy")}`;
		}
	}

	return `Occurs ${freqPhrase} starting ${startStr}${endClause}.`;
}

interface RecurrenceSelectorProps {
	value: RecurrenceValue;
	startDate: string;
	onChange: (value: RecurrenceValue) => void;
}

export function RecurrenceSelector({
	value,
	startDate,
	onChange,
}: RecurrenceSelectorProps) {
	const [open, setOpen] = useState(false);
	const [draftConfig, setDraftConfig] = useState<RecurrenceConfig>(
		defaultConfig,
	);
	const [draftStart, setDraftStart] = useState(startDate || todayIso());

	useEffect(() => {
		if (open) {
			setDraftConfig(rruleToConfig(value.rrule, value.preset));
			setDraftStart(startDate || todayIso());
		}
	}, [open, value.rrule, value.preset, startDate]);

	const committedConfig = rruleToConfig(value.rrule, value.preset);
	const triggerLabel =
		committedConfig.freq === "none"
			? "No recurrence"
			: configToSummary(committedConfig, startDate);

	const handleSave = () => {
		const rrule = configToRRule(draftConfig);
		const preset = configToPreset(draftConfig);
		onChange({ preset, rrule, startDate: draftStart });
		setOpen(false);
	};

	const handleCancel = () => {
		setOpen(false);
	};

	const toggleDay = (day: string) => {
		setDraftConfig((c) => ({
			...c,
			byDay: c.byDay.includes(day)
				? c.byDay.filter((d) => d !== day)
				: [...c.byDay, day],
		}));
	};

	const setFreq = (freq: RecurrenceFreq) => {
		setDraftConfig((c) => ({
			...c,
			freq,
			endType: freq === "none" ? "none" : c.endType,
		}));
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-left hover:bg-surface focus:outline-none focus:ring-1 focus:ring-ring"
				>
					<RefreshCw className="h-3.5 w-3.5 shrink-0 text-muted" />
					<span className="truncate text-sm">{triggerLabel}</span>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-4" align="start">
				<p className="mb-3 text-sm font-semibold">Recurrence</p>

				{/* Start date */}
				<div className="mb-3 flex items-center gap-3">
					<Label className="w-16 shrink-0 text-sm">Start</Label>
					<input
						type="date"
						value={draftStart}
						onChange={(e) => setDraftStart(e.target.value)}
						className="h-9 flex-1 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
					/>
				</div>

				<Separator className="my-3" />

				{/* Repeat type */}
				<div className="mb-3 flex items-center gap-3">
					<Label className="w-16 shrink-0 text-sm">Repeat</Label>
					<Select
						value={draftConfig.freq}
						onValueChange={(v) => setFreq(v as RecurrenceFreq)}
					>
						<SelectTrigger className="flex-1">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None</SelectItem>
							<SelectItem value="daily">Daily</SelectItem>
							<SelectItem value="weekly">Weekly</SelectItem>
							<SelectItem value="monthly">Monthly</SelectItem>
							<SelectItem value="yearly">Yearly</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{draftConfig.freq !== "none" && (
					<>
						{/* Interval */}
						<div className="mb-3 flex items-center gap-3">
							<Label className="w-16 shrink-0 text-sm">Every</Label>
							<Input
								type="number"
								min={1}
								max={99}
								value={draftConfig.interval}
								onChange={(e) =>
									setDraftConfig((c) => ({
										...c,
										interval: Math.max(1, parseInt(e.target.value) || 1),
									}))
								}
								className="w-16"
							/>
							<span className="text-sm text-muted">
								{UNIT_LABELS[draftConfig.freq]}
							</span>
						</div>

						{/* Day-of-week toggles (weekly only) */}
						{draftConfig.freq === "weekly" && (
							<div className="mb-3 flex items-center gap-3">
								<Label className="w-16 shrink-0 text-sm">On</Label>
								<div className="flex gap-1">
									{DAY_CODES.map((day) => {
										const active = draftConfig.byDay.includes(day);
										return (
											<button
												key={day}
												type="button"
												onClick={() => toggleDay(day)}
												className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
													active
														? "bg-accent text-background"
														: "border border-border text-muted hover:bg-surface"
												}`}
											>
												{DAY_LABELS[day]}
											</button>
										);
									})}
								</div>
							</div>
						)}

						{/* End condition */}
						<div className="mb-3 flex flex-wrap items-center gap-3">
							<Label className="w-16 shrink-0 text-sm">End</Label>
							<Select
								value={draftConfig.endType}
								onValueChange={(v) =>
									setDraftConfig((c) => ({
										...c,
										endType: v as RecurrenceEndType,
									}))
								}
							>
								<SelectTrigger className="w-36">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">no end date</SelectItem>
									<SelectItem value="count">after</SelectItem>
									<SelectItem value="until">on this day</SelectItem>
								</SelectContent>
							</Select>
							{draftConfig.endType === "count" && (
								<>
									<Input
										type="number"
										min={1}
										max={999}
										value={draftConfig.count}
										onChange={(e) =>
											setDraftConfig((c) => ({
												...c,
												count: Math.max(1, parseInt(e.target.value) || 1),
											}))
										}
										className="w-16"
									/>
									<span className="text-sm text-muted">occurrences</span>
								</>
							)}
							{draftConfig.endType === "until" && (
								<input
									type="date"
									value={draftConfig.until}
									onChange={(e) =>
										setDraftConfig((c) => ({ ...c, until: e.target.value }))
									}
									className="h-9 w-36 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
								/>
							)}
						</div>
					</>
				)}

				<Separator className="my-3" />

				{/* Summary */}
				<p className="mb-3 text-xs italic text-muted">
					{configToSummary(draftConfig, draftStart)}
				</p>

				{/* Footer */}
				<div className="flex justify-end gap-2">
					<Button variant="outline" size="sm" onClick={handleCancel}>
						Cancel
					</Button>
					<Button size="sm" onClick={handleSave}>
						Save
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
