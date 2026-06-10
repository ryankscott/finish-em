import { cn } from "@/web/lib/cn";

function Skeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("animate-pulse rounded-md bg-surface", className)}
			{...props}
		/>
	);
}

export { Skeleton };
