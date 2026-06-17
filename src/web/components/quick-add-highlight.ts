import type { Project } from "@/server/types";

/**
 * Splits a quick-add input string into segments for inline highlighting.
 * A segment with a non-null `kind` is a recognized, complete token (e.g.
 * `due:today`, `p1`, `project:Work`) and is rendered as a pill; plain text
 * and incomplete tokens (e.g. a bare `due:`) stay as ordinary text.
 *
 * The recognized values mirror the parser in parse-task-create-input.ts.
 */
export type TokenKind =
	| "priority"
	| "project"
	| "due"
	| "scheduled"
	| "recurrence";

export type Segment = { text: string; kind: TokenKind | null };

const DATE_VALUE =
	"(?:today|tod|tomorrow|tom|next\\s*week|nxt|sunday|monday|tuesday|wednesday|thursday|friday|saturday|none|never|clear|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\/\\d{1,2}\\/\\d{2,4})";

// Sticky (y) patterns: each must match starting exactly at the scan position.
const PATTERNS: { kind: TokenKind; re: RegExp }[] = [
	{
		kind: "priority",
		re: /(?:\b(?:priority:|prio:)\s*[1-4]\b|\bp[1-4]\b|🚩\s*[1-4])/iy,
	},
	{
		kind: "due",
		re: new RegExp(`(?:\\bdue:|⏰\\s*)\\s*${DATE_VALUE}\\b`, "iy"),
	},
	{
		kind: "scheduled",
		re: new RegExp(`(?:\\bscheduled:|\\bsch:|🗓\\s*)\\s*${DATE_VALUE}\\b`, "iy"),
	},
	{
		kind: "recurrence",
		re: /(?:\brecurs:|\brec:|\brecurrence:|🔁\s*)\s*(?:daily|weekly|monthly|yearly|every_weekday|none|never|clear)\b/iy,
	},
];

const PROJECT_PREFIX = /(?:\bproject:|\bproj:|📁\s*)\s*/iy;
const NEXT_TOKEN =
	/\s+(?:title:|project:|proj:|priority:|prio:|due:|scheduled:|sch:|notes:|parent:|recurs:|rec:|recurrence:|p[1-4]\b|⏰|🗓|🔁|🚩|📁)/i;

export function tokenizeQuickAdd(
	value: string,
	projects: Project[],
): Segment[] {
	const projectNames = new Set(projects.map((p) => p.name.toLowerCase()));
	const segments: Segment[] = [];
	let plain = "";
	let i = 0;

	const flushPlain = () => {
		if (plain) {
			segments.push({ text: plain, kind: null });
			plain = "";
		}
	};

	while (i < value.length) {
		// Project token: prefix followed by a known (possibly multi-word) name.
		PROJECT_PREFIX.lastIndex = i;
		const pm = PROJECT_PREFIX.exec(value);
		if (pm && pm.index === i) {
			const valStart = i + pm[0].length;
			const rest = value.slice(valStart);
			const stop = rest.search(NEXT_TOKEN);
			const rawVal = stop === -1 ? rest : rest.slice(0, stop);
			const name = rawVal.trim();
			if (name && projectNames.has(name.toLowerCase())) {
				const end = valStart + rawVal.trimEnd().length;
				flushPlain();
				segments.push({ text: value.slice(i, end), kind: "project" });
				i = end;
				continue;
			}
		}

		let matched = false;
		for (const { kind, re } of PATTERNS) {
			re.lastIndex = i;
			const m = re.exec(value);
			if (m && m.index === i) {
				flushPlain();
				segments.push({ text: m[0], kind });
				i += m[0].length;
				matched = true;
				break;
			}
		}
		if (matched) continue;

		plain += value[i];
		i += 1;
	}

	flushPlain();
	return segments;
}
