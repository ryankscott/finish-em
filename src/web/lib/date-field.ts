import { format, isValid, parseISO } from "date-fns";

import { parseDatePhrase } from "@/lib/parsing/parse-task-input";

export function formatDateField(iso: string | null): string {
	return iso ? format(parseISO(iso), "yyyy-MM-dd HH:mm") : "";
}

/** Date phrases use the existing 9am convention; explicit times stay local. */
export function parseDateInput(raw: string): string | null | undefined {
	const text = raw.trim();
	if (!text) return null;
	if (
		/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/.test(
			text,
		)
	) {
		const date = parseISO(text);
		return isValid(date) ? date.toISOString() : undefined;
	}
	return parseDatePhrase(text);
}

/** Preserve seconds and timezone offsets on unchanged fields. */
export function resolveDateField(
	raw: string,
	original: string | null,
): string | null | "invalid" {
	const text = raw.trim();
	if (original && text === format(parseISO(original), "yyyy-MM-dd HH:mm"))
		return original;
	const parsed = parseDateInput(text);
	return parsed === undefined ? "invalid" : parsed;
}
