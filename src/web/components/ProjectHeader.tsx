import { format, parseISO } from "date-fns";
import { Pencil } from "lucide-react";

import type { Project } from "@/server/types";

import { useUi } from "../state/ui";
import { InlineText } from "./InlineText";
import { LinkIcon } from "./LinkIcon";

function shortUrl(url: string): string {
	try {
		const { hostname, pathname } = new URL(url);
		const tail = pathname.split("/").filter(Boolean).pop();
		return tail ? `${hostname.replace(/^www\./, "")}/${tail}` : hostname;
	} catch {
		return url;
	}
}

function LinkLine({ label, url }: { label: string; url: string }) {
	return (
		<div className="flex items-center gap-2 text-sm">
			<span className="w-24 shrink-0 truncate font-medium text-muted">
				{label}
			</span>
			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className="flex min-w-0 items-center gap-1 text-accent hover:underline"
			>
				<LinkIcon url={url} className="h-3 w-3 shrink-0" />
				<span className="truncate">{shortUrl(url)}</span>
			</a>
		</div>
	);
}

export function ProjectHeader({
	project,
	count,
}: {
	project: Project;
	count: number;
}) {
	const ui = useUi();

	return (
		<div className="border-b border-border px-4 py-3">
			<div className="flex items-baseline gap-2">
				<h1 className="text-base font-semibold">
					{project.emoji ? `${project.emoji} ` : ""}
					{project.name}
				</h1>
				<span className="text-xs text-muted">{count}</span>
				<button
					type="button"
					onClick={() => ui.openProjectDialog({ mode: "edit", project })}
					className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface hover:text-foreground"
				>
					<Pencil className="h-3.5 w-3.5" />
					Edit
				</button>
			</div>

			{project.description ? (
				<p className="mt-1 text-sm text-muted">
					<InlineText text={project.description} />
				</p>
			) : null}

			{project.startAt || project.endAt ? (
				<div className="mt-1 flex gap-4 text-xs text-muted">
					{project.startAt ? (
						<span>
							Start {format(parseISO(project.startAt), "MMM d, yyyy")}
						</span>
					) : null}
					{project.endAt ? (
						<span>End {format(parseISO(project.endAt), "MMM d, yyyy")}</span>
					) : null}
				</div>
			) : null}

			{project.resources.length > 0 ? (
				<div className="mt-3">
					<div className="mb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
						Resources
					</div>
					<div className="flex flex-col gap-1">
						{project.resources.map((resource) => (
							<LinkLine
								key={resource.id}
								label={resource.label}
								url={resource.url}
							/>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}
