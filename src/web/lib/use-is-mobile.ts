import { useEffect, useState } from "react";

/** Matches Tailwind's `md` breakpoint, so CSS and JS agree on what "mobile" is. */
const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Several mobile changes are structural swaps rather than restyling -- the
 * sidebar becomes a drawer, the hotkey listeners don't attach -- so the
 * breakpoint has to be observable from JS, not just from CSS.
 */
export function useIsMobile(): boolean {
	const [isMobile, setIsMobile] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia(MOBILE_QUERY).matches;
	});

	useEffect(() => {
		const mql = window.matchMedia(MOBILE_QUERY);
		const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
		// Sync once on mount: the initial state was computed before hydration and
		// the viewport may have changed since.
		setIsMobile(mql.matches);
		mql.addEventListener("change", onChange);
		return () => mql.removeEventListener("change", onChange);
	}, []);

	return isMobile;
}
