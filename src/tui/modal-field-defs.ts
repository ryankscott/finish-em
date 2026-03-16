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
	{ key: "dueAt", label: "Due date", type: "date", hint: "YYYY-MM-DD · E calendar" },
	{ key: "scheduledAt", label: "Scheduled", type: "date", hint: "YYYY-MM-DD · E calendar" },
	{ key: "recurrence", label: "Recurrence", type: "enum" },
	{ key: "notes", label: "Notes", type: "text" },
	{ key: "_submit", label: "Create Task", type: "submit" },
];

export const PROJECT_CREATE_FIELDS: ModalField[] = [
	{ key: "name", label: "Name", type: "text" },
	{ key: "emoji", label: "Emoji", type: "text" },
	{ key: "description", label: "Description", type: "text" },
	{ key: "startAt", label: "Start date", type: "date", hint: "YYYY-MM-DD · E calendar" },
	{ key: "endAt", label: "End date", type: "date", hint: "YYYY-MM-DD · E calendar" },
	{ key: "jiraDiscovery", label: "Jira Discovery", type: "text" },
	{ key: "jiraDelivery", label: "Jira Delivery", type: "text" },
	{ key: "confluenceUrl", label: "Confluence", type: "text" },
	{ key: "_submit", label: "Create Project", type: "submit" },
];

export const MODAL_MODES = ["createTaskModal", "createProjectModal"] as const;
export type ModalMode = (typeof MODAL_MODES)[number];

export function getModalFields(mode: ModalMode): ModalField[] {
	return mode === "createTaskModal" ? TASK_CREATE_FIELDS : PROJECT_CREATE_FIELDS;
}
