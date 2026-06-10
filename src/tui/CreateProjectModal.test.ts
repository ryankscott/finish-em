import { describe, expect, it } from "bun:test";

import { PROJECT_CREATE_FIELDS } from "./modal-field-defs";

describe("PROJECT_CREATE_FIELDS structure", () => {
	it("contains exactly 16 fields (15 data fields + submit)", () => {
		expect(PROJECT_CREATE_FIELDS).toHaveLength(16);
	});

	it("first field is name (text)", () => {
		expect(PROJECT_CREATE_FIELDS[0]).toMatchObject({
			key: "name",
			type: "text",
		});
	});

	it("last field is submit", () => {
		expect(
			PROJECT_CREATE_FIELDS[PROJECT_CREATE_FIELDS.length - 1],
		).toMatchObject({
			type: "submit",
			label: "Create Project",
		});
	});

	it("all field keys are unique", () => {
		const keys = PROJECT_CREATE_FIELDS.map((f) => f.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it("date fields are startAt and endAt with hints", () => {
		const dateFields = PROJECT_CREATE_FIELDS.filter((f) => f.type === "date");
		const dateKeys = dateFields.map((f) => f.key);
		expect(dateKeys).toContain("startAt");
		expect(dateKeys).toContain("endAt");
		for (const field of dateFields) {
			expect(field.hint).toBeTruthy();
		}
	});

	it("has enum fields for Jira ticket statuses", () => {
		const enumFields = PROJECT_CREATE_FIELDS.filter((f) => f.type === "enum");
		expect(enumFields.length).toBeGreaterThan(0);
		const enumKeys = enumFields.map((f) => f.key);
		expect(enumKeys).toContain("jiraDiscoveryStatus");
		expect(enumKeys).toContain("jiraDeliveryStatus");
	});

	it("includes jira and confluence URL fields", () => {
		const keys = PROJECT_CREATE_FIELDS.map((f) => f.key);
		expect(keys).toContain("jiraDiscovery");
		expect(keys).toContain("jiraDelivery");
		expect(keys).toContain("confluenceUrl");
	});
});

describe("modal rendering logic", () => {
	it("active field index 0 corresponds to name", () => {
		expect(PROJECT_CREATE_FIELDS[0]?.key).toBe("name");
	});

	it("submit row is the last index", () => {
		const submitIndex = PROJECT_CREATE_FIELDS.findIndex(
			(f) => f.type === "submit",
		);
		expect(submitIndex).toBe(PROJECT_CREATE_FIELDS.length - 1);
	});
});
