# Product

## Register

product

## Users

Ryan, a software engineer, is the only user. He uses finish-em across a
Cloudflare-deployed web app, a PWA on iPhone, a thin macOS wrapper, and a
Raycast extension, moving between them throughout the day. The job to be done
is fast, low-friction capture and triage of tasks and projects: quick-add with
NLP-style token parsing, due/scheduled dates, recurrence, reminders, and daily
/ weekly goals, without the app getting in the way of actually doing the work.

## Product Purpose

A personal task manager built for speed and precision rather than breadth of
features. It exists to reduce the friction between "I thought of something"
and "it's captured and scheduled correctly," and to make daily/weekly
planning and reviewing overdue work fast. Success looks like near-zero time
spent fighting the UI: fast keyboard-first interaction, information-dense
views, and no decorative chrome standing between Ryan and his list.

## Brand Personality

Sharp and efficient. Reference: Linear, specifically its keyboard-first
speed, dense-but-legible information display, and dark-mode-native restraint.
Not Todoist-style friendly/soft, not feature-bloated. Small moments of
personality are fine in low-stakes corners (the existing nyan-cat easter egg)
but should never compete with the primary task surfaces.

## Anti-references

Not Todoist or Things-style softness and heavy illustration. Not SaaS-cream
marketing aesthetics: no card-grid dashboards, no gradient accents, no
eyebrow-labeled sections, no side-stripe borders. No feature bloat: any new
surface should earn its density, not decorate it.

## Design Principles

- Speed over polish: keyboard-first interaction and low-latency feedback beat
  decorative motion or affordance.
- Density with legibility: pack information tightly (Linear-style) without
  sacrificing scan-ability or contrast.
- Restraint by default: the existing shadcn zinc dark/light system and
  priority accent colors are the palette; new UI should extend it, not
  introduce new brand colors.
- One user, cross-surface consistency: web, PWA, macOS wrapper, and Raycast
  should feel like the same tool, not four different apps.
- Personality in the margins: small delight (easter eggs, empty states) is
  welcome where it doesn't compete with the primary task/triage surfaces.

## Accessibility & Inclusion

Standard WCAG AA contrast and `prefers-reduced-motion` support. No additional
accommodations required beyond best practice, since this is a single-user
personal app.
