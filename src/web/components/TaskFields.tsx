import {
	CalendarDays,
	ChevronDown,
	Flag,
	Folder,
	Hourglass,
} from "lucide-react";
import { type ReactNode, useId } from "react";

import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Priority, Project } from "@/server/types";
import type { TaskDraft } from "../lib/task-draft";
import { DateField } from "./DateField";
import { RecurrenceSelector } from "./RecurrenceSelector";

export function TaskFields({
	value,
	onChange,
	projects,
	advancedContent,
	afterNotes,
	titleRef,
}: {
	value: TaskDraft;
	onChange: (value: TaskDraft) => void;
	projects: Project[];
	advancedContent?: ReactNode;
	/** Shown under the notes, outside the collapsed advanced section. */
	afterNotes?: ReactNode;
	titleRef?: React.Ref<HTMLTextAreaElement>;
}) {
	const id = useId();
	const set = <K extends keyof TaskDraft>(key: K, next: TaskDraft[K]) =>
		onChange({ ...value, [key]: next });
	return (
		<div className="flex min-w-0 flex-col">
			<label htmlFor={`${id}-title`} className="mb-2.5 text-xs text-muted">
				Task
			</label>
			<Textarea
				ref={titleRef}
				id={`${id}-title`}
				value={value.title}
				onChange={(e) => set("title", e.target.value)}
				rows={2}
				placeholder="What’s on your mind?"
				className="task-title-input min-h-[70px] resize-none border-0 bg-transparent p-0 text-[21px] leading-snug tracking-[-0.6px] shadow-none focus-visible:ring-0"
			/>
			<label htmlFor={`${id}-notes`} className="mt-2 text-xs text-muted">
				Notes
			</label>
			<Textarea
				id={`${id}-notes`}
				value={value.notes}
				onChange={(e) => set("notes", e.target.value)}
				rows={3}
				placeholder="Add a little context…"
				className="mt-2 min-h-[85px] rounded-xl border-border bg-background p-3 text-sm shadow-none"
			/>
			{afterNotes && <div className="mt-3">{afterNotes}</div>}
			<div className="mt-5 border-t border-border">
				<div className="task-fields-row">
					<label
						htmlFor={`${id}-project`}
						className="flex items-center gap-2 text-xs text-muted"
					>
						<Folder className="size-3.5" />
						Project
					</label>
					<Select
						value={value.projectId ? String(value.projectId) : ""}
						// Radix Select can emit "" (e.g. while items mount); ignore it
						// rather than clearing the project to 0.
						onValueChange={(v) => v && set("projectId", Number(v))}
					>
						<SelectTrigger
							id={`${id}-project`}
							className="h-11 border-0 bg-transparent px-2 shadow-none"
						>
							<SelectValue placeholder="Choose project" />
						</SelectTrigger>
						<SelectContent align="end" collisionPadding={12}>
							{projects.map((p) => (
								<SelectItem key={p.id} value={String(p.id)}>
									{p.emoji ? `${p.emoji} ` : ""}
									{p.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="task-fields-row">
					<span className="flex items-center gap-2 text-xs text-muted">
						<CalendarDays className="size-3.5" />
						Scheduled
					</span>
					<DateField
						value={value.scheduled}
						onChange={(v) => set("scheduled", v)}
						aria-label="Scheduled date"
					/>
				</div>
				<div className="task-fields-row">
					<span className="flex items-center gap-2 text-xs text-muted">
						<Flag className="size-3.5" />
						Deadline
					</span>
					<DateField
						value={value.due}
						onChange={(v) => set("due", v)}
						aria-label="Deadline"
					/>
				</div>
				<div className="task-fields-row">
					<label
						htmlFor={`${id}-priority`}
						className="flex items-center gap-2 text-xs text-muted"
					>
						<Flag className="size-3.5" />
						Priority
					</label>
					<Select
						value={String(value.priority)}
						onValueChange={(v) => set("priority", Number(v) as Priority)}
					>
						<SelectTrigger
							id={`${id}-priority`}
							className="h-11 border-0 bg-transparent px-2 shadow-none"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent align="end" collisionPadding={12}>
							{["Urgent · P1", "High · P2", "Normal · P3", "Low · P4"].map(
								(label, index) => (
									<SelectItem key={label} value={String(index + 1)}>
										{label}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				</div>
				<div className="task-fields-row">
					<label
						htmlFor={`${id}-estimate`}
						className="flex items-center gap-2 text-xs text-muted"
					>
						<Hourglass className="size-3.5" />
						Estimate
					</label>
					<div className="flex min-w-0 items-center">
						<Input
							id={`${id}-estimate`}
							value={value.estimate}
							onChange={(e) => set("estimate", e.target.value)}
							placeholder="No estimate"
							className="h-11 border-0 bg-transparent px-1 text-sm shadow-none"
						/>
						<Popover>
							<PopoverTrigger asChild>
								<button
									type="button"
									aria-label="Estimate suggestions"
									className="flex size-11 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-surface"
								>
									<ChevronDown className="size-4" />
								</button>
							</PopoverTrigger>
							<PopoverContent
								align="end"
								collisionPadding={12}
								className="w-60 rounded-2xl p-3"
							>
								<p className="mb-2 text-xs text-muted">Quick estimates</p>
								<div className="flex flex-wrap gap-2">
									{[5, 10, 15, 30, 45, 60, 90].map((minutes) => (
										<button
											type="button"
											key={minutes}
											onClick={() => set("estimate", `${minutes}m`)}
											className="min-h-11 rounded-xl bg-surface px-3 text-sm hover:bg-accent-soft"
										>
											{minutes}m
										</button>
									))}
								</div>
								<p className="mt-3 text-xs text-muted">
									Or type your own duration in the field.
								</p>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</div>
			<details className="mt-4 text-sm">
				<summary className="min-h-11 cursor-pointer py-3 text-xs text-muted">
					Repeat, reminders & more
				</summary>
				<div className="flex flex-col gap-4 pb-3">
					<div className="flex flex-col gap-2">
						<span className="text-xs text-muted">Repeat</span>
						<RecurrenceSelector
							value={{
								preset: value.recurrencePreset,
								rrule: value.recurrenceRRule,
								startDate: value.due,
							}}
							startDate={value.due}
							onChange={({ preset, rrule, startDate }) =>
								onChange({
									...value,
									recurrencePreset: preset,
									recurrenceRRule: rrule,
									due: startDate || value.due,
								})
							}
						/>
					</div>
					<label className="flex min-h-11 items-center gap-2 text-xs text-muted">
						<input
							type="checkbox"
							checked={value.someday}
							onChange={(e) => set("someday", e.target.checked)}
							className="size-4 accent-accent"
						/>
						Keep in Someday
					</label>
					{advancedContent}
				</div>
			</details>
		</div>
	);
}
