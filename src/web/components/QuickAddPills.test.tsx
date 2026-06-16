import { describe, expect, it } from "bun:test";

/* ------------------------------------------------------------------ */
/*  Mirror the token helpers from QuickAddPills.tsx for unit tests      */
/* ------------------------------------------------------------------ */

function removeToken(value: string, regex: RegExp): string {
	return value.replace(regex, "").replace(/\s{2,}/g, " ").trim();
}

function insertToken(value: string, token: string): string {
	return `${value} ${token}`.trim();
}

function escapeRegExp(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ------------------------------------------------------------------ */

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
			expect(removeToken("Ship docs priority:1", /\b(?:priority:|prio:)\s*1\b|\bp1\b/i)).toBe("Ship docs");
		});

		it("replaces p1 with p2", () => {
			const value = "Ship docs p1";
			const removeExisting = value.replace(/\b(?:priority:|prio:)\s*[1-4]\b|\bp[1-4]\b/gi, "");
			const cleaned = removeExisting.replace(/\s{2,}/g, " ").trim();
			expect(insertToken(cleaned, "p2")).toBe("Ship docs p2");
		});
	});

	describe("project", () => {
		it("inserts project:Work", () => {
			expect(insertToken("", "project:Work")).toBe("project:Work");
		});

		it("removes project:Work token", () => {
			expect(removeToken("Ship docs project:Work", /\b(?:project:|proj:|📁\s*)\s*Work\b/i)).toBe("Ship docs");
		});
	});

	describe("due date", () => {
		it("inserts due:today", () => {
			expect(insertToken("", "due:today")).toBe("due:today");
		});

		it("removes due:today token", () => {
			expect(removeToken("Ship docs due:today", /\b(?:due:|⏰\s*)\s*(?:today|tomorrow|next\s*week|none|never|clear|\d{4}-\d{2}-\d{2})\b/gi)).toBe("Ship docs");
		});
	});

	describe("scheduled date", () => {
		it("inserts sch:today", () => {
			expect(insertToken("", "sch:today")).toBe("sch:today");
		});

		it("removes sch:today token", () => {
			expect(removeToken("Ship docs sch:today", /\b(?:scheduled:|sch:|🗓\s*)\s*(?:today|tomorrow|next\s*week|none|never|clear|\d{4}-\d{2}-\d{2})\b/gi)).toBe("Ship docs");
		});
	});

	describe("recurrence", () => {
		it("inserts recurs:daily", () => {
			expect(insertToken("", "recurs:daily")).toBe("recurs:daily");
		});

		it("removes recurs:daily token", () => {
			expect(removeToken("Ship docs recurs:daily", /\b(?:recurs:|rec:|recurrence:)\s*(?:daily|weekly|monthly|yearly|every_weekday|none|never|clear)\b/gi)).toBe("Ship docs");
		});
	});
});
