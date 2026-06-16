import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/web/lib/cn";

const badgeVariants = cva(
	"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-accent text-background hover:bg-accent/80",
				secondary:
					"border-transparent bg-surface text-foreground hover:bg-surface/80",
				destructive: "border-transparent bg-p1 text-background hover:bg-p1/80",
				outline: "text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
