import { format, parseISO } from "date-fns";
import { MapPin, Plus } from "lucide-react";

import type { CalendarEvent } from "@/server/types";

import { useIsMobile } from "../lib/use-is-mobile";

export function formatTimeRange(event: CalendarEvent): string {
	if (event.allDay) return "All day";
	try {
		const start = format(parseISO(event.startAt), "h:mm a");
		if (!event.endAt) return start;
		return `${start} – ${format(parseISO(event.endAt), "h:mm a")}`;
	} catch {
		return "";
	}
}

export function startLabel(event: CalendarEvent): string {
	if (event.allDay) return "All day";
	try {
		return format(parseISO(event.startAt), "h:mm a");
	} catch {
		return "";
	}
}

export function EventRow({
	event,
	onAddTodo,
	adding,
}: {
	event: CalendarEvent;
	onAddTodo: (event: CalendarEvent) => void;
	adding: boolean;
}) {
	const isMobile = useIsMobile();

	return (
		<div className="group flex items-stretch gap-3">
			<div className="w-16 shrink-0 pt-0.5 text-right text-xs font-medium text-muted">
				{startLabel(event)}
			</div>
			<div className="relative flex min-w-0 flex-1 items-start gap-2 rounded-md border border-border/60 bg-surface/60 px-3 py-2">
				<div className="absolute inset-y-0 left-0 w-1 rounded-l-md bg-accent/70" />
				<div className="min-w-0 flex-1">
					<span className="block truncate text-sm font-medium">
						{event.summary}
					</span>
					<span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
						<span>{formatTimeRange(event)}</span>
						{event.location ? (
							<span className="flex items-center gap-1 truncate">
								<MapPin className="h-3 w-3 shrink-0" />
								<span className="truncate">{event.location}</span>
							</span>
						) : null}
					</span>
				</div>
				{isMobile ? (
					// No hover on touch, so the desktop button (hidden until
					// hovered) would just be permanently invisible dead space.
					// A small always-visible icon button instead.
					<button
						type="button"
						onClick={() => onAddTodo(event)}
						disabled={adding}
						title="Add a todo linked to this meeting"
						aria-label="Add a todo linked to this meeting"
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-50"
					>
						<Plus className="h-3.5 w-3.5" />
					</button>
				) : (
					<button
						type="button"
						onClick={() => onAddTodo(event)}
						disabled={adding}
						title="Add a todo linked to this meeting"
						className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted opacity-0 transition-opacity hover:bg-surface hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
					>
						<Plus className="h-3.5 w-3.5" />
						Todo
					</button>
				)}
			</div>
		</div>
	);
}
