import { shortcodeListForAutocomplete } from "../emoji-shortcodes";
import type { Project } from "../../server/types";

type AutocompleteSuggestion = {
	nextValue: string;
	hint: string;
};

const PROJECT_KEYS = [
	"name:",
	"color:",
	"emoji:",
	"description:",
	"start:",
	"end:",
	"inbox:",
	"jiraDiscovery:",
	"jiraDelivery:",
	"confluence:",
];
const TASK_KEYS = ["title:", "project:", "priority:", "due:", "scheduled:", "notes:", "parent:", "recurs:"];

function normalizeWords(input: string): { prefix: string; fragment: string } {
	const trimmedEnd = input.replace(/\s+$/, "");
	const lastSpace = trimmedEnd.lastIndexOf(" ");
	if (lastSpace === -1) {
		return { prefix: "", fragment: trimmedEnd };
	}
	return {
		prefix: `${trimmedEnd.slice(0, lastSpace + 1)}`,
		fragment: trimmedEnd.slice(lastSpace + 1),
	};
}

function keySuggestion(input: string, keys: string[]): AutocompleteSuggestion | null {
	const { prefix, fragment } = normalizeWords(input);
	if (fragment.includes(":")) {
		return null;
	}
	const normalized = fragment.toLowerCase();
	if (!normalized) {
		return {
			nextValue: input,
			hint: keys.join("  "),
		};
	}
	const match = keys.find((key) => key.startsWith(normalized));
	if (!match) {
		return null;
	}
	return {
		nextValue: `${prefix}${match}`,
		hint: `Tab to complete ${match}`,
	};
}

function valueSuggestion(input: string, values: string[]): AutocompleteSuggestion | null {
	const { prefix, fragment } = normalizeWords(input);
	const colonIndex = fragment.indexOf(":");
	if (colonIndex === -1) return null;
	const key = fragment.slice(0, colonIndex + 1);
	const valuePrefix = fragment.slice(colonIndex + 1).toLowerCase();
	const match = values.find((value) => value.toLowerCase().startsWith(valuePrefix));
	if (!match) {
		return null;
	}
	return {
		nextValue: `${prefix}${key}${match}`,
		hint: `Tab to complete ${key}${match}`,
	};
}

export function getProjectCreateAutocomplete(input: string): AutocompleteSuggestion | null {
	const keyMatch = keySuggestion(input, PROJECT_KEYS);
	if (keyMatch) return keyMatch;

	const { fragment } = normalizeWords(input);
	if (fragment.toLowerCase().startsWith("inbox:")) {
		return valueSuggestion(input, ["true", "false"]);
	}
	if (fragment.toLowerCase().startsWith("emoji:")) {
		return valueSuggestion(input, [...shortcodeListForAutocomplete()]);
	}
	if (fragment.toLowerCase().startsWith("color:")) {
		const { prefix } = normalizeWords(input);
		if (fragment.length === "color:".length) {
			return {
				nextValue: `${prefix}color:#3b82f6`,
				hint: "Tab to use sample hex color",
			};
		}
	}

	return null;
}

export function getTaskCreateAutocomplete(
	input: string,
	projects: Project[],
): AutocompleteSuggestion | null {
	const keyMatch = keySuggestion(input, TASK_KEYS);
	if (keyMatch) return keyMatch;

	const { fragment } = normalizeWords(input);
	const lower = fragment.toLowerCase();

	if (lower.startsWith("project:")) {
		const projectNames = projects.map((project) => project.name);
		return valueSuggestion(input, projectNames);
	}
	if (lower.startsWith("priority:")) {
		return valueSuggestion(input, ["1", "2", "3", "4"]);
	}
	if (lower.startsWith("recurs:")) {
		return valueSuggestion(input, ["daily", "weekly", "monthly", "yearly", "every_weekday", "none"]);
	}
	if (lower.startsWith("due:")) {
		return valueSuggestion(input, ["today", "tomorrow", "next week", "none"]);
	}
	if (lower.startsWith("scheduled:")) {
		return valueSuggestion(input, ["today", "tomorrow", "next week", "none"]);
	}

	return null;
}
