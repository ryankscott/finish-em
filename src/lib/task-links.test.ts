import { describe, expect, it } from "bun:test";

import {
	ensureScheme,
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
			expect(
				parseTaskLinkSegments("See [Spec doc](https://example.com/spec)"),
			).toEqual([
				{ type: "text", text: "See " },
				{ type: "link", url: "https://example.com/spec", label: "Spec doc" },
			]);
		});

		it("parses bare URL as link segment with null label", () => {
			expect(
				parseTaskLinkSegments("Check https://docs.example.com/path"),
			).toEqual([
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
			expect(result).toContainEqual({
				type: "link",
				url: "https://x.com",
				label: null,
			});
		});

		it("handles trailing whitespace inside [label](url ) parens", () => {
			expect(parseTaskLinkSegments("[doc](https://example.com/page )")).toEqual(
				[{ type: "link", url: "https://example.com/page", label: "doc" }],
			);
		});

		it("handles multiple trailing spaces inside parens", () => {
			expect(
				parseTaskLinkSegments("[doc](https://example.com/page   )"),
			).toEqual([
				{ type: "link", url: "https://example.com/page", label: "doc" },
			]);
		});

		it("parses long Confluence-style labeled link with trailing space", () => {
			const input =
				"[doc](https://idexx.atlassian.net/wiki/spaces/DEV/pages/123/My+Page )";
			expect(parseTaskLinkSegments(input)).toEqual([
				{
					type: "link",
					url: "https://idexx.atlassian.net/wiki/spaces/DEV/pages/123/My+Page",
					label: "doc",
				},
			]);
		});
	});

	describe("getLinkDisplayLabel", () => {
		it("returns custom label when provided", () => {
			expect(getLinkDisplayLabel("https://example.com", "Spec")).toBe("Spec");
			expect(getLinkDisplayLabel("https://example.com", "  Doc  ")).toBe("Doc");
		});

		it("returns last path segment as label for URLs with a path", () => {
			expect(getLinkDisplayLabel("https://docs.example.com/spec", null)).toBe(
				"spec",
			);
			expect(getLinkDisplayLabel("https://github.com/user/repo", null)).toBe(
				"repo",
			);
		});

		it("returns hostname when URL has no meaningful path", () => {
			expect(getLinkDisplayLabel("https://example.com", null)).toBe(
				"example.com",
			);
			expect(getLinkDisplayLabel("https://example.com/", null)).toBe(
				"example.com",
			);
		});

		it("decodes percent-encoded path segments", () => {
			expect(
				getLinkDisplayLabel("https://example.com/hello%20world", null),
			).toBe("hello world");
		});

		it("uses last segment for deep paths (Confluence-style URLs)", () => {
			expect(
				getLinkDisplayLabel(
					"https://idexx.atlassian.net/wiki/spaces/DEV/pages/123/My+Page+Title",
					null,
				),
			).toBe("My+Page+Title");
		});

		it("returns fallback when URL is empty or throws", () => {
			expect(getLinkDisplayLabel("", null)).toBe("link");
		});

		it("returns hostname for URL-like string without path even without TLD", () => {
			expect(getLinkDisplayLabel("https://not-a-url", null)).toBe("not-a-url");
		});

		it("parses URL without scheme by prefixing https", () => {
			expect(getLinkDisplayLabel("example.com/path", null)).toBe("path");
		});
	});

	describe("ensureScheme", () => {
		it("returns empty for empty input", () => {
			expect(ensureScheme("")).toBe("");
		});

		it("preserves http:// URLs", () => {
			expect(ensureScheme("http://example.com")).toBe("http://example.com");
		});

		it("preserves https:// URLs", () => {
			expect(ensureScheme("https://example.com")).toBe("https://example.com");
		});

		it("prepends https:// for schemeless URLs", () => {
			expect(ensureScheme("www.google.com")).toBe("https://www.google.com");
			expect(ensureScheme("example.com/path")).toBe("https://example.com/path");
		});
	});

	describe("toDisplaySegments", () => {
		it("returns text segment unchanged", () => {
			expect(toDisplaySegments("Hello")).toEqual([
				{ type: "text", text: "Hello" },
			]);
		});

		it("returns link segment with last path segment as displayLabel for bare URL", () => {
			expect(toDisplaySegments("https://docs.example.com/spec")).toEqual([
				{
					type: "link",
					displayLabel: "spec",
					url: "https://docs.example.com/spec",
				},
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

		it("renders bare URL as [last-path-segment]", () => {
			expect(toDisplayString("Check https://docs.example.com/spec")).toBe(
				"Check [spec]",
			);
		});

		it("renders root-only URL as [hostname]", () => {
			expect(toDisplayString("Visit https://example.com")).toBe(
				"Visit [example.com]",
			);
		});

		it("renders [label](url) as [label]", () => {
			expect(toDisplayString("See [Spec doc](https://example.com)")).toBe(
				"See [Spec doc]",
			);
		});

		it("renders multiple links", () => {
			expect(toDisplayString("[A](https://a.com) and https://b.com")).toBe(
				"[A] and [b.com]",
			);
		});
	});

	describe("normalizeBareUrlsInText", () => {
		it("leaves plain text unchanged", () => {
			expect(normalizeBareUrlsInText("No links")).toBe("No links");
		});

		it("replaces bare URL with [last-segment](url)", () => {
			expect(
				normalizeBareUrlsInText("Check https://docs.example.com/path"),
			).toBe("Check [path](https://docs.example.com/path)");
		});

		it("uses hostname for root-only bare URL", () => {
			expect(normalizeBareUrlsInText("Visit https://example.com")).toBe(
				"Visit [example.com](https://example.com)",
			);
		});

		it("leaves [label](url) label unchanged", () => {
			expect(normalizeBareUrlsInText("See [Spec](https://example.com)")).toBe(
				"See [Spec](https://example.com)",
			);
		});

		it("adds scheme to schemeless labeled links", () => {
			expect(normalizeBareUrlsInText("[doc](www.google.com)")).toBe(
				"[doc](https://www.google.com)",
			);
		});

		it("normalizes multiple bare URLs", () => {
			expect(normalizeBareUrlsInText("a https://a.com b https://b.com")).toBe(
				"a [a.com](https://a.com) b [b.com](https://b.com)",
			);
		});

		it("uses last path segment for deep URLs", () => {
			expect(
				normalizeBareUrlsInText(
					"https://idexx.atlassian.net/wiki/spaces/DEV/pages/123/My+Page",
				),
			).toBe(
				"[My+Page](https://idexx.atlassian.net/wiki/spaces/DEV/pages/123/My+Page)",
			);
		});

		it("strips trailing whitespace from URL inside labeled link", () => {
			expect(normalizeBareUrlsInText("[doc](https://example.com/page )")).toBe(
				"[doc](https://example.com/page)",
			);
		});

		it("normalizes labeled link with trailing space and schemeless URL", () => {
			expect(normalizeBareUrlsInText("[doc](www.google.com )")).toBe(
				"[doc](https://www.google.com)",
			);
		});
	});

	describe("round-trip stability", () => {
		it("normalization is idempotent for labeled links", () => {
			const first = normalizeBareUrlsInText("[doc](https://example.com/page )");
			const second = normalizeBareUrlsInText(first);
			expect(second).toBe(first);
		});

		it("normalization is idempotent for bare URLs", () => {
			const first = normalizeBareUrlsInText(
				"https://idexx.atlassian.net/wiki/spaces/DEV/pages/123/My+Page",
			);
			const second = normalizeBareUrlsInText(first);
			expect(second).toBe(first);
		});

		it("normalized link can be opened via toDisplaySegments", () => {
			const stored = normalizeBareUrlsInText(
				"[doc](https://idexx.atlassian.net/wiki/spaces/DEV/pages/123/My+Page )",
			);
			const segments = toDisplaySegments(stored);
			const links = segments.filter(
				(s): s is Extract<typeof s, { type: "link" }> => s.type === "link",
			);
			expect(links).toHaveLength(1);
			expect(links[0].url).toBe(
				"https://idexx.atlassian.net/wiki/spaces/DEV/pages/123/My+Page",
			);
			expect(links[0].displayLabel).toBe("doc");
		});

		it("bare URL round-trips through normalize → display → open", () => {
			const stored = normalizeBareUrlsInText(
				"https://idexx.atlassian.net/wiki/spaces/DEV/pages/6058935682/2025-02-27+ezyVet+Feature+Release+Process",
			);
			const segments = toDisplaySegments(stored);
			const links = segments.filter(
				(s): s is Extract<typeof s, { type: "link" }> => s.type === "link",
			);
			expect(links).toHaveLength(1);
			expect(links[0].url).toBe(
				"https://idexx.atlassian.net/wiki/spaces/DEV/pages/6058935682/2025-02-27+ezyVet+Feature+Release+Process",
			);
			expect(links[0].displayLabel).toBe(
				"2025-02-27+ezyVet+Feature+Release+Process",
			);
		});
	});
});
