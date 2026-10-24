import { Link } from "@tanstack/react-router";
import { CalendarDays, Inbox, Menu, Plus, Sun } from "lucide-react";

import { cn } from "../lib/cn";

/**
 * Bottom navigation for mobile. Five destinations, sized for thumbs.
 *
 * "More" opens the drawer holding the full sidebar, so every view stays
 * reachable without cramming a dozen entries in here.
 */
export const MOBILE_NAV_PATHS = ["/today", "/inbox", "/planning"];

function NavButton({
	label,
	icon,
	active,
	onClick,
	to,
}: {
	label: string;
	icon: React.ReactNode;
	active?: boolean;
	onClick?: () => void;
	to?: string;
}) {
	// 44px is Apple's minimum comfortable touch target; the icons alone are 20px.
	const className = cn(
		"flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 text-[10px]",
		active ? "text-accent" : "text-muted",
	);

	if (to) {
		return (
			<Link to={to} className={className} aria-label={label}>
				{icon}
				<span className={label === "Add task" ? "sr-only" : undefined}>
					{label}
				</span>
			</Link>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			className={className}
			aria-label={label}
		>
			{icon}
			<span className={label === "Add task" ? "sr-only" : undefined}>
				{label}
			</span>
		</button>
	);
}

export function MobileNav({
	pathname,
	onOpenMenu,
	onQuickAdd,
}: {
	pathname: string;
	onOpenMenu: () => void;
	onQuickAdd: () => void;
}) {
	const icon = "h-5 w-5";

	return (
		<nav className="flex shrink-0 items-stretch border-border border-t bg-surface-raised px-1 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
			<NavButton
				to="/today"
				label="Today"
				icon={<Sun className={icon} />}
				active={pathname === "/today" || pathname === "/"}
			/>
			<NavButton
				to="/inbox"
				label="Inbox"
				icon={<Inbox className={icon} />}
				active={pathname === "/inbox"}
			/>
			<NavButton
				label="Add task"
				icon={
					<span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
						<Plus className={icon} />
					</span>
				}
				onClick={onQuickAdd}
			/>
			<NavButton
				to="/planning"
				label="Planning"
				icon={<CalendarDays className={icon} />}
				active={pathname === "/planning"}
			/>
			<NavButton
				label="More"
				icon={<Menu className={icon} />}
				onClick={onOpenMenu}
			/>
		</nav>
	);
}
