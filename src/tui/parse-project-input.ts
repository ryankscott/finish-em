import { isValid, parseISO } from "date-fns";
import { lookup as emojiShortcodeLookup } from "../lib/emoji-shortcodes";

type ProjectCreateInput = {
	name: string;
	emoji?: string | null;
	description?: string;
	startAt?: string | null;
	endAt?: string | null;
	color?: string;
	isInbox?: boolean;
	jiraDiscoveryUrl?: string | null;
	jiraDeliveryUrl?: string | null;
	confluenceUrl?: string | null;
};

type ProjectEditValues = {
	name: string;
	emoji?: string | null;
	description?: string;
	startAt?: string | null;
	endAt?: string | null;
	jiraDiscoveryUrl?: string | null;
	jiraDeliveryUrl?: string | null;
	confluenceUrl?: string | null;
};

export type ParseProjectCreateResult = {
	input: Partial<ProjectCreateInput>;
	warnings: string[];
	errors: string[];
	usedTokens: boolean;
};

const TOKEN_PREFIXES = [
	"name:",
	"emoji:",
	"description:",
	"start:",
	"end:",
	"color:",
	"inbox:",
	"jiraDiscovery:",
	"jiraDelivery:",
	"confluence:",
];

function parseEmojiValue(value: string, warnings: string[]): string {
	const trimmed = value.trim();
	const shortcodeMatch = trimmed.match(/^:([a-z0-9_+-]+):$/i);
	if (!shortcodeMatch) {
		return trimmed;
	}

	const shortcode = shortcodeMatch[1] ?? "";
	const mapped = emojiShortcodeLookup(shortcode);
	if (mapped !== undefined) {
		return mapped;
	}

	warnings.push(`Unknown emoji shortcode ":${shortcode}:"; using literal value`);
	return trimmed;
}

function extractTokenValue(input: string, startIndex: number): [string, number] {
	let end = input.length;

	for (const prefix of TOKEN_PREFIXES) {
		let pos = startIndex;
		while (pos < input.length) {
			const idx = input.toLowerCase().indexOf(prefix, pos);
			if (idx === -1) break;
			if (idx > 0 && input[idx - 1] !== " ") {
				pos = idx + 1;
				continue;
			}
			if (idx < end) end = idx;
			break;
		}
	}

	return [input.slice(startIndex, end).trim(), end];
}

function parseOptionalDate(value: string, field: string, errors: string[]): string | null | undefined {
	const normalized = value.trim().toLowerCase();
	if (normalized.length === 0) {
		return undefined;
	}
	if (["none", "clear", "null"].includes(normalized)) {
		return null;
	}
	const parsed = parseISO(value);
	if (!isValid(parsed)) {
		errors.push(`${field} must be a valid ISO date`);
		return undefined;
	}
	return value.trim();
}

function parseInboxValue(value: string, errors: string[]): boolean | undefined {
	const normalized = value.trim().toLowerCase();
	if (["true", "yes", "1", "y"].includes(normalized)) {
		return true;
	}
	if (["false", "no", "0", "n"].includes(normalized)) {
		return false;
	}
	errors.push('inbox must be one of: true/false, yes/no, 1/0');
	return undefined;
}

