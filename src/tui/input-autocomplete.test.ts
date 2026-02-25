import { describe, expect, it } from "vitest";

import type { Project } from "../server/types";
import {
	getProjectCreateAutocomplete,
	getTaskCreateAutocomplete,
} from "./input-autocomplete";

const makeProject = (id: number, name: string): Project => ({
	id,
	name,
	emoji: null,
	description: "",
	startAt: null,
	endAt: null,
	color: "#000000",
	isInbox: false,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
});

const PROJECTS = [makeProject(1, "Inbox"), makeProject(2, "Work")];

describe("input autocomplete", () => {
	it("suggests project token keys", () => {
		const suggestion = getProjectCreateAutocomplete("na");
		expect(suggestion?.nextValue).toBe("name:");
	});

	it("suggests project inbox values", () => {
		const suggestion = getProjectCreateAutocomplete("inbox:t");
		expect(suggestion?.nextValue).toBe("inbox:true");
	});

	it("suggests project emoji shortcode values from shared source", () => {
		const suggestion = getProjectCreateAutocomplete("emoji::ro");
		expect(suggestion?.nextValue).toBe("emoji::rocket:");
	});

	it("suggests additional emoji shortcodes (e.g. heart)", () => {
		const suggestion = getProjectCreateAutocomplete("emoji::he");
		expect(suggestion?.nextValue).toBe("emoji::heart:");
	});

	it("suggests task token keys", () => {
		const suggestion = getTaskCreateAutocomplete("proj", PROJECTS);
		expect(suggestion?.nextValue).toBe("project:");
	});

	it("suggests task project values from known project names", () => {
		const suggestion = getTaskCreateAutocomplete("project:Wo", PROJECTS);
		expect(suggestion?.nextValue).toBe("project:Work");
	});

	it("suggests task recurrence values", () => {
		const suggestion = getTaskCreateAutocomplete("recurs:we", PROJECTS);
		expect(suggestion?.nextValue).toBe("recurs:weekly");
	});
});
