import { describe, expect, it } from "vitest";

import { lookup, shortcodeListForAutocomplete } from "./emoji-shortcodes";

describe("emoji-shortcodes", () => {
	describe("lookup", () => {
		it("returns emoji for known shortcode (lowercase)", () => {
			expect(lookup("cat")).toBe("🐱");
			expect(lookup("rocket")).toBe("🚀");
		});

		it("returns emoji for shortcode with colons", () => {
			expect(lookup(":cat:")).toBe("🐱");
			expect(lookup(":rocket:")).toBe("🚀");
		});

		it("is case-insensitive", () => {
			expect(lookup("CAT")).toBe("🐱");
			expect(lookup("Rocket")).toBe("🚀");
		});

		it("returns undefined for unknown shortcode", () => {
			expect(lookup("unknown")).toBeUndefined();
			expect(lookup(":nope:")).toBeUndefined();
		});
	});

	describe("shortcodeListForAutocomplete", () => {
		it("returns list in :shortcode: form", () => {
			const list = shortcodeListForAutocomplete();
			expect(list.length).toBeGreaterThan(0);
			for (const s of list) {
				expect(s).toMatch(/^:[a-z0-9_]+:$/);
			}
		});

		it("list is sorted", () => {
			const list = shortcodeListForAutocomplete();
			const sorted = [...list].sort();
			expect(list).toEqual(sorted);
		});

		it("every listed shortcode has a lookup result", () => {
			const list = shortcodeListForAutocomplete();
			for (const wrapped of list) {
				const emoji = lookup(wrapped);
				expect(emoji, `shortcode ${wrapped} should resolve`).toBeDefined();
				expect(typeof emoji).toBe("string");
				expect(emoji!.length).toBeGreaterThan(0);
			}
		});

		it("includes original shortcodes", () => {
			const list = shortcodeListForAutocomplete();
			expect(list).toContain(":cat:");
			expect(list).toContain(":rocket:");
			expect(list).toContain(":heart:");
		});
	});
});
