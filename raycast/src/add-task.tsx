import {
	Action,
	ActionPanel,
	Form,
	popToRoot,
	showToast,
	Toast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useMemo, useState } from "react";
// Shared with the web quick-add so both accept exactly the same syntax.
import { parseTaskCreateInput } from "../../src/lib/parsing/parse-task-create-input";
import type { Project } from "../../src/server/types";
import { apiGet, apiPost } from "./api";

type Task = {
	id: number;
	title: string;
};

const PRIORITY_LABELS = ["", "Urgent", "High", "Medium", "Low"];

function formatDate(iso: string): string {
	const date = new Date(iso);
	const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
	return date.toLocaleString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
		...(hasTime ? { hour: "numeric", minute: "2-digit" } : {}),
	});
}

export default function AddTask() {
	const { data: projects = [], isLoading } = useCachedPromise(() =>
		apiGet<Project[]>("/api/projects"),
	);
	const [text, setText] = useState("");

	const parsed = useMemo(
		() => (text.trim() ? parseTaskCreateInput(text, projects) : null),
		[text, projects],
	);

	const preview = useMemo(() => {
		if (!parsed) return "";
		const { input } = parsed;
		const project = projects.find((p) => p.id === input.projectId);
		const lines = [
			input.title ? `Title: ${input.title}` : null,
			project ? `Project: ${project.emoji ?? ""} ${project.name}`.trim() : null,
			input.priority ? `Priority: ${PRIORITY_LABELS[input.priority]}` : null,
			input.dueAt ? `Due: ${formatDate(input.dueAt)}` : null,
			input.scheduledAt ? `Scheduled: ${formatDate(input.scheduledAt)}` : null,
			input.recurrencePreset ? `Recurs: ${input.recurrencePreset}` : null,
			input.estimateMinutes ? `Estimate: ${input.estimateMinutes}m` : null,
			input.notes ? `Notes: ${input.notes}` : null,
			...parsed.warnings.map((w) => `⚠️ ${w}`),
			...parsed.errors.map((e) => `❌ ${e}`),
		];
		return lines.filter(Boolean).join("\n");
	}, [parsed, projects]);

	async function handleSubmit(values: { projectId?: string }) {
		if (!parsed || parsed.errors.length > 0 || !parsed.input.title) {
			await showToast({
				style: Toast.Style.Failure,
				title: parsed?.errors[0] ?? "Task title is required",
			});
			return;
		}

		const projectId =
			parsed.input.projectId ??
			(values.projectId ? Number(values.projectId) : undefined) ??
			projects.find((p) => p.isInbox)?.id;
		if (!projectId) {
			await showToast({
				style: Toast.Style.Failure,
				title: "No project available",
			});
			return;
		}

		await showToast({ style: Toast.Style.Animated, title: "Adding task…" });
		try {
			const task = await apiPost<Task>("/api/tasks", {
				...parsed.input,
				title: parsed.input.title,
				projectId,
			});
			await showToast({
				style: Toast.Style.Success,
				title: `Added: ${task.title}`,
			});
			await popToRoot();
		} catch (err) {
			await showToast({
				style: Toast.Style.Failure,
				title: "Failed to add task",
				message: err instanceof Error ? err.message : String(err),
			});
		}
	}

	return (
		<Form
			isLoading={isLoading}
			actions={
				<ActionPanel>
					<Action.SubmitForm title="Add Task" onSubmit={handleSubmit} />
				</ActionPanel>
			}
		>
			<Form.TextField
				id="text"
				title="Task"
				placeholder="Ship docs project:Work p1 due:today notes:ask Sam first"
				info="Same syntax as the web quick add: project:, p1-p4, due:, scheduled:, recurs:, est:, notes:"
				value={text}
				onChange={setText}
				autoFocus
			/>
			{preview ? <Form.Description title="Preview" text={preview} /> : null}
			<Form.Dropdown
				id="projectId"
				title="Default Project"
				info="Used when the text has no project: token"
				defaultValue=""
			>
				<Form.Dropdown.Item value="" title="Inbox" />
				{projects
					.filter((p) => !p.isInbox)
					.map((p) => (
						<Form.Dropdown.Item
							key={p.id}
							value={String(p.id)}
							title={p.emoji ? `${p.emoji} ${p.name}` : p.name}
						/>
					))}
			</Form.Dropdown>
		</Form>
	);
}
