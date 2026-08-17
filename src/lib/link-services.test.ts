import { describe, expect, it } from "bun:test";

import { getServiceLinkLabel, identifyLinkService } from "./link-services";

describe("identifyLinkService", () => {
	it("recognises github.com", () => {
		expect(identifyLinkService("https://github.com/foo/bar")?.id).toBe(
			"github",
		);
	});

	it("recognises www. prefixes", () => {
		expect(identifyLinkService("https://www.github.com/foo/bar")?.id).toBe(
			"github",
		);
	});

	it("recognises subdomains", () => {
		expect(identifyLinkService("https://gist.github.com/foo")?.id).toBe(
			"github",
		);
	});

	it("recognises atlassian.net as jira by default", () => {
		expect(
			identifyLinkService("https://myco.atlassian.net/browse/PROJ-123")?.id,
		).toBe("jira");
	});

	it("recognises atlassian.net /wiki/ paths as confluence", () => {
		expect(
			identifyLinkService(
				"https://myco.atlassian.net/wiki/spaces/SPACE/pages/123/Page",
			)?.id,
		).toBe("confluence");
	});

	it("recognises notion.so", () => {
		expect(identifyLinkService("https://www.notion.so/Some-Page-abc")?.id).toBe(
			"notion",
		);
	});

	it("recognises linear.app", () => {
		expect(
			identifyLinkService("https://linear.app/team/issue/ENG-45/title")?.id,
		).toBe("linear");
	});

	it("recognises slack.com", () => {
		expect(identifyLinkService("https://myco.slack.com/archives/C1")?.id).toBe(
			"slack",
		);
	});

	it("returns null for an unknown host", () => {
		expect(identifyLinkService("https://example.com/some/page")).toBeNull();
	});

	it("returns null for a malformed url", () => {
		expect(identifyLinkService("not a url")).toBeNull();
	});

	it("does not match a host as a substring of the path", () => {
		expect(identifyLinkService("https://evil.com/github.com/foo")).toBeNull();
	});

	it("does not match a host as a substring of a query param", () => {
		expect(identifyLinkService("https://evil.com/?next=github.com")).toBeNull();
	});
});

describe("getServiceLinkLabel", () => {
	it("derives PROJ-123 from a Jira browse url", () => {
		expect(
			getServiceLinkLabel("https://myco.atlassian.net/browse/PROJ-123"),
		).toBe("PROJ-123");
	});

	it("derives owner/repo#42 from a GitHub PR url", () => {
		expect(getServiceLinkLabel("https://github.com/owner/repo/pull/42")).toBe(
			"owner/repo#42",
		);
	});

	it("derives owner/repo#42 from a GitHub issue url", () => {
		expect(getServiceLinkLabel("https://github.com/owner/repo/issues/42")).toBe(
			"owner/repo#42",
		);
	});

	it("derives owner/repo from a bare GitHub repo url", () => {
		expect(getServiceLinkLabel("https://github.com/owner/repo")).toBe(
			"owner/repo",
		);
	});

	it("returns null for a recognised host with an unrecognised path shape", () => {
		expect(getServiceLinkLabel("https://github.com/settings")).toBeNull();
	});

	it("derives ENG-45 from a Linear issue url", () => {
		expect(
			getServiceLinkLabel("https://linear.app/team/issue/ENG-45/title"),
		).toBe("ENG-45");
	});

	it("derives a readable title from a Notion page url", () => {
		expect(
			getServiceLinkLabel(
				"https://www.notion.so/Some-Page-1234567890abcdef1234567890abcdef",
			),
		).toBe("Some Page");
	});

	it("derives a readable title from a Confluence page url", () => {
		expect(
			getServiceLinkLabel(
				"https://myco.atlassian.net/wiki/spaces/SPACE/pages/123/Page+Title",
			),
		).toBe("Page Title");
	});

	it("returns null for an unrecognised service", () => {
		expect(getServiceLinkLabel("https://example.com/some/page")).toBeNull();
	});
});
