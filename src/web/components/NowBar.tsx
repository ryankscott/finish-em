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
			className="mt-4 mb-3 rounded-2xl bg-accent-soft p-4"
		>
			<div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[1.4px] text-accent">
				<Sparkles className="size-3.5" />
				{focused ? "In focus" : "Next up"}
			</div>
			<h2 className="mt-2 mb-2 text-[17px] md:text-[19px] leading-snug font-medium tracking-[-0.5px]">
				{toDisplayString(task.title)}
			</h2>
			<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
				<div className="min-w-0 text-xs text-muted">
					<p>
						{project?.name ?? ""}
						{project ? " · " : ""}
						{formatMinutes(taskEstimate(task))}
					</p>
					{focused && <p className="mt-1">{elapsed} elapsed</p>}
				</div>
				<div className="flex gap-2">
					{focused ? (
						<>
							<Button
								size="sm"
								className="min-h-11"
								variant="ghost"
								aria-label="Pause focus"
								disabled={stopTask.isPending}
								onClick={() => stopTask.mutate(task.id, { onError })}
							>
								<Pause className="size-4" />
							</Button>
							<Button
								size="sm"
								className="min-h-11"
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
							className="min-h-11"
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
