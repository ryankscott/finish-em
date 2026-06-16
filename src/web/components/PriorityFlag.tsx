import { Flag } from "lucide-react";
import { cn } from "../lib/cn";

const priorityColorClass: Record<number, string> = {
	1: "text-p1",
	2: "text-p2",
	3: "text-p3",
	4: "text-p4",
};

const priorityLabel: Record<number, string> = {
	1: "Urgent",
	2: "High",
	3: "Normal",
	4: "Low",
};

export function PriorityFlag({
	priority,
	className,
}: {
	priority: number;
	className?: string;
}) {
	return (
		<Flag
			className={cn(
				"h-3.5 w-3.5 shrink-0",
				priorityColorClass[priority] ?? "text-muted",
				className,
			)}
			title={priorityLabel[priority] ?? `P${priority}`}
			aria-label={`Priority ${priority}: ${priorityLabel[priority] ?? `P${priority}`}`}
			strokeWidth={2.5}
		/>
	);
}
