import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
	CATEGORY_LABELS,
	type EmojiEntry,
	emojiList,
	searchEmoji,
} from "@/lib/emoji-shortcodes";

import { cn } from "../lib/cn";
import { useIsMobile } from "../lib/use-is-mobile";
import { useKeyboardInset } from "../lib/use-viewport-inset";

/**
 * Searchable emoji grid over the emojilib data that already ships in the bundle
 * for TUI shortcode parsing -- so this costs no new dependency.
 *
 * Replaces a bare text input that required the user to already have the emoji
 * on their clipboard or know their OS's emoji-entry shortcut. Rendered as a
 * popover on desktop and a bottom sheet on touch, since a popover anchored to a
 * small trigger is unusable on a phone.
 */

/** Grouped rendering keeps section headers stable while scrolling the full set. */
function groupByCategory(entries: readonly EmojiEntry[]) {
	const groups: Array<{ category: string; entries: EmojiEntry[] }> = [];
	for (const entry of entries) {
		const last = groups.at(-1);
		if (last && last.category === entry.category) last.entries.push(entry);
		else groups.push({ category: entry.category, entries: [entry] });
	}
	return groups;
}

function EmojiGrid({
	value,
	onSelect,
	onClear,
}: {
	value: string;
	onSelect: (char: string) => void;
	onClear: () => void;
}) {
	const [query, setQuery] = useState("");
	const trimmed = query.trim();

	const results = useMemo(
		() => (trimmed ? searchEmoji(trimmed) : emojiList()),
		[trimmed],
	);
	// Section headers only make sense for the full, category-ordered list; search
	// results are ranked by relevance, so grouping them would interleave headers.
	const groups = useMemo(
		() => (trimmed ? null : groupByCategory(results)),
		[trimmed, results],
	);

	return (
		<>
			<div className="flex items-center gap-2 border-b border-border p-2">
				<div className="relative min-w-0 flex-1">
					<Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted" />
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search emoji"
						// 16px text: anything smaller and iOS zooms the page on focus.
						className="h-10 w-full rounded-md border border-border bg-surface pr-2 pl-8 text-base outline-none placeholder:text-muted focus:border-accent md:h-9 md:text-sm"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck={false}
					/>
				</div>
				{value ? (
					<button
						type="button"
						onClick={onClear}
						className="flex h-10 shrink-0 items-center gap-1 rounded-md border border-border px-2 text-xs text-muted md:h-9"
					>
						<X className="h-3.5 w-3.5" />
						Clear
					</button>
				) : null}
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
				{results.length === 0 ? (
					<p className="py-6 text-center text-sm text-muted">
						No emoji match "{trimmed}"
					</p>
				) : groups ? (
					groups.map((group) => (
						<div key={group.category}>
							<div className="px-1 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted/70">
								{CATEGORY_LABELS[group.category] ?? group.category}
							</div>
							<Row entries={group.entries} value={value} onSelect={onSelect} />
						</div>
					))
				) : (
					<Row entries={results} value={value} onSelect={onSelect} />
				)}
			</div>
		</>
	);
}

function Row({
	entries,
	value,
	onSelect,
}: {
	entries: readonly EmojiEntry[];
	value: string;
	onSelect: (char: string) => void;
}) {
	return (
		<div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-0.5">
			{entries.map((entry) => (
				<button
					key={entry.shortcode}
					type="button"
					onClick={() => onSelect(entry.char)}
					title={`:${entry.shortcode}:`}
					aria-label={entry.shortcode}
					className={cn(
						"flex h-10 items-center justify-center rounded-md text-xl hover:bg-surface",
						entry.char === value && "bg-accent/20 ring-1 ring-accent",
					)}
				>
					{entry.char}
				</button>
			))}
		</div>
	);
}

export function EmojiPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (emoji: string) => void;
}) {
	const isMobile = useIsMobile();
	const keyboardInset = useKeyboardInset();
	const [open, setOpen] = useState(false);

	const trigger = (
		<button
			type="button"
			aria-label={value ? `Emoji: ${value}. Change` : "Choose emoji"}
			onClick={isMobile ? () => setOpen(true) : undefined}
			className="flex h-11 w-full items-center justify-center rounded-md border border-border bg-surface text-2xl md:h-9 md:text-xl"
		>
			{value || <span className="text-sm text-muted">Pick</span>}
		</button>
	);

	const select = (char: string) => {
		onChange(char);
		setOpen(false);
	};
	const clear = () => {
		onChange("");
		setOpen(false);
	};

	if (isMobile) {
		return (
			<>
				{trigger}
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetContent
						side="bottom"
						showClose={false}
						className="flex h-[70vh] flex-col rounded-t-xl p-0"
						style={
							keyboardInset > 0 ? { bottom: `${keyboardInset}px` } : undefined
						}
						aria-describedby={undefined}
					>
						<div className="flex items-center justify-between px-4 pt-4 pb-1">
							<SheetTitle>Choose emoji</SheetTitle>
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="min-h-9 px-2 text-sm text-muted"
							>
								Cancel
							</button>
						</div>
						<EmojiGrid value={value} onSelect={select} onClear={clear} />
					</SheetContent>
				</Sheet>
			</>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>
			<PopoverContent align="end" className="flex h-80 w-80 flex-col p-0">
				<EmojiGrid value={value} onSelect={select} onClear={clear} />
			</PopoverContent>
		</Popover>
	);
}
