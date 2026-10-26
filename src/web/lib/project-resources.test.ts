import { expect, test } from "bun:test";
import { resourceDomain, resourceError } from "./project-resources";

test("resource summaries show the domain without paths, queries, or www", () => {
	expect(
		resourceDomain("https://www.example.com/long/path?token=private"),
	).toBe("example.com");
	expect(resourceDomain("not a URL")).toBe("not a URL");
	expect(resourceDomain("mailto:ryan@example.com")).toBe("mailto:");
});

test("resource editor and project save agree on complete links", () => {
	expect(
		resourceError({ label: " Docs ", url: " https://example.com " }),
	).toBeNull();
	expect(
		resourceError({ label: " ", url: "https://example.com" }),
	).toBeTruthy();
	expect(resourceError({ label: "Docs", url: "" })).toBeTruthy();
	expect(resourceError({ label: "Docs", url: "example.com" })).toContain(
		"https://",
	);
});
