import { format, parseISO } from "date-fns";
import { CheckCircle2, ChevronRight, Target, X } from "lucide-react";
import { useEffect, useState } from "react";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { summarizeGoals } from "../lib/goal-summary";
import { useGoals } from "../lib/queries";
import { useIsMobile } from "../lib/use-is-mobile";
import { GoalsPanel } from "./GoalsPanel";

export function GoalsSummary({
	periodType,
	periodStart,
	addSignal = 0,
}: {
	periodType: "daily" | "weekly";
	periodStart: string;
	addSignal?: number;
}) {
	const { data: goals = [] } = useGoals({ periodType, periodStart });
	const [open, setOpen] = useState(false);
	const isMobile = useIsMobile();
	const summary = summarizeGoals(goals, periodType);
	const heading =
		periodType === "weekly" ? "This week’s goals" : "Today’s goals";
	useEffect(() => {
		if (addSignal > 0) setOpen(true);
	}, [addSignal]);
	const trigger = (
		<button
			type="button"
			onClick={isMobile ? () => setOpen(true) : undefined}
			aria-haspopup="dialog"
			aria-expanded={open}
			aria-label={`${heading}: ${summary.title}. ${summary.completed} of ${summary.total} complete`}
			className="flex min-h-12 w-full items-center gap-2.5 rounded-xl border border-border bg-surface-raised px-3 py-2 text-left text-xs hover:border-accent/50"
		>
			{summary.allComplete ? (
				<CheckCircle2 className="size-4 shrink-0 text-accent" />
			) : (
				<Target className="size-4 shrink-0 text-accent" />
			)}
			<span className="line-clamp-2 min-w-0 flex-1 break-words">
				{summary.title}
			</span>
			<span className="shrink-0 text-[11px] text-muted tabular-nums">
				{summary.completed} of {summary.total}
			</span>
			<span
				className="hidden h-1 w-14 shrink-0 overflow-hidden rounded-full bg-border md:block"
				aria-hidden="true"
			>
				<span
					className="block h-full rounded-full bg-accent"
					style={{ width: `${summary.progress}%` }}
				/>
			</span>
			<ChevronRight className="size-3.5 shrink-0 text-muted" />
		</button>
	);
	const body = (
		<>
			<p className="px-5 pb-2 text-[11px] text-muted">
				{format(parseISO(periodStart), "d MMMM")} · {summary.completed} of{" "}
				{summary.total} complete
			</p>
			<GoalsPanel
				key={`${periodType}:${periodStart}`}
				periodType={periodType}
				periodStart={periodStart}
				addSignal={addSignal}
				showHeading={false}
				className="px-5 pt-1 pb-5"
			/>
		</>
	);
	if (isMobile)
		return (
			<>
				{trigger}
				<Sheet open={open} onOpenChange={setOpen}>
					<SheetContent
						side="bottom"
						showClose={false}
						onEscapeKeyDown={(e) => e.stopPropagation()}
						className="max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-surface-raised p-0 pb-safe"
						aria-describedby={undefined}
					>
						<header className="flex items-center justify-between px-5 pt-4 pb-1">
							<SheetTitle className="text-base font-medium">
								{heading}
							</SheetTitle>
							<button
								type="button"
								aria-label="Close goals"
								onClick={() => setOpen(false)}
								className="flex size-11 items-center justify-center text-muted"
							>
								<X className="size-4" />
							</button>
						</header>
						{body}
					</SheetContent>
				</Sheet>
			</>
		);
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={8}
				collisionPadding={16}
				onEscapeKeyDown={(e) => e.stopPropagation()}
				className="max-h-[min(650px,var(--radix-popover-content-available-height))] w-[min(370px,calc(100vw-2rem))] overflow-y-auto rounded-[19px] bg-surface-raised p-0"
				aria-label={heading}
			>
				<header className="flex items-center justify-between px-5 pt-4 pb-1">
					<h2 className="text-base font-medium tracking-tight">{heading}</h2>
					<button
						type="button"
						aria-label="Close goals"
						onClick={() => setOpen(false)}
						className="flex size-11 items-center justify-center text-muted"
					>
						<X className="size-4" />
					</button>
				</header>
				{body}
			</PopoverContent>
		</Popover>
	);
}
