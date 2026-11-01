import { describe, expect, test } from "bun:test";
import { stripRects } from "./titlebar";

const el = (top: number, height: number, width = 40) =>
	({
		getBoundingClientRect: () => ({ left: 10, top, width, height }),
	}) as unknown as Element;

describe("stripRects", () => {
	test("keeps controls that reach into the titlebar strip", () => {
		expect(stripRects([el(4, 44)])).toEqual([{ x: 10, y: 4, w: 40, h: 44 }]);
	});

	test("drops controls below the strip and hidden ones", () => {
		expect(stripRects([el(60, 30), el(4, 0), el(4, 30, 0)])).toEqual([]);
	});
});
