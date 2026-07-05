import { describe, expect, it } from "bun:test";

import { parseQuickAdd } from "@/server/services/quick-add";

describe("quick add parser", () => {
	it("extracts priority, project, due date and recurrence from deterministic parser", async () => {
		const result = await parseQuickAdd(
			"Submit report p1 #Work tomorrow every weekday",
		);

		expect(result.title).toBe("Submit report");
		expect(result.priority).toBe(1);
		expect(result.projectName).toBe("Work");
		expect(result.recurrencePreset).toBe("every_weekday");
		expect(result.source).toBe("deterministic");
		expect(result.dueAt).toBeTruthy();
	});

	it("keeps title when no date tokens are present", async () => {
		const result = await parseQuickAdd("Refactor dashboard layout");
		expect(result.title).toBe("Refactor dashboard layout");
		expect(result.priority).toBeNull();
	});

	it("parses a bare relative date without a keyword", async () => {
		const result = await parseQuickAdd("Write report tomorrow");
		expect(result.title).toBe("Write report");
		expect(result.dueAt).toBeTruthy();
	});

	it("parses 'in N days' relative dates", async () => {
		const result = await parseQuickAdd("Review PR in 3 days");
		expect(result.title).toBe("Review PR");
		expect(result.dueAt).toBeTruthy();
	});

	it("parses 'next <weekday>' into a due date", async () => {
		const result = await parseQuickAdd("Standup next monday");
		expect(result.title).toBe("Standup");
		const due = result.dueAt ? new Date(result.dueAt) : null;
		expect(due).not.toBeNull();
		// Monday is day index 1
		expect(due?.getDay()).toBe(1);
	});

	it("parses inline weekly-by-day recurrence", async () => {
		const result = await parseQuickAdd("Team sync every monday");
		expect(result.title).toBe("Team sync");
		expect(result.recurrenceRRule).toBe("FREQ=WEEKLY;INTERVAL=1;BYDAY=MO");
	});

	it("parses 'every N weeks' recurrence into an interval RRULE", async () => {
		const result = await parseQuickAdd("Pay rent every 2 weeks");
		expect(result.title).toBe("Pay rent");
		expect(result.recurrenceRRule).toBe("FREQ=WEEKLY;INTERVAL=2");
	});

	it("combines a relative date and weekly recurrence", async () => {
		const result = await parseQuickAdd("Groceries next friday every week");
		expect(result.title).toBe("Groceries");
		expect(result.recurrencePreset).toBe("weekly");
		expect(result.dueAt).toBeTruthy();
	});
});
