import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayFlag, DayPicker, SelectionState, UI } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/web/lib/cn";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Chevron({
	orientation,
	...chevronProps
}: React.ComponentProps<typeof DayPicker> extends {
	components: { Chevron: infer C };
}
	? C extends (props: infer P) => unknown
		? P
		: never
	: never) {
	if (orientation === "left") {
		return <ChevronLeft className="h-4 w-4" {...chevronProps} />;
	}
	return <ChevronRight className="h-4 w-4" {...chevronProps} />;
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
			className={cn("p-3", className)}
			classNames={{
				[UI.Root]: cn("w-full"),
				[UI.Months]:
					"flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
				[UI.Month]: "space-y-4",
				[UI.MonthCaption]: "flex justify-center pt-1 relative items-center",
				[UI.CaptionLabel]: "text-sm font-medium",
				[UI.Nav]: "space-x-1 flex items-center",
				[UI.PreviousMonthButton]: cn(
					buttonVariants({ variant: "outline" }),
					"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1",
				),
				[UI.NextMonthButton]: cn(
					buttonVariants({ variant: "outline" }),
					"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1",
				),
				[UI.MonthGrid]: "w-full border-collapse space-y-1",
				[UI.Weekdays]: "flex",
				[UI.Weekday]: "text-muted rounded-md w-8 font-normal text-[0.8rem]",
				[UI.Weeks]: "w-full",
				[UI.Week]: "flex w-full mt-2",
				[UI.Day]: cn(
					"relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
					"[&:has(.rdp-selected)]:bg-accent/20 rounded-md",
					"[&:has(.rdp-range_end)]:rounded-r-md",
				),
				[UI.DayButton]: cn(
					"h-8 w-8 p-0 font-normal rounded-md",
					"hover:bg-accent/20",
				),
				[DayFlag.today]: "text-accent font-semibold",
				[DayFlag.outside]: "text-muted opacity-50",
				[DayFlag.disabled]: "text-muted opacity-50",
				[DayFlag.hidden]: "invisible",
				[SelectionState.selected]:
					"bg-accent text-background hover:bg-accent/90",
				[SelectionState.range_middle]: "bg-accent/20 text-foreground",
				[SelectionState.range_start]: "bg-accent text-background",
				[SelectionState.range_end]: "bg-accent text-background",
				...classNames,
			}}
			components={{
				Chevron: Chevron,
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
