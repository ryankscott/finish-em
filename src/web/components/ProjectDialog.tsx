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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { JiraTicketStatus } from "@/server/types";

import { formatDateField, resolveDateField } from "../lib/date-field";
import { useHotkeyScope } from "../lib/hotkeys";
import { useProjectMutations } from "../lib/queries";
import { useUi } from "../state/ui";
import { DateField } from "./DateField";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
	{ value: "__none__", label: "—" },
	{ value: "todo", label: "Todo" },
	{ value: "in_progress", label: "In Progress" },
	{ value: "done", label: "Done" },
];

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

function StatusSelect({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	const selectValue = value || "__none__";
	return (
		<Select
			value={selectValue}
			onValueChange={(v) => onChange(v === "__none__" ? "" : v)}
		>
			<SelectTrigger aria-label="Status">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{STATUS_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

/** A link URL paired with an optional Jira ticket status. */
function LinkRow({
	label,
	url,
	setUrl,
	status,
	setStatus,
	withStatus = true,
}: {
	label: string;
	url: string;
	setUrl: (value: string) => void;
	status?: string;
	setStatus?: (value: string) => void;
	withStatus?: boolean;
}) {
	return (
		<div className={withStatus ? "grid grid-cols-[1fr_8rem] gap-3" : ""}>
			<Field label={label}>
				<Input value={url} onChange={(e) => setUrl(e.target.value)} />
			</Field>
			{withStatus && setStatus ? (
				<Field label="Status">
					<StatusSelect value={status ?? ""} onChange={setStatus} />
				</Field>
			) : null}
		</div>
	);
}

const asStatus = (value: string): JiraTicketStatus | null =>
	value && value !== "__none__" ? (value as JiraTicketStatus) : null;

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
	const [jiraDiscoveryStatus, setJiraDiscoveryStatus] = useState("");
	const [confluenceUrl, setConfluenceUrl] = useState("");
	const [jiraDeliveryUrl, setJiraDeliveryUrl] = useState("");
	const [jiraDeliveryStatus, setJiraDeliveryStatus] = useState("");
	const [jiraDocsUrl, setJiraDocsUrl] = useState("");
	const [jiraDocsStatus, setJiraDocsStatus] = useState("");
	const [jiraReleaseNoteUrl, setJiraReleaseNoteUrl] = useState("");
	const [jiraReleaseNoteStatus, setJiraReleaseNoteStatus] = useState("");
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
		setJiraDiscoveryStatus(p?.jiraDiscoveryStatus ?? "");
		setConfluenceUrl(p?.confluenceUrl ?? "");
		setJiraDeliveryUrl(p?.jiraDeliveryUrl ?? "");
		setJiraDeliveryStatus(p?.jiraDeliveryStatus ?? "");
		setJiraDocsUrl(p?.jiraDocsUrl ?? "");
		setJiraDocsStatus(p?.jiraDocsStatus ?? "");
		setJiraReleaseNoteUrl(p?.jiraReleaseNoteUrl ?? "");
		setJiraReleaseNoteStatus(p?.jiraReleaseNoteStatus ?? "");
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
			jiraDiscoveryStatus: asStatus(jiraDiscoveryStatus),
			confluenceUrl: confluenceUrl.trim() || null,
			jiraDeliveryUrl: jiraDeliveryUrl.trim() || null,
			jiraDeliveryStatus: asStatus(jiraDeliveryStatus),
			jiraDocsUrl: jiraDocsUrl.trim() || null,
			jiraDocsStatus: asStatus(jiraDocsStatus),
			jiraReleaseNoteUrl: jiraReleaseNoteUrl.trim() || null,
			jiraReleaseNoteStatus: asStatus(jiraReleaseNoteStatus),
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
						status={jiraDiscoveryStatus}
						setStatus={setJiraDiscoveryStatus}
					/>
					<LinkRow
						label="Confluence PRD URL"
						url={confluenceUrl}
						setUrl={setConfluenceUrl}
						withStatus={false}
					/>

					<div className="mt-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
						Delivery
					</div>
					<LinkRow
						label="Jira Delivery Epic URL"
						url={jiraDeliveryUrl}
						setUrl={setJiraDeliveryUrl}
						status={jiraDeliveryStatus}
						setStatus={setJiraDeliveryStatus}
					/>
					<LinkRow
						label="Jira Docs URL"
						url={jiraDocsUrl}
						setUrl={setJiraDocsUrl}
						status={jiraDocsStatus}
						setStatus={setJiraDocsStatus}
					/>
					<LinkRow
						label="Jira Release Note URL"
						url={jiraReleaseNoteUrl}
						setUrl={setJiraReleaseNoteUrl}
						status={jiraReleaseNoteStatus}
						setStatus={setJiraReleaseNoteStatus}
					/>
					<LinkRow
						label="Teams Release Note URL"
						url={teamsReleaseNoteUrl}
						setUrl={setTeamsReleaseNoteUrl}
						withStatus={false}
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
