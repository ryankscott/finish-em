import type { Project, ProjectResourceInput } from "@/server/types";
import { resolveDateField } from "./date-field";

export type ProjectDraft = {
	name: string;
	emoji: string;
	description: string;
	start: string;
	end: string;
	color: string;
	resources: ProjectResourceInput[];
};

export function resolveProjectDraft(
	draft: ProjectDraft,
	original?: Project | null,
) {
	if (!draft.name.trim()) return { error: "Project name is required." };
	if (!/^#[0-9a-f]{6}$/i.test(draft.color))
		return { error: "Use a six-digit hex colour, for example #435c76." };
	const startAt = resolveDateField(draft.start, original?.startAt ?? null);
	const endAt = resolveDateField(draft.end, original?.endAt ?? null);
	if (startAt === "invalid" || endAt === "invalid")
		return { error: "Choose valid project dates." };
	if (startAt && endAt && startAt > endAt)
		return { error: "The end date must be on or after the start date." };
	const resources = draft.resources
		.map((r) => ({ label: r.label.trim(), url: r.url.trim() }))
		.filter((r) => r.label || r.url);
	for (const resource of resources) {
		if (!resource.label || !resource.url)
			return { error: "Each resource needs a label and a URL." };
		try {
			new URL(resource.url);
		} catch {
			return { error: "Enter a complete resource URL, including https://." };
		}
	}
	return {
		input: {
			name: draft.name.trim(),
			emoji: draft.emoji.trim() || null,
			description: draft.description.trim(),
			startAt,
			endAt,
			color: draft.color,
			resources,
		},
	};
}
