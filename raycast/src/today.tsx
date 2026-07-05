import {
	Action,
	ActionPanel,
	Color,
	Icon,
	List,
	showToast,
	Toast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { runCli } from "./cli";

type Task = {
	id: number;
	title: string;
	priority: 1 | 2 | 3 | 4;
	dueAt: string | null;
};

type Digest = {
	dueToday: Task[];
	overdue: Task[];
	stale: Task[];
};

const PRIORITY_ICON: Record<Task["priority"], { source: Icon; tintColor: Color }> = {
	1: { source: Icon.Circle, tintColor: Color.Red },
	2: { source: Icon.Circle, tintColor: Color.Orange },
	3: { source: Icon.Circle, tintColor: Color.Yellow },
	4: { source: Icon.Circle, tintColor: Color.SecondaryText },
};

function formatDueDate(dueAt: string | null): string | undefined {
	if (!dueAt) return undefined;
	return new Date(dueAt).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

export default function Today() {
	const { data, isLoading, revalidate } = useCachedPromise(() =>
		runCli<Digest>("digest --json"),
	);

	async function completeTask(task: Task) {
		await showToast({ style: Toast.Style.Animated, title: "Completing…" });
		try {
			await runCli(`task done ${task.id} --json`);
			await showToast({
				style: Toast.Style.Success,
				title: `Completed: ${task.title}`,
			});
			revalidate();
		} catch (err) {
			await showToast({
				style: Toast.Style.Failure,
				title: "Failed to complete task",
				message: err instanceof Error ? err.message : String(err),
			});
		}
	}

	function renderTask(task: Task) {
		return (
			<List.Item
				key={task.id}
				title={task.title}
				icon={PRIORITY_ICON[task.priority]}
				accessories={
					formatDueDate(task.dueAt)
						? [{ text: formatDueDate(task.dueAt) }]
						: undefined
				}
				actions={
					<ActionPanel>
						<Action
							title="Complete Task"
							icon={Icon.Checkmark}
							onAction={() => completeTask(task)}
						/>
					</ActionPanel>
				}
			/>
		);
	}

	const isEmpty =
		!isLoading &&
		(data?.overdue.length ?? 0) === 0 &&
		(data?.dueToday.length ?? 0) === 0 &&
		(data?.stale.length ?? 0) === 0;

	return (
		<List isLoading={isLoading}>
			{isEmpty ? (
				<List.EmptyView
					icon={Icon.CheckCircle}
					title="You're all caught up"
					description="Nothing overdue, due today, or stale."
				/>
			) : (
				<>
					<List.Section title="Overdue" subtitle={String(data?.overdue.length ?? 0)}>
						{(data?.overdue ?? []).map(renderTask)}
					</List.Section>
					<List.Section title="Due Today" subtitle={String(data?.dueToday.length ?? 0)}>
						{(data?.dueToday ?? []).map(renderTask)}
					</List.Section>
					<List.Section title="Stale" subtitle={String(data?.stale.length ?? 0)}>
						{(data?.stale ?? []).map(renderTask)}
					</List.Section>
				</>
			)}
		</List>
	);
}
