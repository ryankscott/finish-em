// In the macOS app the page is drawn under a transparent titlebar, and the
// native view drags the window from the top strip. It needs to know where the
// page's own controls sit in that strip so clicks on them still land.

const STRIP_HEIGHT = 52;
const INTERACTIVE = "button, a, input, [role='button']";

type Rect = { x: number; y: number; w: number; h: number };

type TitlebarWindow = Window & {
	webkit?: {
		messageHandlers?: { titlebar?: { postMessage: (r: Rect[]) => void } };
	};
};

export function stripRects(elements: Iterable<Element>): Rect[] {
	const rects: Rect[] = [];
	for (const el of elements) {
		const r = el.getBoundingClientRect();
		if (r.width === 0 || r.height === 0 || r.top >= STRIP_HEIGHT) continue;
		rects.push({ x: r.left, y: r.top, w: r.width, h: r.height });
	}
	return rects;
}

export function startTitlebarSync(): void {
	const handler = (window as TitlebarWindow).webkit?.messageHandlers?.titlebar;
	if (document.documentElement.dataset.titlebar !== "inset" || !handler) return;
	let queued = false;
	const sync = () => {
		queued = false;
		handler.postMessage(stripRects(document.querySelectorAll(INTERACTIVE)));
	};
	const schedule = () => {
		if (queued) return;
		queued = true;
		requestAnimationFrame(sync);
	};
	new MutationObserver(schedule).observe(document.body, {
		subtree: true,
		childList: true,
		attributes: true,
	});
	window.addEventListener("resize", schedule);
	schedule();
}
