# Compact project editor and view

Approved 27/10/2026 from the Compact rows prototype.

- Show resources as flat title/domain rows in both the editor and project view.
  The view opens links; the editor opens one link's fields on demand. Cancel
  restores the existing resource or removes the new draft. Project save includes
  current link edits and validates incomplete links rather than dropping them.
- Replace the native colour picker and permanent hex field with a compact named
  swatch popover. Keep custom hex entry under a disclosure. Reuse the picker in
  the project header, where selecting a colour saves immediately.
- Put Delete project in the editor footer, with confirmation explaining that
  tasks move to Inbox and saved resource links are removed. Hide deletion for
  Inbox and navigate away after deleting the project being viewed.
- Preserve the existing desktop dialog/iPhone sheet and touch targets. Use
  DD/MM/YYYY for project dates in the viewing header.

Validation: 501 tests, Biome, TypeScript, production build, and browser checks
against an isolated Bun database. Exercised link edit/add/validation/cancel,
colour save from both surfaces, custom hex, deletion cancellation and completion,
and task reassignment to Inbox. Checked desktop and narrow mobile layouts.
