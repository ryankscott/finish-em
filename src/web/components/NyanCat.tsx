import { cn } from "../lib/cn";

// Flat, tightly-packed rainbow bands rather than a smooth animated gradient —
// modelled on nyan-mode (the Emacs scroll-position minor mode), whose trail is
// a static stack of horizontal colored bands rather than a wavy gradient.
const RAINBOW_TICK = "repeating-linear-gradient(to bottom, #ff2d2d 0 3px, #ff9a2d 3px 6px, #ffe62d 6px 9px, #3ddc4a 9px 12px, #2d8cff 12px 15px, #a12dff 15px 18px)";

// /nyan-cat.gif is a single 1750x800 frame containing the cat plus its own
// baked-in rainbow trail. Only the cat is used here — the trail above is
// drawn separately so its length can track `progress` — so the sprite is
// cropped to just the cat via a scaled-up background-image positioned to hide
// everything else, rather than shipping a second cropped asset.
const SPRITE_W = 1750;
const SPRITE_H = 800;
const CAT_CROP = { x: 1165, y: 225, w: 400, h: 340 };
const CAT_DISPLAY_H = 18;
const CAT_SCALE = CAT_DISPLAY_H / CAT_CROP.h;
const CAT_DISPLAY_W = Math.round(CAT_CROP.w * CAT_SCALE);

/**
 * A nyan cat that scoots along a track as `progress` (0..1) increases, trailing
 * a rainbow behind it. Purely decorative reward state for the status bar's
 * daily-completion progress.
 */
export function NyanCat({ progress }: { progress: number }) {
	const clamped = Math.min(1, Math.max(0, progress));
	const atGoal = clamped >= 1;

	return (
		<div className="relative h-4 w-full overflow-hidden">
			<div
				className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
				style={{ width: `${clamped * 100}%`, backgroundImage: RAINBOW_TICK }}
				aria-hidden="true"
			/>
			<div
				className={cn(
					"absolute top-1/2 -translate-y-1/2 transition-[left] duration-700 ease-out",
					atGoal && "animate-nyan-glow",
				)}
				style={{ left: `calc(${clamped * 100}% - ${CAT_DISPLAY_W / 2}px)` }}
				role="img"
				aria-label="Nyan cat"
			>
				<div
					style={{
						width: CAT_DISPLAY_W,
						height: CAT_DISPLAY_H,
						backgroundImage: "url(/nyan-cat.gif)",
						backgroundSize: `${SPRITE_W * CAT_SCALE}px ${SPRITE_H * CAT_SCALE}px`,
						backgroundPosition: `-${CAT_CROP.x * CAT_SCALE}px -${CAT_CROP.y * CAT_SCALE}px`,
						backgroundRepeat: "no-repeat",
					}}
				/>
			</div>
		</div>
	);
}
