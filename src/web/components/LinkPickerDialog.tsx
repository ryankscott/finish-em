import { ExternalLink } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ensureScheme } from "@/lib/task-links";

export type LinkChoice = { url: string; displayLabel: string };

export function LinkPickerDialog({
	open,
	links,
	onClose,
}: {
	open: boolean;
	links: LinkChoice[];
	onClose: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Open link</DialogTitle>
				</DialogHeader>
				<div className="mt-2 flex flex-col gap-1">
					{links.map((link) => (
						<a
							key={link.url}
							href={ensureScheme(link.url)}
							target="_blank"
							rel="noreferrer"
							onClick={onClose}
							className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface"
						>
							<ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted" />
							<span className="font-medium">{link.displayLabel}</span>
							<span className="ml-1 min-w-0 truncate text-xs text-muted">
								{ensureScheme(link.url)}
							</span>
						</a>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
