import { describe, expect, it } from "bun:test";
import type { Project } from "@/server/types";
import { tokenizeQuickAdd } from "./quick-add-highlight";

const project = (id: number, name: string): Project =>
	({ id, name, isInbox: false }) as Project;

const PROJECTS = [project(1, "Work"), project(2, "Finance Stuff")];

const tokens = (value: string) =>
	tokenizeQuickAdd(value, PROJECTS)
		.filter((s) => s.kind)
		.map((s) => [s.kind, s.text]);

describe("tokenizeQuickAdd", () => {
	it("highlights a complete due token", () => {
		expect(tokens("do a thing due:today")).toEqual([["due", "due:today"]]);
	});

	it("does not highlight a bare prefix", () => {
		expect(tokens("do a thing due:")).toEqual([]);
	});

	it("highlights priority, project, due, scheduled and recurrence", () => {
		expect(
			tokens("ship p1 project:Work due:tom sch:nxt recurs:weekly"),
		).toEqual([
			["priority", "p1"],
			["project", "project:Work"],
			["due", "due:tom"],
			["scheduled", "sch:nxt"],
			["recurrence", "recurs:weekly"],
		]);
	});

	it("highlights a multi-word project name", () => {
		expect(tokens("pay bills project:Finance Stuff p2")).toEqual([
			["project", "project:Finance Stuff"],
			["priority", "p2"],
		]);
	});

	it("does not highlight an unknown project", () => {
		expect(tokens("task project:Nope")).toEqual([]);
	});

	it("leaves plain text as a single non-token segment", () => {
		const segs = tokenizeQuickAdd("just a title", PROJECTS);
		expect(segs).toEqual([{ text: "just a title", kind: null }]);
	});

	it("preserves surrounding text and spacing around a token", () => {
		const segs = tokenizeQuickAdd("a p1 b", PROJECTS);
		expect(segs).toEqual([
			{ text: "a ", kind: null },
			{ text: "p1", kind: "priority" },
			{ text: " b", kind: null },
		]);
	});
});
