# TUI Create Project Modal

## Summary

Spec for the full-form Create Project modal (`P` key) that allows users to enter all project attributes in a single keyboard-driven flow.

## Current Rules

- TUI provides a full-form modal for project creation: The TUI SHALL provide a multi-field create modal, triggered by `P` from any view, that presents all project attributes in a single keyboard-driven flow and creates the project on submission.
- Create Project modal exposes all project fields: The `CreateProjectModal` SHALL present all project fields — name, emoji, description, start date, end date, Jira Discovery URL, Jira Delivery URL, and Confluence URL — in a single form.
- Create Project modal supports keyboard navigation between fields: The TUI SHALL allow the user to move between modal fields using `j`/`k` or `Tab`/`Shift+Tab`.
- Create Project modal supports direct text entry on all fields: The TUI SHALL allow the user to type directly into all fields (Name, Emoji, Description, Start date, End date, Jira Discovery, Jira Delivery, Confluence) using the existing text-input keybinding system.
- Create Project modal validates required fields before submission: The TUI SHALL block project creation if the Name field is empty and indicate the error inline.
- Create Project modal submits and dismisses on successful creation: The TUI SHALL create the project with all collected field values when the user submits from the "Create Project" row.

## Related History

- `2026-03-10-create-task-project-modals` -> `archive/2026-03-10-create-task-project-modals.md`
