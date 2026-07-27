import {
	Action,
	ActionPanel,
	Form,
	popToRoot,
	showToast,
	Toast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { apiGet, apiPost } from "./api";

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
		apiGet<Project[]>("/api/projects"),
	);

	async function handleSubmit(values: {
		title: string;
		projectId?: string;
		priority?: string;
	}) {
		const selectedProjectId = values.projectId?.trim();
		const fallbackProjectId =
			projects?.find((project) => project.isInbox)?.id ?? projects?.[0]?.id;
		const projectId = selectedProjectId
			? Number(selectedProjectId)
			: fallbackProjectId;

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
				projectId,
				title: values.title,
				...(values.priority ? { priority: Number(values.priority) } : {}),
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
