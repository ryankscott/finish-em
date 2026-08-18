---
name: finish-em
description: A dark-first zinc control room for personal task triage
colors:
  background: "oklch(0.141 0.005 285.823)"
  surface: "oklch(0.21 0.006 285.885)"
  surface-raised: "oklch(0.274 0.006 286.618)"
  border: "oklch(0.274 0.006 286.618)"
  foreground: "oklch(0.985 0 0)"
  muted: "oklch(0.705 0.015 286.067)"
  accent: "oklch(0.871 0.006 286.286)"
  p1-urgent: "oklch(0.65 0.21 25)"
  p2-high: "oklch(0.8 0.16 85)"
  p3-normal: "oklch(0.72 0.17 150)"
  p4-low: "oklch(0.68 0.12 250)"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "normal"
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "normal"
  section-label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "normal"
    letterSpacing: "0.05em"
  micro:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: "normal"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "none"
    letterSpacing: "-0.01em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  gutter: "16px"
  row-desktop: "6px"
  row-mobile: "10px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
  badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: finish-em

## Overview

**Creative North Star: "The Control Room"**

finish-em is a dense, dark-first instrument panel for one operator, not a
storefront for many visitors. Every surface — the task list, the status bar's
overdue/today/week counters, the weekly goals ticker, the calendar sync — is
built to stay visible and legible at once, the way a console keeps its gauges
in view rather than hiding them behind menus. The palette is almost entirely
achromatic zinc; the only saturated color is the four-step priority scale,
which exists to be read at a glance across a long list, not to decorate it.
Density and speed lead; decoration follows only where it clarifies status.
This is explicitly not a soft, illustrated, Todoist-style task app — it takes
its cues from Linear: keyboard-first, dark-mode-native, information-dense
without becoming cluttered.

**Key Characteristics:**
- Dark-first, zinc-neutral, near-monochrome by default
- One saturated signal system (priority p1–p4), reserved for meaning
- Flat surfaces distinguished by tone, not shadow
- Small radii, tight padding, 14px base type — built for scanning rows, not reading prose
- Touch and keyboard both first-class (swipe gestures on mobile, hotkeys on desktop), never at odds

## Colors

The palette is a near-monochrome zinc ramp with a single functional accent
system layered on top; there is no decorative brand color.

### Primary
- **Foreground Ring** (`oklch(0.871 0.006 286.286)` dark / `oklch(0.21 0.006 285.885)` light — zinc-300 / zinc-900): the `accent` token. Used for focus rings, selection rings, links, and primary button fills — the interactive/attention color, not a brand hue.

### Secondary — Priority Signal
- **P1 Urgent** (`oklch(0.65 0.21 25)` — red): overdue due dates, urgent-priority flags. The only color allowed to interrupt an otherwise neutral row.
- **P2 High** (`oklch(0.8 0.16 85)` — amber): high-priority flag only.
- **P3 Normal** (`oklch(0.72 0.17 150)` — green): normal-priority flag, and doubles as the "completed" checkmark color.
- **P4 Low** (`oklch(0.68 0.12 250)` — blue): low-priority flag only.

