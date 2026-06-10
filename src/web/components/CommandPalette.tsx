import { useNavigate } from "@tanstack/react-router";

import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "@/components/ui/command";

import { useProjects } from "../lib/queries";
import { useUi } from "../state/ui";

export function CommandPalette() {
	const ui = useUi();
	const navigate = useNavigate();
	const { data: projects = [] } = useProjects();

	const go = (to: string) => {
		ui.setPaletteOpen(false);
		navigate({ to });
	};

	const run = (action: () => void) => {
		ui.setPaletteOpen(false);
		action();
	};

	const views: Array<[string, string]> = [
		["Today", "/today"],
		["Inbox", "/inbox"],
		["Upcoming", "/upcoming"],
		["Overdue", "/overdue"],
		["Blocked", "/blocked"],
		["By Priority", "/priority"],
		["Completed", "/completed"],
		["Deleted", "/deleted"],
		["Reminders", "/reminders"],
		["Settings", "/settings"],
	];

	return (
		<CommandDialog open={ui.paletteOpen} onOpenChange={ui.setPaletteOpen}>
			<CommandInput placeholder="Jump to view or project…" />
			<CommandList>
				<CommandEmpty>No results</CommandEmpty>
				<CommandGroup heading="Actions">
					<CommandItem onSelect={() => run(() => ui.openQuickAdd())}>
						Add task
						<CommandShortcut>a</CommandShortcut>
					</CommandItem>
					<CommandItem
						onSelect={() => run(() => ui.openProjectDialog({ mode: "create" }))}
					>
						New project
						<CommandShortcut>P</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => run(() => ui.setHelpOpen(true))}>
						Keyboard shortcuts
						<CommandShortcut>?</CommandShortcut>
					</CommandItem>
				</CommandGroup>
				<CommandGroup heading="Views">
					{views.map(([label, to]) => (
						<CommandItem key={to} onSelect={() => go(to)}>
							{label}
						</CommandItem>
					))}
				</CommandGroup>
				<CommandGroup heading="Projects">
					{projects
						.filter((p) => !p.isInbox)
						.map((project) => (
							<CommandItem
								key={project.id}
								onSelect={() => go(`/projects/${project.id}`)}
							>
								{project.emoji ? `${project.emoji} ` : ""}
								{project.name}
							</CommandItem>
						))}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
