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

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1">
			<Label>{label}</Label>
			{children}
		</div>
	);
}

function LinkRow({
	label,
	url,
	setUrl,
}: {
	label: string;
	url: string;
	setUrl: (value: string) => void;
}) {
	return (
		<Field label={label}>
			<Input value={url} onChange={(e) => setUrl(e.target.value)} />
		</Field>
	);
}

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
	const [jiraDiscoveryUrl, setJiraDiscoveryUrl] = useState("");
	const [confluenceUrl, setConfluenceUrl] = useState("");
	const [jiraDeliveryUrl, setJiraDeliveryUrl] = useState("");
	const [jiraDocsUrl, setJiraDocsUrl] = useState("");
	const [jiraReleaseNoteUrl, setJiraReleaseNoteUrl] = useState("");
	const [teamsReleaseNoteUrl, setTeamsReleaseNoteUrl] = useState("");

	useEffect(() => {
		if (!state) return;
		const p = state.mode === "edit" ? state.project : null;
		setName(p?.name ?? "");
		setEmoji(p?.emoji ?? "");
		setDescription(p?.description ?? "");
		setStart(formatDateField(p?.startAt ?? null));
		setEnd(formatDateField(p?.endAt ?? null));
		setJiraDiscoveryUrl(p?.jiraDiscoveryUrl ?? "");
		setConfluenceUrl(p?.confluenceUrl ?? "");
		setJiraDeliveryUrl(p?.jiraDeliveryUrl ?? "");
		setJiraDocsUrl(p?.jiraDocsUrl ?? "");
		setJiraReleaseNoteUrl(p?.jiraReleaseNoteUrl ?? "");
		setTeamsReleaseNoteUrl(p?.teamsReleaseNoteUrl ?? "");
	}, [state]);

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
			jiraDiscoveryUrl: jiraDiscoveryUrl.trim() || null,
			confluenceUrl: confluenceUrl.trim() || null,
			jiraDeliveryUrl: jiraDeliveryUrl.trim() || null,
			jiraDocsUrl: jiraDocsUrl.trim() || null,
			jiraReleaseNoteUrl: jiraReleaseNoteUrl.trim() || null,
			teamsReleaseNoteUrl: teamsReleaseNoteUrl.trim() || null,
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

					<div className="mt-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
						Discovery
					</div>
					<LinkRow
						label="Jira Discovery URL"
						url={jiraDiscoveryUrl}
						setUrl={setJiraDiscoveryUrl}
					/>
					<LinkRow
						label="Confluence PRD URL"
						url={confluenceUrl}
						setUrl={setConfluenceUrl}
					/>

					<div className="mt-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
						Delivery
					</div>
					<LinkRow
						label="Jira Delivery Epic URL"
						url={jiraDeliveryUrl}
						setUrl={setJiraDeliveryUrl}
					/>
					<LinkRow
						label="Jira Docs URL"
						url={jiraDocsUrl}
						setUrl={setJiraDocsUrl}
					/>
					<LinkRow
						label="Jira Release Note URL"
						url={jiraReleaseNoteUrl}
						setUrl={setJiraReleaseNoteUrl}
					/>
					<LinkRow
						label="Teams Release Note URL"
						url={teamsReleaseNoteUrl}
						setUrl={setTeamsReleaseNoteUrl}
					/>
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
