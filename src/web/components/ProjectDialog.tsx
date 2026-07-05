import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { formatDateField, resolveDateField } from "../lib/date-field";
import { useHotkeyScope } from "../lib/hotkeys";
import { useProjectMutations } from "../lib/queries";
import { useUi } from "../state/ui";
import { DateField } from "./DateField";

type ResourceRow = { label: string; url: string };

export function ProjectDialog() {
	const ui = useUi();
	const { createProject, updateProject } = useProjectMutations();
	const state = ui.projectDialog;
	const editing = state?.mode === "edit" ? state.project : null;

	const [name, setName] = useState("");
	const [emoji, setEmoji] = useState("");
	const [description, setDescription] = useState("");
	const [start, setStart] = useState("");
	const [end, setEnd] = useState("");
	const [resources, setResources] = useState<ResourceRow[]>([]);

	useEffect(() => {
		if (!state) return;
		const p = state.mode === "edit" ? state.project : null;
		setName(p?.name ?? "");
		setEmoji(p?.emoji ?? "");
		setDescription(p?.description ?? "");
		setStart(formatDateField(p?.startAt ?? null));
		setEnd(formatDateField(p?.endAt ?? null));
		setResources(
			(p?.resources ?? []).map((r) => ({ label: r.label, url: r.url })),
		);
	}, [state]);

	const updateResource = (index: number, patch: Partial<ResourceRow>) => {
		setResources((rows) =>
			rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
		);
	};
	const addResource = () =>
		setResources((rows) => [...rows, { label: "", url: "" }]);
	const removeResource = (index: number) =>
		setResources((rows) => rows.filter((_, i) => i !== index));

	const submit = () => {
		if (!state) return;
		if (!name.trim()) {
			toast.error("Project name is required");
			return;
		}
		const startAt = resolveDateField(start, editing?.startAt ?? null);
		const endAt = resolveDateField(end, editing?.endAt ?? null);
		if (startAt === "invalid" || endAt === "invalid") {
			toast.error(
				"Dates accept: today, tomorrow, monday, next week, 2026-07-01",
			);
			return;
		}

		const input = {
			name: name.trim(),
			emoji: emoji.trim() ? emoji.trim() : null,
			description: description.trim(),
			startAt,
			endAt,
			resources: resources
				.map((r) => ({ label: r.label.trim(), url: r.url.trim() }))
				.filter((r) => r.label.length > 0 && r.url.length > 0),
		};

		const onSuccess = () => {
			toast.success(editing ? "Project saved" : "Project created");
			ui.closeProjectDialog();
		};
		const onError = (err: Error) => toast.error(err.message);

		if (editing) {
			updateProject.mutate(
				{ projectId: editing.id, input },
				{ onSuccess, onError },
			);
		} else {
			createProject.mutate(input, { onSuccess, onError });
		}
	};

	useHotkeyScope(
		{
			escape: () => ui.closeProjectDialog(),
			"mod+enter": () => submit(),
		},
		{ enabled: state !== null, allowInInput: true },
	);

	return (
		<Dialog
			open={state !== null}
			onOpenChange={(open) => !open && ui.closeProjectDialog()}
		>
			<DialogContent className="max-h-[85vh] w-full max-w-xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
				</DialogHeader>
				<div className="mt-4 flex flex-col gap-3">
					<div className="grid grid-cols-[1fr_5rem] gap-3">
						<div className="flex flex-col gap-1">
							<Label>Name</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								autoFocus
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label>Emoji</Label>
							<Input value={emoji} onChange={(e) => setEmoji(e.target.value)} />
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<Label>Description</Label>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="flex flex-col gap-1">
							<Label>Start date</Label>
							<DateField value={start} onChange={setStart} />
						</div>
						<div className="flex flex-col gap-1">
							<Label>End date</Label>
							<DateField value={end} onChange={setEnd} />
						</div>
					</div>

					<div className="mt-2 flex items-center justify-between">
						<span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
							Resources
						</span>
						<button
							type="button"
							onClick={addResource}
							className="rounded-md border border-border px-2 py-1 text-xs text-foreground hover:bg-surface"
						>
							+ Add link
						</button>
					</div>
					{resources.length === 0 ? (
						<p className="text-xs text-muted">
							No links yet. Add Jira, Confluence, docs, or any URL for this
							project.
						</p>
					) : (
						resources.map((row, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and reorder only on explicit add/remove
								key={index}
								className="grid grid-cols-[10rem_1fr_2rem] items-center gap-2"
							>
								<Input
									value={row.label}
									placeholder="Label"
									onChange={(e) => updateResource(index, { label: e.target.value })}
								/>
								<Input
									value={row.url}
									placeholder="https://…"
									onChange={(e) => updateResource(index, { url: e.target.value })}
								/>
								<button
									type="button"
									aria-label="Remove link"
									onClick={() => removeResource(index)}
									className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:bg-surface"
								>
									✕
								</button>
							</div>
						))
					)}
				</div>
				<div className="mt-4 flex items-center justify-end gap-3 text-xs text-muted">
					<span>esc to cancel · ⌘⏎ to save</span>
					<button
						type="button"
						onClick={submit}
						className="rounded-md bg-accent px-4 py-2 font-medium text-background"
					>
						{editing ? "Save project" : "Create project"}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
