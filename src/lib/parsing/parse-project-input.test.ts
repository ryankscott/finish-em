import { describe, expect, it } from "bun:test";

import {
	parseProjectCreateInput,
	serializeProjectToEditInput,
} from "./parse-project-input";

describe("parseProjectCreateInput", () => {
	it("supports plain-text fallback as project name", () => {
		const result = parseProjectCreateInput("Roadmap");
		expect(result.usedTokens).toBe(false);
		expect(result.input.name).toBe("Roadmap");
		expect(result.errors).toHaveLength(0);
	});

	it("parses tokenized project metadata", () => {
		const result = parseProjectCreateInput(
			"name:Roadmap color:#3b82f6 emoji:🚀 description:Planning start:2026-03-01 end:2026-06-30 inbox:false",
		);
		expect(result.usedTokens).toBe(true);
		expect(result.errors).toHaveLength(0);
		expect(result.input.name).toBe("Roadmap");
		expect(result.input.color).toBe("#3b82f6");
		expect(result.input.emoji).toBe("🚀");
		expect(result.input.description).toBe("Planning");
		expect(result.input.startAt).toBe("2026-03-01");
		expect(result.input.endAt).toBe("2026-06-30");
		expect(result.input.isInbox).toBe(false);
	});

	it("parses emoji shortcode syntax like :cat: via shared source", () => {
		const result = parseProjectCreateInput("name:Pets emoji::cat:");
		expect(result.errors).toHaveLength(0);
		expect(result.input.emoji).toBe("🐱");
	});

	it("warns and uses literal value for unknown emoji shortcode", () => {
		const result = parseProjectCreateInput("name:Test emoji::unknown_shortcode:");
		expect(result.warnings.some((w) => w.includes("Unknown emoji shortcode"))).toBe(true);
		expect(result.input.emoji).toBe(":unknown_shortcode:");
	});

	it("validates required name in tokenized mode", () => {
		const result = parseProjectCreateInput("color:#3b82f6 inbox:true");
		expect(result.usedTokens).toBe(true);
		expect(result.errors.some((error) => error.includes("name is required"))).toBe(true);
	});

	it("validates color and date fields", () => {
		const result = parseProjectCreateInput("name:Test color:blue start:not-a-date");
		expect(result.errors.some((error) => error.includes("hex"))).toBe(true);
		expect(result.errors.some((error) => error.includes("start"))).toBe(true);
	});

	it("parses tokenized input suitable for edit patches", () => {
		const result = parseProjectCreateInput(
			"name:Roadmap emoji:🧭 description:Refined scope start:2026-04-01 end:2026-06-01",
		);
		expect(result.errors).toHaveLength(0);
		expect(result.input.name).toBe("Roadmap");
		expect(result.input.emoji).toBe("🧭");
		expect(result.input.description).toBe("Refined scope");
		expect(result.input.startAt).toBe("2026-04-01");
		expect(result.input.endAt).toBe("2026-06-01");
	});
});

describe("serializeProjectToEditInput", () => {
	it("serializes all editable metadata fields", () => {
		const value = serializeProjectToEditInput({
			name: "Roadmap",
			emoji: "🚀",
			description: "Planning",
			startAt: "2026-03-01",
			endAt: "2026-06-30",
		});
		expect(value).toBe(
			"name:Roadmap emoji:🚀 description:Planning start:2026-03-01 end:2026-06-30",
		);
	});

	it("omits empty optional fields", () => {
		const value = serializeProjectToEditInput({
			name: "Roadmap",
			emoji: null,
			description: "",
			startAt: null,
			endAt: null,
		});
		expect(value).toBe("name:Roadmap");
	});
});
