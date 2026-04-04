# Project External Links

## Summary

Projects may store optional external links (Jira Product Discovery, Jira Delivery, Confluence) and users may edit them from the project edit screen and see them in project view when set.

## Current Rules

- Projects store optional Jira and Confluence URLs: The system SHALL store three optional URL fields per project: Jira Product Discovery, Jira Delivery, and Confluence. Each field SHALL be nullable and persist as provided by the user (no format validation required).
- TUI project edit screen supports editing link fields: The TUI SHALL expose the three link fields in the existing project edit picker. The user SHALL be able to select each field, enter or paste a URL (or clear the value), and submit to update the project.
- Project view may display set links: When the user is viewing a project in project view, the TUI MAY display the three link fields in the project metadata area when they are set, so the user can see or copy the URLs.

## Related History

- `2026-03-05-project-jira-confluence-links` -> `archive/2026-03-05-project-jira-confluence-links.md`
