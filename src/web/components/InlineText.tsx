import { ensureScheme, toDisplaySegments } from "@/lib/task-links";

import { LinkIcon } from "./LinkIcon";

export function InlineText({ text }: { text: string }) {
	const segments = toDisplaySegments(text);

	return (
		<>
			{segments.map((seg, i) => {
				if (seg.type === "text") {
					// biome-ignore lint/suspicious/noArrayIndexKey: segments are positional slices of one string, so the index is the identity
					return <span key={i}>{seg.text}</span>;
				}
				return (
					<a
						// biome-ignore lint/suspicious/noArrayIndexKey: segments are positional slices of one string, so the index is the identity
						key={i}
						href={ensureScheme(seg.url)}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
						className="rounded px-0.5 text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
					>
						<LinkIcon
							url={seg.url}
							className="mr-0.5 inline h-3 w-3 shrink-0 align-[-0.125em] no-underline"
						/>
						{seg.displayLabel}
					</a>
				);
			})}
		</>
	);
}
