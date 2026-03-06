import { describe, expect, it } from "bun:test";

import { buildSidebarItems } from "./Sidebar";

describe("buildSidebarItems - Overdue nav item", () => {
	it("includes an Overdue nav item", () => {
		const items = buildSidebarItems([]);
		const overdueItem = items.find(
			(item) => item.type === "nav" && item.key === "overdue",
		);
		expect(overdueItem).toBeDefined();
	});

	it("places Overdue after Today and before Inbox", () => {
		const items = buildSidebarItems([]);
		const navItems = items.filter((item) => item.type === "nav");
		const todayIdx = navItems.findIndex((item) => item.type === "nav" && item.key === "today");
		const overdueIdx = navItems.findIndex((item) => item.type === "nav" && item.key === "overdue");
		const inboxIdx = navItems.findIndex((item) => item.type === "nav" && item.key === "inbox");

		expect(overdueIdx).toBeGreaterThan(todayIdx);
		expect(overdueIdx).toBeLessThan(inboxIdx);
	});

	it("Overdue nav item has correct view and countKey", () => {
		const items = buildSidebarItems([]);
		const overdueItem = items.find(
			(item) => item.type === "nav" && item.key === "overdue",
		);
		expect(overdueItem).toMatchObject({
			type: "nav",
			key: "overdue",
			label: "Overdue",
			countKey: "overdue",
			view: "overdue",
		});
	});
});
