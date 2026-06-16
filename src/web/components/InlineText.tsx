import { ensureScheme, toDisplaySegments } from "@/lib/task-links";

export function InlineText({ text }: { text: string }) {
	const segments = toDisplaySegments(text);

	return (
		<>
			{segments.map((seg, i) => {
				if (seg.type === "text") {
					return <span key={i}>{seg.text}</span>;
				}
				return (
					<a
						key={i}
						href={ensureScheme(seg.url)}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
						className="rounded px-0.5 text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
					>
						{seg.displayLabel}
					</a>
				);
			})}
		</>
	);
}
