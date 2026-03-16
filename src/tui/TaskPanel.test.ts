import { describe, expect, it } from "bun:test";

import { toDisplayString } from "../lib/task-links";
import { truncate } from "./task-display-helpers";

/**
 * Tests for the display logic used in TaskPanel's collapsed notes preview
 * and project description rendering. These test the pure function pipeline
 * (toDisplayString + truncate) that the component applies at render time.
 */

describe("TaskPanel collapsed notes preview display", () => {
	it("renders markdown link as [label] in the collapsed preview", () => {
		const notes = "See [My Doc](https://example.com/doc) for details";
		const result = truncate(toDisplayString(notes), 80).trimEnd();
		expect(result).toBe("See [My Doc] for details");
	});

	it("renders bare URL as [label] in the collapsed preview", () => {
		const notes = "Check https://docs.example.com/spec for more";
		const result = truncate(toDisplayString(notes), 80).trimEnd();
		expect(result).toBe("Check [spec] for more");
	});

	it("truncates after link shortening, not before", () => {
		// A raw URL over 80 chars gets truncated mid-URL if not shortened first.
		// After shortening to [label], the result fits within 80 chars.
		const longUrl = "https://example.com/" + "a".repeat(70);
		const notes = `See ${longUrl}`;
		const rawTruncated = truncate(notes, 80);
		const shortenedTruncated = truncate(toDisplayString(notes), 80).trimEnd();
		expect(shortenedTruncated).toBe(`See [${"a".repeat(70)}]`);
		// raw truncation would clip the URL mid-string
		expect(rawTruncated).toContain("…");
	});

	it("leaves plain text unchanged in collapsed preview", () => {
		const notes = "Just a plain note with no links";
		const result = truncate(toDisplayString(notes), 80).trimEnd();
		expect(result).toBe("Just a plain note with no links");
	});
});

describe("TaskPanel project description display", () => {
	it("renders markdown link in project description as [label]", () => {
		const description = "Design doc at [Spec](https://example.com/spec)";
		expect(toDisplayString(description)).toBe("Design doc at [Spec]");
	});

	it("renders bare URL in project description as [label]", () => {
		const description = "See https://docs.example.com/overview for context";
		expect(toDisplayString(description)).toBe("See [overview] for context");
	});

	it("leaves plain project description unchanged", () => {
		const description = "A project about building things";
		expect(toDisplayString(description)).toBe("A project about building things");
	});

	it("renders multiple links in project description", () => {
		const description = "[Board](https://jira.example.com) and [Docs](https://docs.example.com)";
		expect(toDisplayString(description)).toBe("[Board] and [Docs]");
	});
});
