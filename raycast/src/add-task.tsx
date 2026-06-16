import {
	Action,
	ActionPanel,
	Form,
	popToRoot,
	showToast,
	Toast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { runCli } from "./cli";

type Project = {
	id: number;
	name: string;
	emoji: string | null;
	isInbox: boolean;
};

type Task = {
	id: number;
	title: string;
};

const PRIORITIES = [
	{ label: "None", value: "" },
	{ label: "Urgent", value: "1" },
	{ label: "High", value: "2" },
	{ label: "Medium", value: "3" },
	{ label: "Low", value: "4" },
];

export default function AddTask() {
	const { data: projects, isLoading } = useCachedPromise(() =>
		runCli<Project[]>("project list --json"),
	);

	async function handleSubmit(values: {
		title: string;
		projectId?: string;
		priority?: string;
	}) {
		const flags: string[] = ["--json"];
		const selectedProjectId = values.projectId?.trim();
		const fallbackProjectId =
			projects?.find((project) => project.isInbox)?.id ?? projects?.[0]?.id;
		const projectIdToUse =
			selectedProjectId || (fallbackProjectId ? String(fallbackProjectId) : "");

		if (projectIdToUse) {
			flags.push(`--project-id ${projectIdToUse}`);
		}

		if (values.priority) flags.push(`--priority ${values.priority}`);

		await showToast({ style: Toast.Style.Animated, title: "Adding task…" });

		try {
			const task = await runCli<Task>(
				`task add "$TASK_TITLE" ${flags.join(" ")}`,
				{
					TASK_TITLE: values.title,
				},
			);
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
				id="title"
				title="Title"
				placeholder="Task title"
				autoFocus
			/>
			<Form.Dropdown id="projectId" title="Project" defaultValue="">
				<Form.Dropdown.Item key="none" value="" title="Default (Inbox)" />
				{(projects ?? []).map((p) => (
					<Form.Dropdown.Item
						key={p.id}
						value={String(p.id)}
						title={p.emoji ? `${p.emoji} ${p.name}` : p.name}
					/>
				))}
			</Form.Dropdown>
			<Form.Dropdown id="priority" title="Priority" defaultValue="">
				{PRIORITIES.map((p) => (
					<Form.Dropdown.Item key={p.value} value={p.value} title={p.label} />
				))}
			</Form.Dropdown>
		</Form>
	);
}
