import { CalendarDays, Flag, Folder, Hourglass } from "lucide-react";
import { type ReactNode, useId } from "react";

import { Input } from "@/components/ui/input";
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
	titleRef,
}: {
	value: TaskDraft;
	onChange: (value: TaskDraft) => void;
	projects: Project[];
	advancedContent?: ReactNode;
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
			<div className="mt-5 border-t border-border">
				<div className="task-fields-row">
					<label
						htmlFor={`${id}-project`}
						className="flex items-center gap-2 text-xs text-muted"
					>
						<Folder className="size-3.5" />
						Project
					</label>
					<select
						id={`${id}-project`}
						value={value.projectId || ""}
						onChange={(e) => set("projectId", Number(e.target.value))}
						className="min-h-11 w-full min-w-0 rounded-lg bg-surface-raised px-1 text-sm"
					>
						<option value="" disabled>
							Choose project
						</option>
						{projects.map((p) => (
							<option key={p.id} value={p.id}>
								{p.emoji ? `${p.emoji} ` : ""}
								{p.name}
							</option>
						))}
					</select>
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
					<select
						id={`${id}-priority`}
						value={value.priority}
						onChange={(e) =>
							set("priority", Number(e.target.value) as Priority)
						}
						className="min-h-11 w-full rounded-lg bg-surface-raised px-1 text-sm"
					>
						<option value={1}>Urgent · P1</option>
						<option value={2}>High · P2</option>
						<option value={3}>Normal · P3</option>
						<option value={4}>Low · P4</option>
					</select>
				</div>
				<div className="task-fields-row">
					<label
						htmlFor={`${id}-estimate`}
						className="flex items-center gap-2 text-xs text-muted"
					>
						<Hourglass className="size-3.5" />
						Estimate
					</label>
					<Input
						id={`${id}-estimate`}
						value={value.estimate}
						onChange={(e) => set("estimate", e.target.value)}
						placeholder="No estimate"
						className="h-11 border-0 bg-transparent px-1 text-sm shadow-none"
						list={`${id}-estimates`}
					/>
					<datalist id={`${id}-estimates`}>
						{[5, 10, 15, 30, 45, 60, 90].map((minutes) => (
							<option key={minutes} value={`${minutes}m`} />
						))}
					</datalist>
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
