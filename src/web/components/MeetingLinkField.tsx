import { addDays, format, parseISO, startOfDay } from "date-fns";
import { CalendarClock, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalendarEvent } from "@/server/types";

import { useCalendarEvents } from "../lib/queries";

const WINDOW_DAYS = 60;

function eventLabel(event: CalendarEvent): string {
	try {
		const when = event.allDay
			? format(parseISO(event.startAt), "EEE d MMM")
			: format(parseISO(event.startAt), "EEE d MMM, h:mm a");
		return `${event.summary} · ${when}`;
	} catch {
		return event.summary;
	}
}

export interface MeetingLinkFieldProps {
	/** Currently linked event UID, or null. */
	value: string | null;
	/** Called with the chosen event (or null to unlink). */
	onChange: (event: CalendarEvent | null) => void;
}

export function MeetingLinkField({ value, onChange }: MeetingLinkFieldProps) {
	const [open, setOpen] = useState(false);
	const now = new Date();
	const { data: events = [] } = useCalendarEvents({
		from: startOfDay(now).toISOString(),
		to: addDays(now, WINDOW_DAYS).toISOString(),
	});

	const linked = events.find((e) => e.uid === value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="h-9 w-full justify-start gap-2 font-normal"
				>
					<CalendarClock className="h-3.5 w-3.5 shrink-0 text-muted" />
					<span className="truncate">
						{value
							? linked
								? eventLabel(linked)
								: "Linked meeting"
							: "Link to meeting"}
					</span>
					{value ? (
						<X
							className="ml-auto h-3.5 w-3.5 shrink-0 text-muted hover:text-foreground"
							onClick={(e) => {
								e.stopPropagation();
								onChange(null);
							}}
						/>
					) : null}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0" align="start">
				{events.length === 0 ? (
					<p className="p-3 text-sm text-muted">
						No upcoming meetings. Connect a calendar in Settings.
					</p>
				) : (
					<ScrollArea className="max-h-72">
						<div className="flex flex-col p-1">
							{events.map((event) => (
								<button
									key={`${event.uid}-${event.recurrenceId}`}
									type="button"
									onClick={() => {
										onChange(event);
										setOpen(false);
									}}
									className={
										event.uid === value
											? "flex flex-col rounded-md bg-surface-raised px-2.5 py-1.5 text-left text-sm"
											: "flex flex-col rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-surface"
									}
								>
									<span className="truncate">{event.summary}</span>
									<span className="text-xs text-muted">
										{event.allDay
											? format(parseISO(event.startAt), "EEE d MMM · 'All day'")
											: format(parseISO(event.startAt), "EEE d MMM · h:mm a")}
									</span>
								</button>
							))}
						</div>
					</ScrollArea>
				)}
			</PopoverContent>
		</Popover>
	);
}
