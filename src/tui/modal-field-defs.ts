export type ModalFieldType = "text" | "enum" | "date" | "submit";

export type ModalField = {
	key: string;
	label: string;
	type: ModalFieldType;
	hint?: string;
};

export const TASK_CREATE_FIELDS: ModalField[] = [
	{ key: "title", label: "Title", type: "text" },
	{ key: "project", label: "Project", type: "enum" },
	{ key: "priority", label: "Priority", type: "enum" },
	{
		key: "dueAt",
		label: "Due date",
		type: "date",
		hint: "YYYY-MM-DD · E calendar",
	},
	{
		key: "scheduledAt",
		label: "Scheduled",
		type: "date",
		hint: "YYYY-MM-DD · E calendar",
	},
	{ key: "recurrence", label: "Recurrence", type: "enum" },
	{ key: "blockedReason", label: "Blocked reason", type: "text" },
	{ key: "notes", label: "Notes", type: "text" },
	{ key: "_submit", label: "Create Task", type: "submit" },
];

export const PROJECT_CREATE_FIELDS: ModalField[] = [
	{ key: "name", label: "Name", type: "text" },
	{ key: "emoji", label: "Emoji", type: "text" },
	{ key: "description", label: "Description", type: "text" },
	{
		key: "startAt",
		label: "Start date",
		type: "date",
		hint: "YYYY-MM-DD · E calendar",
	},
	{
		key: "endAt",
		label: "End date",
		type: "date",
		hint: "YYYY-MM-DD · E calendar",
	},
	{ key: "jiraDiscovery", label: "Discovery: Jira URL", type: "text" },
	{ key: "jiraDiscoveryStatus", label: "Discovery: Jira Status", type: "enum" },
	{ key: "confluenceUrl", label: "Discovery: PRD URL", type: "text" },
	{ key: "jiraDelivery", label: "Delivery: Epic URL", type: "text" },
	{ key: "jiraDeliveryStatus", label: "Delivery: Epic Status", type: "enum" },
	{ key: "jiraDocsUrl", label: "Delivery: Docs URL", type: "text" },
	{ key: "jiraDocsStatus", label: "Delivery: Docs Status", type: "enum" },
	{
		key: "jiraReleaseNoteUrl",
		label: "Delivery: Release Note URL",
		type: "text",
	},
	{
		key: "jiraReleaseNoteStatus",
		label: "Delivery: Release Note Status",
		type: "enum",
	},
	{ key: "teamsReleaseNoteUrl", label: "Delivery: Teams URL", type: "text" },
	{ key: "_submit", label: "Create Project", type: "submit" },
];

export const TASK_EDIT_MODAL_FIELDS: ModalField[] = [
	{ key: "title", label: "Title", type: "text" },
	{ key: "project", label: "Project", type: "enum" },
	{ key: "priority", label: "Priority", type: "enum" },
	{
		key: "dueAt",
		label: "Due date",
		type: "date",
		hint: "YYYY-MM-DD · E calendar",
	},
	{
		key: "scheduledAt",
		label: "Scheduled",
		type: "date",
		hint: "YYYY-MM-DD · E calendar",
	},
	{ key: "recurrence", label: "Recurrence", type: "enum" },
	{ key: "blockedReason", label: "Blocked reason", type: "text" },
	{ key: "notes", label: "Notes", type: "text" },
	{ key: "_submit", label: "Save Task", type: "submit" },
];

export const PROJECT_EDIT_MODAL_FIELDS: ModalField[] = [
	{ key: "name", label: "Name", type: "text" },
	{ key: "emoji", label: "Emoji", type: "text" },
	{ key: "description", label: "Description", type: "text" },
	{
		key: "startAt",
		label: "Start date",
		type: "date",
		hint: "YYYY-MM-DD · E calendar",
	},
	{
		key: "endAt",
		label: "End date",
		type: "date",
		hint: "YYYY-MM-DD · E calendar",
	},
	{ key: "jiraDiscovery", label: "Discovery: Jira URL", type: "text" },
	{ key: "jiraDiscoveryStatus", label: "Discovery: Jira Status", type: "enum" },
	{ key: "confluenceUrl", label: "Discovery: PRD URL", type: "text" },
	{ key: "jiraDelivery", label: "Delivery: Epic URL", type: "text" },
	{ key: "jiraDeliveryStatus", label: "Delivery: Epic Status", type: "enum" },
	{ key: "jiraDocsUrl", label: "Delivery: Docs URL", type: "text" },
	{ key: "jiraDocsStatus", label: "Delivery: Docs Status", type: "enum" },
	{
		key: "jiraReleaseNoteUrl",
		label: "Delivery: Release Note URL",
		type: "text",
	},
	{
		key: "jiraReleaseNoteStatus",
		label: "Delivery: Release Note Status",
		type: "enum",
	},
	{ key: "teamsReleaseNoteUrl", label: "Delivery: Teams URL", type: "text" },
	{ key: "_submit", label: "Save Project", type: "submit" },
];

export const MODAL_MODES = [
	"createTaskModal",
	"createProjectModal",
	"editTaskModal",
	"editProjectModal",
] as const;
export type ModalMode = (typeof MODAL_MODES)[number];

export function getModalFields(mode: ModalMode): ModalField[] {
	if (mode === "editTaskModal") return TASK_EDIT_MODAL_FIELDS;
	if (mode === "createTaskModal") return TASK_CREATE_FIELDS;
	if (mode === "editProjectModal") return PROJECT_EDIT_MODAL_FIELDS;
	return PROJECT_CREATE_FIELDS;
}
