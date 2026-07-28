import { useEffect, useState } from "react";

/**
 * Height of the on-screen keyboard (and any other browser chrome overlaying the
 * layout viewport), in CSS pixels.
 *
 * iOS Safari does not shrink the layout viewport when the keyboard opens, and
 * `100dvh` doesn't account for it either -- so a `fixed inset-0` panel keeps its
 * full height and everything anchored to its bottom edge (our quick-add option
 * pills and Add/Cancel buttons) ends up underneath the keyboard. visualViewport
 * is the only thing that reports the actually-visible region.
 *
 * Returns 0 where visualViewport is unavailable or no keyboard is up, so callers
 * can subtract it unconditionally.
 */
export function useKeyboardInset(): number {
	const [inset, setInset] = useState(0);

	useEffect(() => {
		const vv = window.visualViewport;
		if (!vv) return;

		const update = () => {
			// offsetTop matters because iOS scrolls the layout viewport up to keep
			// the focused field visible; without it the panel is short *and*
			// misaligned. Clamped at 0 so over-scroll bounce can't invert it.
			const hidden = window.innerHeight - vv.height - vv.offsetTop;
			setInset(Math.max(0, Math.round(hidden)));
		};

		update();
		vv.addEventListener("resize", update);
		vv.addEventListener("scroll", update);
		return () => {
			vv.removeEventListener("resize", update);
			vv.removeEventListener("scroll", update);
		};
	}, []);

	return inset;
}
