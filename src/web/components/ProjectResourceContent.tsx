import { resourceDomain } from "../lib/project-resources";
import { LinkIcon } from "./LinkIcon";

export function ProjectResourceContent({
	label,
	url,
}: {
	label: string;
	url: string;
}) {
	return (
		<>
			<LinkIcon url={url} className="size-4 shrink-0 text-muted" />
			<span className="min-w-0 flex-1">
				<span className="block truncate text-sm">
					{label || "Untitled link"}
				</span>
				<span className="block truncate text-xs text-muted">
					{resourceDomain(url) || "Add a URL"}
				</span>
			</span>
		</>
	);
}
