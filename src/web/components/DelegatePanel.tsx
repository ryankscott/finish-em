import { Check, Sparkles, Undo2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { DelegateAgent, Task } from "@/server/types";
import { cn } from "../lib/cn";
import {
	appendResult,
	buildDelegatePrompt,
	DELEGATE_TARGETS,
	delegateTarget,
	delegateUrl,
	needsClipboard,
} from "../lib/delegate";
import { useProjects, useTaskMutations, useTasks } from "../lib/queries";
import { useUi } from "../state/ui";

const AGENT_KEY = "finish-em:delegate-agent";

function readAgent(): DelegateAgent {
	try {
		const saved = localStorage.getItem(AGENT_KEY);
		if (DELEGATE_TARGETS.some((t) => t.agent === saved))
			return saved as DelegateAgent;
	} catch {}
	return "claude-code";
}

function saveAgent(agent: DelegateAgent) {
	try {
		localStorage.setItem(AGENT_KEY, agent);
	} catch {}
}

// An anchor click, not window.open: the macOS WKWebView shell hands custom
// schemes (claude://) to the OS only from a navigation, and popup blockers
// leave a user-initiated anchor alone.
function launch(url: string) {
	const a = document.createElement("a");
	a.href = url;
	if (url.startsWith("http")) {
		a.target = "_blank";
		a.rel = "noopener noreferrer";
	}
	a.click();
}

async function copy(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}

export function DelegatePanel({ task: opened }: { task: Task }) {
	const promptId = useId();
	const resultId = useId();
	const { data: projects = [] } = useProjects();
	// The editor holds the task as it was when opened. Read the live row so a
	// send here, or an agent reporting back through the API, shows at once.
	const { data: siblings = [] } = useTasks({ projectId: opened.projectId });
	const task = siblings.find((t) => t.id === opened.id) ?? opened;
	const { data: subtasks = [] } = useTasks({ parentTaskId: task.id });
	const { updateTask, completeTask } = useTaskMutations();
	const ui = useUi();
	const [open, setOpen] = useState(false);
	const [agent, setAgent] = useState<DelegateAgent>(
		task.delegateAgent ?? readAgent(),
	);
	const [prompt, setPrompt] = useState("");
	const [reply, setReply] = useState("");

	const project = projects.find((p) => p.id === task.projectId) ?? null;
	const basePrompt = (feedback?: string) =>
		buildDelegatePrompt({ task, project, subtasks, feedback });

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset only when switching tasks, not on every refetch.
	useEffect(() => {
		setOpen(false);
		setReply("");
		setAgent(task.delegateAgent ?? readAgent());
	}, [task.id]);

	const setStatus = (
		input: Pick<Task, "delegateStatus" | "delegateAgent"> & { notes?: string },
		message: string,
	) =>
		updateTask.mutate(
			{ taskId: task.id, before: task, input },
			{
				onSuccess: () => toast.success(message),
				onError: (err) => toast.error(err.message),
			},
		);

	const send = async (text: string, to: DelegateAgent) => {
		const label = delegateTarget(to).label;
		const copied = needsClipboard(to, text) ? await copy(text) : false;
		launch(delegateUrl(to, text));
		saveAgent(to);
		setOpen(false);
		setReply("");
		setStatus(
			{ delegateStatus: "delegated", delegateAgent: to },
			copied ? `Prompt copied. Paste it into ${label}.` : `Sent to ${label}`,
		);
	};

	if (task.status === "completed") return null;

	const sectionClass =
		"flex flex-col gap-3 rounded-xl border border-border bg-surface p-3";

	if (task.delegateStatus && task.delegateAgent) {
		const label = delegateTarget(task.delegateAgent).label;
		const review = task.delegateStatus === "review";
		return (
			<section className={sectionClass} aria-label="Delegation">
				<p className="flex items-center gap-2 text-xs">
					<Sparkles className="size-4 text-accent" />
					{review
						? `${label} finished. Its result is in the notes.`
						: `With ${label}. It adds its result to the notes when it finishes.`}
				</p>
				<label htmlFor={resultId} className="text-xs text-muted">
					{review
						? "Reply, to send it back for another pass"
						: "Or paste the result here yourself"}
				</label>
				<Textarea
					id={resultId}
					value={reply}
					onChange={(e) => setReply(e.target.value)}
					rows={3}
					className="text-xs"
				/>
				<div className="flex flex-wrap justify-end gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() =>
							setStatus(
								{ delegateStatus: null, delegateAgent: null },
								"Taken back",
							)
						}
					>
						<Undo2 className="size-4" />
						Take back
					</Button>
					{review ? (
						<>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={!reply.trim()}
								onClick={() =>
									send(basePrompt(reply), task.delegateAgent ?? agent)
								}
							>
								Send back
							</Button>
							<Button
								type="button"
								size="sm"
								disabled={completeTask.isPending}
								onClick={() =>
									completeTask.mutate(task, {
										onSuccess: () => {
											toast.success("Accepted and completed");
											ui.closeTaskEditor();
										},
										onError: (err) => toast.error(err.message),
									})
								}
							>
								<Check className="size-4" />
								Accept
							</Button>
						</>
					) : (
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={!reply.trim()}
							onClick={() =>
								setStatus(
									{
										delegateStatus: "review",
										delegateAgent: task.delegateAgent,
										notes: appendResult(
											task.notes,
											task.delegateAgent ?? agent,
											reply,
										),
									},
									"Result added. Ready for review.",
								)
							}
						>
							Add result
						</Button>
					)}
				</div>
			</section>
		);
	}

	if (!open)
		return (
			<button
				type="button"
				onClick={() => {
					setPrompt(basePrompt());
					setOpen(true);
				}}
				className="flex min-h-11 items-center gap-2 text-xs text-muted"
			>
				<Sparkles className="size-4" />
				Delegate to an agent
			</button>
		);

	const target = delegateTarget(agent);
	return (
		<section className={sectionClass} aria-label="Delegate to an agent">
			<fieldset className="grid grid-cols-2 gap-2">
				<legend className="sr-only">Agent</legend>
				{DELEGATE_TARGETS.map((t) => (
					<button
						key={t.agent}
						type="button"
						aria-pressed={t.agent === agent}
						onClick={() => setAgent(t.agent)}
						className={cn(
							"min-h-11 rounded-xl border px-3 py-2 text-left text-xs",
							t.agent === agent
								? "border-accent bg-accent-soft"
								: "border-border bg-surface-raised",
						)}
					>
						<span className="block font-medium">{t.label}</span>
						<span className="block text-muted">{t.hint}</span>
					</button>
				))}
			</fieldset>
			<label htmlFor={promptId} className="text-xs text-muted">
				Prompt. Edit it before you send.
			</label>
			<Textarea
				id={promptId}
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				rows={9}
				className="font-mono text-[11px] leading-relaxed"
			/>
			<div className="flex justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => setOpen(false)}
				>
					Cancel
				</Button>
				<Button
					type="button"
					size="sm"
					disabled={!prompt.trim() || updateTask.isPending}
					onClick={() => send(prompt, agent)}
				>
					<Sparkles className="size-4" />
					Send to {target.label}
				</Button>
			</div>
		</section>
	);
}
