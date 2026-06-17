import { describe, expect, it } from "bun:test";
import {
	insertToken,
	removeAnyProjectToken,
	removeProjectToken,
	removeToken,
} from "./QuickAddPills";

describe("QuickAddPills token logic", () => {
	describe("priority", () => {
		it("inserts p1 into empty string", () => {
			expect(insertToken("", "p1")).toBe("p1");
		});

		it("inserts p1 after existing text", () => {
			expect(insertToken("Ship docs", "p1")).toBe("Ship docs p1");
		});

		it("removes p1 token", () => {
			expect(removeToken("Ship docs p1", /\bp1\b/i)).toBe("Ship docs");
		});

		it("removes priority:1 token", () => {
			expect(
				removeToken(
					"Ship docs priority:1",
					/\b(?:priority:|prio:)\s*1\b|\bp1\b/i,
				),
			).toBe("Ship docs");
		});

		it("replaces p1 with p2", () => {
			const value = "Ship docs p1";
			const removeExisting = value.replace(
				/\b(?:priority:|prio:)\s*[1-4]\b|\bp[1-4]\b/gi,
				"",
			);
			const cleaned = removeExisting.replace(/\s{2,}/g, " ").trim();
			expect(insertToken(cleaned, "p2")).toBe("Ship docs p2");
		});
	});

	describe("project", () => {
		it("inserts project:Work", () => {
			expect(insertToken("", "project:Work")).toBe("project:Work");
		});

		it("removes a single-word project token", () => {
			expect(removeProjectToken("Ship docs project:Work", "Work")).toBe(
				"Ship docs",
			);
		});

		it("removes a multi-word project token", () => {
			expect(
				removeProjectToken("Ship docs project:Work Stuff", "Work Stuff"),
			).toBe("Ship docs");
		});

		it("removes a multi-word project token followed by another token", () => {
			expect(
				removeProjectToken("Ship docs project:Work Stuff p1", "Work Stuff"),
			).toBe("Ship docs p1");
		});

		it("removes any existing project token before replacing (multi-word)", () => {
			expect(removeAnyProjectToken("Ship docs project:Work Stuff p1")).toBe(
				"Ship docs p1",
			);
		});

		it("removes a proj: abbreviated token", () => {
			expect(removeAnyProjectToken("Ship docs proj:Home due:today")).toBe(
				"Ship docs due:today",
			);
		});
	});

	describe("due date", () => {
		it("inserts due:today", () => {
			expect(insertToken("", "due:today")).toBe("due:today");
		});

		it("removes due:today token", () => {
			expect(
				removeToken(
					"Ship docs due:today",
					/\b(?:due:|⏰\s*)\s*(?:today|tomorrow|next\s*week|none|never|clear|\d{4}-\d{2}-\d{2})\b/gi,
				),
			).toBe("Ship docs");
		});

		it("removes due:next week token", () => {
			expect(
				removeToken(
					"Ship docs due:next week",
					/\b(?:due:|⏰\s*)\s*(?:today|tomorrow|next\s*week|none|never|clear|\d{4}-\d{2}-\d{2})\b/gi,
				),
			).toBe("Ship docs");
		});
	});

	describe("scheduled date", () => {
		it("inserts sch:today", () => {
			expect(insertToken("", "sch:today")).toBe("sch:today");
		});

		it("removes sch:today token", () => {
			expect(
				removeToken(
					"Ship docs sch:today",
					/\b(?:scheduled:|sch:|🗓\s*)\s*(?:today|tomorrow|next\s*week|none|never|clear|\d{4}-\d{2}-\d{2})\b/gi,
				),
			).toBe("Ship docs");
		});
	});

	describe("recurrence", () => {
		it("inserts recurs:daily", () => {
			expect(insertToken("", "recurs:daily")).toBe("recurs:daily");
		});

		it("removes recurs:daily token", () => {
			expect(
				removeToken(
					"Ship docs recurs:daily",
					/\b(?:recurs:|rec:|recurrence:)\s*(?:daily|weekly|monthly|yearly|every_weekday|none|never|clear)\b/gi,
				),
			).toBe("Ship docs");
		});
	});
});
