import { Check, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { Project } from "@/server/types";

import { cn } from "../lib/cn";
import { useKeyboardInset } from "../lib/use-viewport-inset";

/**
 * Project chooser as a bottom sheet with a search field.
 *
 * Projects don't fit the pill treatment the other quick-add options use: names
 * run to 40+ characters, so a single pill can span the whole width of a phone,
 * and there are enough projects that the row would wrap several times. One row
 * per project in a searchable sheet stays legible at any name length and any
 * project count.
 */
export function ProjectPickerSheet({
	open,
	onOpenChange,
	projects,
	selectedId,
	onSelect,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projects: Project[];
	selectedId: number | null | undefined;
	onSelect: (project: Project) => void;
}) {
	const [query, setQuery] = useState("");
	const keyboardInset = useKeyboardInset();

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return projects;
		return projects.filter((p) => p.name.toLowerCase().includes(q));
	}, [projects, query]);

	return (
		<Sheet
			open={open}
			onOpenChange={(next) => {
				// Reset the filter between openings; a stale query would silently
				// hide most of the list next time the sheet comes up.
				if (!next) setQuery("");
				onOpenChange(next);
			}}
		>
			<SheetContent
				side="bottom"
				showClose={false}
				className="flex max-h-[75vh] flex-col rounded-t-xl p-0"
				style={keyboardInset > 0 ? { bottom: `${keyboardInset}px` } : undefined}
				aria-describedby={undefined}
			>
				<div className="flex items-center justify-between px-4 pt-4 pb-2">
					<SheetTitle>Select project</SheetTitle>
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="min-h-9 px-2 text-sm text-muted"
					>
						Cancel
					</button>
				</div>
				<div className="px-4 pb-3">
					<div className="relative">
						<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
						<input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search projects"
							// 16px minimum or iOS zooms the viewport on focus.
							className="h-11 w-full rounded-md border border-border bg-surface pr-3 pl-9 text-base outline-none placeholder:text-muted focus:border-accent"
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck={false}
						/>
					</div>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
					{filtered.length === 0 ? (
						<p className="px-4 py-6 text-center text-sm text-muted">
							No projects match "{query}"
						</p>
					) : (
						filtered.map((project) => {
							const active = project.id === selectedId;
							return (
								<button
									key={project.id}
									type="button"
									onClick={() => {
										onSelect(project);
										onOpenChange(false);
									}}
									className={cn(
										"flex min-h-12 w-full items-center gap-3 px-4 text-left text-base",
										active ? "text-accent" : "text-foreground",
									)}
								>
									<span className="w-6 shrink-0 text-center">
										{project.emoji ?? "●"}
									</span>
									<span className="min-w-0 flex-1 truncate">
										{project.name}
									</span>
									{active ? <Check className="h-4 w-4 shrink-0" /> : null}
								</button>
							);
						})
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
