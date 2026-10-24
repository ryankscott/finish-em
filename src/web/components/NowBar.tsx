import { Check, Pause, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { toDisplayString } from "@/lib/task-links";
import type { Task } from "@/server/types";
import { formatMinutes, taskEstimate } from "../lib/day-plan";
import { useProjects, useTaskMutations } from "../lib/queries";
import { useElapsed } from "../lib/use-elapsed";

export function NowBar({
	focused,
	next,
}: {
	focused: Task | null;
	next: Task | null;
}) {
	const { startTask, stopTask, completeTask } = useTaskMutations();
	const { data: projects = [] } = useProjects();
	const elapsed = useElapsed(focused?.startedAt ?? null);
	const task = focused ?? next;
	if (!task) return null;
	const project = projects.find((p) => p.id === task.projectId);
	const onError = (err: Error) => toast.error(err.message);
	return (
		<section
			aria-label={focused ? "In focus" : "Next up"}
			className="mt-7 mb-5 rounded-[18px] bg-accent-soft px-[23px] py-[21px]"
		>
			<div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[1.4px] text-accent">
				<Sparkles className="size-3.5" />
				{focused ? "In focus" : "Next up"}
			</div>
			<h2 className="mt-3 mb-2 text-[19px] leading-snug font-medium tracking-[-0.5px]">
				{toDisplayString(task.title)}
			</h2>
			<p className="text-xs text-muted">
				{project?.name ?? ""}
				{project ? " · " : ""}
				{formatMinutes(taskEstimate(task))}
			</p>
			<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
				<span className="text-xs text-muted">
					{focused ? `${elapsed} elapsed` : "One thing at a time."}
				</span>
				<div className="flex gap-2">
					{focused ? (
						<>
							<Button
								size="sm"
								variant="ghost"
								aria-label="Pause focus"
								disabled={stopTask.isPending}
								onClick={() => stopTask.mutate(task.id, { onError })}
							>
								<Pause className="size-4" />
							</Button>
							<Button
								size="sm"
								disabled={completeTask.isPending}
								onClick={() =>
									completeTask.mutate(task, {
										onSuccess: () => toast.success("Task completed"),
										onError,
									})
								}
							>
								<Check className="size-4" />
								Done
							</Button>
						</>
					) : (
						<Button
							size="sm"
							disabled={startTask.isPending}
							onClick={() => startTask.mutate(task.id, { onError })}
						>
							<Play className="size-4" />
							Start focus
						</Button>
					)}
				</div>
			</div>
		</section>
	);
}
