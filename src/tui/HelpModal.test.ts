import { describe, expect, it } from "bun:test";

import { SHORTCUTS } from "./HelpModal";

describe("HelpModal shortcuts", () => {
	it("includes sidebar toggle keybinding", () => {
		const sidebarRow = SHORTCUTS.find((row) => row.keys === "/");
		expect(sidebarRow).toBeDefined();
		expect(sidebarRow?.action).toContain("sidebar");
	});
});
