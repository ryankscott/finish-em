import { useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Palette, Trash2 } from "lucide-react";
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
import { ConfirmDialog } from "./ConfirmDialog";
import { DateField } from "./DateField";
import { EmojiPicker } from "./EmojiPicker";
import { ProjectColourPicker } from "./ProjectColourPicker";
import { ProjectResourcesEditor } from "./ProjectResourcesEditor";

type ResourceRow = { label: string; url: string };

export function ProjectDialog() {
	const ui = useUi();
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [confirmDelete, setConfirmDelete] = useState(false);
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
	const { createProject, updateProject, deleteProject } = useProjectMutations();
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
		setConfirmDelete(false);
		setEmoji(p?.emoji ?? "");
		setDescription(p?.description ?? "");
		setStart(formatDateField(p?.startAt ?? null));
		setEnd(formatDateField(p?.endAt ?? null));
		setResources(
			(p?.resources ?? []).map((r) => ({ label: r.label, url: r.url })),
		);
	}, [state]);

	const submit = () => {
		if (!state || confirmDelete) return;
		if (
			createProject.isPending ||
			updateProject.isPending ||
			deleteProject.isPending
		)
			return;
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
			escape: () => {
				if (!confirmDelete) ui.closeProjectDialog();
			},
			"mod+enter": () => submit(),
		},
		{ enabled: state !== null, allowInInput: true },
	);

	const title = editing ? "Edit project" : "New project";
	const saveLabel = editing ? "Save project" : "Create project";

	const pending =
		createProject.isPending ||
		updateProject.isPending ||
		deleteProject.isPending;
	const fields = (
		<form
			id={formId}
			className="flex min-w-0 flex-col"
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<label htmlFor={`${id}-name`} className="mb-1.5 text-xs text-muted">
				Name
			</label>
			<div className="flex items-start gap-3">
				<Input
					ref={mountName}
					id={`${id}-name`}
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="What are you working on?"
					className="project-title-input h-auto min-h-11 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-1 text-[21px] leading-snug tracking-[-0.6px] shadow-none focus-visible:ring-0"
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
				rows={2}
				placeholder="Add a little context…"
				className="mt-2 min-h-16 rounded-md border-border bg-background p-3 text-sm shadow-none"
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
				<div className="task-fields-row">
					<span className="flex items-center gap-2 text-xs text-muted">
						<Palette className="size-3.5" />
						Colour
					</span>
					<div className="flex justify-end">
						<ProjectColourPicker
							value={color}
							onChange={setColor}
							disabled={pending}
						/>
					</div>
				</div>
			</div>
			<ProjectResourcesEditor resources={resources} onChange={setResources} />
			{error && (
				<p role="alert" className="mt-3 text-sm text-p1">
					{error}
				</p>
			)}
		</form>
	);
	const confirmation = (
		<ConfirmDialog
			open={confirmDelete}
			onOpenChange={setConfirmDelete}
			title="Delete project"
			confirmLabel="Delete project"
			description={`Delete project “${editing?.name ?? ""}”? Its tasks will move to Inbox. The project and its saved resource links will be removed.`}
			onConfirm={() => {
				if (!editing || pending) return;
				deleteProject.mutate(editing.id, {
					onSuccess: () => {
						toast.success("Project deleted");
						ui.closeProjectDialog();
						if (pathname === `/projects/${editing.id}`)
							navigate({ to: "/today" });
					},
					onError: (err) => setError(err.message),
				});
			}}
		/>
	);
	const footer = (
		<div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
			{editing && !editing.isInbox ? (
				<Button
					type="button"
					variant="ghost"
					disabled={pending}
					onClick={() => setConfirmDelete(true)}
					className="min-h-11 px-1 text-xs text-p1"
				>
					<Trash2 />
					Delete project
				</Button>
			) : (
				<span className="text-xs text-muted">
					{isMobile ? "" : "⌘↵ to save"}
				</span>
			)}
			<div className="flex gap-2">
				{!isMobile && (
					<Button
						type="button"
						variant="ghost"
						disabled={pending}
						onClick={() => ui.closeProjectDialog()}
					>
						Cancel
					</Button>
				)}
				<Button type="submit" form={formId} disabled={pending} className="px-3">
					{pending ? "Saving…" : saveLabel}
				</Button>
			</div>
		</div>
	);
	const focusName = (event: Event) => {
		event.preventDefault();
		nameRef.current?.focus({ preventScroll: true });
		if (scrollRef.current) scrollRef.current.scrollTop = 0;
	};
	if (isMobile)
		return (
			<>
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
						<div className="shrink-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
							{footer}
						</div>
					</SheetContent>
				</Sheet>
				{confirmation}
			</>
		);
	return (
		<>
			<Dialog
				open={state !== null}
				onOpenChange={(open) => !open && ui.closeProjectDialog()}
			>
				<DialogContent
					aria-describedby={undefined}
					onOpenAutoFocus={focusName}
					className="flex max-h-[90dvh] w-[calc(100%-3rem)] max-w-[500px] flex-col gap-0 overflow-y-auto rounded-xl bg-surface-raised p-[26px]"
				>
					<DialogTitle className="mb-5 text-[15px] font-medium">
						{title}
					</DialogTitle>
					{fields}
					{footer}
				</DialogContent>
			</Dialog>
			{confirmation}
		</>
	);
}
