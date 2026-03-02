import { describe, expect, it } from "bun:test";

import {
	getLinkDisplayLabel,
	normalizeBareUrlsInText,
	parseTaskLinkSegments,
	toDisplaySegments,
	toDisplayString,
} from "./task-links";

describe("task-links", () => {
	describe("parseTaskLinkSegments", () => {
		it("returns empty array for empty input", () => {
			expect(parseTaskLinkSegments("")).toEqual([]);
		});

		it("parses plain text as single text segment", () => {
			expect(parseTaskLinkSegments("Hello world")).toEqual([
				{ type: "text", text: "Hello world" },
			]);
		});

		it("parses [link text](url) as link segment with label and url", () => {
			expect(parseTaskLinkSegments("See [Spec doc](https://example.com/spec)")).toEqual([
				{ type: "text", text: "See " },
				{ type: "link", url: "https://example.com/spec", label: "Spec doc" },
			]);
		});

		it("parses bare URL as link segment with null label", () => {
			expect(parseTaskLinkSegments("Check https://docs.example.com/path")).toEqual([
				{ type: "text", text: "Check " },
				{ type: "link", url: "https://docs.example.com/path", label: null },
			]);
		});

		it("parses multiple links in one string", () => {
			const result = parseTaskLinkSegments(
				"[A](https://a.com) and https://b.com and [C](https://c.com)",
			);
			expect(result).toEqual([
				{ type: "link", url: "https://a.com", label: "A" },
				{ type: "text", text: " and " },
				{ type: "link", url: "https://b.com", label: null },
				{ type: "text", text: " and " },
				{ type: "link", url: "https://c.com", label: "C" },
			]);
		});

		it("treats empty label in [ ](url) as null", () => {
			expect(parseTaskLinkSegments("[ ](https://example.com)")).toEqual([
				{ type: "link", url: "https://example.com", label: null },
			]);
		});

		it("does not match [label](url) when label contains ]; rest is text and bare URL", () => {
			// [^\]]* stops at first ], so "[a] b](url)" matches as label "a" only if ]( follows; "[a] b](" does not
			const result = parseTaskLinkSegments("[a] b](https://x.com)");
			expect(result).toContainEqual({ type: "link", url: "https://x.com", label: null });
		});
	});

	describe("getLinkDisplayLabel", () => {
		it("returns custom label when provided", () => {
			expect(getLinkDisplayLabel("https://example.com", "Spec")).toBe("Spec");
			expect(getLinkDisplayLabel("https://example.com", "  Doc  ")).toBe("Doc");
		});

		it("returns hostname as label when custom label is null or empty", () => {
			expect(getLinkDisplayLabel("https://docs.example.com/spec", null)).toBe(
				"docs.example.com",
			);
			expect(getLinkDisplayLabel("https://github.com/user/repo", null)).toBe("github.com");
		});

		it("returns fallback when URL is empty or throws", () => {
			expect(getLinkDisplayLabel("", null)).toBe("link");
		});

		it("returns hostname for URL-like string even without TLD (URL parser accepts it)", () => {
			expect(getLinkDisplayLabel("https://not-a-url", null)).toBe("not-a-url");
		});

		it("parses URL without scheme by prefixing https", () => {
			expect(getLinkDisplayLabel("example.com/path", null)).toBe("example.com");
		});
	});

	describe("toDisplaySegments", () => {
		it("returns text segment unchanged", () => {
			expect(toDisplaySegments("Hello")).toEqual([{ type: "text", text: "Hello" }]);
		});

		it("returns link segment with displayLabel (domain) for bare URL", () => {
			expect(toDisplaySegments("https://docs.example.com/spec")).toEqual([
				{ type: "link", displayLabel: "docs.example.com", url: "https://docs.example.com/spec" },
			]);
		});

		it("returns link segment with custom label for [label](url)", () => {
			expect(toDisplaySegments("[Spec doc](https://example.com)")).toEqual([
				{ type: "link", displayLabel: "Spec doc", url: "https://example.com" },
			]);
		});

		it("mixed text and links", () => {
			expect(toDisplaySegments("See [here](https://x.com) for more")).toEqual([
				{ type: "text", text: "See " },
				{ type: "link", displayLabel: "here", url: "https://x.com" },
				{ type: "text", text: " for more" },
			]);
		});
	});

	describe("toDisplayString", () => {
		it("renders plain text unchanged", () => {
			expect(toDisplayString("No links")).toBe("No links");
		});

		it("renders bare URL as [domain]", () => {
			expect(toDisplayString("Check https://docs.example.com/spec")).toBe(
				"Check [docs.example.com]",
			);
		});

		it("renders [label](url) as [label]", () => {
			expect(toDisplayString("See [Spec doc](https://example.com)")).toBe("See [Spec doc]");
		});

		it("renders multiple links", () => {
			expect(
				toDisplayString("[A](https://a.com) and https://b.com"),
			).toBe("[A] and [b.com]");
		});
	});

	describe("normalizeBareUrlsInText", () => {
		it("leaves plain text unchanged", () => {
			expect(normalizeBareUrlsInText("No links")).toBe("No links");
		});

		it("replaces bare URL with [domain](url)", () => {
			expect(normalizeBareUrlsInText("Check https://docs.example.com/path")).toBe(
				"Check [docs.example.com](https://docs.example.com/path)",
			);
		});

		it("leaves [label](url) unchanged", () => {
			expect(
				normalizeBareUrlsInText("See [Spec](https://example.com)"),
			).toBe("See [Spec](https://example.com)");
		});

		it("normalizes multiple bare URLs", () => {
			expect(
				normalizeBareUrlsInText("a https://a.com b https://b.com"),
			).toBe("a [a.com](https://a.com) b [b.com](https://b.com)");
		});
	});
});
