import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "../lib/cn";
import { formatDateField } from "../lib/date-field";
import { useHotkeyScope } from "../lib/hotkeys";
import { resolveProjectDraft } from "../lib/project-draft";
import { useProjectMutations } from "../lib/queries";
import { useIsMobile } from "../lib/use-is-mobile";
import { useKeyboardInset } from "../lib/use-viewport-inset";
import { useUi } from "../state/ui";
import { DateField } from "./DateField";
import { EmojiPicker } from "./EmojiPicker";

type ResourceRow = { label: string; url: string };

export function ProjectDialog() {
	const ui = useUi();
	const id = useId();
	const [color, setColor] = useState("#435c76");
	const [error, setError] = useState("");
	const isMobile = useIsMobile();
	const keyboardInset = useKeyboardInset();
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
		setColor(p?.color ?? "#435c76");
		setError("");
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
		if (createProject.isPending || updateProject.isPending) return;
		const result = resolveProjectDraft(
			{ name, emoji, description, start, end, color, resources },
			editing,
		);
		if (result.error) {
			setError(result.error);
			return;
		}
		if (!result.input) return;
		const input = result.input;

		const onSuccess = () => {
			toast.success(editing ? "Project saved" : "Project created");
			ui.closeProjectDialog();
		};
		const onError = (err: Error) => setError(err.message);

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

	const title = editing ? "Edit project" : "New project";
	const saveLabel = editing ? "Save project" : "Create project";

	const fields = (
		<div className={cn("flex flex-col", isMobile ? "gap-4" : "gap-3")}>
			{/* Name and emoji share a row on desktop. On a phone the emoji trigger
			    would squeeze the name field to nothing, so they stack. */}
			<div
				className={cn(
					"gap-3",
					isMobile ? "flex flex-col" : "grid grid-cols-[1fr_5rem]",
				)}
			>
				<div className="flex flex-col gap-1">
					<Label htmlFor={`${id}-name`}>Name</Label>
					<Input
						id={`${id}-name`}
						value={name}
						onChange={(e) => setName(e.target.value)}
						// Autofocusing on mobile throws up the keyboard before the user
						// has seen the form, hiding most of it.
						autoFocus={!isMobile}
						className={isMobile ? "h-11 text-base" : undefined}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<Label>Emoji</Label>
					<EmojiPicker value={emoji} onChange={setEmoji} />
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<Label htmlFor={`${id}-description`}>Description</Label>
				<Textarea
					id={`${id}-description`}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={2}
					className={isMobile ? "text-base" : undefined}
				/>
			</div>
			<div
				className={cn("gap-3", isMobile ? "flex flex-col" : "grid grid-cols-2")}
			>
				<div className="flex flex-col gap-1">
					<Label>Start date</Label>
					<DateField
						value={start}
						onChange={setStart}
						aria-label="Project start date"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<Label>End date</Label>
					<DateField
						value={end}
						onChange={setEnd}
						aria-label="Project end date"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor={`${id}-color`}>Colour</Label>
				<div className="flex items-center gap-3">
					<input
						id={`${id}-color`}
						type="color"
						aria-label="Project colour picker"
						value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#435c76"}
						onChange={(e) => setColor(e.target.value)}
						className="h-11 w-14 shrink-0 rounded-xl border border-border bg-background p-1"
					/>
					<Input
						aria-label="Project colour hex"
						value={color}
						onChange={(e) => setColor(e.target.value)}
						className="h-11 min-w-0 flex-1"
					/>
				</div>
			</div>

			<div className="mt-2 flex items-center justify-between">
				<span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
					Resources
				</span>
				<button
					type="button"
					onClick={addResource}
					className={cn(
						"rounded-md border border-border text-foreground hover:bg-surface",
						isMobile ? "min-h-9 px-3 text-sm" : "px-2 py-1 text-xs",
					)}
				>
					+ Add link
				</button>
			</div>
			{resources.length === 0 ? (
				<p className="text-xs text-muted">
					No links yet. Add Jira, Confluence, docs, or any URL for this project.
				</p>
			) : (
				resources.map((row, index) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and reorder only on explicit add/remove
						key={index}
						className={cn(
							"gap-2",
							isMobile
								? "flex flex-col rounded-md border border-border p-2"
								: "grid grid-cols-[10rem_1fr_2rem] items-center",
						)}
					>
						<Input
							aria-label={`Resource ${index + 1} label`}
							value={row.label}
							placeholder="Label"
							onChange={(e) => updateResource(index, { label: e.target.value })}
							className={isMobile ? "h-11 text-base" : undefined}
						/>
						{/* A URL row that's 2rem wide on a phone is unusable; on mobile
						    each link becomes a stacked card with a full-width remove. */}
						<Input
							aria-label={`Resource ${index + 1} URL`}
							value={row.url}
							placeholder="https://…"
							onChange={(e) => updateResource(index, { url: e.target.value })}
							className={isMobile ? "h-11 text-base" : undefined}
							inputMode="url"
							autoCapitalize="off"
							autoCorrect="off"
						/>
						<button
							type="button"
							aria-label="Remove link"
							onClick={() => removeResource(index)}
							className={cn(
								"rounded-md border border-border text-muted hover:bg-surface",
								isMobile ? "min-h-10 w-full text-sm" : "px-2 py-1 text-xs",
							)}
						>
							{isMobile ? "Remove link" : "✕"}
						</button>
					</div>
				))
			)}
		</div>
	);

	if (isMobile) {
		return (
			<Sheet
				open={state !== null}
				onOpenChange={(open) => !open && ui.closeProjectDialog()}
			>
				<SheetContent
					side="bottom"
					showClose={false}
					className="flex h-[100dvh] max-h-none flex-col rounded-none bg-surface-raised p-0"
					style={
						keyboardInset > 0
							? {
									bottom: keyboardInset,
									height: `calc(100dvh - ${keyboardInset}px)`,
								}
							: undefined
					}
					aria-describedby={undefined}
				>
					<div className="flex shrink-0 items-center justify-between border-b border-border px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
						<SheetTitle>{title}</SheetTitle>
						<button
							type="button"
							onClick={() => ui.closeProjectDialog()}
							className="min-h-9 px-2 text-sm text-muted"
						>
							Cancel
						</button>
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
						{fields}
						{error && (
							<p role="alert" className="mt-3 text-sm text-p1">
								{error}
							</p>
						)}
					</div>
					{/* Pinned rather than at the end of the scroll area: the resources
					    list can grow past a screen, and Save shouldn't scroll away. */}
					<div className="shrink-0 border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
						<button
							type="button"
							disabled={createProject.isPending || updateProject.isPending}
							onClick={submit}
							className="min-h-[44px] w-full rounded-xl bg-accent font-medium text-accent-foreground disabled:opacity-50"
						>
							{saveLabel}
						</button>
					</div>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Dialog
			open={state !== null}
			onOpenChange={(open) => !open && ui.closeProjectDialog()}
		>
			<DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-[22px] bg-surface-raised">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="mt-4">
					{fields}
					{error && (
						<p role="alert" className="mt-3 text-sm text-p1">
							{error}
						</p>
					)}
				</div>
				<div className="mt-4 flex items-center justify-end gap-3 text-xs text-muted">
					<span>esc to cancel · ⌘⏎ to save</span>
					<button
						type="button"
						disabled={createProject.isPending || updateProject.isPending}
						onClick={submit}
						className="rounded-xl bg-accent px-4 py-3 font-medium text-accent-foreground disabled:opacity-50"
					>
						{saveLabel}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
