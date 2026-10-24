import { ArrowUpRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getTaskCreateAutocomplete } from "@/lib/parsing/input-autocomplete";
import { useHotkeyScope } from "../lib/hotkeys";
import { useProjects, useTaskMutations } from "../lib/queries";
import {
	newTaskDraft,
	resolveTaskDraft,
	type TaskDraft,
} from "../lib/task-draft";
import { useIsMobile } from "../lib/use-is-mobile";
import { useKeyboardInset } from "../lib/use-viewport-inset";
import { useUi } from "../state/ui";
import { TaskFields } from "./TaskFields";

export function QuickAdd() {
	const ui = useUi();
	const formId = useId();
	const isMobile = useIsMobile();
	const keyboardInset = useKeyboardInset();
	const { data: projects = [] } = useProjects();
	const { createTask } = useTaskMutations();
	const [draft, setDraft] = useState<TaskDraft>(() => newTaskDraft(0));
	const [error, setError] = useState("");
	const titleRef = useRef<HTMLTextAreaElement>(null);
	const options = ui.quickAdd;
	const open = options !== null;
	const inboxId = projects.find((p) => p.isInbox)?.id ?? 0;

	useEffect(() => {
		if (!options) return;
		setDraft(
			newTaskDraft(
				options.parentTask?.projectId ?? options.projectId ?? inboxId,
				window.location.pathname === "/today" ||
					window.location.pathname === "/",
			),
		);
		setError("");
	}, [options, inboxId]);

	const submit = () => {
		if (createTask.isPending) return;
		const result = resolveTaskDraft(
			draft,
			projects,
			undefined,
			options?.parentTask,
		);
		if (result.error) {
			setError(result.error);
			return;
		}
		if (!result.input) return;
		createTask.mutate(result.input, {
			onSuccess: (task) => {
				toast.success(`Added “${task.title}”`);
				ui.closeQuickAdd();
			},
			onError: (err) => setError(err.message),
		});
	};
	useHotkeyScope(
		{ escape: () => ui.closeQuickAdd(), "mod+enter": () => submit() },
		{ enabled: open, allowInInput: true },
	);

	const fields = (
		<form
			id={formId}
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			className="flex min-w-0 flex-col"
			onKeyDown={(e) => {
				if (e.target === titleRef.current && e.key === "Tab") {
					const suggestion = getTaskCreateAutocomplete(draft.title, projects);
					if (suggestion) {
						e.preventDefault();
						setDraft({ ...draft, title: suggestion.nextValue });
						return;
					}
				}
				if (
					e.target === titleRef.current &&
					e.key === "Enter" &&
					!e.shiftKey &&
					!e.metaKey &&
					!e.ctrlKey &&
					!e.nativeEvent.isComposing
				) {
					e.preventDefault();
					submit();
				}
			}}
		>
			{options?.parentTask && (
				<p className="mb-4 truncate text-xs text-muted">
					Subtask of {options.parentTask.title}
				</p>
			)}
			<TaskFields
				value={draft}
				onChange={setDraft}
				projects={projects}
				titleRef={titleRef}
			/>
			{error && (
				<p role="alert" className="mt-3 text-sm text-p1">
					{error}
				</p>
			)}
		</form>
	);
	const footer = (
		<div className="flex items-center justify-between gap-3 pt-5">
			<span className="text-[11px] text-muted">
				{draft.scheduled ? "Added to your plan" : "Unscheduled"}
			</span>
			<Button type="submit" form={formId} disabled={createTask.isPending}>
				{createTask.isPending ? "Adding…" : "Add task"}
				<ArrowUpRight className="size-4" />
			</Button>
		</div>
	);
	if (isMobile)
		return (
			<Sheet open={open} onOpenChange={(next) => !next && ui.closeQuickAdd()}>
				<SheetContent
					side="bottom"
					showClose={false}
					aria-describedby={undefined}
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						titleRef.current?.focus();
					}}
					className="flex h-[100dvh] max-h-none flex-col rounded-none bg-surface-raised p-0"
					style={
						keyboardInset > 0
							? {
									bottom: keyboardInset,
									height: `calc(100dvh - ${keyboardInset}px)`,
								}
							: undefined
					}
				>
					<header className="flex shrink-0 items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
						<SheetTitle className="text-lg">New task</SheetTitle>
						<button
							type="button"
							className="min-h-11 px-2 text-xs text-muted"
							onClick={() => ui.closeQuickAdd()}
						>
							Cancel
						</button>
					</header>
					<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3">
						{fields}
					</div>
					<div className="shrink-0 border-t border-border px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
						{footer}
					</div>
				</SheetContent>
			</Sheet>
		);
	return (
		<Dialog open={open} onOpenChange={(next) => !next && ui.closeQuickAdd()}>
			<DialogContent
				aria-describedby={undefined}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					titleRef.current?.focus();
				}}
				className="flex max-h-[90dvh] w-[calc(100%-3rem)] max-w-[500px] flex-col gap-0 overflow-y-auto rounded-[22px] bg-surface-raised p-[26px]"
			>
				<DialogTitle className="mb-6 text-[15px] font-medium">
					New task
				</DialogTitle>
				{fields}
				{footer}
			</DialogContent>
		</Dialog>
	);
}
