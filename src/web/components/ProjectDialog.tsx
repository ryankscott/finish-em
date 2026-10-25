import {
	ArrowUpRight,
	CalendarDays,
	Link2,
	Palette,
	Plus,
	X,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

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
	const formId = useId();
	const nameRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const mountName = useCallback((node: HTMLInputElement | null) => {
		nameRef.current = node;
		node?.focus({ preventScroll: true });
	}, []);
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

	const pending = createProject.isPending || updateProject.isPending;
	const fields = (
		<form
			id={formId}
			className="flex min-w-0 flex-col"
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<label htmlFor={`${id}-name`} className="mb-2.5 text-xs text-muted">
				Name
			</label>
			<div className="flex items-start gap-3">
				<Input
					ref={mountName}
					id={`${id}-name`}
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="What are you working on?"
					className="project-title-input h-auto min-h-[70px] min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 pt-1 pb-5 text-[21px] leading-snug tracking-[-0.6px] shadow-none focus-visible:ring-0"
				/>
				<div className="w-14 shrink-0">
					<EmojiPicker value={emoji} onChange={setEmoji} />
				</div>
			</div>
			<label htmlFor={`${id}-description`} className="mt-2 text-xs text-muted">
				Description
			</label>
			<Textarea
				id={`${id}-description`}
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				rows={3}
				placeholder="Add a little context…"
				className="mt-2 min-h-[85px] rounded-xl border-border bg-background p-3 text-sm shadow-none"
			/>
			<div className="mt-5 border-t border-border">
				<div className="task-fields-row">
					<span className="flex items-center gap-2 text-xs text-muted">
						<CalendarDays className="size-3.5" />
						Start date
					</span>
					<DateField
						value={start}
						onChange={setStart}
						aria-label="Project start date"
					/>
				</div>
				<div className="task-fields-row">
					<span className="flex items-center gap-2 text-xs text-muted">
						<CalendarDays className="size-3.5" />
						End date
					</span>
					<DateField
						value={end}
						onChange={setEnd}
						aria-label="Project end date"
					/>
				</div>
				<div className="task-fields-row py-3">
					<label
						htmlFor={`${id}-color`}
						className="flex items-center gap-2 text-xs text-muted"
					>
						<Palette className="size-3.5" />
						Colour
					</label>
					<div className="min-w-0">
						<fieldset
							className="flex flex-wrap gap-1.5"
							aria-label="Project colours"
						>
							{[
								"#435c76",
								"#527b9b",
								"#64847c",
								"#ad8259",
								"#ba7376",
								"#8a7a9e",
							].map((swatch) => (
								<button
									type="button"
									key={swatch}
									aria-label={`Use colour ${swatch}`}
									aria-pressed={color.toLowerCase() === swatch}
									onClick={() => setColor(swatch)}
									className="flex size-8 items-center justify-center rounded-full border border-transparent aria-pressed:border-accent"
								>
									<span
										className="size-5 rounded-full"
										style={{ backgroundColor: swatch }}
									/>
								</button>
							))}
						</fieldset>
						<div className="mt-2 flex items-center gap-2">
							<input
								type="color"
								aria-label="Project colour picker"
								value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#435c76"}
								onChange={(e) => setColor(e.target.value)}
								className="size-9 shrink-0 rounded-xl border border-border bg-background p-1"
							/>
							<Input
								id={`${id}-color`}
								aria-label="Project colour hex"
								value={color}
								onChange={(e) => setColor(e.target.value)}
								className="h-11 min-w-0 border-0 bg-transparent px-1 text-sm shadow-none"
							/>
						</div>
					</div>
				</div>
			</div>
			<div className="mt-5 flex items-center justify-between gap-3">
				<span className="flex items-center gap-2 text-xs text-muted">
					<Link2 className="size-3.5" />
					Resources
				</span>
				<button
					type="button"
					onClick={addResource}
					className="flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-xs text-accent hover:bg-accent-soft"
				>
					<Plus className="size-3.5" />
					Add link
				</button>
			</div>
			{resources.length === 0 ? (
				<p className="text-xs leading-relaxed text-muted">
					Keep your docs, designs, and useful links together.
				</p>
			) : (
				<div className="flex flex-col gap-2">
					{resources.map((row, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: resource order is preserved and rows only change on explicit add/remove
							key={index}
							className="relative flex flex-col gap-2 rounded-2xl border border-border bg-background p-3 pr-12"
						>
							<Input
								aria-label={`Resource ${index + 1} label`}
								value={row.label}
								placeholder="Link name"
								onChange={(e) =>
									updateResource(index, { label: e.target.value })
								}
								className="h-11 border-0 bg-transparent px-0 shadow-none"
							/>
							<Input
								aria-label={`Resource ${index + 1} URL`}
								value={row.url}
								placeholder="https://…"
								onChange={(e) => updateResource(index, { url: e.target.value })}
								className="h-11 border-0 bg-transparent px-0 text-sm shadow-none"
								inputMode="url"
								autoCapitalize="off"
								autoCorrect="off"
							/>
							<button
								type="button"
								aria-label="Remove link"
								onClick={() => removeResource(index)}
								className="absolute top-2 right-1 flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface"
							>
								<X className="size-4" />
							</button>
						</div>
					))}
				</div>
			)}
			{error && (
				<p role="alert" className="mt-3 text-sm text-p1">
					{error}
				</p>
			)}
		</form>
	);
	const footer = (
		<div className="flex items-center justify-between gap-3 pt-5">
			<span className="text-[11px] md:text-xs text-muted">
				{isMobile ? "Links and dates are optional" : "⌘↵ to save"}
			</span>
			<Button type="submit" form={formId} disabled={pending}>
				{pending ? "Saving…" : saveLabel}
				<ArrowUpRight className="size-4" />
			</Button>
		</div>
	);
	const focusName = (event: Event) => {
		event.preventDefault();
		nameRef.current?.focus({ preventScroll: true });
		if (scrollRef.current) scrollRef.current.scrollTop = 0;
	};
	if (isMobile)
		return (
			<Sheet
				open={state !== null}
				onOpenChange={(open) => !open && ui.closeProjectDialog()}
			>
				<SheetContent
					side="bottom"
					showClose={false}
					aria-describedby={undefined}
					onOpenAutoFocus={focusName}
					className="flex h-[100dvh] max-h-none flex-col rounded-none bg-surface-raised p-0 data-[state=open]:animate-none data-[state=closed]:animate-none"
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
						<SheetTitle className="text-lg">{title}</SheetTitle>
						<button
							type="button"
							onClick={() => ui.closeProjectDialog()}
							className="min-h-11 px-2 text-xs text-muted"
						>
							Cancel
						</button>
					</header>
					<div
						ref={scrollRef}
						className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3"
					>
						{fields}
					</div>
					<div className="shrink-0 border-t border-border px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
						{footer}
					</div>
				</SheetContent>
			</Sheet>
		);
	return (
		<Dialog
			open={state !== null}
			onOpenChange={(open) => !open && ui.closeProjectDialog()}
		>
			<DialogContent
				aria-describedby={undefined}
				onOpenAutoFocus={focusName}
				className="flex max-h-[90dvh] w-[calc(100%-3rem)] max-w-[500px] flex-col gap-0 overflow-y-auto rounded-[22px] bg-surface-raised p-[26px]"
			>
				<DialogTitle className="mb-6 text-[15px] font-medium">
					{title}
				</DialogTitle>
				{fields}
				{footer}
			</DialogContent>
		</Dialog>
	);
}
