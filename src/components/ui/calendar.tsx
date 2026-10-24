import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayFlag, DayPicker, SelectionState, UI } from "react-day-picker";

import { cn } from "@/web/lib/cn";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Chevron({
	orientation,
}: {
	orientation?: "left" | "up" | "down" | "right";
}) {
	return orientation === "left" ? (
		<ChevronLeft className="size-4" />
	) : (
		<ChevronRight className="size-4" />
	);
}

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			weekStartsOn={1}
			className={cn("task-calendar relative w-full p-0", className)}
			classNames={{
				[UI.Root]: "relative w-full",
				[UI.Months]: "relative w-full",
				[UI.Month]: "w-full",
				[UI.MonthCaption]: "flex h-11 items-center justify-center px-12",
				[UI.CaptionLabel]: "text-sm font-medium",
				[UI.Nav]: "absolute inset-x-0 top-0 flex items-center justify-between",
				[UI.PreviousMonthButton]:
					"flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface disabled:opacity-40",
				[UI.NextMonthButton]:
					"flex size-11 items-center justify-center rounded-xl text-muted hover:bg-surface disabled:opacity-40",
				[UI.MonthGrid]: "w-full table-fixed border-collapse",
				[UI.Weekdays]: "",
				[UI.Weekday]: "h-10 text-center text-xs font-normal text-muted",
				[UI.Weeks]: "",
				[UI.Week]: "",
				[UI.Day]: "p-0 text-center",
				[UI.DayButton]:
					"flex h-11 w-full items-center justify-center rounded-xl text-sm hover:bg-accent-soft aria-selected:bg-accent",
				[DayFlag.today]:
					"font-semibold text-accent [&_button]:ring-1 [&_button]:ring-inset [&_button]:ring-accent/50",
				[DayFlag.outside]: "text-muted opacity-45",
				[DayFlag.disabled]: "text-muted opacity-30",
				[DayFlag.hidden]: "invisible",
				[SelectionState.selected]:
					"[&_button]:bg-accent [&_button]:text-accent-foreground [&_button]:hover:bg-accent",
				[SelectionState.range_middle]: "bg-accent-soft",
				[SelectionState.range_start]:
					"rounded-l-xl bg-accent text-accent-foreground",
				[SelectionState.range_end]:
					"rounded-r-xl bg-accent text-accent-foreground",
				...classNames,
			}}
			components={{ Chevron }}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
