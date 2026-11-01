import type { Project, ProjectResourceInput } from "@/server/types";
import { resolveDateField } from "./date-field";
import { resourceError } from "./project-resources";

export type ProjectDraft = {
	name: string;
	emoji: string;
	description: string;
	start: string;
	end: string;
	resources: ProjectResourceInput[];
};

export function resolveProjectDraft(
	draft: ProjectDraft,
	original?: Project | null,
) {
	if (!draft.name.trim()) return { error: "Project name is required." };
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
		const error = resourceError(resource);
		if (error) return { error };
	}
	return {
		input: {
			name: draft.name.trim(),
			emoji: draft.emoji.trim() || null,
			description: draft.description.trim(),
			startAt,
			endAt,
			resources,
		},
	};
}
