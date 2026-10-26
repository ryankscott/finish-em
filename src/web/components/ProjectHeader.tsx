import { format, parseISO } from "date-fns";
import { ExternalLink, Pencil } from "lucide-react";

import { toast } from "sonner";
import type { Project } from "@/server/types";

import { useProjectMutations } from "../lib/queries";
import { useUi } from "../state/ui";
import { InlineText } from "./InlineText";
import { ProjectColourPicker } from "./ProjectColourPicker";
import { ProjectResourceContent } from "./ProjectResourceContent";
export function ProjectHeader({
	project,
	count,
}: {
	project: Project;
	count: number;
}) {
	const ui = useUi();
	const { updateProject } = useProjectMutations();

	return (
		<div className="workspace-page border-b border-border !pb-3">
			<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
				<h1 className="min-w-0 break-words text-base font-semibold">
					{project.emoji ? `${project.emoji} ` : ""}
					{project.name}
				</h1>
				<span className="text-xs text-muted">{count}</span>
				<div className="ml-auto flex shrink-0 items-center gap-1">
					{!project.isInbox && (
						<ProjectColourPicker
							value={project.color}
							disabled={updateProject.isPending}
							onChange={(color) =>
								updateProject.mutate(
									{ projectId: project.id, input: { color } },
									{ onError: (err) => toast.error(err.message) },
								)
							}
						/>
					)}
					<button
						type="button"
						onClick={() => ui.openProjectDialog({ mode: "edit", project })}
						className="flex min-h-11 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface hover:text-foreground"
					>
						<Pencil className="h-3.5 w-3.5" />
						Edit
					</button>
				</div>
			</div>

			{project.description ? (
				<p className="mt-1 text-sm text-muted">
					<InlineText text={project.description} />
				</p>
			) : null}

			{project.startAt || project.endAt ? (
				<div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
					{project.startAt ? (
						<span>Start {format(parseISO(project.startAt), "dd/MM/yyyy")}</span>
					) : null}
					{project.endAt ? (
						<span>End {format(parseISO(project.endAt), "dd/MM/yyyy")}</span>
					) : null}
				</div>
			) : null}

			{project.resources.length > 0 ? (
				<section className="mt-3 max-w-lg" aria-label="Project resources">
					<div className="mb-1 flex items-center justify-between gap-2">
						<h2 className="text-xs font-medium">
							Resources{" "}
							<span className="ml-1 text-muted">
								{project.resources.length}
							</span>
						</h2>
						<button
							type="button"
							onClick={() => ui.openProjectDialog({ mode: "edit", project })}
							className="min-h-11 rounded-md px-2 text-xs text-muted hover:bg-surface"
						>
							Edit links
						</button>
					</div>
					{project.resources.map((resource) => (
						<a
							key={resource.id}
							href={resource.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex min-h-11 min-w-0 items-center gap-3 border-b border-border py-2 text-foreground hover:bg-surface"
						>
							<ProjectResourceContent
								label={resource.label}
								url={resource.url}
							/>
							<ExternalLink className="size-3.5 shrink-0 text-muted" />
						</a>
					))}
				</section>
			) : null}
		</div>
	);
}
