import { describe, expect, test } from "bun:test";
import type { Project } from "@/server/types";
import { formatDateField } from "./date-field";
import { type ProjectDraft, resolveProjectDraft } from "./project-draft";
import { reorderProjectIds } from "./project-order";

const project: Project = {
	id: 1,
	name: "Work",
	emoji: "🐶",
	description: "",
	startAt: "2026-10-24T01:30:15.123Z",
	endAt: "2026-11-01T01:30:15.123Z",
	color: "#435c76",
	isInbox: false,
	sortOrder: 3,
	resources: [
		{ id: 1, label: "Docs", url: "https://example.com", sortOrder: 0 },
	],
	createdAt: "",
	updatedAt: "",
};
const draft: ProjectDraft = {
	name: "Work",
	emoji: "🐶",
	description: "Details",
	start: formatDateField(project.startAt),
	end: formatDateField(project.endAt),
	color: project.color,
	resources: project.resources,
};
describe("project editing", () => {
	test("retains exact dates and all resource fields", () => {
		expect(resolveProjectDraft(draft, project).input).toMatchObject({
			startAt: project.startAt,
			endAt: project.endAt,
			description: "Details",
			color: project.color,
			resources: [{ label: "Docs", url: "https://example.com" }],
		});
	});
	test("can clear emoji, dates, description and resources without changing identity or order", () => {
		const result = resolveProjectDraft(
			{
				...draft,
				emoji: "",
				start: "",
				end: "",
				description: "",
				resources: [],
			},
			project,
		);
		expect(result.input).toMatchObject({
			emoji: null,
			startAt: null,
			endAt: null,
			resources: [],
			description: "",
		});
		expect(result.input).not.toHaveProperty("isInbox");
		expect(result.input).not.toHaveProperty("sortOrder");
	});
	test("blocks incomplete links rather than silently deleting them", () => {
		expect(
			resolveProjectDraft(
				{ ...draft, resources: [{ label: "Docs", url: "" }] },
				project,
			).error,
		).toBeDefined();
		expect(
			resolveProjectDraft(
				{ ...draft, resources: [{ label: "Docs", url: "broken" }] },
				project,
			).error,
		).toBeDefined();
	});
	test("validates colours and date order", () => {
		expect(
			resolveProjectDraft({ ...draft, color: "invalid" }, project).error,
		).toBeDefined();
		expect(
			resolveProjectDraft({ ...draft, end: "2020-01-01" }, project).error,
		).toBeDefined();
	});
	test("reordering moves exactly one project and ignores invalid drops", () => {
		const projects = [project, { ...project, id: 2 }, { ...project, id: 3 }];
		expect(reorderProjectIds(projects, 1, 3)).toEqual([2, 3, 1]);
		expect(reorderProjectIds(projects, 8, 1)).toEqual([1, 2, 3]);
		expect(projects.map((p) => p.id)).toEqual([1, 2, 3]);
	});
});
