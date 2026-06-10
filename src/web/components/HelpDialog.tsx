import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import { useUi } from "../state/ui";

const SECTIONS: Array<[string, Array<[string, string]>]> = [
	[
		"Navigation",
		[
			["j / ↓", "Move down"],
			["k / ↑", "Move up"],
			["g / G", "First / last task"],
			["space", "Expand or collapse subtasks"],
			["\\", "Toggle sidebar"],
			["/", "Search tasks"],
			["⌘K", "Command palette"],
			["1–8", "Switch view (Today, Inbox, Upcoming…)"],
		],
	],
	[
		"Tasks",
		[
			["x", "Complete or reopen task"],
			["a", "Quick add task"],
			["s", "Add subtask to selected task"],
			["e / enter", "Edit task (incl. reminder)"],
			["d", "Delete task"],
			["u", "Restore task (Deleted view)"],
			["o", "Open link in task"],
		],
	],
	[
		"Projects",
		[
			["P", "New project"],
			["", "Edit / delete via sidebar hover"],
		],
	],
	[
		"Upcoming",
		[
			["h / l", "Previous / next column"],
			["[ / ]", "Previous / next week"],
			["t", "Jump to today"],
			["v", "Cycle day / work week / week"],
			["g", "Add goal"],
		],
	],
	[
		"General",
		[
			["r", "Refresh data"],
			["?", "Toggle this help"],
			["esc", "Close dialogs"],
			["⌘⏎", "Save in edit dialog"],
		],
	],
];

export function HelpDialog() {
	const ui = useUi();
	return (
		<Dialog open={ui.helpOpen} onOpenChange={ui.setHelpOpen}>
			<DialogContent className="max-h-[80vh] w-full max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Keyboard shortcuts</DialogTitle>
				</DialogHeader>
				<div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5">
					{SECTIONS.map(([section, rows]) => (
						<div key={section}>
							<div className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">
								{section}
							</div>
							<Table>
								<TableBody>
									{rows.map(([keys, action]) => (
										<TableRow key={keys}>
											<TableCell className="w-36 py-0.5 pr-3 font-mono text-xs text-accent">
												{keys}
											</TableCell>
											<TableCell className="py-0.5 text-muted">
												{action}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
