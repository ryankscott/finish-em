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

	it("does not highlight tokens inside a URL", () => {
		const url = "https://example.com/p1/due:today";
		const segs = tokenizeQuickAdd(`see ${url} p2`, PROJECTS);
		expect(segs).toEqual([
			{ text: `see ${url} `, kind: null },
			{ text: "p2", kind: "priority" },
		]);
	});
});

describe("estimate tokens", () => {
	it("pills a minute estimate", () => {
		expect(tokenizeQuickAdd("Write est:45m", PROJECTS)).toEqual([
			{ text: "Write ", kind: null },
			{ text: "est:45m", kind: "estimate" },
		]);
	});

	it("pills the hour forms", () => {
		expect(
			tokenizeQuickAdd("est:1h30", PROJECTS).find((s) => s.kind === "estimate")
				?.text,
		).toBe("est:1h30");
		expect(
			tokenizeQuickAdd("estimate:2h", PROJECTS).find(
				(s) => s.kind === "estimate",
			)?.text,
		).toBe("estimate:2h");
	});

	it("pills a bare number as minutes", () => {
		expect(
			tokenizeQuickAdd("est:45", PROJECTS).find((s) => s.kind === "estimate")
				?.text,
		).toBe("est:45");
	});

	it("leaves an incomplete estimate as plain text", () => {
		expect(
			tokenizeQuickAdd("Write est:", PROJECTS).some(
				(s) => s.kind === "estimate",
			),
		).toBe(false);
	});

	it("does not pill an unreadable value", () => {
		expect(
			tokenizeQuickAdd("Write est:soon", PROJECTS).some(
				(s) => s.kind === "estimate",
			),
		).toBe(false);
	});

	it("leaves a URL containing est: untouched", () => {
		const segments = tokenizeQuickAdd(
			"Read https://example.com/est:45m/docs",
			PROJECTS,
		);
		expect(segments.some((s) => s.kind === "estimate")).toBe(false);
	});

	it("does not swallow a following token", () => {
		const segments = tokenizeQuickAdd("Write est:45m due:today", PROJECTS);
		expect(segments.find((s) => s.kind === "estimate")?.text).toBe("est:45m");
		expect(segments.find((s) => s.kind === "due")?.text).toBe("due:today");
	});
});

describe("tokenizeQuickAdd notes", () => {
	it("pills multi-word notes up to the next token", () => {
		const segments = tokenizeQuickAdd(
			"Call vet notes:ask about the diet p1",
			PROJECTS,
		);
		expect(segments.find((s) => s.kind === "notes")?.text).toBe(
			"notes:ask about the diet",
		);
		expect(segments.find((s) => s.kind === "priority")?.text).toBe("p1");
	});

	it("leaves a bare notes: as plain text", () => {
		expect(
			tokenizeQuickAdd("Call vet notes:", PROJECTS).some(
				(s) => s.kind === "notes",
			),
		).toBe(false);
	});
});