export function parseProjectCreateInput(input: string): ParseProjectCreateResult {
	const warnings: string[] = [];
	const errors: string[] = [];
	const trimmed = input.trim();

	if (trimmed.length === 0) {
		return {
			input: {},
			warnings,
			errors: ["Project name is required"],
			usedTokens: false,
		};
	}

	const usedTokens = /(\bname:|\bemoji:|\bdescription:|\bstart:|\bend:|\bcolor:|\binbox:|\bjiraDiscovery:|\bjiraDelivery:|\bconfluence:)/i.test(trimmed);
	if (!usedTokens) {
		return {
			input: { name: trimmed },
			warnings,
			errors,
			usedTokens: false,
		};
	}

	let working = trimmed;
	const result: Partial<ProjectCreateInput> = {};

	const knownKeys = ["name", "emoji", "description", "start", "end", "color", "inbox", "jiradiscovery", "jiradelivery", "confluence"];
	const unknownTokens = [...trimmed.matchAll(/\b([a-z_]+):/gi)]
		.map((match) => match[1]?.toLowerCase())
		.filter((key) => key && !knownKeys.includes(key));
	for (const unknown of unknownTokens) {
		warnings.push(`Unrecognized token "${unknown}:"`);
	}

	const nameMatch = working.match(/\bname:/i);
	if (nameMatch && nameMatch.index !== undefined) {
		const valueStart = nameMatch.index + nameMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		if (value.trim().length > 0) {
			result.name = value.trim();
		}
		working = (working.slice(0, nameMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const emojiMatch = working.match(/\bemoji:/i);
	if (emojiMatch && emojiMatch.index !== undefined) {
		const valueStart = emojiMatch.index + emojiMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		if (value.trim().length > 0) {
			result.emoji = parseEmojiValue(value, warnings);
		}
		working = (working.slice(0, emojiMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const descriptionMatch = working.match(/\bdescription:/i);
	if (descriptionMatch && descriptionMatch.index !== undefined) {
		const valueStart = descriptionMatch.index + descriptionMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		if (value.trim().length > 0) {
			result.description = value.trim();
		}
		working = (working.slice(0, descriptionMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const startMatch = working.match(/\bstart:/i);
	if (startMatch && startMatch.index !== undefined) {
		const valueStart = startMatch.index + startMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		const parsed = parseOptionalDate(value, "start", errors);
		if (parsed !== undefined) {
			result.startAt = parsed;
		}
		working = (working.slice(0, startMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const endMatch = working.match(/\bend:/i);
	if (endMatch && endMatch.index !== undefined) {
		const valueStart = endMatch.index + endMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		const parsed = parseOptionalDate(value, "end", errors);
		if (parsed !== undefined) {
			result.endAt = parsed;
		}
		working = (working.slice(0, endMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const colorMatch = working.match(/\bcolor:/i);
	if (colorMatch && colorMatch.index !== undefined) {
		const valueStart = colorMatch.index + colorMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		if (value.trim().length > 0) {
			const normalized = value.trim();
			if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
				errors.push('color must be a hex value like #3b82f6');
			} else {
				result.color = normalized;
			}
		}
		working = (working.slice(0, colorMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const inboxMatch = working.match(/\binbox:/i);
	if (inboxMatch && inboxMatch.index !== undefined) {
		const valueStart = inboxMatch.index + inboxMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		if (value.trim().length > 0) {
			const parsed = parseInboxValue(value, errors);
			if (parsed !== undefined) {
				result.isInbox = parsed;
			}
		}
		working = (working.slice(0, inboxMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const jiraDiscoveryMatch = working.match(/\bjiraDiscovery:/i);
	if (jiraDiscoveryMatch && jiraDiscoveryMatch.index !== undefined) {
		const valueStart = jiraDiscoveryMatch.index + jiraDiscoveryMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		const normalized = value.trim().toLowerCase();
		result.jiraDiscoveryUrl = normalized.length === 0 || ["none", "clear", "null"].includes(normalized) ? null : value.trim();
		working = (working.slice(0, jiraDiscoveryMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const jiraDeliveryMatch = working.match(/\bjiraDelivery:/i);
	if (jiraDeliveryMatch && jiraDeliveryMatch.index !== undefined) {
		const valueStart = jiraDeliveryMatch.index + jiraDeliveryMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		const normalized = value.trim().toLowerCase();
		result.jiraDeliveryUrl = normalized.length === 0 || ["none", "clear", "null"].includes(normalized) ? null : value.trim();
		working = (working.slice(0, jiraDeliveryMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const confluenceMatch = working.match(/\bconfluence:/i);
	if (confluenceMatch && confluenceMatch.index !== undefined) {
		const valueStart = confluenceMatch.index + confluenceMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		const normalized = value.trim().toLowerCase();
		result.confluenceUrl = normalized.length === 0 || ["none", "clear", "null"].includes(normalized) ? null : value.trim();
		working = (working.slice(0, confluenceMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	if (!result.name && working.length > 0) {
		result.name = working;
	}

	if (!result.name || result.name.trim().length === 0) {
		errors.push('name is required (use plain text or "name:")');
	}

	return {
		input: result,
		warnings,
		errors,
		usedTokens: true,
	};
}

export function serializeProjectToEditInput(values: ProjectEditValues): string {
	const parts: string[] = [`name:${values.name}`];
	if (values.emoji) {
		parts.push(`emoji:${values.emoji}`);
	}
	if (values.description && values.description.trim().length > 0) {
		parts.push(`description:${values.description}`);
	}
	if (values.startAt) {
		parts.push(`start:${values.startAt}`);
	}
	if (values.endAt) {
		parts.push(`end:${values.endAt}`);
	}
	if (values.jiraDiscoveryUrl) {
		parts.push(`jiraDiscovery:${values.jiraDiscoveryUrl}`);
	}
	if (values.jiraDeliveryUrl) {
		parts.push(`jiraDelivery:${values.jiraDeliveryUrl}`);
	}
	if (values.confluenceUrl) {
		parts.push(`confluence:${values.confluenceUrl}`);
	}
	return parts.join(" ");
}