### Neutral
- **Void** (`oklch(0.141 0.005 285.823)` dark / `oklch(1 0 0)` light — zinc-950 / white): `background`, the base canvas.
- **Panel** (`oklch(0.21 0.006 285.885)` dark / `oklch(0.985 0 0)` light — zinc-900 / zinc-50): `surface`, one step up — representing hovered rows, inputs, and inactive nav.
- **Panel Raised** (`oklch(0.274 0.006 286.618)` dark / `oklch(0.967 0.001 286.375)` light — zinc-800 / zinc-100): `surface-raised`, the selected/active state and modal body.
- **Hairline** (`oklch(0.274 0.006 286.618)` dark / `oklch(0.92 0.004 286.32)` light — zinc-800 / zinc-200): `border`, always 1px, never decorative.
- **Ink** (`oklch(0.985 0 0)` dark / `oklch(0.141 0.005 285.823)` light — zinc-50 / zinc-950): `foreground`, primary text.
- **Instrument Gray** (`oklch(0.705 0.015 286.067)` dark / `oklch(0.446 0.017 285.786)` light — zinc-400 / zinc-600): `muted`, secondary text, timestamps, counts, disabled state. (Light-theme value is zinc-600, not the shadcn-default zinc-500 — zinc-500 measured ~4.4:1 against `surface-raised`, just under AA; zinc-600 clears 4.5:1 everywhere it's used.)

### Named Rules
**The Signal Rule.** Priority colors (p1–p4) exist to be read as status at a glance across a list — due-date urgency, priority flags, completion state. They are never used decoratively (backgrounds, borders-for-flourish, marketing accents). Future chart or data-viz work may extend this palette, but any new color must carry the same signal role, not a brand or mood role.

## Typography

**Body Font:** `ui-sans-serif, system-ui, -apple-system, sans-serif` (the OS system font stack — no webfont load, matches native chrome on every platform this ships to: web, PWA, macOS wrapper).

**Character:** One family, weight-differentiated. There is no display face — finish-em never needs a hero headline, so hierarchy comes from weight, size, and color (muted vs. foreground), not from a second typeface.

### Hierarchy
- **Title** (600, 14px, tight/-0.01em): dialog titles, page headers (e.g. "Today", project names in the sidebar).
- **Body** (400, 14px, normal): task titles, row content, form fields — the base size for nearly everything, since this is a scanning interface, not a reading one.
- **Label** (400, 12px): timestamps, counts, metadata chips (due date, project tag, priority label) riding along the right edge of a row.
- **Section Label** (600, 11px, `0.05em` tracking, uppercase): the recurring group-header pattern (`text-[11px] font-semibold tracking-wide uppercase`) that titles a cluster of content — "Projects" and "Resources" headers, task-list date groupings, settings section titles, the goals-panel header. Documented explicitly because it's used identically in 8+ places; it's a real step, not drift.
- **Micro** (400, 10px): the tightest tier — mobile bottom-nav captions and the emoji-picker's category dividers, where even Label (12px) doesn't fit the available space.

### Named Rules
**The Four Sizes, Not One Rule.** The type scale has exactly four steps — 14px (Title/Body), 12px (Label), 11px (Section Label), 10px (Micro) — each tied to a specific role, not to a free-floating "small/smaller" scale. Reach for weight, tracking, case, and color (`muted` vs `foreground`) to add emphasis within a step before ever introducing a fifth size.

## Layout

Density over whitespace. A 16px gutter (`px-4`) sets the outer margin for
headers, search, and list containers; rows themselves sit on a matching 8px
(`px-2`) inner gutter so row content lines up with the page edge. Desktop
rows are compact (`py-1.5`, ~1.5rem tall); below the `md` breakpoint every
interactive row grows to a 44px minimum tap target (`min-h-[44px] py-2.5`)
without changing the underlying data density — same information, bigger hit
area. Nested tasks indent by 22px per depth level on desktop, 16px on mobile.
The app shell is a fixed-height flex column (`100dvh`, safe-area insets for
iOS notch/home-indicator) with a persistent sidebar (desktop) or slide-out
drawer (mobile) and a persistent bottom status bar showing overdue/today/week
counts and the weekly goal ticker — nothing scrolls those out of view.

## Elevation & Depth

Flat by default. Depth between the background/surface/surface-raised tiers is
conveyed through tone stepping, not shadow: unselected rows are transparent,
hover raises to `surface`, selected/active raises to `surface-raised` with a
1px accent ring. `shadow-sm` appears only on interactive controls at rest
(buttons, inputs) as a barely-there separation cue, and true overlays
(dialogs, popovers, command palette) get a real `shadow-2xl` to read clearly
as floating above the page. This is a working default, not a hard ceiling —
future work may add elevation more deliberately (e.g. a stronger hover lift)
where it earns its place, but shadow should stay purposeful rather than
becoming ambient decoration.

## Shapes

Small, consistent radii throughout: `4px` on the tightest controls, `6px`
(`rounded-md`) as the dominant radius for rows, buttons, inputs, and dialogs,
`8px` (`rounded-lg`) on dialog shells, and full pill radius only on badges
and the priority/status chips. Borders are always 1px and always `border`
(the hairline token) — never a colored or thick accent border. No card
outlines around ordinary content; borders mark real boundaries (inputs,
dialogs, separators), not decoration.

## Components

Utilitarian and quiet: every control should recede so task content leads.
Chrome exists to be legible, not to be admired.

### Buttons
- **Shape:** `rounded-md` (6px), `h-9` default / `h-8` small / `h-10` large.
- **Primary (`default`):** `accent` background, `background` text — the ring/focus color inverted into a solid fill; used sparingly (one primary action per view).
- **Outline / Ghost:** transparent background, `border` hairline (outline only) or none (ghost); both raise to `surface` on hover.
- **Hover / Focus:** color-mix opacity shifts on hover (`/90`, `/80`), a 1px `accent` focus ring with `-2px` offset on focus-visible — no scale or shadow transforms.

### Chips / Badges
- **Style:** full-radius pill, `accent`-on-`background` by default, `surface`-on-`foreground` for the secondary variant, `p1`-on-`background` for destructive/urgent state.
- **State:** static, not selectable — used for status labels (priority word, project tag), not filter toggles.

### Cards / Containers
- **Corner Style:** `rounded-md` (dialogs use `rounded-lg`).
- **Background:** `surface-raised` for dialogs and popovers; ordinary content containers stay `background` or `surface` with no card framing at all — see the Named Rule below.
- **Shadow Strategy:** none at rest; see Elevation & Depth.
- **Border:** 1px `border` hairline, or none where a background-tone shift already separates the region.

### Inputs / Fields
- **Style:** `surface` background, 1px `border` hairline, `rounded-md`, `shadow-sm` at rest.
- **Focus:** 1px `accent` ring, no border-color change, no glow.
- **Disabled:** 50% opacity, pointer-events none.

### Navigation
- **Style:** flat list items, `rounded-md`, `text-muted` at rest, `foreground` + `surface-raised` background when active, `surface` on hover. Row height is `py-1.5` on desktop and grows to an 11 (44px) minimum on the mobile drawer, matching the row density rule in Layout. Counts render right-aligned in `muted` 12px type.

### Signature Component: Status Bar
A persistent, single-line instrument strip (not a card, not a panel) pinned
to the bottom of the shell: overdue count (turns `p1` red when non-zero and
links to the Overdue view), today/week completion counts, a scrolling weekly
goals ticker, and a Nyan Cat progress indicator toward the daily goal on the
far right. It is the one place in the app where a bit of personality
(the Nyan Cat) is allowed, precisely because it sits outside the primary
task-triage surfaces.

## Do's and Don'ts

### Do:
- **Do** keep the priority palette (p1–p4) as the only saturated color family; every new status or signal should map onto it or extend it with the same signal-only role, not introduce a new hue.
- **Do** use tone-stepping (`background` → `surface` → `surface-raised`) for depth and state, not shadow.
- **Do** keep the body type at 14px and reach for weight/color before introducing a new type size.
- **Do** give every touch-only row a 44px minimum tap target without changing its desktop density.

### Don't:
- **Don't** wrap ordinary list content in a card. Rows sit directly on the page background; borders and tone shifts do the separating work cards would otherwise do.
- **Don't** add colored or thick borders (side-stripes, accent outlines) as a decorative device. Borders are always the 1px hairline token.
- **Don't** introduce gradients, glassmorphism, or ambient shadow — the system is flat and tonal by design.
- **Don't** let the Nyan Cat / easter-egg register bleed into primary task, project, or planning surfaces — personality stays in the status bar corner it already owns.
