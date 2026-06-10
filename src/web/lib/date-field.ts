import { format, parseISO } from "date-fns";

import { parseDatePhrase } from "@/lib/parsing/parse-task-input";

/** Render an ISO datetime for a free-text date field, or empty when unset. */
export function formatDateField(iso: string | null): string {
	return iso ? format(parseISO(iso), "yyyy-MM-dd HH:mm") : "";
}

/**
 * Resolve a free-text date field back to an ISO string (or null when blank).
 * Accepts the TUI date phrases (today, tomorrow, monday, next week,
 * 2026-07-01, none). Returns 'invalid' when the phrase can't be parsed.
 * Keeps the original value when the text matches the loaded datetime so an
 * unchanged field never loses its time component.
 */
export function resolveDateField(
	raw: string,
	original: string | null,
): string | null | "invalid" {
	const text = raw.trim();
	if (!text) return null;
	if (original && text === format(parseISO(original), "yyyy-MM-dd HH:mm")) {
		return original;
	}
	return parseDatePhrase(text) ?? "invalid";
}
