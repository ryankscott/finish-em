import { ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ParseTaskCreateResult } from "@/lib/parsing/parse-task-create-input";
import type { Project } from "@/server/types";
import { cn } from "../lib/cn";

/* ------------------------------------------------------------------ */
/*  Token helpers                                                      */
/* ------------------------------------------------------------------ */

export function escapeRegExp(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function removeToken(value: string, regex: RegExp): string {
	return value
		.replace(regex, "")
		.replace(/\s{2,}/g, " ")
		.trim();
}

export function insertToken(value: string, token: string): string {
	return `${value} ${token}`.trim();
}

/*
 * Boundary that ends a project token's value: the next known token prefix or
 * end of string. Mirrors the parser, which reads a project name until the next
 * token, so multi-word names like "Work Stuff" are handled correctly.
 */
const PROJECT_VALUE_STOP =
	"(?=\\s+(?:title:|project:|proj:|priority:|prio:|due:|scheduled:|sch:|notes:|parent:|recurs:|rec:|recurrence:|p[1-4]\\b|⏰|🗓|🔁|🚩|📁)|$)";

/** Remove a specific named project token (handles multi-word names). */
export function removeProjectToken(value: string, name: string): string {
	const regex = new RegExp(
		`\\b(?:project:|proj:|📁\\s*)\\s*${escapeRegExp(name)}(?=\\s|$)`,
		"i",
	);
	return removeToken(value, regex);
}

/*
 * Date phrases the parser accepts for due/scheduled tokens, including the
 * short abbreviations (tod/tom/nxt). Used to detect and strip date tokens.
 */
const DATE_PHRASE = "today|tod|tomorrow|tom|next\\s*week|nxt";
const DATE_TOKEN_VALUE = `(?:${DATE_PHRASE}|none|never|clear|\\d{4}-\\d{2}-\\d{2})`;

/** Map a matched date phrase to its canonical pill label (Today/Tomorrow/Next week). */
function dateLabelFor(phrase: string): string | null {
	const text = phrase.toLowerCase().replace(/\s+/g, " ");
	if (text === "today" || text === "tod") return "Today";
	if (text === "tomorrow" || text === "tom") return "Tomorrow";
	if (text === "next week" || text === "nxt") return "Next week";
	return null;
}

/** Remove any existing project token, regardless of its value. */
export function removeAnyProjectToken(value: string): string {
	const regex = new RegExp(
		`\\b(?:project:|proj:|📁\\s*)\\s*.+?${PROJECT_VALUE_STOP}`,
		"gi",
	);
	return removeToken(value, regex);
}

/* ------------------------------------------------------------------ */
/*  Pill component                                                     */
/* ------------------------------------------------------------------ */

function Pill({
	label,
	active,
	onClick,
	className,
	title,
}: {
	label: string;
	active?: boolean;
	onClick?: () => void;
	className?: string;
	title?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={title}
			className={cn(
				"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
				"focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
				active
					? "border-p4 bg-p4/15 text-p4"
					: "border-border text-muted hover:bg-surface-raised hover:text-foreground",
				className,
			)}
		>
			{active ? <X className="h-3 w-3" /> : null}
			{label}
		</button>
	);
}

/* ------------------------------------------------------------------ */
/*  Dropdown for project overflow                                      */
/* ------------------------------------------------------------------ */

function ProjectDropdown({
	projects,
	onSelect,
	children,
}: {
	projects: Project[];
	onSelect: (project: Project) => void;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [open]);

	return (
		<div ref={ref} className="relative inline-flex">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className={cn(
					"inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
					"border-border text-muted hover:bg-surface-raised hover:text-foreground",
					"focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
				)}
			>
				{children}
				<ChevronDown className="h-3 w-3" />
			</button>
			{open ? (
				<div className="absolute left-0 top-full z-50 mt-1 max-h-48 min-w-[12rem] overflow-auto rounded-md border border-border bg-surface-raised shadow-lg">
					{projects.map((project) => (
						<button
							key={project.id}
							type="button"
							onClick={() => {
								onSelect(project);
								setOpen(false);
							}}
							className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-foreground hover:bg-surface"
						>
							{project.emoji ? (
								<span className="text-sm">{project.emoji}</span>
							) : null}
							<span className="truncate">{project.name}</span>
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  QuickAddPills                                                      */
/* ------------------------------------------------------------------ */

export function QuickAddPills({
	value,
	onChange,
	projects,
	parsed,
}: {
	value: string;
	onChange: (value: string) => void;
	projects: Project[];
	parsed: ParseTaskCreateResult | null;
}) {
	const MAX_PROJECT_PILLS = 5;

	const activePriority = parsed?.input.priority;
	const activeProjectId = parsed?.input.projectId;
	const activeDue = parsed?.input.dueAt;
	const activeScheduled = parsed?.input.scheduledAt;
	const activeRecurrence = parsed?.input.recurrencePreset;

	const nonInboxProjects = useMemo(
		() => projects.filter((p) => !p.isInbox),
		[projects],
	);

	const visibleProjects = nonInboxProjects.slice(0, MAX_PROJECT_PILLS);
	const overflowProjects = nonInboxProjects.slice(MAX_PROJECT_PILLS);

	const hasOverflow = overflowProjects.length > 0;
	const overflowLabel = `+${overflowProjects.length}`;

	/* ---------- priority ---------- */
	function togglePriority(priority: number) {
		if (activePriority === priority) {
			// remove pN token
			const regex = new RegExp(
				`\\b(?:priority:|prio:)\\s*${priority}\\b|\\bp${priority}\\b`,
				"i",
			);
			onChange(removeToken(value, regex));
		} else {
			// remove existing priority, then insert new one
			const removeExisting = value.replace(
				/\b(?:priority:|prio:)\s*[1-4]\b|\bp[1-4]\b/gi,
				"",
			);
			const cleaned = removeExisting.replace(/\s{2,}/g, " ").trim();
			onChange(insertToken(cleaned, `p${priority}`));
		}
	}

	/* ---------- project ---------- */
	function toggleProject(project: Project) {
		if (activeProjectId === project.id) {
			onChange(removeProjectToken(value, project.name));
		} else {
			// remove existing project token (handles multi-word names)
			const cleaned = removeAnyProjectToken(value);
			onChange(insertToken(cleaned, `project:${project.name}`));
		}
	}

	/* ---------- due date ---------- */
	const dateOptions = [
		{ label: "Today", token: "due:today" },
		{ label: "Tomorrow", token: "due:tomorrow" },
		{ label: "Next week", token: "due:next week" },
	] as const;

	function toggleDue(option: (typeof dateOptions)[number]) {
		// strip any existing due token (preset or absolute date), then either
		// toggle the clicked option off or insert it in place of the old one
		const regex = new RegExp(
			`\\b(?:due:|⏰\\s*)\\s*${DATE_TOKEN_VALUE}\\b`,
			"gi",
		);
		const cleaned = removeToken(value, regex);
		if (isDueActive(option.label)) {
			onChange(cleaned);
			return;
		}
		onChange(insertToken(cleaned, option.token));
	}

	function isDueActive(label: string): boolean {
		if (activeDue === null || activeDue === undefined) return false;
		const match = value.match(
			new RegExp(`\\b(?:due:|⏰\\s*)\\s*(${DATE_PHRASE})`, "i"),
		);
		if (!match) return false;
		return dateLabelFor(match[1]) === label;
	}

	/* ---------- scheduled date ---------- */
	const schedOptions = [
		{ label: "Today", token: "sch:today" },
		{ label: "Tomorrow", token: "sch:tomorrow" },
		{ label: "Next week", token: "sch:next week" },
	] as const;

	function toggleScheduled(option: (typeof schedOptions)[number]) {
		const regex = new RegExp(
			`\\b(?:scheduled:|sch:|🗓\\s*)\\s*${DATE_TOKEN_VALUE}\\b`,
			"gi",
		);
		const cleaned = removeToken(value, regex);
		if (isScheduledActive(option.label)) {
			onChange(cleaned);
			return;
		}
		onChange(insertToken(cleaned, option.token));
	}

	function isScheduledActive(label: string): boolean {
		if (activeScheduled === null || activeScheduled === undefined) return false;
		const match = value.match(
			new RegExp(`\\b(?:scheduled:|sch:|🗓\\s*)\\s*(${DATE_PHRASE})`, "i"),
		);
		if (!match) return false;
		return dateLabelFor(match[1]) === label;
	}

	/* ---------- recurrence ---------- */
	const recOptions = [
		{ label: "Daily", token: "recurs:daily" },
		{ label: "Weekly", token: "recurs:weekly" },
		{ label: "Monthly", token: "recurs:monthly" },
	] as const;

	function toggleRecurrence(option: (typeof recOptions)[number]) {
		if (activeRecurrence) {
			const regex =
				/\b(?:recurs:|rec:|recurrence:)\s*(?:daily|weekly|monthly|yearly|every_weekday|none|never|clear)\b/gi;
			const cleaned = removeToken(value, regex);
			if (activeRecurrence === option.token.split(":")[1]) {
				onChange(cleaned);
				return;
			}
			onChange(insertToken(cleaned, option.token));
			return;
		}
		onChange(insertToken(value, option.token));
	}

	function isRecurrenceActive(label: string): boolean {
		return activeRecurrence?.toLowerCase() === label.toLowerCase();
	}

	/* ---------- render ---------- */
	return (
		<div className="flex flex-wrap items-center gap-1.5 px-4 py-1.5">
			{/* Priority */}
			<div className="flex items-center gap-1">
				{[1, 2, 3, 4].map((p) => (
					<Pill
						key={p}
						label={`P${p}`}
						active={activePriority === p}
						onClick={() => togglePriority(p)}
						className={cn(
							activePriority === p && [
								p === 1 && "border-p1 bg-p1/15 text-p1",
								p === 2 && "border-p2 bg-p2/15 text-p2",
								p === 3 && "border-p3 bg-p3/15 text-p3",
								p === 4 && "border-p4 bg-p4/15 text-p4",
							],
						)}
					/>
				))}
			</div>

			{/* Projects */}
			{visibleProjects.length > 0 ? (
				<div className="flex items-center gap-1">
					{visibleProjects.map((project) => (
						<Pill
							key={project.id}
							label={project.name}
							active={activeProjectId === project.id}
							onClick={() => toggleProject(project)}
						/>
					))}
					{hasOverflow ? (
						<ProjectDropdown
							projects={overflowProjects}
							onSelect={(project) => toggleProject(project)}
						>
							{overflowLabel}
						</ProjectDropdown>
					) : null}
				</div>
			) : null}

			{/* Due */}
			<div className="flex items-center gap-1">
				{dateOptions.map((opt) => (
					<Pill
						key={opt.token}
						label={`Due ${opt.label}`}
						active={isDueActive(opt.label)}
						onClick={() => toggleDue(opt)}
						className="hidden sm:inline-flex"
					/>
				))}
			</div>

			{/* Scheduled */}
			<div className="flex items-center gap-1">
				{schedOptions.map((opt) => (
					<Pill
						key={opt.token}
						label={`Scheduled ${opt.label}`}
						active={isScheduledActive(opt.label)}
						onClick={() => toggleScheduled(opt)}
						className="hidden sm:inline-flex"
					/>
				))}
			</div>

			{/* Recurrence */}
			<div className="flex items-center gap-1">
				{recOptions.map((opt) => (
					<Pill
						key={opt.token}
						label={opt.label}
						active={isRecurrenceActive(opt.label)}
						onClick={() => toggleRecurrence(opt)}
					/>
				))}
			</div>
		</div>
	);
}
