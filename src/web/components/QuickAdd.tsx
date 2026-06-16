import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { getTaskCreateAutocomplete } from "@/lib/parsing/input-autocomplete";
import { parseTaskCreateInput } from "@/lib/parsing/parse-task-create-input";

import { useHotkeyScope } from "../lib/hotkeys";
import { useProjects, useTaskMutations } from "../lib/queries";
import { useUi } from "../state/ui";
import { QuickAddPills } from "./QuickAddPills";

/**
 * Quick-add bar using the same token syntax as the TUI:
 *   Ship docs project:Work p1 due:today scheduled:tomorrow recurs:weekly
 * Tab accepts the autocomplete suggestion; Enter submits; Esc closes.
 */
export function QuickAdd() {
	const ui = useUi();
	const { data: projects = [] } = useProjects();
	const { createTask } = useTaskMutations();
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const open = ui.quickAdd !== null;
	const parentTask = ui.quickAdd?.parentTask;

	useEffect(() => {
		if (open) {
			setValue("");
			requestAnimationFrame(() => inputRef.current?.focus());
		}
	}, [open]);

	const parsed = useMemo(
		() => (value.trim() ? parseTaskCreateInput(value, projects) : null),
		[value, projects],
	);

	const suggestion = useMemo(
		() => (value ? getTaskCreateAutocomplete(value, projects) : null),
		[value, projects],
	);

	const submit = () => {
		if (!parsed || parsed.errors.length > 0) {
			toast.error(parsed?.errors[0] ?? "Task title is required");
			return;
		}
		const inboxId = projects.find((p) => p.isInbox)?.id;
		const projectId =
			parentTask?.projectId ??
			parsed.input.projectId ??
			ui.quickAdd?.projectId ??
			inboxId;
		if (!projectId || !parsed.input.title) {
			toast.error("No project available for this task");
			return;
		}
		createTask.mutate(
			{
				...parsed.input,
				title: parsed.input.title,
				projectId,
				parentTaskId: parentTask?.id ?? null,
			},
			{
				onSuccess: (task) => {
					toast.success(`Added "${task.title}"`);
					ui.closeQuickAdd();
				},
				onError: (err) => toast.error(err.message),
			},
		);
	};

	useHotkeyScope(
		{
			escape: () => ui.closeQuickAdd(),
			enter: () => submit(),
			tab: () => {
				if (suggestion) setValue(suggestion.nextValue);
				else return false;
			},
		},
		{ enabled: open, allowInInput: true },
	);

	if (!open) return null;

	return (
		<div className="fixed inset-x-0 top-0 z-50 flex justify-center p-4">
			<div className="w-full max-w-2xl rounded-lg border border-border bg-surface-raised shadow-2xl">
				<div className="px-4 pt-3 text-xs text-muted">
					{parentTask ? `New subtask of "${parentTask.title}"` : "New task"}
				</div>
				<input
					ref={inputRef}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Ship docs project:Work p1 due:today recurs:weekly"
					className="w-full bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted/60"
				/>
				<QuickAddPills
					value={value}
					onChange={setValue}
					projects={projects}
					parsed={parsed}
				/>
				<div className="flex min-h-8 items-center gap-3 border-t border-border px-4 py-1.5 text-xs">
					{suggestion ? (
						<span className="text-accent">tab → {suggestion.hint}</span>
					) : null}
					{parsed?.warnings.map((warning) => (
						<span key={warning} className="text-p2">
							{warning}
						</span>
					))}
					{parsed?.errors.map((error) => (
						<span key={error} className="text-p1">
							{error}
						</span>
					))}
					<span className="ml-auto text-muted">
						enter to add · esc to close
					</span>
				</div>
			</div>
		</div>
	);
}
