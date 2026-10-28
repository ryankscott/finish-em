import type { DelegateAgent, Project, Task } from "../../server/types";

export type DelegateTarget = {
	agent: DelegateAgent;
	label: string;
	hint: string;
	/** Agents with no prefill URL get the prompt on the clipboard instead. */
	prefill: boolean;
};

export const DELEGATE_TARGETS: DelegateTarget[] = [
	{
		agent: "claude-code",
		label: "Claude Code",
		hint: "Opens a new Claude Code session",
		prefill: true,
	},
	{
		agent: "claude",
		label: "Claude",
		hint: "Opens a new chat on claude.ai",
		prefill: true,
	},
	{
		agent: "chatgpt",
		label: "ChatGPT",
		hint: "Opens a new chat on chatgpt.com",
		prefill: true,
	},
	{
		agent: "codex",
		label: "Codex",
		hint: "Copies the prompt and opens Codex",
		prefill: false,
	},
];

// Long query strings get cut off or rejected, and the receiving app shows an
// empty composer when that happens. Past this length the prompt goes on the
// clipboard as well, so nothing is lost.
export const MAX_URL_PROMPT = 6000;

export function delegateTarget(agent: DelegateAgent): DelegateTarget {
	return DELEGATE_TARGETS.find((t) => t.agent === agent) ?? DELEGATE_TARGETS[0];
}

export function delegateUrl(agent: DelegateAgent, prompt: string): string {
	const q = encodeURIComponent(prompt.slice(0, MAX_URL_PROMPT));
	switch (agent) {
		case "claude-code":
			return `claude://claude.ai/code/new?q=${q}`;
		case "claude":
			return `https://claude.ai/new?q=${q}`;
		case "chatgpt":
			return `https://chatgpt.com/?q=${q}`;
		case "codex":
			return "https://chatgpt.com/codex";
	}
}

export function needsClipboard(agent: DelegateAgent, prompt: string): boolean {
	return !delegateTarget(agent).prefill || prompt.length > MAX_URL_PROMPT;
}

type PromptInput = {
	task: Pick<Task, "id" | "title" | "notes" | "dueAt">;
	project: Pick<Project, "name"> | null;
	subtasks: Pick<Task, "title" | "status">[];
	/** Your reply when sending a reviewed task back for another pass. */
	feedback?: string;
};

export function buildDelegatePrompt({
	task,
	project,
	subtasks,
	feedback,
}: PromptInput): string {
	const lines = [
		feedback?.trim()
			? `I reviewed your earlier result on this task and want another pass:\n${feedback.trim()}`
			: "Please do this task for me.",
		"",
		`Task: ${task.title.trim()}`,
	];
	if (project) lines.push(`Project: ${project.name}`);
	if (task.dueAt) lines.push(`Due: ${task.dueAt.slice(0, 10)}`);
	if (task.notes.trim()) lines.push("", "Notes:", task.notes.trim());
	if (subtasks.length)
		lines.push(
			"",
			"Subtasks:",
			...subtasks.map(
				(s) => `- [${s.status === "completed" ? "x" : " "}] ${s.title}`,
			),
		);
	lines.push(
		"",
		`This is finish-em task #${task.id}. If you have the finish-em tools, call update_task for task ${task.id} when you finish: keep the existing notes, append a short "Result" section that says what you did and links to anything you made, and set delegateStatus to "review". Do not complete the task; I review it first. If you do not have the finish-em tools, end with a short summary I can paste into the task.`,
	);
	return lines.join("\n");
}

/** Notes with a pasted result appended, for agents that cannot call the API. */
export function appendResult(
	notes: string,
	agent: DelegateAgent,
	result: string,
): string {
	const body = result.trim();
	if (!body) return notes;
	const heading = `Result from ${delegateTarget(agent).label}:`;
	return notes.trim()
		? `${notes.trimEnd()}\n\n${heading}\n${body}`
		: `${heading}\n${body}`;
}
